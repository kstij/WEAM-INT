#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');

const AppScanner = require('./scanner/AppScanner');
const CodeGenerator = require('./generator/CodeGenerator');
const IntegrationTester = require('./utils/IntegrationTester');
const AIIntegrator = require('./ai/AIIntegrator');

// ASCII Art for weamInt
function showASCIIArt() {
  console.clear();
  console.log(chalk.green(`
__        _______    _    __  __      ___ _   _ _____ 
\\ \\      / / ____|  / \\  |  \\/  |    |_ _| \\ | |_   _|
 \\ \\ /\\ / /|  _|   / _ \\ | |\\/| |_____| ||  \\| | | |  
  \\ V  V / | |___ / ___ \\| |  | |_____| || |\\  | | |  
   \\_/\\_/  |_____/_/   \\_\\_|  |_|    |___|_| \\_| |_|  


  `));
  
  console.log(chalk.cyan.bold('    🤖 AI-Powered Weam Integration Tool'));
  console.log(chalk.gray('    Automatically integrate your apps with Weam.ai\n'));
}

// AI-powered integration flow
async function integrateAppWithAI(appPath) {
  const spinner = ora('🤖 AI is analyzing your app...').start();
  
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      spinner.fail('OpenAI API key not found!');
      console.log(chalk.yellow('\n⚠️  Please set your OpenAI API key:'));
      console.log(chalk.gray('export OPENAI_API_KEY=your-api-key-here'));
      console.log(chalk.gray('Or add it to your .env file'));
      process.exit(1);
    }
    
    // Get user preferences
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'What should this app be called in Weam?',
        default: path.basename(appPath),
        validate: (input) => input.length > 0 || 'App name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Brief description of your app:',
        default: 'AI-powered application'
      },
      {
        type: 'list',
        name: 'category',
        message: 'Which category should this app go in?',
        choices: [
          'Productivity',
          'Creative',
          'Analytics',
          'Communication',
          'Development',
          'Marketing',
          'Other'
        ]
      },
      {
        type: 'confirm',
        name: 'addAuth',
        message: 'Add Weam authentication to your app?',
        default: true
      },
      {
        type: 'confirm',
        name: 'addDatabase',
        message: 'Integrate with Weam database?',
        default: true
      },
      {
        type: 'confirm',
        name: 'addBranding',
        message: 'Apply Weam branding (logo, navigation)?',
        default: true
      }
    ]);
    
    // Use AI to integrate the app
    const aiIntegrator = new AIIntegrator();
    const result = await aiIntegrator.integrateApp(appPath, answers);
    
    // Show results
    console.log(chalk.green.bold('\n✅ AI Integration Complete!'));
    console.log(chalk.white(`   Files modified: ${result.summary.successful}`));
    console.log(chalk.white(`   Files failed: ${result.summary.failed}`));
    
    if (result.summary.failed > 0) {
      console.log(chalk.yellow(`   ⚠️  ${result.summary.failed} files had issues - check the logs`));
    }
    
    console.log(chalk.cyan.bold('\n🎉 Your app is now integrated with Weam!'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('1. Review the changes made by AI'));
    console.log(chalk.gray('2. Test your app locally'));
    console.log(chalk.gray('3. Deploy to Weam Supersolutions'));
    
    // Show modified files
    if (result.changes.length > 0) {
      console.log(chalk.blue.bold('\n📁 Modified Files:'));
      result.changes.forEach(change => {
        const status = change.success ? '✅' : '❌';
        console.log(chalk.gray(`   ${status} ${change.file}`));
      });
    }
    
  } catch (error) {
    spinner.fail('AI integration failed!');
    console.error(chalk.red.bold('\n❌ Error:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// Traditional integration flow (for comparison)
async function integrateApp(appPath) {
  const spinner = ora('Initializing AI App Integrator...').start();
  
  try {
    // Step 1: Scan the app
    spinner.text = '🔍 Scanning your app structure...';
    const scanner = new AppScanner();
    const appInfo = await scanner.scanApp(appPath);
    spinner.succeed('App structure analyzed!');
    
    // Step 2: Show analysis results
    console.log(chalk.green.bold('\n📊 App Analysis Results:'));
    console.log(chalk.white(`   App Type: ${appInfo.type}`));
    console.log(chalk.white(`   Framework: ${appInfo.framework}`));
    console.log(chalk.white(`   API Routes: ${appInfo.apiRoutes.length} found`));
    console.log(chalk.white(`   Database Models: ${appInfo.models.length} found`));
    console.log(chalk.white(`   Authentication: ${appInfo.hasAuth ? 'Detected' : 'Not found'}`));
    
    // Step 3: Get user preferences
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'What should this app be called in Weam?',
        default: appInfo.name,
        validate: (input) => input.length > 0 || 'App name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Brief description of your app:',
        default: appInfo.description
      },
      {
        type: 'list',
        name: 'category',
        message: 'Which category should this app go in?',
        choices: [
          'Productivity',
          'Creative',
          'Analytics',
          'Communication',
          'Development',
          'Marketing',
          'Other'
        ]
      },
      {
        type: 'confirm',
        name: 'addAuth',
        message: 'Add Weam authentication to your app?',
        default: !appInfo.hasAuth
      },
      {
        type: 'confirm',
        name: 'addDatabase',
        message: 'Integrate with Weam database?',
        default: true
      },
      {
        type: 'confirm',
        name: 'addBranding',
        message: 'Apply Weam branding (logo, navigation)?',
        default: true
      }
    ]);
    
    // Step 4: Generate integration code
    spinner.start('⚡ Generating integration code...');
    const generator = new CodeGenerator();
    const integrationFiles = await generator.generateIntegration(appInfo, answers);
    spinner.succeed('Integration code generated!');
    
    // Step 5: Test integration
    spinner.start('🧪 Testing integration...');
    const tester = new IntegrationTester();
    const testResults = await tester.testIntegration(appPath, integrationFiles);
    spinner.succeed('Integration tests completed!');
    
    // Step 6: Show results
    console.log(chalk.green.bold('\n✅ Integration Complete!'));
    console.log(chalk.white(`   Files created: ${integrationFiles.length}`));
    console.log(chalk.white(`   Tests passed: ${testResults.passed}/${testResults.total}`));
    
    if (testResults.failed > 0) {
      console.log(chalk.yellow(`   ⚠️  ${testResults.failed} tests failed - check the logs`));
    }
    
    console.log(chalk.cyan.bold('\n🎉 Your app is now ready for Weam integration!'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('1. Review the generated files'));
    console.log(chalk.gray('2. Test your app locally'));
    console.log(chalk.gray('3. Deploy to Weam Supersolutions'));
    
  } catch (error) {
    spinner.fail('Integration failed!');
    console.error(chalk.red.bold('\n❌ Error:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// Main CLI Menu
async function showMainMenu() {
  showASCIIArt();
  
  console.log(chalk.yellow.bold('    ┌─────────────────────────────────────────┐'));
  console.log(chalk.yellow.bold('    │              MAIN MENU                  │'));
  console.log(chalk.yellow.bold('    └─────────────────────────────────────────┘\n'));
  
  console.log(chalk.white('    [1] 🤖 AI Integrate App (Recommended)'));
  console.log(chalk.white('    [2] 🔧 Traditional Integration'));
  console.log(chalk.white('    [3] 🔍 Scan App Structure'));
  console.log(chalk.white('    [4] ⚙️  Setup Configuration'));
  console.log(chalk.white('    [5] 🌐 Start Web Interface'));
  console.log(chalk.white('    [6] ❓ Help & Documentation'));
  console.log(chalk.white('    [7] 🚪 Exit\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(chalk.cyan('    Enter your choice (1-7): '), async (answer) => {
      rl.close();
      await handleMenuChoice(answer.trim());
      resolve();
    });
  });
}

// Handle menu choices
async function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      await handleAIIntegration();
      break;
    case '2':
      await handleTraditionalIntegration();
      break;
    case '3':
      await handleScanApp();
      break;
    case '4':
      await handleSetup();
      break;
    case '5':
      await handleWebInterface();
      break;
    case '6':
      await handleHelp();
      break;
    case '7':
      await handleExit();
      break;
    default:
      console.log(chalk.red('\n    ❌ Invalid choice. Please enter 1-7.'));
      await waitForEnter();
      await showMainMenu();
  }
}

// AI Integration handler
async function handleAIIntegration() {
  console.log(chalk.green.bold('\n    🤖 AI Integration Mode'));
  console.log(chalk.gray('    This will automatically modify your app files to integrate with Weam.\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const appPath = await new Promise((resolve) => {
    rl.question(chalk.cyan('    Enter app path (or press Enter for current directory): '), (answer) => {
      rl.close();
      resolve(answer.trim() || '.');
    });
  });
  
  const fullPath = path.resolve(appPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`\n    ❌ Path does not exist: ${fullPath}`));
    await waitForEnter();
    await showMainMenu();
    return;
  }
  
  try {
    await integrateAppWithAI(fullPath);
  } catch (error) {
    console.log(chalk.red(`\n    ❌ Integration failed: ${error.message}`));
  }
  
  await waitForEnter();
  await showMainMenu();
}

