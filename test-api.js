#!/usr/bin/env node

/**
 * Test script for the multi-agent system via API
 * This script tests the API endpoint for the multi-model system
 */

const http = require('http');

async function testMultiAgentAPI() {
  console.log('🚀 Testing Multi-Agent System via API...\n');

  const testData = {
    topic: 'The Future of Artificial Intelligence in Healthcare',
    audience: 'Healthcare professionals and medical researchers',
    tone: 'Professional and informative',
    desiredSlideCount: 8,
    theme: 'professional',
    duration: 15,
    enableLive: true,
    policy: 'balanced'
  };

  const postData = JSON.stringify(testData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/multi-model-generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('📋 Test Input:');
  console.log(`   Topic: ${testData.topic}`);
  console.log(`   Audience: ${testData.audience}`);
  console.log(`   Tone: ${testData.tone}`);
  console.log(`   Slides: ${testData.desiredSlideCount}`);
  console.log(`   Duration: ${testData.duration} minutes\n`);

  console.log('🔄 Sending request to multi-model API...\n');

  const startTime = Date.now();

  const req = http.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log(`\n⏱️  Request completed in ${duration}s\n`);

      try {
        const result = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ API request successful!\n');
          
          if (result.deck) {
            console.log('📊 Results:');
            console.log(`   Total slides: ${result.deck.slides ? result.deck.slides.length : 'N/A'}`);
            console.log(`   Deck title: ${result.deck.title || 'N/A'}`);
            
            if (result.metadata) {
              console.log(`   Processing time: ${result.metadata.processingTime || 'N/A'}ms`);
              console.log(`   Total tokens: ${result.metadata.totalTokens || 'N/A'}`);
              console.log(`   Total cost: $${result.metadata.totalCost ? result.metadata.totalCost.toFixed(4) : 'N/A'}`);
            }

            if (result.deck.slides) {
              console.log('\n📝 Slide Overview:');
              result.deck.slides.forEach((slide, index) => {
                console.log(`   ${index + 1}. ${slide.title || 'Untitled'}`);
              });
            }
          }

          if (result.executiveSummary) {
            console.log('\n📧 Executive Summary generated');
          }

          if (result.qualityChecks && result.qualityChecks.length > 0) {
            console.log(`\n🔍 Quality Checks: ${result.qualityChecks.length} issues found`);
          }

          console.log('\n🎉 Multi-agent system test completed successfully!');
        } else {
          console.log('❌ API request failed:');
          console.log(result);
        }
      } catch (parseError) {
        console.log('❌ Failed to parse response:');
        console.log('Raw response:', data);
        console.log('Parse error:', parseError.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the development server is running on port 3001');
      console.log('   You can start it with: npm run dev');
    }
  });

  req.write(postData);
  req.end();
}

// Run the test
testMultiAgentAPI().catch(console.error);
