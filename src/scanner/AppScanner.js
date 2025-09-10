const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

class AppScanner {
  constructor() {
    this.supportedFrameworks = {
      'next.js': ['next.config.js', 'next.config.ts', 'pages/', 'app/'],
      'react': ['src/', 'public/', 'package.json'],
      'express': ['server.js', 'app.js', 'index.js', 'routes/'],
      'vue': ['vue.config.js', 'src/', 'components/'],
      'angular': ['angular.json', 'src/', 'package.json'],
      'svelte': ['svelte.config.js', 'src/', 'package.json']
    };
  }

  async scanApp(appPath) {
    const appInfo = {
      name: path.basename(appPath),
      path: appPath,
      type: 'unknown',
      framework: 'unknown',
      description: '',
      version: '1.0.0',
      apiRoutes: [],
      models: [],
      components: [],
      hasAuth: false,
      hasDatabase: false,
      dependencies: {},
      structure: {},
      integrationPoints: []
    };

    try {
      // Read package.json
      await this.analyzePackageJson(appPath, appInfo);
      
      // Detect framework
      await this.detectFramework(appPath, appInfo);
      
      // Scan API routes
      await this.scanApiRoutes(appPath, appInfo);
      
      // Scan database models
      await this.scanDatabaseModels(appPath, appInfo);
      
      // Scan components
      await this.scanComponents(appPath, appInfo);
      
      // Check for authentication
      await this.checkAuthentication(appPath, appInfo);
      
      // Check for database integration
      await this.checkDatabaseIntegration(appPath, appInfo);
      
      // Analyze file structure
      await this.analyzeStructure(appPath, appInfo);
      
      // Identify integration points
      await this.identifyIntegrationPoints(appPath, appInfo);
      
      return appInfo;
    } catch (error) {
      throw new Error(`Failed to scan app: ${error.message}`);
    }
  }

  async analyzePackageJson(appPath, appInfo) {
    const packageJsonPath = path.join(appPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      appInfo.name = packageJson.name || appInfo.name;
      appInfo.description = packageJson.description || '';
      appInfo.version = packageJson.version || '1.0.0';
      appInfo.dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // Detect app type based on dependencies
      if (packageJson.dependencies?.next) {
        appInfo.type = 'web-app';
        appInfo.framework = 'next.js';
      } else if (packageJson.dependencies?.react) {
        appInfo.type = 'web-app';
        appInfo.framework = 'react';
      } else if (packageJson.dependencies?.express) {
        appInfo.type = 'api-server';
        appInfo.framework = 'express';
      } else if (packageJson.dependencies?.vue) {
        appInfo.type = 'web-app';
        appInfo.framework = 'vue';
      }
    }
  }

  async detectFramework(appPath, appInfo) {
    for (const [framework, indicators] of Object.entries(this.supportedFrameworks)) {
      let matches = 0;
      
      for (const indicator of indicators) {
        const indicatorPath = path.join(appPath, indicator);
        if (await fs.pathExists(indicatorPath)) {
          matches++;
        }
      }
      
      if (matches >= indicators.length / 2) {
        appInfo.framework = framework;
        break;
      }
    }
  }

