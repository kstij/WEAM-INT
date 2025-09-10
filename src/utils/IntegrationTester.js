const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class IntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: []
    };
  }

  async testIntegration(appPath, integrationFiles) {
    console.log('🧪 Running integration tests...\n');
    
    try {
      // Test 1: Check if generated files exist
      await this.testGeneratedFiles(integrationFiles);
      
      // Test 2: Validate file syntax
      await this.testFileSyntax(integrationFiles);
      
      // Test 3: Test authentication setup
      await this.testAuthenticationSetup(appPath);
      
      // Test 4: Test database integration
      await this.testDatabaseIntegration(appPath);
      
      // Test 5: Test proxy configuration
      await this.testProxyConfiguration(integrationFiles);
      
      // Test 6: Test environment configuration
      await this.testEnvironmentConfiguration(integrationFiles);
      
      this.testResults.total = this.testResults.passed + this.testResults.failed;
      
      return this.testResults;
    } catch (error) {
      this.testResults.errors.push(`Test suite error: ${error.message}`);
      this.testResults.failed++;
      return this.testResults;
    }
  }

  async testGeneratedFiles(integrationFiles) {
    console.log('📁 Testing generated files...');
    
    for (const file of integrationFiles) {
      try {
        if (await fs.pathExists(file.path)) {
          const stats = await fs.stat(file.path);
          if (stats.size > 0) {
            console.log(`   ✅ ${path.basename(file.path)} - Generated successfully`);
            this.testResults.passed++;
          } else {
            console.log(`   ❌ ${path.basename(file.path)} - File is empty`);
            this.testResults.failed++;
            this.testResults.errors.push(`${file.path} is empty`);
          }
        } else {
          console.log(`   ❌ ${path.basename(file.path)} - File not found`);
          this.testResults.failed++;
          this.testResults.errors.push(`${file.path} not found`);
        }
      } catch (error) {
        console.log(`   ❌ ${path.basename(file.path)} - Error: ${error.message}`);
        this.testResults.failed++;
        this.testResults.errors.push(`${file.path}: ${error.message}`);
      }
    }
  }

  async testFileSyntax(integrationFiles) {
    console.log('\n🔍 Testing file syntax...');
    
    for (const file of integrationFiles) {
      try {
        const content = await fs.readFile(file.path, 'utf8');
        
        // Basic syntax checks
        if (file.path.endsWith('.js') || file.path.endsWith('.jsx')) {
          // Check for basic JavaScript syntax
          if (content.includes('const ') || content.includes('function ') || content.includes('module.exports')) {
            console.log(`   ✅ ${path.basename(file.path)} - JavaScript syntax looks good`);
            this.testResults.passed++;
          } else {
            console.log(`   ⚠️  ${path.basename(file.path)} - Unusual JavaScript structure`);
            this.testResults.failed++;
            this.testResults.errors.push(`${file.path} has unusual JavaScript structure`);
          }
        } else if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
          // Check for TypeScript syntax
          if (content.includes('import ') || content.includes('export ') || content.includes('interface ')) {
            console.log(`   ✅ ${path.basename(file.path)} - TypeScript syntax looks good`);
            this.testResults.passed++;
          } else {
            console.log(`   ⚠️  ${path.basename(file.path)} - Unusual TypeScript structure`);
            this.testResults.failed++;
            this.testResults.errors.push(`${file.path} has unusual TypeScript structure`);
          }
        } else if (file.path.endsWith('.json')) {
          // Check JSON syntax
          try {
            JSON.parse(content);
            console.log(`   ✅ ${path.basename(file.path)} - Valid JSON`);
            this.testResults.passed++;
          } catch (error) {
            console.log(`   ❌ ${path.basename(file.path)} - Invalid JSON: ${error.message}`);
            this.testResults.failed++;
            this.testResults.errors.push(`${file.path}: Invalid JSON - ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${path.basename(file.path)} - File type not checked`);
          this.testResults.passed++;
        }
      } catch (error) {
        console.log(`   ❌ ${path.basename(file.path)} - Read error: ${error.message}`);
        this.testResults.failed++;
        this.testResults.errors.push(`${file.path}: Read error - ${error.message}`);
      }
    }
  }

  async testAuthenticationSetup(appPath) {
    console.log('\n🔐 Testing authentication setup...');
    
    try {
      // Check if weamSession middleware was generated
      const sessionFile = path.join(appPath, 'weam-integration/middleware/weamSession.js');
      if (await fs.pathExists(sessionFile)) {
        const content = await fs.readFile(sessionFile, 'utf8');
        
        if (content.includes('iron-session') && content.includes('weamSessionMiddleware')) {
          console.log('   ✅ Weam session middleware generated correctly');
          this.testResults.passed++;
        } else {
          console.log('   ❌ Weam session middleware missing required components');
          this.testResults.failed++;
          this.testResults.errors.push('Weam session middleware missing required components');
        }
      } else {
        console.log('   ❌ Weam session middleware not found');
        this.testResults.failed++;
        this.testResults.errors.push('Weam session middleware not found');
      }
    } catch (error) {
      console.log(`   ❌ Authentication test error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Authentication test: ${error.message}`);
    }
  }

  async testDatabaseIntegration(appPath) {
    console.log('\n🗄️ Testing database integration...');
    
    try {
      // Check if database connection file was generated
      const dbFile = path.join(appPath, 'weam-integration/lib/db.js');
      if (await fs.pathExists(dbFile)) {
        const content = await fs.readFile(dbFile, 'utf8');
        
        if (content.includes('mongoose') && content.includes('weamUserFields')) {
          console.log('   ✅ Database integration generated correctly');
          this.testResults.passed++;
        } else {
          console.log('   ❌ Database integration missing required components');
          this.testResults.failed++;
          this.testResults.errors.push('Database integration missing required components');
        }
      } else {
        console.log('   ❌ Database integration file not found');
        this.testResults.failed++;
        this.testResults.errors.push('Database integration file not found');
      }
    } catch (error) {
      console.log(`   ❌ Database test error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Database test: ${error.message}`);
    }
  }

  async testProxyConfiguration(integrationFiles) {
    console.log('\n🔗 Testing proxy configuration...');
    
    try {
      const proxyFile = integrationFiles.find(f => f.type === 'proxy');
      if (proxyFile) {
        const content = await fs.readFile(proxyFile.path, 'utf8');
        
        if (content.includes('NextRequest') && content.includes('fetch') && content.includes('APP_BASE_URL')) {
          console.log('   ✅ Proxy configuration generated correctly');
          this.testResults.passed++;
        } else {
          console.log('   ❌ Proxy configuration missing required components');
          this.testResults.failed++;
          this.testResults.errors.push('Proxy configuration missing required components');
        }
      } else {
        console.log('   ❌ Proxy configuration not found');
        this.testResults.failed++;
        this.testResults.errors.push('Proxy configuration not found');
      }
    } catch (error) {
      console.log(`   ❌ Proxy test error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Proxy test: ${error.message}`);
    }
  }

  async testEnvironmentConfiguration(integrationFiles) {
    console.log('\n⚙️ Testing environment configuration...');
    
    try {
      const envFile = integrationFiles.find(f => f.type === 'config');
      if (envFile) {
        const content = await fs.readFile(envFile.path, 'utf8');
        
        if (content.includes('WEAM_COOKIE_NAME') && content.includes('MONGODB_URI') && content.includes('PORT')) {
          console.log('   ✅ Environment configuration generated correctly');
          this.testResults.passed++;
        } else {
          console.log('   ❌ Environment configuration missing required variables');
          this.testResults.failed++;
          this.testResults.errors.push('Environment configuration missing required variables');
        }
      } else {
        console.log('   ❌ Environment configuration not found');
        this.testResults.failed++;
        this.testResults.errors.push('Environment configuration not found');
      }
    } catch (error) {
      console.log(`   ❌ Environment test error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Environment test: ${error.message}`);
    }
  }

  // Test if the app can start with the integration
  async testAppStartup(appPath) {
    console.log('\n🚀 Testing app startup...');
    
    try {
      // This would require actually starting the app
      // For now, we'll just check if the main files exist
      const packageJsonPath = path.join(appPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        
        if (packageJson.scripts && packageJson.scripts.start) {
          console.log('   ✅ App has start script');
          this.testResults.passed++;
        } else {
          console.log('   ⚠️  App missing start script');
          this.testResults.failed++;
          this.testResults.errors.push('App missing start script');
        }
      } else {
        console.log('   ❌ package.json not found');
        this.testResults.failed++;
        this.testResults.errors.push('package.json not found');
      }
    } catch (error) {
      console.log(`   ❌ Startup test error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Startup test: ${error.message}`);
    }
  }

  // Generate test report
  generateReport() {
    const report = {
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: this.testResults.total > 0 ? (this.testResults.passed / this.testResults.total * 100).toFixed(1) : 0
      },
      errors: this.testResults.errors,
      timestamp: new Date().toISOString()
    };

    return report;
  }
}

module.exports = IntegrationTester;
