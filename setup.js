#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Typapp Setup Script');
console.log('======================\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check for environment file
const envFile = path.join(__dirname, '.env');
const envExampleFile = path.join(__dirname, 'env.example');

if (!fs.existsSync(envFile)) {
  console.log('\n📝 Creating environment file...');
  try {
    fs.copyFileSync(envExampleFile, envFile);
    console.log('✅ Environment file created from template');
    console.log('⚠️  Please update .env with your Google Cloud credentials');
  } catch (error) {
    console.error('❌ Failed to create environment file:', error.message);
  }
} else {
  console.log('✅ Environment file already exists');
}

// Check for Google service account key
const serviceAccountPath = path.join(__dirname, 'server', 'service-account-key.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.log('\n⚠️  Google Service Account Key not found');
  console.log('Please follow these steps:');
  console.log('1. Go to Google Cloud Console');
  console.log('2. Create a service account');
  console.log('3. Download the JSON key file');
  console.log('4. Place it in server/service-account-key.json');
} else {
  console.log('✅ Google Service Account Key found');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Configure your Google Cloud credentials');
console.log('2. Share your Google Drive folders with the service account');
console.log('3. Run "npm run dev" to start the application');
console.log('4. Open http://localhost:3000 in your browser'); 