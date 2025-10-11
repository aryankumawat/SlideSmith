#!/usr/bin/env node

// Debug test for the multi-agent system
const testDebugAgents = async () => {
  const API_URL = 'http://localhost:3001/api/multi-model-generate';
  
  const testData = {
    topic: "Simple Test Topic",
    audience: "General audience",
    tone: "Casual",
    desiredSlideCount: 3,
    theme: "Corporate",
    duration: 5,
    policy: "speed"  // Use speed policy to force gemma3-4b
  };

  console.log('🔍 Debug Testing Multi-Agent System...');
  console.log('📊 Test Data:', JSON.stringify(testData, null, 2));
  console.log('\n⏳ Sending request to multi-agent API...');

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
    
    console.log('\n✅ Multi-Agent Generation Successful!');
    console.log('📈 Generation Stats:');
    console.log(`   - Total Time: ${result.generationTime || 'N/A'}ms`);
    console.log(`   - Policy Used: ${result.policy || 'N/A'}`);
    console.log(`   - Quality Score: ${result.qualityScore || 'N/A'}`);
    
    if (result.deck && result.deck.slides) {
      console.log('\n📝 Generated Slides:');
      result.deck.slides.forEach((slide, index) => {
        const titleBlock = slide.blocks?.find(block => block.type === 'Heading');
        const title = titleBlock?.text || 'Untitled';
        console.log(`   ${index + 1}. ${title}`);
      });
      
      console.log(`\n🎯 Total Slides Generated: ${result.deck.slides.length}`);
    }

    console.log('\n🎉 Multi-Agent System Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testDebugAgents();
