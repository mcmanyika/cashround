# Mukando - Next.js App

This is a Next.js version of the Mukando dApp, converted from a React app.

## Features

- MetaMask wallet integration
- Referral system with blockchain integration
- Payment processing for referrers
- Modern UI with responsive design

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `pages/` - Next.js pages (routing)
- `src/components/` - React components
- `src/abis/` - Smart contract ABIs
- `src/contracts/` - Smart contracts
- `public/` - Static assets

## Conversion Notes

This app was converted from a React app to Next.js with the following changes:

1. Replaced React Router with Next.js routing
2. Converted class components to functional components with hooks
3. Updated imports to use Next.js router
4. Moved static assets to the correct locations
5. Updated package.json with Next.js dependencies
6. Added proper TypeScript configuration
7. Added ESLint configuration for Next.js

## Smart Contracts

The app integrates with Ethereum smart contracts for the referral system. Make sure you have the correct network configuration and contract addresses set up.
