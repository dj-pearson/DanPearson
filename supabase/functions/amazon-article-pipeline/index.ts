import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Amazon Product Advertising API Configuration
const AMAZON_ACCESS_KEY = Deno.env.get('AMAZON_ACCESS_KEY')!
const AMAZON_SECRET_KEY = Deno.env.get('AMAZON_SECRET_KEY')!
const AMAZON_PARTNER_TAG = Deno.env.get('AMAZON_PARTNER_TAG') || 'YOUR_ASSOCIATE_TAG' // IMPORTANT: Must be set!
const AMAZON_REGION = 'us-east-1' // Change to your region
const AMAZON_HOST = 'webservices.amazon.com'
const AMAZON_ENDPOINT = '/paapi5/searchitems'

// Niches configuration
const NICHES = ['home office', 'travel gear', 'fitness']

// AWS Signature Version 4 Implementation for PA-API v5
async function signRequest(
  method: string,
  host: string,
  path: string,
  queryString: string,
  payload: string,
  accessKey: string,
  secretKey: string,
  region: string,
  service: string,
  target: string
): Promise<{ headers: Record<string, string>; timestamp: string }> {
  const algorithm = 'AWS4-HMAC-SHA256'
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '')
  const dateStamp = timestamp.slice(0, 8)

  // Helper function to create HMAC
  async function hmac(key: Uint8Array | string, data: string): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      typeof key === 'string' ? new TextEncoder().encode(key) : key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
    return new Uint8Array(signature)
  }

  // Helper function to create SHA-256 hash
  async function hash(data: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Create canonical request with PA-API required headers
  const payloadHash = await hash(payload)
  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${timestamp}\nx-amz-target:${target}\n`
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target'
  const canonicalRequest = `${method}\n${path}\n${queryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

  // Debug logging
  console.log('[DEBUG] Canonical Request:', JSON.stringify({
    method,
    path,
    queryString,
    canonicalHeaders: canonicalHeaders.split('\n'),
    signedHeaders,
    payloadHash
  }))

  // Create string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const canonicalRequestHash = await hash(canonicalRequest)
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${canonicalRequestHash}`

  console.log('[DEBUG] Signing details:', JSON.stringify({
    algorithm,
    timestamp,
    credentialScope,
    canonicalRequestHash
  }))

  // Calculate signature
  let signingKey = await hmac(`AWS4${secretKey}`, dateStamp)
  signingKey = await hmac(signingKey, region)
  signingKey = await hmac(signingKey, service)
  signingKey = await hmac(signingKey, 'aws4_request')

  const signatureBuffer = await hmac(signingKey, stringToSign)
  const signature = Array.from(signatureBuffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  console.log('[DEBUG] Generated signature:', signature.slice(0, 20) + '...')

  return {
    headers: {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=utf-8',
      // Note: Host header is NOT included - Deno/browser sets it automatically
      'X-Amz-Date': timestamp,
      'X-Amz-Target': target,
      'Authorization': authorizationHeader
    },
    timestamp
  }
}

// Search Amazon products using PA-API 5
async function searchAmazonProducts(keywords: string, itemCount = 10) {
  console.log(`[INFO] Searching Amazon for: ${keywords}`)

  // Validate credentials
  console.log('[DEBUG] Credentials check:', {
    accessKeyLength: AMAZON_ACCESS_KEY?.length,
    secretKeyLength: AMAZON_SECRET_KEY?.length,
    partnerTag: AMAZON_PARTNER_TAG,
    accessKeyPrefix: AMAZON_ACCESS_KEY?.substring(0, 4) + '...'
  })

  const payload = JSON.stringify({
    Keywords: keywords,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.ProductInfo',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis'
    ],
    PartnerTag: AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com',
    ItemCount: itemCount
  })

  console.log('[DEBUG] Request payload:', payload.substring(0, 100) + '...')

  try {
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
      'ProductAdvertisingAPIv1',
      target
    )

    console.log(`[DEBUG] Making request with timestamp: ${timestamp}`)
    console.log('[DEBUG] Request headers:', JSON.stringify(headers, null, 2))

    const response = await fetch(`https://${AMAZON_HOST}${AMAZON_ENDPOINT}`, {
      method: 'POST',
      headers,
      body: payload
    })

    console.log('[DEBUG] Response status:', response.status)
    const responseText = await response.text()
    console.log('[DEBUG] Response body:', responseText.substring(0, 200))

    if (!response.ok) {
      console.error('[ERROR] Amazon API rejected request')
      throw new Error(`Amazon API error: ${response.status} ${responseText}`)
    }

    const data = JSON.parse(responseText)

    if (!data.SearchResult?.Items) {
      console.log('[WARN] No items found in Amazon response')
      return []
    }

    // Transform Amazon response to our format
    return data.SearchResult.Items.map((item: any) => ({
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || 'No title',
      image: item.Images?.Primary?.Large?.URL || '',
      price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Price not available',
      features: item.ItemInfo?.Features?.DisplayValues || [],
      affiliateLink: `https://www.amazon.com/dp/${item.ASIN}?tag=${AMAZON_PARTNER_TAG}`
    }))
  } catch (error) {
    console.error('[ERROR] Amazon API request failed:', error)
    throw error
  }
}

// Generate article content using DataForSEO and AI
async function generateArticleContent(products: any[], niche: string) {
  // TODO: Integrate DataForSEO for keyword research
  // For now, generate basic content

  const title = `Top ${products.length} ${niche} Products for 2025`
  const introduction = `Looking for the best ${niche} products? We've researched and compiled this comprehensive guide featuring ${products.length} carefully selected products that stand out for their quality, features, and value.`

  const productSections = products.map((product, index) => ({
    heading: `${index + 1}. ${product.title}`,
    content: `This product offers excellent value with features including: ${product.features.slice(0, 3).join(', ')}. Currently available at ${product.price}.`,
    affiliateLink: product.affiliateLink,
    image: product.image
  }))

  return {
    title,
    introduction,
    products: productSections,
    niche
  }
}

// Main handler
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    console.log('[INFO] Pipeline started')

    // Validate required environment variables
    if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY) {
      throw new Error('Missing Amazon API credentials')
    }

    if (AMAZON_PARTNER_TAG === 'YOUR_ASSOCIATE_TAG') {
      throw new Error('AMAZON_PARTNER_TAG environment variable must be set to your Amazon Associates tag')
    }

    // Select random niche
    const selectedNiche = NICHES[Math.floor(Math.random() * NICHES.length)]
    console.log(`[INFO] Selected niche: ${selectedNiche}`)

    // Search for products
    console.log('[INFO] Fetching Amazon products')
    const products = await searchAmazonProducts(selectedNiche, 5)

    if (products.length === 0) {
      throw new Error('No products found')
    }

    console.log(`[INFO] Found ${products.length} products`)

    // Generate article content
    console.log('[INFO] Generating article content')
    const article = await generateArticleContent(products, selectedNiche)

    // Store in database (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article,
          niche: selectedNiche,
          status: 'draft',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('[WARN] Failed to store article:', error)
      } else {
        console.log('[INFO] Article stored in database')
      }
    }

    console.log('[INFO] Pipeline completed successfully')

    return new Response(JSON.stringify({
      success: true,
      article,
      productCount: products.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('[ERROR] Pipeline failed:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
