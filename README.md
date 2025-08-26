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

    Create a `.env` file in the root directory with the following variables:

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
    ```

## 🛠️ Development

### Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

| Command                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `bun run dev`             | Start development server with hot reload |
| `bun run build`           | Build for production                     |
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
```

## 🔧 Key Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with Radix UI components
- **State Management**: Redux Toolkit
- **Routing**: React Router 7
- **Wallet Integration**: WalletConnect
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
