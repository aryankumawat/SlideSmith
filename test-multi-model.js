#!/usr/bin/env node

/**
 * Test Script for Multi-Model SlideSmith System
 * This script tests the new multi-agent architecture
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testMultiModelGeneration() {
  console.log('🤖 Testing Multi-Model SlideSmith System...\n');
  
  const testCases = [
    {
      name: 'AI in Healthcare (Quality Policy)',
      input: {
        topic: 'AI in Healthcare',
        audience: 'Medical professionals and healthcare administrators',
        tone: 'Professional and evidence-based',
        desiredSlideCount: 12,
        theme: 'medical',
        policy: 'quality',
        generateExecutiveSummary: true,
      },
      expectedFeatures: ['research', 'fact-checking', 'executive-summary'],
    },
    {
      name: 'Digital Marketing (Speed Policy)',
      input: {
        topic: 'Digital Marketing Strategies for Small Businesses',
        audience: 'Small business owners',
        tone: 'Practical and actionable',
        desiredSlideCount: 8,
        theme: 'business',
        policy: 'speed',
        enableLive: true,
      },
      expectedFeatures: ['live-widgets', 'fast-generation'],
    },
    {
      name: 'Climate Change (Local Policy)',
      input: {
        topic: 'Climate Change Solutions and Renewable Energy',
        audience: 'Environmental scientists and policymakers',
        tone: 'Scientific and urgent',
        desiredSlideCount: 15,
        theme: 'environmental',
        policy: 'local-only',
        sources: ['IPCC', 'NASA', 'UNEP'],
      },
      expectedFeatures: ['local-models', 'source-citations'],
    },
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`Policy: ${testCase.input.policy}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE}/api/multi-model-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.input),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`HTTP ${response.status}: ${error.error || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Generation failed');
      }

      console.log(`✅ Generated in ${duration}ms`);
      console.log(`📊 Slides: ${result.deck.slides.length}`);
      console.log(`🔍 Research snippets: ${result.deck.researchSnippets?.length || 0}`);
      console.log(`📈 Quality scores:`, result.metadata.qualityScores);
      
      if (result.executiveSummary) {
        console.log(`📋 Executive summary: Generated`);
      }
      
      if (result.qualityChecks && result.qualityChecks.length > 0) {
        console.log(`🔍 Quality checks: ${result.qualityChecks.length} issues found`);
        const highSeverity = result.qualityChecks.filter(c => c.severity === 'high').length;
        if (highSeverity > 0) {
          console.log(`⚠️  High severity issues: ${highSeverity}`);
        }
      }
      
      // Validate slide quality
      const slides = result.deck.slides;
      let qualityIssues = 0;
      
      slides.forEach((slide, index) => {
        // Check for proper structure
        const hasTitle = slide.blocks.some(b => b.type === 'Heading');
        if (!hasTitle) {
          qualityIssues++;
          console.log(`  ⚠️  Slide ${index + 1}: Missing title`);
        }
        
        // Check word limits
        const titleBlock = slide.blocks.find(b => b.type === 'Heading');
        if (titleBlock && titleBlock.text.split(' ').length > 8) {
          qualityIssues++;
          console.log(`  ⚠️  Slide ${index + 1}: Title too long (${titleBlock.text.split(' ').length} words)`);
        }
        
        // Check bullet limits
        const bulletsBlock = slide.blocks.find(b => b.type === 'Bullets');
        if (bulletsBlock && bulletsBlock.items.length > 6) {
          qualityIssues++;
          console.log(`  ⚠️  Slide ${index + 1}: Too many bullets (${bulletsBlock.items.length})`);
        }
      });
      
      if (qualityIssues === 0) {
        console.log(`✅ ${testCase.name}: PASS - High quality slides\n`);
      } else {
        console.log(`⚠️  ${testCase.name}: PARTIAL - ${qualityIssues} quality issues\n`);
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.name}: FAIL - ${error.message}\n`);
    }
  }
}

async function testAPIHealth() {
  console.log('🏥 Testing Multi-Model API Health...');
  
  try {
    const response = await fetch(`${API_BASE}/api/multi-model-generate/health`);
    
    if (response.ok) {
      const health = await response.json();
      console.log('✅ API is healthy');
      console.log(`📊 Router status:`, health.router);
      console.log(`🤖 Agents: ${Object.keys(health.agents).length} initialized`);
      return true;
    } else {
      console.log(`❌ API health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API health check failed: ${error.message}`);
    return false;
  }
}

async function testAudienceAdaptation() {
  console.log('🎯 Testing Audience Adaptation...');
  
  try {
    // First generate a base presentation
    const baseResponse = await fetch(`${API_BASE}/api/multi-model-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Machine Learning Fundamentals',
        audience: 'Technical developers',
        tone: 'Technical and detailed',
        desiredSlideCount: 10,
        policy: 'balanced',
      }),
    });

    if (!baseResponse.ok) {
      throw new Error('Base generation failed');
    }

    const baseResult = await baseResponse.json();
    console.log('✅ Base presentation generated');

    // Test audience adaptation
    const adaptationResponse = await fetch(`${API_BASE}/api/multi-model-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Machine Learning Fundamentals',
        audience: 'Technical developers',
        tone: 'Technical and detailed',
        desiredSlideCount: 10,
        policy: 'balanced',
        adaptForAudience: {
          targetAudience: 'Business executives',
          targetDuration: 15, // 15 minutes
        },
      }),
    });

    if (adaptationResponse.ok) {
      const adaptationResult = await adaptationResponse.json();
      if (adaptationResult.audienceAdaptation) {
        console.log('✅ Audience adaptation successful');
        console.log(`📊 Original slides: ${baseResult.deck.slides.length}`);
        console.log(`📊 Adapted slides: ${adaptationResult.audienceAdaptation.adaptedDeck.slides.length}`);
        console.log(`📝 Changes: ${adaptationResult.audienceAdaptation.changes.length}`);
      } else {
        console.log('⚠️  Audience adaptation not performed');
      }
    } else {
      console.log('⚠️  Audience adaptation failed');
    }

  } catch (error) {
    console.log(`❌ Audience adaptation test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Multi-Model SlideSmith Test Suite\n');
  console.log('=' .repeat(60));
  
  // Test API health first
  const isHealthy = await testAPIHealth();
  
  if (!isHealthy) {
    console.log('❌ API is not healthy. Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // Run multi-model generation tests
  await testMultiModelGeneration();
  
  // Test audience adaptation
  await testAudienceAdaptation();
  
  console.log('=' .repeat(60));
  console.log('🎉 Multi-Model test suite completed!');
  console.log('\n📝 To test manually:');
  console.log('1. Go to http://localhost:3000/studio');
  console.log('2. Use the new multi-model API endpoint');
  console.log('3. Try different policies: quality, speed, cost, balanced, local-only');
  console.log('4. Test audience adaptation and executive summaries');
}

// Run the test suite
main().catch(console.error);
