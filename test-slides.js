#!/usr/bin/env node

/**
 * Test Script for SlideSmith - Rich Slide Generation
 * This script tests the slide generation system to ensure it works properly
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testSlideGeneration() {
  console.log('🧪 Testing SlideSmith Rich Slide Generation...\n');
  
  const testCases = [
    {
      name: 'AI in Healthcare',
      topic: 'AI in Healthcare',
      detail: 'Healthcare AI applications including diagnosis, treatment, and patient care',
      expectedSlides: 8
    },
    {
      name: 'Digital Marketing',
      topic: 'Digital Marketing Strategies',
      detail: 'Modern digital marketing approaches and best practices',
      expectedSlides: 6
    },
    {
      name: 'Climate Change',
      topic: 'Climate Change Solutions',
      detail: 'Environmental solutions and sustainable practices',
      expectedSlides: 7
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: testCase.topic,
          detail: testCase.detail,
          tone: 'Professional',
          audience: 'General audience',
          length: testCase.expectedSlides,
          theme: 'DeepSpace',
          enableLive: false,
          mode: 'execute'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.deck || !result.deck.slides) {
        throw new Error('No deck or slides in response');
      }

      const slides = result.deck.slides;
      console.log(`✅ Generated ${slides.length} slides`);
      
      // Check if slides have rich content
      let richContentCount = 0;
      slides.forEach((slide, index) => {
        if (slide.blocks && slide.blocks.length > 0) {
          const hasContent = slide.blocks.some(block => 
            block.type === 'Markdown' && block.md && block.md.length > 50
          );
          if (hasContent) {
            richContentCount++;
            console.log(`  📄 Slide ${index + 1}: "${slide.blocks[0].text}" - Rich content ✓`);
          } else {
            console.log(`  📄 Slide ${index + 1}: "${slide.blocks[0].text}" - Basic content`);
          }
        }
      });
      
      console.log(`📊 Rich content slides: ${richContentCount}/${slides.length}`);
      
      if (richContentCount >= 3) {
        console.log(`✅ ${testCase.name}: PASS - Rich content generated\n`);
      } else {
        console.log(`⚠️  ${testCase.name}: PARTIAL - Limited rich content\n`);
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.name}: FAIL - ${error.message}\n`);
    }
  }
}

async function testAPIHealth() {
  console.log('🏥 Testing API Health...');
  
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Test',
        detail: 'Test presentation',
        tone: 'Professional',
        audience: 'General audience',
        length: 5,
        theme: 'DeepSpace',
        enableLive: false,
        mode: 'plan'
      })
    });

    if (response.ok) {
      console.log('✅ API is healthy and responding\n');
      return true;
    } else {
      console.log(`❌ API health check failed: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API health check failed: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('🚀 SlideSmith Test Suite\n');
  console.log('=' .repeat(50));
  
  // Test API health first
  const isHealthy = await testAPIHealth();
  
  if (!isHealthy) {
    console.log('❌ API is not healthy. Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // Run slide generation tests
  await testSlideGeneration();
  
  console.log('=' .repeat(50));
  console.log('🎉 Test suite completed!');
  console.log('\n📝 To test manually:');
  console.log('1. Go to http://localhost:3000/studio');
  console.log('2. Enter a topic (e.g., "AI in Healthcare")');
  console.log('3. Click "Generate Presentation"');
  console.log('4. Check that slides have rich, informative content');
}

// Run the test suite
main().catch(console.error);
