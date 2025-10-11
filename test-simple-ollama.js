#!/usr/bin/env node

// Simple test to check if Ollama is working
const testOllama = async () => {
  const API_URL = 'http://localhost:11434/v1/chat/completions';
  
  const testData = {
    model: 'gemma3:4b',
    messages: [{ role: 'user', content: 'Hello, respond with just "Hi there!"' }],
    max_tokens: 50,
    temperature: 0.7,
  };

  console.log('🧪 Testing Ollama directly...');
  console.log('📊 Test Data:', JSON.stringify(testData, null, 2));

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
    console.log('✅ Ollama Response:', result);
    
    if (result.choices && result.choices[0]) {
      console.log('💬 Content:', result.choices[0].message.content);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testOllama();
