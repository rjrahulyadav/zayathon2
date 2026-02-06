# ZAYATHON

A modern hackathon event website built with React, TypeScript, and Vite.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🔐 Authentication with Supabase
- 📧 Email functionality with Edge Functions
- 📱 Fully responsive design
- 🚀 Ready for Vercel deployment

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- shadcn/ui components
- Supabase (Auth & Database)
- Firebase (Optional)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

This project is configured for deployment to Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy.

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── integrations/   # External service integrations
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── assets/         # Static assets
```

## License

MIT
