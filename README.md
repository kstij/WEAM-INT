# AI App Integrator 🚀

**The easiest way to integrate any vibecoded app into Weam.ai**

Transform your AI applications into seamless Weam Supersolutions with just a few clicks. The AI App Integrator automatically handles authentication, database integration, branding, and proxy setup.

## ✨ Features

- **🔍 Smart App Detection**: Automatically analyzes your app structure and framework
- **⚡ One-Click Integration**: Generates all necessary Weam integration code
- **🧪 Built-in Testing**: Validates integration before deployment
- **🎨 Automatic Branding**: Applies Weam logo, navigation, and styling
- **🔐 Authentication Setup**: Integrates iron-session for seamless login
- **🗄️ Database Integration**: Connects to Weam's MongoDB with user isolation
- **🌐 Web UI**: Beautiful, intuitive interface for non-technical users
- **📱 CLI Tool**: Command-line interface for developers

## 🚀 Quick Start

### Option 1: Web Interface (Recommended for Non-Developers)

1. **Start the Web UI**:
   ```bash
   npm run ui
   ```

2. **Open your browser** to `http://localhost:3005`

3. **Upload your app** as a ZIP file

4. **Configure integration** settings

5. **Download** the generated integration files

### Option 2: Command Line Interface

1. **Install globally**:
   ```bash
   npm install -g ai-app-integrator
   ```

2. **Integrate your app**:
   ```bash
   ai-app-integrator integrate /path/to/your/app
   ```

3. **Follow the prompts** to configure your integration

## 📋 Supported App Types

- **Next.js** applications
- **React** applications  
- **Express.js** servers
- **Vue.js** applications
- **Angular** applications
- **Svelte** applications

## 🔧 What Gets Generated

### Authentication Integration
- Weam session middleware
- Auth guards for API routes
- User context and permissions

### Database Integration
- MongoDB connection setup
- User/company association fields
- Data isolation and security

### Branding Integration
- Weam logo components
- Navigation with "Back to App" button
- Consistent styling and colors

### Proxy Integration
- Next.js API proxy routes
- Weam page components
- Environment configuration

## 📁 Project Structure

```
AI-App-Integrator/
├── src/
│   ├── scanner/          # App analysis and detection
│   ├── generator/        # Code generation engine
│   ├── templates/        # EJS templates for generated code
│   ├── ui/              # Web interface
│   └── utils/           # Testing and utilities
├── public/              # Static assets
└── tests/               # Test files
```

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd AI-App-Integrator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm start` - Start the CLI tool
- `npm run dev` - Start development server with hot reload
- `npm run ui` - Start the web interface
- `npm test` - Run tests
- `npm run build` - Build for production

## 🧪 Testing

The integrator includes comprehensive testing:

- **File Generation Tests**: Verifies all files are created correctly
- **Syntax Validation**: Checks JavaScript/TypeScript syntax
- **Authentication Tests**: Validates session middleware setup
- **Database Tests**: Confirms database integration
- **Proxy Tests**: Verifies API proxy configuration

## 📖 Usage Examples

### CLI Integration
```bash
# Scan an app without integrating
ai-app-integrator scan /path/to/app

# Full integration with prompts
ai-app-integrator integrate /path/to/app

# Start web UI
ai-app-integrator ui
```

### Programmatic Usage
```javascript
const AppScanner = require('./src/scanner/AppScanner');
const CodeGenerator = require('./src/generator/CodeGenerator');

// Scan an app
const scanner = new AppScanner();
const appInfo = await scanner.scanApp('/path/to/app');

// Generate integration
const generator = new CodeGenerator();
const files = await generator.generateIntegration(appInfo, preferences);
```

## 🔒 Security

- All generated code follows Weam security standards
- User data isolation is enforced
- Authentication is handled via iron-session
- CORS is properly configured
- Environment variables are secured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.weam.ai/integrations](https://docs.weam.ai/integrations)
- **Issues**: [GitHub Issues](https://github.com/weam-ai/ai-app-integrator/issues)
- **Community**: [Weam Discord](https://discord.gg/weam)

## 🎯 Roadmap

- [ ] Support for more frameworks (SvelteKit, Nuxt.js)
- [ ] Advanced customization options
- [ ] Integration marketplace
- [ ] Automated deployment
- [ ] Performance optimization
- [ ] Multi-language support

---

**Made with ❤️ by the Weam.ai team**

*Transform your AI apps into Weam Supersolutions in minutes, not hours!*
