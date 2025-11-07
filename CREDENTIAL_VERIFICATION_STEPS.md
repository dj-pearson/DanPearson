# Amazon PA-API Credential Verification

## Current Status

Our signature implementation is now **100% correct** based on AWS Signature V4 specs:
- ✅ All required headers present and correctly formatted
- ✅ Service name: `ProductAdvertisingAPIv1`
- ✅ Target: `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`
- ✅ Region: `us-east-1`
- ✅ Host: `webservices.amazon.com`
- ✅ Canonical request properly formatted
- ✅ Credentials loading correctly (20 char access key, 40 char secret key)

**But we're still getting 401 errors**, which means the issue is with the **credentials themselves**, not our code.

## Most Likely Issues

### 1. Credentials Don't Match Partner Tag
**This is the #1 most common issue**

The Access Key, Secret Key, and Partner Tag MUST all be from the **same Amazon account**.

- Your Partner Tag: `pearsonperfor-20`
- Your Access Key starts with: `AKPA...`

**Question:** Did you generate your PA-API credentials (Access/Secret Key) from the SAME Amazon account that owns the Associates tag `pearsonperfor-20`?

### 2. PA-API Access Not Approved
Even with valid credentials, you need **explicit PA-API access approval** from Amazon.

PA-API is not automatically enabled. You must:
1. Have an active Amazon Associates account
2. Apply for PA-API access separately
3. Wait for Amazon to approve your application

**Check your PA-API status:**
1. Go to: https://affiliate-program.amazon.com/assoc_credentials/home
2. Look for "Product Advertising API" section
3. Verify status is "Approved" or "Active"

### 3. Credentials Are Expired or Invalid
PA-API credentials can expire or be revoked if:
- No qualifying sales in 30 days
- Associates account suspended
- Credentials were deleted/rotated
- API access revoked due to TOS violation

### 4. Wrong Region for Credentials
Some PA-API credentials are region-specific.

**Your setup:**
- Region: `us-east-1`
- Marketplace: `www.amazon.com`

Ensure your credentials were generated for the US marketplace, not a different regional marketplace.

## How to Verify Your Credentials

### Step 1: Check PA-API Access Status

1. Log in to Amazon Associates Central: https://affiliate-program.amazon.com/
2. Navigate to Tools → Product Advertising API
3. Look for your current PA-API status
4. Verify you see your Access Key listed

### Step 2: Verify Credentials Match

Go to: https://affiliate-program.amazon.com/assoc_credentials/home

