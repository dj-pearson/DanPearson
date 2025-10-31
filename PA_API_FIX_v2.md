# Amazon PA-API Signature Fix - Version 2

## The Root Cause of 401 Errors

After researching the official Amazon PA-API v5 documentation, I identified **THREE critical missing requirements** that were causing the `InvalidSignatureException`:

### Missing Requirements

1. **❌ Wrong Service Name for Signing**
   - **Was**: `ProductAdvertisingAPI`
   - **Should be**: `ProductAdvertisingAPIv1`
   - Impact: This caused the entire signature calculation to be incorrect

2. **❌ Missing Required Header: `Content-Encoding`**
   - **Required value**: `amz-1.0`
   - Impact: PA-API v5 specifically requires this header to be included in the signature
   - This header MUST be in both the canonical request AND the actual HTTP request

3. **❌ Missing Required Header: `X-Amz-Target`**
   - **Required value**: `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`
   - Impact: This header identifies which PA-API operation you're calling
   - This header MUST be in both the canonical request AND the actual HTTP request

## What Was Fixed

### 1. Updated Signature Function (Lines 15-90)
```typescript
// Added 'target' parameter
async function signRequest(
  // ... existing parameters ...
  service: string,
  target: string  // NEW: PA-API operation target
)
```

### 2. Fixed Canonical Headers (Line 56)
**Before:**
```typescript
const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${timestamp}\n`
const signedHeaders = 'content-type;host;x-amz-date'
```

**After:**
```typescript
const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${timestamp}\nx-amz-target:${target}\n`
const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target'
```

**Key changes:**
- ✅ Added `content-encoding:amz-1.0`
- ✅ Added `x-amz-target:${target}`
- ✅ Headers are in alphabetical order (REQUIRED by AWS Signature V4)
- ✅ Updated signedHeaders list to include all headers

### 3. Fixed HTTP Request Headers (Lines 80-86)
**Before:**
```typescript
headers: {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Amz-Date': timestamp,
  'Authorization': authorizationHeader,
  'Host': host
}
```

**After:**
```typescript
headers: {
  'Content-Encoding': 'amz-1.0',           // NEW
  'Content-Type': 'application/json; charset=utf-8',
  'Host': host,
  'X-Amz-Date': timestamp,
  'X-Amz-Target': target,                   // NEW
  'Authorization': authorizationHeader
}
```

### 4. Fixed Service Name and Added Target (Lines 113-125)
**Before:**
```typescript
const { headers, timestamp } = await signRequest(
  'POST',
  AMAZON_HOST,
  AMAZON_ENDPOINT,
  '',
  payload,
  AMAZON_ACCESS_KEY,
  AMAZON_SECRET_KEY,
  AMAZON_REGION,
  'ProductAdvertisingAPI'  // WRONG!
)
```

**After:**
```typescript
const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'

const { headers, timestamp } = await signRequest(
  'POST',
  AMAZON_HOST,
  AMAZON_ENDPOINT,
  '',
  payload,
  AMAZON_ACCESS_KEY,
  AMAZON_SECRET_KEY,
  AMAZON_REGION,
  'ProductAdvertisingAPIv1',  // CORRECT!
  target                       // NEW PARAMETER
)
```

## PA-API v5 Official Requirements Summary

Based on official documentation at https://webservices.amazon.com/paapi5/documentation/:

| Requirement | Value |
|-------------|-------|
| **Host** | `webservices.amazon.com` (US marketplace) |
| **Region** | `us-east-1` |
| **Service** | `ProductAdvertisingAPIv1` |
| **Endpoint** | `/paapi5/searchitems` |
| **Content-Type** | `application/json; charset=utf-8` |
| **Content-Encoding** | `amz-1.0` (REQUIRED) |
| **X-Amz-Target** | `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.[OperationName]` |
| **X-Amz-Date** | ISO 8601 format: `YYYYMMDD'T'HHMMSS'Z'` |
| **Signature Version** | AWS Signature Version 4 |

## Testing the Fix

### Dashboard Test (Recommended)
1. Go to: https://supabase.com/dashboard/project/qazhdcqvjppbbjxzvisp/functions
2. Click on `amazon-article-pipeline`
3. Click "Invoke"
4. Check the logs - you should now see successful product results instead of 401 errors

### Expected Success Response
```json
{
  "success": true,
  "article": {
    "title": "Top 5 [niche] Products for 2025",
    "introduction": "...",
    "products": [
      {
        "heading": "1. Product Name",
        "content": "Product description with features...",
        "affiliateLink": "https://www.amazon.com/dp/B08XYZ?tag=pearsonperfor-20",
        "image": "https://m.media-amazon.com/images/..."
      }
    ],
    "niche": "home office"
  },
  "productCount": 5
}
```

### If It Still Fails

Check these common issues:

1. **Verify API Credentials Are Valid**
   ```bash
   supabase secrets list
   ```
   Confirm you see:
   - `AMAZON_ACCESS_KEY`
   - `AMAZON_SECRET_KEY`
   - `AMAZON_PARTNER_TAG` = "pearsonperfor-20"

2. **Check Your Amazon Associate Account**
   - Is your Associates account active?
   - Have you made qualifying sales in the last 180 days?
   - Are your PA-API credentials from the same account as your Associates tag?

3. **Test Your Credentials Manually**
   Try using the official Amazon PA-API Scratchpad tool to verify your credentials work:
   https://webservices.amazon.com/paapi5/scratchpad/

4. **Check for Credential Typos**
   - Access Key should be 20 characters
   - Secret Key should be 40 characters
   - Partner Tag should be in format: `yourname-20` or `yourname-21`

## Why This Was So Difficult to Debug

The AWS Signature Version 4 algorithm is **extremely** sensitive:
- Every character matters
- Headers must be in alphabetical order
- Whitespace must be exact
- Missing a single header causes complete signature failure
- Amazon's error messages don't tell you WHICH header is wrong

The PA-API v5 adds additional complexity:
- Custom headers (`content-encoding`, `x-amz-target`) not used in other AWS services
- Different service name (`ProductAdvertisingAPIv1` vs typical AWS service names)
- The documentation doesn't clearly emphasize these requirements

## References

- [PA-API v5 Sending Requests](https://webservices.amazon.com/paapi5/documentation/sending-request.html)
- [PA-API v5 Common Request Parameters](https://webservices.amazon.com/paapi5/documentation/common-request-parameters.html)
- [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
- [PA-API v5 US Locale Reference](https://webservices.amazon.com/paapi5/documentation/locale-reference/united-states.html)

## Deployment Status

✅ **Deployed**: Version 15 (deployed at 9:10 AM)
📁 **Location**: `supabase/functions/amazon-article-pipeline/index.ts`
🔗 **Dashboard**: https://supabase.com/dashboard/project/qazhdcqvjppbbjxzvisp/functions/amazon-article-pipeline

The function should now work correctly. Test it via the dashboard and check the logs!
