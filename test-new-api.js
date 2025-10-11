#!/usr/bin/env node

// Test script for the new simplified API
const testNewAPI = async () => {
  const API_URL = 'http://localhost:3001/api/generate-deck';
  
  const testData = {
    mode: 'quick_prompt',
    topic_or_prompt: 'Create a 10-slide deck on climate change economics for executives. Formal tone. Add one chart comparing carbon pricing models.',
    tone: 'professional',
    audience: 'executives',
    slide_count: 10,
    theme: 'deep_space',
    live_widgets: false
  };

  console.log('🚀 Testing New Simplified API...');
  console.log('📊 Test Data:', JSON.stringify(testData, null, 2));
  console.log('\n⏳ Sending request to new API...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`📡 Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n✅ Deck Generation Successful!');
    console.log('📈 Deck Info:');
    console.log(`   - Title: ${result.deck.title}`);
    console.log(`   - Theme: ${result.deck.theme}`);
    console.log(`   - Total Slides: ${result.deck.slides.length}`);
    
    console.log('\n📝 Generated Slides:');
    result.deck.slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} (${slide.layout})`);
      if (slide.bullets && slide.bullets.length > 0) {
        console.log(`      Bullets: ${slide.bullets.slice(0, 2).join(', ')}${slide.bullets.length > 2 ? '...' : ''}`);
      }
      if (slide.chart_spec) {
        console.log(`      Chart: ${slide.chart_spec.type}`);
      }
      if (slide.image) {
        console.log(`      Image: ${slide.image.alt}`);
      }
    });

    console.log('\n🎉 New API Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testNewAPI();
