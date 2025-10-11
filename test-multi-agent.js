#!/usr/bin/env node

// Test script for the multi-agent system
const testMultiAgent = async () => {
  const API_URL = 'http://localhost:3001/api/multi-model-generate';
  
  const testData = {
    topic: "The Future of Artificial Intelligence in Healthcare",
    audience: "Healthcare professionals and medical researchers",
    tone: "Professional and informative",
    desiredSlideCount: 8,
    theme: "Corporate",
    duration: 15,
    policy: "balanced"
  };

  console.log('🚀 Testing Multi-Agent System...');
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
        // Extract title from the first Heading block
        const titleBlock = slide.blocks?.find(block => block.type === 'Heading');
        const title = titleBlock?.text || 'Untitled';
        console.log(`   ${index + 1}. ${title}`);
      });
      
      console.log(`\n🎯 Total Slides Generated: ${result.deck.slides.length}`);
    }

    if (result.qualityChecks) {
      console.log('\n🔍 Quality Checks:');
      result.qualityChecks.forEach(check => {
        console.log(`   - ${check.type}: ${check.score || 'N/A'}`);
      });
    }

    console.log('\n🎉 Multi-Agent System Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('💡 Make sure:');
    console.error('   1. Next.js dev server is running (npm run dev)');
    console.error('   2. Ollama is running (ollama serve)');
    console.error('   3. Both services are accessible on localhost');
  }
};

// Run the test
testMultiAgent();
