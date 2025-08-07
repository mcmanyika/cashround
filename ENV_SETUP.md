# Environment Configuration

This project uses environment variables for configuration. To set up your environment:

1. Create a `.env.local` file in the root directory
2. Add the following variables:

```env
# Contract Configuration
NEXT_PUBLIC_POLYGON_MAINNET_CONTRACT_ADDRESS="0xa1268396c94543f42238accfaee9776fce12a52a"
NEXT_PUBLIC_NETWORK_ID="137"
```

## Environment Variables

- `NEXT_PUBLIC_POLYGON_MAINNET_CONTRACT_ADDRESS`: The contract address on Polygon mainnet
- `NEXT_PUBLIC_NETWORK_ID`: The default network ID (137 for Polygon mainnet)

## Development

For local development, you can override these values in your `.env.local` file. The application will fall back to default values if environment variables are not set.

## Security

- Never commit `.env.local` to version control
- Only use `NEXT_PUBLIC_` prefix for variables that need to be exposed to the browser
- Keep sensitive information in server-side environment variables

## Supported Networks

The application supports the following networks:

- Polygon Mainnet (137)
- Local Development (1337)
- Local Development (5777)

You can configure additional networks by updating the `CONTRACT_ADDRESSES` object in `src/config/contractConfig.js`.
