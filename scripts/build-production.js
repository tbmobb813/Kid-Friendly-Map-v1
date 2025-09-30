#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...\n');

// 1. Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('rm -rf .expo dist web-build', { stdio: 'inherit' });
  console.log('✅ Cleaned previous builds\n');
} catch (error) {
  console.warn('⚠️ Warning: Could not clean previous builds\n');
}

// 2. Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('bun install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// 3. Run TypeScript check
console.log('🔍 Running TypeScript check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed\n');
} catch (error) {
  console.error('❌ TypeScript check failed');
  process.exit(1);
}

// 4. Run linting
console.log('🔧 Running linter...');
try {
  execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.warn('⚠️ Warning: Linting issues found, but continuing...\n');
}

// 5. Build for web
console.log('🌐 Building for web...');
try {
  execSync('npx expo export --platform web', { stdio: 'inherit' });
  console.log('✅ Web build completed\n');
} catch (error) {
  console.error('❌ Web build failed');
  process.exit(1);
}

// 6. Generate app.json for EAS Build (if needed)
console.log('📱 Preparing mobile build configuration...');
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Update version for production
const now = new Date();
const buildNumber = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

appJson.expo.version = appJson.expo.version || '1.0.0';
appJson.expo.ios = appJson.expo.ios || {};
appJson.expo.android = appJson.expo.android || {};

appJson.expo.ios.buildNumber = buildNumber;
appJson.expo.android.versionCode = parseInt(buildNumber.replace(/\./g, ''));

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`✅ Updated build numbers: iOS ${buildNumber}, Android ${appJson.expo.android.versionCode}\n`);

// 7. Create deployment checklist
const checklistPath = path.join(__dirname, '..', 'DEPLOYMENT_CHECKLIST.md');
const checklist = `# Deployment Checklist

## Pre-deployment
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] Performance testing completed
- [ ] Accessibility testing completed
- [ ] Security review completed
- [ ] API endpoints configured for production
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Crash reporting configured

## Mobile App Store Deployment
- [ ] App icons and splash screens updated
- [ ] App store descriptions written
- [ ] Screenshots prepared
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] App store metadata configured

### iOS App Store
- [ ] Apple Developer account configured
- [ ] Certificates and provisioning profiles updated
- [ ] App Store Connect configured
- [ ] TestFlight testing completed

### Google Play Store
- [ ] Google Play Console configured
- [ ] Signing key configured
- [ ] Internal testing completed
- [ ] Store listing completed

## Web Deployment
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] CDN configured
- [ ] Performance optimization completed
- [ ] SEO metadata added

## Post-deployment
- [ ] Monitoring dashboards configured
- [ ] Error tracking verified
- [ ] Performance metrics baseline established
- [ ] User feedback channels configured
- [ ] Support documentation updated

## Build Information
- Build Date: ${now.toISOString()}
- iOS Build Number: ${buildNumber}
- Android Version Code: ${appJson.expo.android.versionCode}
- App Version: ${appJson.expo.version}
`;

fs.writeFileSync(checklistPath, checklist);
console.log('✅ Created deployment checklist\n');

console.log('🎉 Production build process completed!');
console.log('📋 Check DEPLOYMENT_CHECKLIST.md for next steps');
console.log('🌐 Web build available in: dist/');
console.log('📱 Mobile builds can be created with: npx eas build --platform all');
