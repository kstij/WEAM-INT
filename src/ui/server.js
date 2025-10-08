const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');

const AppScanner = require('../scanner/AppScanner');
const CodeGenerator = require('../generator/CodeGenerator');
const IntegrationTester = require('../utils/IntegrationTester');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.post('/api/scan', upload.single('app'), async (req, res, next) => {
  let extractedPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No app file uploaded' });
    }

    const zipPath = req.file.path;
    
    // Extract ZIP file
    const extractDir = path.join('temp', `extracted_${Date.now()}`);
    await fs.ensureDir(extractDir);
    
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);
    
    // Find the root directory (usually the first directory in the ZIP)
    const extractedFiles = await fs.readdir(extractDir);
    const rootDir = extractedFiles.find(file => {
      const fullPath = path.join(extractDir, file);
      return fs.statSync(fullPath).isDirectory();
    });
    
    if (!rootDir) {
      throw new Error('No root directory found in ZIP file');
    }
    
    extractedPath = path.join(extractDir, rootDir);
    
    // Scan the extracted app
    const scanner = new AppScanner();
    const appInfo = await scanner.scanApp(extractedPath);
    
    // Update the path to the extracted directory
    appInfo.path = extractedPath;
    appInfo.originalZipPath = zipPath;

    res.json({
      success: true,
      appInfo
    });
  } catch (error) {
    // Clean up extracted files on error
    if (extractedPath && await fs.pathExists(extractedPath)) {
      await fs.remove(path.dirname(extractedPath));
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/integrate', async (req, res) => {
  try {
    const { appInfo, userPreferences } = req.body;

    if (!appInfo || !userPreferences) {
      return res.status(400).json({ error: 'Missing appInfo or userPreferences' });
    }

    const generator = new CodeGenerator();
    const integrationFiles = await generator.generateIntegration(appInfo, userPreferences);

    const tester = new IntegrationTester();
    const testResults = await tester.testIntegration(appInfo.path, integrationFiles);

    res.json({
      success: true,
      integrationFiles,
      testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup endpoint to remove temporary files
app.post('/api/cleanup', async (req, res) => {
  try {
    const { appPath } = req.body;
    
    if (appPath && await fs.pathExists(appPath)) {
      await fs.remove(path.dirname(appPath));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/templates', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../templates');
    const templates = await fs.readdir(templatesDir);
    
    res.json({
      success: true,
      templates: templates.filter(t => t.endsWith('.ejs'))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handler for Multer 2.x compatibility
app.use(function (err, req, res, next) {
  if (err && err.storageErrors && Array.isArray(err.storageErrors) && err.storageErrors.length) {
    // Multer 2.x may return multiple storage errors
    res.status(400).json({
      success: false,
      error: err.storageErrors.map(e => e.message).join('; ')
    });
  } else if (err && err.code === 'LIMIT_FILE_SIZE') {
    // Multer still uses LIMIT_FILE_SIZE for file size errors
    res.status(400).json({
      success: false,
      error: 'File too large'
    });
  } else if (err && err.name === 'MulterError') {
    // General Multer error
    res.status(400).json({
      success: false,
      error: err.message
    });
  } else {
    next(err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI App Integrator UI running on http://localhost:${PORT}`);
});
