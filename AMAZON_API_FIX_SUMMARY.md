# Amazon Product Advertising API - Fix Summary

## Problem Identified
Your edge function was receiving `InvalidSignatureException` errors (401) from the Amazon Product Advertising API. This is one of the most common issues with PA-API integration.

## Root Causes
1. **Missing Partner Tag**: The PA-API requires your Amazon Associates tag (PartnerTag) to be included in every request
2. **Incorrect AWS Signature V4**: The request signing algorithm needs to be implemented precisely according to AWS specifications
3. **Timestamp Issues**: AWS requires specific ISO 8601 timestamp formatting

## What Was Fixed

### 1. Correct AWS Signature V4 Implementation
The new implementation includes:
- Proper canonical request formation
- Correct string-to-sign creation
- HMAC-SHA256 signature calculation using Web Crypto API
- Proper header formatting and inclusion

### 2. Partner Tag Configuration
- Set your Amazon Associates tag: `pearsonperfor-20`
- Added as environment variable: `AMAZON_PARTNER_TAG`
- Included in all API requests

### 3. Request Structure
The corrected request now includes:
```
- Keywords: Search term based on niche
- Resources: Product details to retrieve
- PartnerTag: Your Associates ID
- PartnerType: "Associates"
- Marketplace: "www.amazon.com"
- ItemCount: Number of products to return
```

## Environment Variables Set
- ✅ `AMAZON_ACCESS_KEY` (already configured)
- ✅ `AMAZON_SECRET_KEY` (already configured)
- ✅ `AMAZON_PARTNER_TAG` = "pearsonperfor-20" (newly added)

## File Created
📁 `supabase/functions/amazon-article-pipeline/index.ts`

This is the corrected implementation with:
- Proper AWS Signature V4 signing
- Error handling and logging
- Product transformation for affiliate links
- Integration with Supabase for storing articles

## Testing the Fix

### Option 1: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/qazhdcqvjppbbjxzvisp/functions
2. Find "amazon-article-pipeline"
3. Click "Invoke" to test the function
4. Check the logs for results

### Option 2: Via API Call
Use the test script: `test-amazon-function.js`

1. Get your Supabase Anon Key from the dashboard
2. Replace `YOUR_SUPABASE_ANON_KEY` in the test script
3. Run: `node test-amazon-function.js`

### Option 3: Via curl
```bash
curl -X POST \
  "https://qazhdcqvjppbbjxzvisp.supabase.co/functions/v1/amazon-article-pipeline" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Expected Behavior

### Success Response:
```json
{
  "success": true,
  "article": {
    "title": "Top 5 home office Products for 2025",
    "introduction": "...",
    "products": [
      {
        "heading": "1. Product Name",
        "content": "Product description...",
        "affiliateLink": "https://www.amazon.com/dp/ASIN?tag=pearsonperfor-20",
        "image": "https://..."
      }
    ],
    "niche": "home office"
  },
  "productCount": 5
}
```

### What the Function Does:
1. Selects a random niche from: ["home office", "travel gear", "fitness"]
2. Searches Amazon PA-API for products in that niche
3. Retrieves product details (title, price, features, images)
4. Generates affiliate links with your tag
5. Creates article structure
6. Stores in your Supabase database (if tables exist)

## Next Steps to Complete Your Pipeline

### 1. Create Database Table for Articles
```sql
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  niche TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Integrate DataForSEO for Keywords
The current implementation has a TODO for DataForSEO integration. You'll need to:
- Add `DATAFORSEO_API_LOGIN` and `DATAFORSEO_API_PASSWORD` (already set as secrets)
- Implement keyword research API call
- Use keywords to optimize article content

### 3. Integrate OpenAI for Article Generation
Use your `OPENAI_API` secret to:
- Generate SEO-optimized article content
- Create compelling product descriptions
- Add buyer guides and comparisons

### 4. Schedule Regular Execution
Set up a cron job or use Supabase's edge function triggers to:
- Run daily/weekly to generate fresh content
- Rotate through niches
- Update product prices and availability

## Important Notes

⚠️ **Rate Limits**: Amazon PA-API has strict rate limits:
- 1 request per second
- 8,640 requests per day (with qualifying sales)
- Lower limits if not making sales

⚠️ **Associate Requirements**:
- You must maintain active Associate status
- Generate qualifying sales within 180 days
- Follow Amazon's Operating Agreement

⚠️ **Testing**:
- Test with small item counts first
- Monitor the logs for any errors
- Check that affiliate links work correctly

## Monitoring

Check your function logs regularly:
```bash
supabase functions list
```

Then view logs in the Supabase Dashboard at:
https://supabase.com/dashboard/project/qazhdcqvjppbbjxzvisp/functions/amazon-article-pipeline/logs

## Need Help?

If you still encounter issues:
1. Check the function logs in Supabase Dashboard
2. Verify all environment variables are set correctly
3. Ensure your Amazon PA-API credentials are valid
4. Confirm your Associates account is active
5. Test with different search keywords

## AWS Signature V4 Reference
If you need to debug further, refer to:
- https://webservices.amazon.com/paapi5/documentation/sending-request.html
- https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html
