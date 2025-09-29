#!/usr/bin/env node

/**
 * InvestX Troubleshooting Script
 * Helps diagnose and fix common development issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 InvestX Troubleshooting Script');
console.log('================================\n');

// Check if .next directory exists and is corrupted
function checkBuildCache() {
  console.log('📦 Checking build cache...');
  const nextDir = path.join(process.cwd(), '.next');

  if (fs.existsSync(nextDir)) {
    console.log('⚠️  .next directory exists - this can cause cache corruption issues');
    console.log('💡 Recommendation: Run "npm run dev:clean" for a fresh start\n');
  } else {
    console.log('✅ No build cache found - should be clean\n');
  }
}

// Check if node_modules exists
function checkNodeModules() {
  console.log('📚 Checking node_modules...');
  const nodeModulesDir = path.join(process.cwd(), 'node_modules');

  if (fs.existsSync(nodeModulesDir)) {
    console.log('✅ node_modules exists');
  } else {
    console.log('❌ node_modules missing - run "npm install"\n');
  }
}

// Check environment file
function checkEnvFile() {
  console.log('🔐 Checking environment configuration...');
  const envFile = path.join(process.cwd(), '.env.local');
  const envExample = path.join(process.cwd(), '.env.example');

  if (fs.existsSync(envFile)) {
    console.log('✅ .env.local exists');
  } else if (fs.existsSync(envExample)) {
    console.log('⚠️  .env.local missing - copy from .env.example');
  } else {
    console.log('❌ Environment file missing');
  }
  console.log('');
}

// Quick fix options
function showFixes() {
  console.log('🚀 Quick Fixes:');
  console.log('---------------');
  console.log('1. Clear cache and restart: npm run dev:clean');
  console.log('2. Full clean: npm run clean:full');
  console.log('3. Reinstall dependencies: rm -rf node_modules && npm install');
  console.log('4. Check environment: copy .env.example to .env.local\n');
}

// Run checks
checkBuildCache();
checkNodeModules();
checkEnvFile();
showFixes();

console.log('✨ Troubleshooting complete!');