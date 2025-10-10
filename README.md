# Qubic Voting Frontend

A modern React application for participating in Qubic governance by voting on proposals and creating polls. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- 🗳️ **Voting Interface**: Participate in Qubic governance polls with real-time results
- 📊 **Poll Creation**: Create new governance polls (costs 10,000,000 QU)
- 👛 **Wallet Integration**: WalletConnect v2 support for secure wallet connections
- 🎨 **Modern UI**: Built with Radix UI components and Tailwind CSS 4
- 🌍 **Internationalization**: Multi-language support with i18next
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices
- 🔄 **Real-time Updates**: Live transaction monitoring and polling data
- 🎯 **Type Safety**: Full TypeScript support with strict type checking
- 🔗 **Qubic Integration**: Direct integration with Qubic network and QUtil contract
- 🚀 **Server-Side Caching**: Reduces API calls with cached assets and polls data
- 🔒 **Secure API**: Protected endpoints for automated data updates
- 📋 **Asset Reference**: Easy asset selection with copy-to-clipboard functionality

## 🏗️ Architecture

The application is built with a modern, scalable architecture:

- **Frontend**: React 19 with TypeScript and Vite 7
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router 7 for navigation
- **Wallet**: WalletConnect v2 for multi-wallet support
- **Testing**: Vitest for unit testing
- **Build**: Vite for fast development and optimized builds

## 📋 Prerequisites

- **Bun**: Version 1.0 or higher (recommended) or Node.js 18+
- **Git**: For cloning the repository

## 🚀 Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd voting-frontend
    ```

2. **Install dependencies**

    ```bash
    bun install
    ```

    _Or if using npm:_

    ```bash
    npm install
    ```

3. **Environment Setup**

    Copy the environment template and configure your settings:

    ```bash
    cp env.example .env
    ```

    Edit `.env` with your values:

    ```bash
    # Qubic Network Configuration
    VITE_QUBIC_RPC_URL=https://rpc.qubic.org
    VITE_QUBIC_CHAIN_ID=qubic:main

    # WalletConnect Configuration
    VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

    # Application Configuration
    VITE_APP_TITLE="Qubic Voting"
    VITE_APP_DESCRIPTION="Community governance voting system"
    VITE_APP_URL=https://your-app-url.com

    # API Security (for server-side caching)
    API_KEY=your-secret-api-key-here
    PORT=3001
    ```

## 🛠️ Development

### Start Development Server

```bash
# Frontend only
bun run dev

# Frontend + API server
bun run dev:full
```

The application will be available at `http://localhost:5173`  
The API server will be available at `http://localhost:3001`

### Available Scripts

| Command                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `bun run dev`             | Start development server with hot reload |
| `bun run dev:full`        | Start frontend + API server together    |
| `bun run server`          | Start API server only                   |
| `bun run build`           | Build for production                     |
| `bun run build:with-data` | Build with fresh cached data            |
| `bun run generate-assets` | Generate assets cache                    |
| `bun run generate-polls`  | Generate polls cache                     |
| `bun run generate-all`    | Generate both assets and polls cache    |
| `bun run preview`         | Preview production build locally         |
| `bun run lint`            | Run ESLint to check code quality         |
| `bun run lint:fix`        | Auto-fix ESLint issues                   |
| `bun run prettier:check`  | Check code formatting                    |
| `bun run prettier:format` | Format code with Prettier                |
| `bun run test`            | Run tests in watch mode                  |
| `bun run test:run`        | Run tests once                           |

## 🏗️ Building for Production

1. **Create production build**

    ```bash
    bun run build
    ```

2. **Preview production build locally**
    ```bash
    bun run preview
    ```

The built files will be in the `dist/` directory, ready for deployment.

## 🚀 Server-Side Caching

The application includes server-side caching to reduce API calls and improve performance:

### API Endpoints

**🔒 Protected Endpoints (require API key):**
- `POST /api/update-polls` - Updates polls data
- `POST /api/update-assets` - Updates assets data

**📊 Public Endpoints:**
- `GET /api/health` - Server health check

### Automated Updates

Set up cron jobs on your server to automatically update data:

```bash
# Add to crontab (crontab -e)
# Update polls every minute
* * * * * curl -X POST http://localhost:3001/api/update-polls -H "x-api-key: your-secret-api-key-here"

# Update assets every hour  
0 * * * * curl -X POST http://localhost:3001/api/update-assets -H "x-api-key: your-secret-api-key-here"
```

### Benefits

- 🚀 **Faster loading** - Static JSON vs smart contract calls
- 💰 **Lower costs** - Fewer RPC calls
- 🛡️ **Rate limiting** - Server controls API usage
- 🔄 **Auto-updates** - Fresh data every minute/hour
- 📱 **Better UX** - Asset reference list with copy buttons
- 🔐 **Secure** - Protected API endpoints prevent abuse

## 📁 Project Structure

```
src/
├── assets/           # Static assets (icons, images, logos)
├── components/       # Reusable UI components
│   ├── buttons/      # Button components
│   ├── layouts/      # Layout components
│   ├── modals/       # Modal components
│   └── ui/           # Base UI components (shadcn/ui components)
├── configs/          # Configuration files (i18n, env)
├── constants/        # Application constants and URLs
├── contexts/         # React contexts (WalletConnect)
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
│   └── qubic/        # Qubic-specific utilities, encoders, decoders
├── pages/            # Page components
│   ├── create-poll/  # Poll creation page with form
│   └── home/         # Home page with polls list and voting
├── router/           # React Router configuration
├── services/         # External service integrations
├── store/            # Redux store and slices
└── types/            # TypeScript type definitions
scripts/
├── generate-assets.ts # Assets sync script
└── generate-polls.ts  # Polls sync script
public/
├── assets.json       # Generated asset cache
└── polls.json        # Generated polls cache
server.js             # Secure API server
```

## 🔧 Key Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with Radix UI components
- **State Management**: Redux Toolkit
- **Routing**: React Router 7
- **Wallet Integration**: WalletConnect
- **API Server**: Express.js with secure endpoints
- **Testing**: Vitest
- **Code Quality**: ESLint + Prettier
- **Package Manager**: Bun (with npm/yarn fallback)

## 🧪 Testing

The project includes comprehensive testing setup:

- **Test Runner**: Vitest with Node.js environment
- **Test Setup**: Mocked dependencies for Qubic utilities
- **Coverage**: Focus on core Qubic functionality (encoders, decoders)

Run tests using:

```bash
# Watch mode (for development)
bun run test

# Single run (for CI/CD)
bun run test:run
```

## Deployment

The project includes a `vercel.json` configuration for easy deployment to Vercel with SPA routing support:

```bash
# Deploy to Vercel
vercel

# Or build and deploy to your preferred platform
bun run build
# Upload dist/ folder to your hosting provider
```

## 🔐 Security Features

- **Wallet Integration**: Secure WalletConnect v2 implementation
- **Transaction Monitoring**: Real-time transaction status tracking
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript coverage for all critical operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the established code style
4. Run tests and linting: `bun run test && bun run lint`
5. Commit using conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a pull request

## 📄 License

As we use some parts from the 451 Package to our Wallet also apply the Anti-Military License. See
https://github.com/computor-tools/qubic-js Further our Wallet Code is protected by the AGPL-3.0
License. You may use our Source-Code for what you need to do business.
