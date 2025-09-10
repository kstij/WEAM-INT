#!/usr/bin/env node

const AppScanner = require('./src/scanner/AppScanner');
const CodeGenerator = require('./src/generator/CodeGenerator');
const path = require('path');

async function demoIntegration() {
  console.log('🚀 AI App Integrator Demo\n');
  
  try {
    // Test with AI-VideoGen
    const appPath = path.join(__dirname, '../AI-VideoGen');
    console.log(`📁 Scanning app: ${appPath}\n`);
    
    // Step 1: Scan the app
    const scanner = new AppScanner();
    const appInfo = await scanner.scanApp(appPath);
    
    console.log('📊 App Analysis Results:');
    console.log(`   App Name: ${appInfo.name}`);
    console.log(`   App Type: ${appInfo.type}`);
    console.log(`   Framework: ${appInfo.framework}`);
    console.log(`   API Routes: ${appInfo.apiRoutes.length} found`);
    console.log(`   Database Models: ${appInfo.models.length} found`);
    console.log(`   Components: ${appInfo.components.length} found`);
    console.log(`   Has Auth: ${appInfo.hasAuth ? 'Yes' : 'No'}`);
    console.log(`   Has Database: ${appInfo.hasDatabase ? 'Yes' : 'No'}`);
    console.log(`   Integration Points: ${appInfo.integrationPoints.length} identified\n`);
    
    // Step 2: Generate integration
    console.log('⚡ Generating integration code...\n');
    
    const userPreferences = {
      appName: 'AI Video Generator',
      description: 'AI-powered video generation and enhancement tool',
      category: 'Creative',
      addAuth: true,
      addDatabase: true,
      addBranding: true
    };
    
    const generator = new CodeGenerator();
    const integrationFiles = await generator.generateIntegration(appInfo, userPreferences);
    
    console.log('✅ Integration files generated:');
    integrationFiles.forEach(file => {
      console.log(`   📄 ${file.type}: ${file.path}`);
      console.log(`      ${file.description}`);
    });
    
    console.log(`\n🎉 Integration complete! ${integrationFiles.length} files generated.`);
    console.log('\nNext steps:');
    console.log('1. Review the generated files in ./weam-integration/');
    console.log('2. Copy files to your app following the integration guide');
    console.log('3. Test your app with Weam integration');
    console.log('4. Deploy to Weam Supersolutions');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

// Run the demo
demoIntegration();
