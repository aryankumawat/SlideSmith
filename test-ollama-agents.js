#!/usr/bin/env node

/**
 * Test script for the multi-agent system with Ollama
 * This script tests the complete pipeline of agents
 */

const { MultiModelOrchestrator } = require('./src/lib/multi-model/orchestrator');

async function testMultiAgentSystem() {
  console.log('🚀 Testing Multi-Agent System with Ollama...\n');

  try {
    // Initialize the orchestrator
    const orchestrator = new MultiModelOrchestrator();
    
    // Wait a moment for agents to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test input
    const testInput = {
      topic: 'The Future of Artificial Intelligence in Healthcare',
      audience: 'Healthcare professionals and medical researchers',
      tone: 'Professional and informative',
      desiredSlideCount: 8,
      theme: 'professional',
      duration: 15,
      enableLive: true,
      policy: 'balanced' // Use balanced policy for testing
    };

    console.log('📋 Test Input:');
    console.log(`   Topic: ${testInput.topic}`);
    console.log(`   Audience: ${testInput.audience}`);
    console.log(`   Tone: ${testInput.tone}`);
    console.log(`   Slides: ${testInput.desiredSlideCount}`);
    console.log(`   Duration: ${testInput.duration} minutes\n`);

    console.log('🔄 Starting presentation generation...\n');

    // Generate the presentation
    const startTime = Date.now();
    const result = await orchestrator.generatePresentation(testInput);
    const endTime = Date.now();

    console.log('✅ Presentation generated successfully!\n');

    // Display results
    console.log('📊 Results:');
    console.log(`   Total slides: ${result.deck.slides.length}`);
    console.log(`   Processing time: ${(endTime - startTime) / 1000}s`);
    console.log(`   Total tokens: ${result.metadata.totalTokens}`);
    console.log(`   Total cost: $${result.metadata.totalCost.toFixed(4)}`);
    
    console.log('\n🎯 Quality Scores:');
    console.log(`   Fact Check: ${result.metadata.qualityScores.factCheck}`);
    console.log(`   Accessibility: ${result.metadata.qualityScores.accessibility}`);
    console.log(`   Readability: ${result.metadata.qualityScores.readability}`);
    console.log(`   Consistency: ${result.metadata.qualityScores.consistency}`);

    console.log('\n📝 Slide Overview:');
    result.deck.slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title || 'Untitled'}`);
    });

    if (result.executiveSummary) {
      console.log('\n📧 Executive Summary generated');
    }

    if (result.qualityChecks && result.qualityChecks.length > 0) {
      console.log(`\n🔍 Quality Checks: ${result.qualityChecks.length} issues found`);
    }

    console.log('\n🎉 Multi-agent system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Check if it's an Ollama connection issue
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure Ollama is running on http://localhost:11434');
      console.log('   You can start it with: ollama serve');
    }
  }
}

// Run the test
testMultiAgentSystem().catch(console.error);
