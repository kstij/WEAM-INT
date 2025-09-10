const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const ora = require('ora');

class AIIntegrator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.weamContext = `
# Weam.ai Integration Context

## Authentication System
- Uses iron-session with cookie name "weam"
- Cookie password from WEAM_COOKIE_PASSWORD env var
- Session middleware: weamSessionMiddleware()
- Auth guard: requireWeamAuth()

## Database Integration
- MongoDB with Mongoose
- User fields: { id: String, email: String, name: String, avatar: String }
- Company field: companyId: String
- Timestamps: createdAt, updatedAt
- Public field: isPublic: Boolean

## Branding
- Weam logo component
- "Back to App" button linking to https://app.weam.ai
- Weam color scheme and styling
- Navigation with Weam branding

## API Integration
- Proxy routes in Weam for API forwarding
- CORS configuration for Weam domain
- Error handling with 401 redirects to login

## File Structure
- middleware/weamSession.js - Session handling
- lib/db.js - Database connection
- components/WeamLogo.jsx - Logo component
- components/WeamNavigation.jsx - Navigation
- styles/weam.css - Weam styling
`;

    this.integrationPrompts = {
      express: {
        middleware: `Add Weam session middleware to Express app. Import weamSessionMiddleware and requireWeamAuth, add session middleware, protect API routes with auth.`,
        database: `Update Mongoose models to include Weam user/company fields. Add user: {id, email, name, avatar}, companyId, isPublic, timestamps.`,
        branding: `Add Weam branding to Express app. Include Weam logo, "Back to App" button, and Weam styling.`
      },
      nextjs: {
        middleware: `Add Weam session handling to Next.js app. Use iron-session, add session validation, protect API routes.`,
        database: `Update database models for Weam integration. Add user association and company fields.`,
        branding: `Add Weam components and styling to Next.js app. Include Weam logo and navigation.`
      },
      react: {
        middleware: `Add Weam authentication to React app. Handle session validation, API auth headers, redirect on 401.`,
        database: `Update API calls to include user context and company association.`,
        branding: `Add Weam branding components to React app. Include logo, navigation, and styling.`
      }
    };
  }

  async integrateApp(appPath, options = {}) {
    const spinner = ora('🤖 AI is analyzing your app...').start();
    
    try {
      // Step 1: Analyze the app structure
      const appAnalysis = await this.analyzeApp(appPath);
      spinner.text = '🔍 AI is understanding your code...';
      
      // Step 2: Get AI recommendations
      const recommendations = await this.getAIRecommendations(appAnalysis, options);
      spinner.text = '⚡ AI is making changes...';
      
      // Step 3: Apply AI changes
      const changes = await this.applyAIChanges(appPath, recommendations);
      spinner.succeed('✅ AI integration complete!');
      
      return {
        success: true,
        changes: changes,
        summary: this.generateSummary(changes)
      };
      
    } catch (error) {
      spinner.fail('❌ AI integration failed');
      throw error;
    }
  }

  async analyzeApp(appPath) {
    const analysis = {
      framework: 'unknown',
      files: [],
      packageJson: null,
      hasAuth: false,
      hasDatabase: false,
      apiRoutes: [],
      models: [],
      components: []
    };

    // Read package.json
    const packageJsonPath = path.join(appPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      analysis.packageJson = await fs.readJson(packageJsonPath);
      
      // Detect framework
      if (analysis.packageJson.dependencies?.next) {
        analysis.framework = 'nextjs';
      } else if (analysis.packageJson.dependencies?.express) {
        analysis.framework = 'express';
      } else if (analysis.packageJson.dependencies?.react) {
        analysis.framework = 'react';
      }
    }

    // Scan important files
    const patterns = [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/*.json'
    ];

    for (const pattern of patterns) {
      const files = glob.sync(pattern, { 
        cwd: appPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
      });
      
      for (const file of files) {
        const filePath = path.join(appPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        analysis.files.push({
          path: file,
          content: content,
          type: this.getFileType(file)
        });

        // Analyze content
        if (content.includes('iron-session') || content.includes('passport') || content.includes('auth')) {
          analysis.hasAuth = true;
        }
        
        if (content.includes('mongoose') || content.includes('prisma') || content.includes('database')) {
          analysis.hasDatabase = true;
        }

        // Find API routes
        if (file.includes('/api/') || file.includes('/routes/')) {
          analysis.apiRoutes.push(file);
        }

        // Find models
        if (file.includes('/models/') || file.includes('/schemas/')) {
          analysis.models.push(file);
        }

        // Find components
        if (file.includes('/components/') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
          analysis.components.push(file);
        }
      }
    }

    return analysis;
  }

  async getAIRecommendations(analysis, options) {
    const prompt = `
${this.weamContext}

## App Analysis
- Framework: ${analysis.framework}
- Has Auth: ${analysis.hasAuth}
- Has Database: ${analysis.hasDatabase}
- API Routes: ${analysis.apiRoutes.length}
- Models: ${analysis.models.length}
- Components: ${analysis.components.length}

## Integration Options
- Add Auth: ${options.addAuth !== false}
- Add Database: ${options.addDatabase !== false}
- Add Branding: ${options.addBranding !== false}
- App Name: ${options.appName || 'My App'}

## Key Files to Modify
${analysis.files.slice(0, 10).map(f => `- ${f.path} (${f.type})`).join('\n')}

Please provide specific code changes needed to integrate this app with Weam.ai. For each file that needs modification, provide:
1. File path
2. Specific changes needed
3. Code snippets to add/modify

Focus on:
1. Adding Weam session middleware
2. Updating database models with user/company fields
3. Adding Weam branding components
4. Protecting API routes with authentication
5. Adding proper error handling and redirects

Be specific about what code to add, where to add it, and what to modify.
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert developer specializing in Weam.ai integrations. You understand authentication, database design, and UI/UX patterns. Provide specific, actionable code changes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    });

    return this.parseAIResponse(response.choices[0].message.content);
  }

  async applyAIChanges(appPath, recommendations) {
    const changes = [];
    
    for (const recommendation of recommendations) {
      const filePath = path.join(appPath, recommendation.filePath);
      
      try {
        // Read current file
        let currentContent = '';
        if (await fs.pathExists(filePath)) {
          currentContent = await fs.readFile(filePath, 'utf8');
        }

        // Apply AI changes
        const newContent = await this.applyFileChanges(currentContent, recommendation);
        
        // Write back to file
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, newContent);
        
        changes.push({
          file: recommendation.filePath,
          action: recommendation.action,
          success: true
        });
        
        console.log(chalk.green(`✅ Modified: ${recommendation.filePath}`));
        
      } catch (error) {
        changes.push({
          file: recommendation.filePath,
          action: recommendation.action,
          success: false,
          error: error.message
        });
        
        console.log(chalk.red(`❌ Failed: ${recommendation.filePath} - ${error.message}`));
      }
    }

    return changes;
  }

  async applyFileChanges(currentContent, recommendation) {
    const prompt = `
Current file content:
\`\`\`
${currentContent}
\`\`\`

Required changes:
${recommendation.changes}

Please provide the complete modified file content with all changes applied. Make sure to:
1. Preserve existing functionality
2. Add the required Weam integration code
3. Maintain proper code formatting
4. Include necessary imports
5. Follow best practices

Return only the complete file content, no explanations.
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert code editor. Apply the requested changes to the file while preserving existing functionality. Return only the complete modified file content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    });

    return response.choices[0].message.content;
  }

  parseAIResponse(response) {
    const recommendations = [];
    const lines = response.split('\n');
    
    let currentRecommendation = null;
    
    for (const line of lines) {
      if (line.startsWith('File:')) {
        if (currentRecommendation) {
          recommendations.push(currentRecommendation);
        }
        currentRecommendation = {
          filePath: line.replace('File:', '').trim(),
          action: 'modify',
          changes: ''
        };
      } else if (currentRecommendation && line.trim()) {
        currentRecommendation.changes += line + '\n';
      }
    }
    
    if (currentRecommendation) {
      recommendations.push(currentRecommendation);
    }
    
    return recommendations;
  }

  getFileType(filePath) {
    if (filePath.endsWith('.js')) return 'javascript';
    if (filePath.endsWith('.jsx')) return 'react';
    if (filePath.endsWith('.ts')) return 'typescript';
    if (filePath.endsWith('.tsx')) return 'react-ts';
    if (filePath.endsWith('.json')) return 'json';
    return 'unknown';
  }

  generateSummary(changes) {
    const successful = changes.filter(c => c.success).length;
    const failed = changes.filter(c => !c.success).length;
    
    return {
      total: changes.length,
      successful,
      failed,
      files: changes.map(c => c.file)
    };
  }
}

module.exports = AIIntegrator;
