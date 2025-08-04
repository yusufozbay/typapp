#!/usr/bin/env node

const axios = require('axios');

console.log('🚀 Typapp Deployment Test');
console.log('========================\n');

async function testDeployment() {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  console.log('Testing endpoints...\n');

  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get(`${backendUrl}/api/health`);
    console.log('✅ Backend is running:', healthResponse.data.message);

    // Test demo analysis
    console.log('\n2. Testing Demo Analysis...');
    const demoResponse = await axios.post(`${backendUrl}/api/analyze-demo`, {
      title: 'Test Document',
      content: 'This is a test document with some spelling errors like recieve and seperate.'
    });
    console.log('✅ Demo analysis working:', demoResponse.data.results[0].language);

    console.log('\n🎉 All tests passed! Your deployment is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Set up your Google Gemini API key');
    console.log('2. Configure Google Drive integration');
    console.log('3. Test file upload functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if backend is running');
    console.log('2. Verify environment variables');
    console.log('3. Check network connectivity');
  }
}

testDeployment(); 