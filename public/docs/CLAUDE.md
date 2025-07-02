# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Earth-2089 is a Web3 gaming application built with React 19, TypeScript, and Solana blockchain integration. It's a post-apocalyptic survival game with real-time multiplayer features, NFT integration, and a complex in-game economy.

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run functions:dev    # Start Netlify dev server with functions
npm run npc:dev         # Run NPC engine in development mode

# Building
npm run build           # Build for production
npm run functions:build # Build Netlify functions

# Android Development
npx cap sync android    # Sync web assets to Android
npx cap run android     # Build and run Android app
npx cap open android    # Open Android Studio

# Utilities
npm run lint           # ESLint checking
npm run types          # Generate Supabase types from database schema
npm run npc:start      # Start NPC engine in production
```

## Architecture Overview

### Frontend Structure
- **React 19** with TypeScript and Vite build system
- **Tailwind CSS 4** with shadcn/ui component library
- **React Context providers** for state management (GameProvider, NetworkProvider, ThemeProvider)
- **View-based routing** with main game screens in `src/components/views/`

### Backend Infrastructure
- **Netlify Functions** (40+ serverless functions) for all API operations
- **Supabase** for real-time database, authentication, and real-time subscriptions
- **Solana Web3** integration for blockchain operations (wallets, SPL tokens, NFTs)

### Key Directories
```
src/
├── components/views/    # Main game screens (CharacterCreation, EarthMarket, etc.)
├── components/ui/       # shadcn/ui components
├── providers/          # React context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions (including auto-generated Supabase types)
├── config/             # Game configuration files
└── lib/                # Utilities and helpers

netlify/functions/      # 40+ serverless API endpoints
npc-engine/            # Autonomous character system
```

### Database Integration
- Uses **Supabase** with auto-generated TypeScript types
- Run `npm run types` to regenerate types after database schema changes
- Real-time subscriptions for live gameplay features

### Solana Blockchain Integration
- Multi-wallet support (Phantom, Solflare, etc.)
- SPL token operations and NFT minting
- Network switching between devnet/mainnet
- Wallet adapter pattern throughout the application

## Code Style & Patterns

### TypeScript First
- All new code must use TypeScript
- Component props should have explicit interfaces
- Database operations use generated Supabase types

### React Patterns
- Functional components with hooks
- Compound components using Radix UI primitives
- Custom hooks for business logic separation
- Provider pattern for cross-cutting concerns

### Naming Conventions
- **PascalCase** for components
- **camelCase** for functions and variables  
- **kebab-case** for files and folders
- **snake_case** for database fields and API endpoints

### Styling
- **Tailwind CSS 4** for all styling
- Use shadcn/ui components when possible
- Custom CSS only when Tailwind limitations are reached

## Game-Specific Architecture

### Character System
- Character creation with visual customization
- Equipment and inventory management
- Stats tracking and progression

### World Map
- Interactive SVG-based map with D3.js
- Zone-based travel system
- Real-time location tracking

### Economy
- In-game currency and item trading
- Mining and resource gathering
- Market system with real-time pricing

### Social Features
- Real-time chat system
- Leaderboards and rankings
- Multiplayer interactions

## NPC Engine
- Autonomous character system in `/npc-engine/`
- Multiple activity modes (mining, trading, chat)
- Configurable AI behaviors
- Real-time database integration

## Important Notes

- **Bundle organization** uses cntx-ui with defined bundles (ui, api, config, docs)
- **Path aliases** configured (`@/` points to `src/`)
- **Environment variables** required for Supabase and Solana integration (see `.env.example`)
- **Node.js 22+** required for development
- **ESLint** configured with TypeScript rules