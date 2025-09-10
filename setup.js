#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

async function setup() {
  console.log(chalk.cyan.bold('🚀 AI App Integrator Setup\n'));
  
  try {
    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, 'env.example');
    
    if (await fs.pathExists(envPath)) {
      console.log(chalk.yellow('⚠️  .env file already exists'));
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Do you want to overwrite it?',
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.green('✅ Setup cancelled - keeping existing .env'));
        return;
      }
    }
    
    // Get OpenAI API key
    const { openaiKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'openaiKey',
        message: 'Enter your OpenAI API key:',
        validate: (input) => input.length > 0 || 'OpenAI API key is required'
      }
    ]);
    
    // Get other optional settings
    const { weamPassword, mongodbUri } = await inquirer.prompt([
      {
        type: 'input',
        name: 'weamPassword',
        message: 'Weam cookie password (optional):',
        default: 'your-secret-password-here'
      },
      {
        type: 'input',
        name: 'mongodbUri',
        message: 'MongoDB URI (optional):',
        default: 'mongodb://localhost:27017/weam-integrations'
      }
    ]);
    
    // Create .env file
    const envContent = `# AI App Integrator Configuration
PORT=3005
NODE_ENV=development

# OpenAI Configuration (REQUIRED for AI integration)
OPENAI_API_KEY=${openaiKey}

# Weam Integration Settings
WEAM_COOKIE_NAME=weam
WEAM_COOKIE_PASSWORD=${weamPassword}
WEAM_BASE_URL=https://app.weam.ai

# Database Configuration (for testing integrations)
MONGODB_URI=${mongodbUri}

# AI App Integrator Settings
INTEGRATOR_API_KEY=your-integrator-api-key
TEMPLATE_REPO_URL=https://github.com/weam-ai/integration-templates

# File Upload Settings
MAX_FILE_SIZE=100MB
UPLOAD_DIR=./uploads
TEMP_DIR=./temp

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/integrator.log
`;
    
    await fs.writeFile(envPath, envContent);
    
    console.log(chalk.green.bold('\n✅ Setup Complete!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. Clone this repo in your app folder'));
    console.log(chalk.gray('2. Run: node ai-app-integrator/src/index.js ai-integrate .'));
    console.log(chalk.gray('3. AI will automatically modify your app files!'));
    
    console.log(chalk.cyan.bold('\n🎉 Ready to integrate apps with Weam!'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

setup();
