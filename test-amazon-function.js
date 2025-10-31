// Test script for Amazon Article Pipeline
// This will help you test the function manually

const FUNCTION_URL = 'https://qazhdcqvjppbbjxzvisp.supabase.co/functions/v1/amazon-article-pipeline';
const ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key

async function testFunction() {
  try {
    console.log('Testing Amazon Article Pipeline...');

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS! The function is working correctly.');
      console.log(`Found ${data.productCount} products for niche: ${data.article.niche}`);
      console.log(`Article title: ${data.article.title}`);
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testFunction();