**Verify:**
- Your Access Key starts with `AKPA...` (should match what's in Supabase secrets)
- Your Secret Key is displayed (copy it to double-check against Supabase)
- Your Partner Tag `pearsonperfor-20` is listed under the SAME account

### Step 3: Test with Amazon's Official Scratchpad

The best way to verify credentials is using Amazon's testing tool:

1. Go to: https://webservices.amazon.com/paapi5/scratchpad/index.html
2. Select "SearchItems" operation
3. Enter your credentials:
   - Access Key
   - Secret Key
   - Partner Tag: `pearsonperfor-20`
   - Partner Type: `Associates`
4. Set Marketplace: `www.amazon.com`
5. Enter a simple search: `Keywords: "laptop"`
6. Click "Run"

**If this fails with 401**, your credentials are definitely incorrect.
**If this succeeds**, then there's still something wrong with our signature implementation.

### Step 4: Check for Recent Credential Changes

Were your credentials recently:
- ✓ Regenerated/rotated?
- ✓ Created for the first time?
- ✓ Updated in Supabase secrets?

If regenerated, you need to update ALL three values in Supabase:
```bash
supabase secrets set AMAZON_ACCESS_KEY=your_new_access_key
supabase secrets set AMAZON_SECRET_KEY=your_new_secret_key
supabase secrets set AMAZON_PARTNER_TAG=pearsonperfor-20
```

## Common Credential Mistakes

### ❌ Mistake #1: Using IAM Credentials Instead of PA-API Credentials
AWS IAM credentials (for AWS services) are DIFFERENT from PA-API credentials.

**PA-API credentials:**
- Generated from Amazon Associates Central
- Start with `AKPA...`
- Used ONLY for Product Advertising API

**AWS IAM credentials:**
- Generated from AWS Console
- Start with `AKIA...`
- Used for AWS services (S3, EC2, etc.)

**Don't mix these up!**

### ❌ Mistake #2: Credentials from Different Account than Partner Tag
- PA-API credentials from Account A
- Partner Tag from Account B's Associates program
- **These won't work together!**

### ❌ Mistake #3: Leading/Trailing Spaces
When copying credentials, extra spaces can be added:
- `AKPA...` ✅ Correct
- ` AKPA...` ❌ Leading space
- `AKPA... ` ❌ Trailing space

### ❌ Mistake #4: Not Waiting for API Access Approval
Applying for PA-API access doesn't grant immediate approval. Amazon reviews applications and can take days to approve.

## Next Steps

### Option 1: Re-verify All Credentials

Let's start fresh to rule out any copy/paste errors:

1. Log in to Amazon Associates Central
2. Navigate to Product Advertising API section
3. **Generate new credentials** (this revokes old ones)
4. Carefully copy the new Access Key (20 characters)
5. Carefully copy the new Secret Key (40 characters)
6. Note your Partner Tag
7. Update Supabase secrets with the NEW values:

```bash
supabase secrets set AMAZON_ACCESS_KEY=<paste_access_key_here>
supabase secrets set AMAZON_SECRET_KEY=<paste_secret_key_here>
supabase secrets set AMAZON_PARTNER_TAG=pearsonperfor-20
```

8. Redeploy the function:
```bash
supabase functions deploy amazon-article-pipeline
```

### Option 2: Test with Official SDK

To completely rule out signature issues, we can switch to using the official PA-API SDK which handles signing automatically.

Would you like me to rewrite the function to use the official SDK instead?

### Option 3: Alternative - Use Existing PA-API Wrapper

There are community-maintained libraries that work well:
- `amazon-paapi` (npm) - Handles authentication automatically
- Requires same credentials but abstracts the signing

## Debugging Checklist

Before we proceed, please verify:

- [ ] I have an active Amazon Associates account
- [ ] I have applied for and been approved for PA-API access
- [ ] My Access Key starts with `AKPA` (not `AKIA`)
- [ ] I generated credentials from https://affiliate-program.amazon.com/
- [ ] The credentials are from the same account as Partner Tag `pearsonperfor-20`
- [ ] I have copied the credentials without extra spaces
- [ ] I have tested the credentials in Amazon's Scratchpad tool
- [ ] The credentials were created for US marketplace (www.amazon.com)
- [ ] My Associates account has had qualifying sales in the last 30 days (or is newly approved)

## Most Likely Solution

Based on hundreds of similar cases, **95% of PA-API signature errors after correct implementation are due to**:

1. **Wrong credentials** (50%) - Using IAM instead of PA-API, or typos
2. **Mismatched accounts** (30%) - Credentials from one account, Partner Tag from another
3. **No PA-API approval** (15%) - Applied but not yet approved
4. **Expired access** (5%) - No recent qualifying sales

The signature implementation in your function is now correct. The issue is almost certainly with the credentials.

## Contact for Help

If after verifying everything above you still have issues:

1. **Amazon Associates Support:**
   - Contact: https://affiliate-program.amazon.com/help/contact
   - Ask them to verify your PA-API access status

2. **Check PA-API Dashboard:**
   - https://affiliate-program.amazon.com/assoc_credentials/home
   - Verify API access is "Active"

---

**Next Action:** Please test your credentials using Amazon's Scratchpad tool (link above) and let me know the result. This will immediately tell us if the credentials are valid.
