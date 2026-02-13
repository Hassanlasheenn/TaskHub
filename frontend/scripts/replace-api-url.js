#!/usr/bin/env node

/**
 * Script to replace API URL in environment.prod.ts during build
 * Usage: node scripts/replace-api-url.js <api-url>
 */

const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_BASE_URL || process.argv[2] || 'https://api.yourdomain.com';
const envFile = path.join(__dirname, '../src/environments/environment.prod.ts');

console.log(`🔧 Replacing API URL with: ${apiUrl}`);

try {
  let content = fs.readFileSync(envFile, 'utf8');
  
  // Replace the apiBaseUrl value
  content = content.replace(
    /apiBaseUrl:\s*['"](.*?)['"]/,
    `apiBaseUrl: '${apiUrl}'`
  );
  
  fs.writeFileSync(envFile, content, 'utf8');
  console.log(`✅ Successfully updated ${envFile}`);
} catch (error) {
  console.error(`❌ Error updating environment file:`, error);
  process.exit(1);
}