// Traditional Integration handler
async function handleTraditionalIntegration() {
  console.log(chalk.blue.bold('\n    🔧 Traditional Integration Mode'));
  console.log(chalk.gray('    This will generate integration files for you to copy manually.\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const appPath = await new Promise((resolve) => {
    rl.question(chalk.cyan('    Enter app path (or press Enter for current directory): '), (answer) => {
      rl.close();
      resolve(answer.trim() || '.');
    });
  });
  
  const fullPath = path.resolve(appPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`\n    ❌ Path does not exist: ${fullPath}`));
    await waitForEnter();
    await showMainMenu();
    return;
  }
  
  try {
    await integrateApp(fullPath);
  } catch (error) {
    console.log(chalk.red(`\n    ❌ Integration failed: ${error.message}`));
  }
  
  await waitForEnter();
  await showMainMenu();
}

// Scan App handler
async function handleScanApp() {
  console.log(chalk.magenta.bold('\n    🔍 App Structure Scanner'));
  console.log(chalk.gray('    This will analyze your app without making any changes.\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const appPath = await new Promise((resolve) => {
    rl.question(chalk.cyan('    Enter app path (or press Enter for current directory): '), (answer) => {
      rl.close();
      resolve(answer.trim() || '.');
    });
  });
  
  const fullPath = path.resolve(appPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`\n    ❌ Path does not exist: ${fullPath}`));
    await waitForEnter();
    await showMainMenu();
    return;
  }
  
  try {
    const scanner = new AppScanner();
    const appInfo = await scanner.scanApp(fullPath);
    
    console.log(chalk.green.bold('\n    📊 App Analysis Results:'));
    console.log(chalk.white(`    App Name: ${appInfo.name}`));
    console.log(chalk.white(`    Framework: ${appInfo.framework}`));
    console.log(chalk.white(`    Type: ${appInfo.type}`));
    console.log(chalk.white(`    API Routes: ${appInfo.apiRoutes.length}`));
    console.log(chalk.white(`    Models: ${appInfo.models.length}`));
    console.log(chalk.white(`    Components: ${appInfo.components.length}`));
    console.log(chalk.white(`    Has Auth: ${appInfo.hasAuth ? 'Yes' : 'No'}`));
    console.log(chalk.white(`    Has Database: ${appInfo.hasDatabase ? 'Yes' : 'No'}`));
  } catch (error) {
    console.log(chalk.red(`\n    ❌ Scan failed: ${error.message}`));
  }
  
  await waitForEnter();
  await showMainMenu();
}

