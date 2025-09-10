const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');

class CodeGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = './weam-integration';
  }

  async generateIntegration(appInfo, userPreferences) {
    const integrationFiles = [];
    
    try {
      // Create output directory
      await fs.ensureDir(this.outputDir);
      
      // Generate Weam session middleware
      if (userPreferences.addAuth) {
        const sessionFile = await this.generateSessionMiddleware(appInfo);
        integrationFiles.push(sessionFile);
      }
      
      // Generate database integration
      if (userPreferences.addDatabase) {
        const dbFiles = await this.generateDatabaseIntegration(appInfo);
        integrationFiles.push(...dbFiles);
      }
      
      // Generate Weam branding
      if (userPreferences.addBranding) {
        const brandingFiles = await this.generateBranding(appInfo, userPreferences);
        integrationFiles.push(...brandingFiles);
      }
      
      // Generate proxy routes for Weam
      const proxyFiles = await this.generateProxyRoutes(appInfo, userPreferences);
      integrationFiles.push(...proxyFiles);
      
      // Generate environment configuration
      const envFile = await this.generateEnvironmentConfig(appInfo, userPreferences);
      integrationFiles.push(envFile);
      
      // Generate integration documentation
      const docFile = await this.generateDocumentation(appInfo, userPreferences);
      integrationFiles.push(docFile);
      
      // Generate package.json updates
      const packageFile = await this.updatePackageJson(appInfo, userPreferences);
      integrationFiles.push(packageFile);
      
      return integrationFiles;
    } catch (error) {
      throw new Error(`Failed to generate integration: ${error.message}`);
    }
  }

  async generateSessionMiddleware(appInfo) {
    const template = await fs.readFile(path.join(this.templatesDir, 'weamSession.ejs'), 'utf8');
    const content = ejs.render(template, {
      appName: appInfo.name,
      framework: appInfo.framework
    });
    
    const filePath = path.join(this.outputDir, 'middleware/weamSession.js');
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    
    return {
      type: 'middleware',
      path: filePath,
      description: 'Weam session middleware for authentication'
    };
  }

  async generateDatabaseIntegration(appInfo) {
    const files = [];
    
    // Generate database connection
    const dbTemplate = await fs.readFile(path.join(this.templatesDir, 'database.ejs'), 'utf8');
    const dbContent = ejs.render(dbTemplate, {
      appName: appInfo.name,
      models: appInfo.models
    });
    
    const dbFilePath = path.join(this.outputDir, 'lib/db.js');
    await fs.ensureDir(path.dirname(dbFilePath));
    await fs.writeFile(dbFilePath, dbContent);
    files.push({
      type: 'database',
      path: dbFilePath,
      description: 'Database connection with Weam integration'
    });
    
    // Update existing models
    for (const model of appInfo.models) {
      const modelTemplate = await fs.readFile(path.join(this.templatesDir, 'modelUpdate.ejs'), 'utf8');
      const modelContent = ejs.render(modelTemplate, {
        modelName: model.name,
        modelType: model.type,
        appName: appInfo.name
      });
      
      const modelFilePath = path.join(this.outputDir, `models/${model.name}.js`);
      await fs.ensureDir(path.dirname(modelFilePath));
      await fs.writeFile(modelFilePath, modelContent);
      files.push({
        type: 'model',
        path: modelFilePath,
        description: `Updated ${model.name} model with Weam user/company fields`
      });
    }
    
    return files;
  }

  async generateBranding(appInfo, userPreferences) {
    const files = [];
    
    // Generate Weam logo component
    const logoTemplate = await fs.readFile(path.join(this.templatesDir, 'weamLogo.ejs'), 'utf8');
    const logoContent = ejs.render(logoTemplate, {
      appName: userPreferences.appName
    });
    
    const logoFilePath = path.join(this.outputDir, 'components/WeamLogo.jsx');
    await fs.ensureDir(path.dirname(logoFilePath));
    await fs.writeFile(logoFilePath, logoContent);
    files.push({
      type: 'component',
      path: logoFilePath,
      description: 'Weam logo component'
    });
    
    // Generate navigation component
    const navTemplate = await fs.readFile(path.join(this.templatesDir, 'weamNavigation.ejs'), 'utf8');
    const navContent = ejs.render(navTemplate, {
      appName: userPreferences.appName,
      category: userPreferences.category
    });
    
    const navFilePath = path.join(this.outputDir, 'components/WeamNavigation.jsx');
    await fs.ensureDir(path.dirname(navFilePath));
    await fs.writeFile(navFilePath, navContent);
    files.push({
      type: 'component',
      path: navFilePath,
      description: 'Weam navigation component with branding'
    });
    
    // Generate CSS for Weam styling
    const cssTemplate = await fs.readFile(path.join(this.templatesDir, 'weamStyles.ejs'), 'utf8');
    const cssContent = ejs.render(cssTemplate, {
      appName: userPreferences.appName
    });
    
    const cssFilePath = path.join(this.outputDir, 'styles/weam.css');
    await fs.ensureDir(path.dirname(cssFilePath));
    await fs.writeFile(cssFilePath, cssContent);
    files.push({
      type: 'styles',
      path: cssFilePath,
      description: 'Weam brand styling'
    });
    
    return files;
  }

  async generateProxyRoutes(appInfo, userPreferences) {
    const files = [];
    
    // Generate Next.js API proxy route
    const proxyTemplate = await fs.readFile(path.join(this.templatesDir, 'proxyRoute.ejs'), 'utf8');
    const proxyContent = ejs.render(proxyTemplate, {
      appName: userPreferences.appName,
      appPath: appInfo.path,
      apiRoutes: appInfo.apiRoutes,
      port: this.getAppPort(appInfo)
    });
    
    const proxyFilePath = path.join(this.outputDir, 'weam-proxy/[...path]/route.ts');
    await fs.ensureDir(path.dirname(proxyFilePath));
    await fs.writeFile(proxyFilePath, proxyContent);
    files.push({
      type: 'proxy',
      path: proxyFilePath,
      description: 'Weam proxy route for API forwarding'
    });
    
    // Generate Weam page component
    const pageTemplate = await fs.readFile(path.join(this.templatesDir, 'weamPage.ejs'), 'utf8');
    const pageContent = ejs.render(pageTemplate, {
      appName: userPreferences.appName,
      description: userPreferences.description,
      category: userPreferences.category
    });
    
    const pageFilePath = path.join(this.outputDir, 'weam-page/page.tsx');
    await fs.ensureDir(path.dirname(pageFilePath));
    await fs.writeFile(pageFilePath, pageContent);
    files.push({
      type: 'page',
      path: pageFilePath,
      description: 'Weam page component for Supersolutions'
    });
    
    return files;
  }

  async generateEnvironmentConfig(appInfo, userPreferences) {
    const template = await fs.readFile(path.join(this.templatesDir, 'envConfig.ejs'), 'utf8');
    const content = ejs.render(template, {
      appName: userPreferences.appName,
      port: this.getAppPort(appInfo),
      hasAuth: userPreferences.addAuth,
      hasDatabase: userPreferences.addDatabase
    });
    
    const filePath = path.join(this.outputDir, '.env.weam');
    await fs.writeFile(filePath, content);
    
    return {
      type: 'config',
      path: filePath,
      description: 'Environment configuration for Weam integration'
    };
  }

  async generateDocumentation(appInfo, userPreferences) {
    const template = await fs.readFile(path.join(this.templatesDir, 'integrationDoc.ejs'), 'utf8');
    const content = ejs.render(template, {
      appName: userPreferences.appName,
      description: userPreferences.description,
      category: userPreferences.category,
      appInfo,
      userPreferences
    });
    
    const filePath = path.join(this.outputDir, 'WEAM_INTEGRATION.md');
    await fs.writeFile(filePath, content);
    
    return {
      type: 'documentation',
      path: filePath,
      description: 'Integration documentation and setup guide'
    };
  }

  async updatePackageJson(appInfo, userPreferences) {
    const packageJsonPath = path.join(appInfo.path, 'package.json');
    let packageJson = {};
    
    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }
    
    // Add Weam integration dependencies
    const weamDeps = {
      'iron-session': '^6.3.1',
      'cors': '^2.8.5',
      'axios': '^1.6.0'
    };
    
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...weamDeps
    };
    
    // Add integration scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'weam:integrate': 'node weam-integration/setup.js',
      'weam:test': 'node weam-integration/test.js'
    };
    
    const filePath = path.join(this.outputDir, 'package.json.weam');
    await fs.writeFile(filePath, JSON.stringify(packageJson, null, 2));
    
    return {
      type: 'package',
      path: filePath,
      description: 'Updated package.json with Weam dependencies'
    };
  }

  getAppPort(appInfo) {
    // Default ports based on framework
    const defaultPorts = {
      'next.js': 3000,
      'react': 3000,
      'express': 3001,
      'vue': 3000,
      'angular': 4200
    };
    
    return defaultPorts[appInfo.framework] || 3000;
  }
}

module.exports = CodeGenerator;