  async scanApiRoutes(appPath, appInfo) {
    const routePatterns = [
      '**/api/**/*.js',
      '**/api/**/*.ts',
      '**/routes/**/*.js',
      '**/routes/**/*.ts',
      '**/server/**/*.js',
      '**/server/**/*.ts'
    ];

    for (const pattern of routePatterns) {
      const files = glob.sync(pattern, { cwd: appPath });
      
      for (const file of files) {
        const filePath = path.join(appPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract route information
        const routes = this.extractRoutes(content, file);
        appInfo.apiRoutes.push(...routes);
      }
    }
  }

  extractRoutes(content, filePath) {
    const routes = [];
    
    // Express.js routes
    const expressMatches = content.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (expressMatches) {
      expressMatches.forEach(match => {
        const method = match.match(/\.(get|post|put|delete|patch)/)[1].toUpperCase();
        const path = match.match(/['"`]([^'"`]+)['"`]/)[1];
        routes.push({
          method,
          path,
          file: filePath,
          framework: 'express'
        });
      });
    }
    
    // Next.js API routes
    const nextMatches = content.match(/export\s+(default\s+)?(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/gi);
    if (nextMatches) {
      const method = nextMatches[0].match(/(GET|POST|PUT|DELETE|PATCH)/i)[0];
      const routePath = filePath.replace(/.*\/api\//, '/api/').replace(/\/route\.(js|ts)$/, '');
      routes.push({
        method,
        path: routePath,
        file: filePath,
        framework: 'next.js'
      });
    }
    
    return routes;
  }

  async scanDatabaseModels(appPath, appInfo) {
    const modelPatterns = [
      '**/models/**/*.js',
      '**/models/**/*.ts',
      '**/schemas/**/*.js',
      '**/schemas/**/*.ts'
    ];

    for (const pattern of modelPatterns) {
      const files = glob.sync(pattern, { cwd: appPath });
      
      for (const file of files) {
        const filePath = path.join(appPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract model information
        const models = this.extractModels(content, file);
        appInfo.models.push(...models);
      }
    }
  }

  extractModels(content, filePath) {
    const models = [];
    
    // Mongoose models
    const mongooseMatches = content.match(/const\s+(\w+)\s*=\s*mongoose\.model\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (mongooseMatches) {
      mongooseMatches.forEach(match => {
        const name = match.match(/const\s+(\w+)/)[1];
        const collection = match.match(/['"`]([^'"`]+)['"`]/)[1];
        models.push({
          name,
          collection,
          file: filePath,
          type: 'mongoose'
        });
      });
    }
    
    // Prisma models
    const prismaMatches = content.match(/model\s+(\w+)\s*\{/g);
    if (prismaMatches) {
      prismaMatches.forEach(match => {
        const name = match.match(/model\s+(\w+)/)[1];
        models.push({
          name,
          file: filePath,
          type: 'prisma'
        });
      });
    }
    
    return models;
  }

  async scanComponents(appPath, appInfo) {
    const componentPatterns = [
      '**/components/**/*.js',
      '**/components/**/*.jsx',
      '**/components/**/*.ts',
      '**/components/**/*.tsx',
      '**/src/**/*.jsx',
      '**/src/**/*.tsx'
    ];

    for (const pattern of componentPatterns) {
      const files = glob.sync(pattern, { cwd: appPath });
      
      for (const file of files) {
        const filePath = path.join(appPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract component information
        const components = this.extractComponents(content, file);
        appInfo.components.push(...components);
      }
    }
  }

  extractComponents(content, filePath) {
    const components = [];
    
    // React components
    const reactMatches = content.match(/(?:export\s+)?(?:default\s+)?(?:function|const)\s+(\w+)/g);
    if (reactMatches) {
      reactMatches.forEach(match => {
        const name = match.match(/(?:function|const)\s+(\w+)/)[1];
        if (name[0] === name[0].toUpperCase()) { // Capitalized = component
          components.push({
            name,
            file: filePath,
            type: 'react'
          });
        }
      });
    }
    
    return components;
  }

  async checkAuthentication(appPath, appInfo) {
    const authIndicators = [
      'iron-session',
      'passport',
      'auth0',
      'firebase-auth',
      'next-auth',
      'jwt',
      'bcrypt',
      'crypto'
    ];

    const packageJsonPath = path.join(appPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const indicator of authIndicators) {
        if (allDeps[indicator]) {
          appInfo.hasAuth = true;
          break;
        }
      }
    }

    // Check for auth-related files
    const authFiles = [
      '**/auth/**/*.js',
      '**/auth/**/*.ts',
      '**/middleware/**/*.js',
      '**/middleware/**/*.ts',
      '**/config/**/*auth*.js',
      '**/config/**/*auth*.ts'
    ];

    for (const pattern of authFiles) {
      const files = glob.sync(pattern, { cwd: appPath });
      if (files.length > 0) {
        appInfo.hasAuth = true;
        break;
      }
    }
  }

  async checkDatabaseIntegration(appPath, appInfo) {
    const dbIndicators = [
      'mongoose',
      'prisma',
      'sequelize',
      'typeorm',
      'mongodb',
      'mysql',
      'postgresql',
      'sqlite'
    ];

    const packageJsonPath = path.join(appPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const indicator of dbIndicators) {
        if (allDeps[indicator]) {
          appInfo.hasDatabase = true;
          break;
        }
      }
    }
  }

  async analyzeStructure(appPath, appInfo) {
    const structure = await this.getDirectoryStructure(appPath);
    appInfo.structure = structure;
  }

  async getDirectoryStructure(dir, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return null;
    
    const items = await fs.readdir(dir);
    const structure = {};
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        structure[item] = await this.getDirectoryStructure(itemPath, maxDepth, currentDepth + 1);
      } else if (stat.isFile()) {
        structure[item] = 'file';
      }
    }
    
    return structure;
  }

  async identifyIntegrationPoints(appPath, appInfo) {
    const integrationPoints = [];
    
    // API endpoints that need Weam auth
    appInfo.apiRoutes.forEach(route => {
      if (this.needsAuth(route.path)) {
        integrationPoints.push({
          type: 'auth',
          location: route.file,
          description: `Add Weam authentication to ${route.method} ${route.path}`
        });
      }
    });
    
    // Database models that need user association
    appInfo.models.forEach(model => {
      integrationPoints.push({
        type: 'database',
        location: model.file,
        description: `Add user/company fields to ${model.name} model`
      });
    });
    
    // UI components that need Weam branding
    appInfo.components.forEach(component => {
      if (this.needsBranding(component.name)) {
        integrationPoints.push({
          type: 'branding',
          location: component.file,
          description: `Apply Weam branding to ${component.name} component`
        });
      }
    });
    
    appInfo.integrationPoints = integrationPoints;
  }

  needsAuth(routePath) {
    const protectedPaths = ['/api/', '/admin/', '/dashboard/', '/profile/'];
    return protectedPaths.some(protectedPath => routePath.includes(protectedPath));
  }

  needsBranding(componentName) {
    const brandingComponents = ['Header', 'Navbar', 'Navigation', 'Layout', 'App'];
    return brandingComponents.some(brand => componentName.includes(brand));
  }
}

module.exports = AppScanner;