// Setup handler
async function handleSetup() {
  console.log(chalk.yellow.bold('\n    ⚙️  Configuration Setup'));
  console.log(chalk.gray('    This will help you configure weamInt.\n'));
  
  try {
    require('./setup');
  } catch (error) {
    console.log(chalk.red(`\n    ❌ Setup failed: ${error.message}`));
  }
  
  await waitForEnter();
  await showMainMenu();
}

// Web Interface handler
async function handleWebInterface() {
  console.log(chalk.blue.bold('\n    🌐 Starting Web Interface'));
  console.log(chalk.gray('    Opening web interface at http://localhost:3005\n'));
  
  try {
    require('./ui/server');
    console.log(chalk.green('    ✅ Web interface started successfully!'));
    console.log(chalk.cyan('    Press Ctrl+C to stop the server'));
  } catch (error) {
    console.log(chalk.red(`\n    ❌ Failed to start web interface: ${error.message}`));
  }
  
  await waitForEnter();
  await showMainMenu();
}

// Help handler
async function handleHelp() {
  console.log(chalk.cyan.bold('\n    ❓ Help & Documentation'));
  console.log(chalk.gray('    ┌─────────────────────────────────────────┐'));
  console.log(chalk.gray('    │                                         │'));
  console.log(chalk.white('    │  🤖 AI Integration (Option 1):         │'));
  console.log(chalk.gray('    │     • Automatically modifies your app   │'));
  console.log(chalk.gray('    │     • Requires OpenAI API key           │'));
  console.log(chalk.gray('    │     • Recommended for most users        │'));
  console.log(chalk.gray('    │                                         │'));
  console.log(chalk.white('    │  🔧 Traditional Integration (Option 2):│'));
  console.log(chalk.gray('    │     • Generates files for manual copy   │'));
  console.log(chalk.gray('    │     • No API key required               │'));
  console.log(chalk.gray('    │     • Good for learning the process     │'));
  console.log(chalk.gray('    │                                         │'));
  console.log(chalk.white('    │  🔍 Scan App (Option 3):               │'));
  console.log(chalk.gray('    │     • Analyzes your app structure       │'));
  console.log(chalk.gray('    │     • No changes made                   │'));
  console.log(chalk.gray('    │     • Good for understanding your app   │'));
  console.log(chalk.gray('    │                                         │'));
  console.log(chalk.gray('    └─────────────────────────────────────────┘'));
  
  await waitForEnter();
  await showMainMenu();
}

// Exit handler
async function handleExit() {
  console.log(chalk.green.bold('\n    👋 Thank you for using weamInt!'));
  console.log(chalk.gray('    Happy coding! 🚀\n'));
  process.exit(0);
}

// Utility function to wait for Enter key
async function waitForEnter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(chalk.gray('    Press Enter to continue...'), () => {
      rl.close();
      resolve();
    });
  });
}

// Main entry point
async function main() {
  try {
    while (true) {
      await showMainMenu();
    }
  } catch (error) {
    console.log(chalk.red(`\n    ❌ Unexpected error: ${error.message}`));
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main();
}
