# Smart Contract Deployment Guide

This guide explains how to deploy the Blue Carbon Registry smart contracts to the Aptos blockchain and configure the frontend to interact with them.

## Smart Contract Overview

The marketplace consists of two main Move modules:

1. **CarbonCreditToken**: Manages the carbon credit token (CARBON) with minting, burning, and balance tracking
2. **LiquidityPool**: Manages the liquidity pool for token swaps between APT and carbon credits

## Prerequisites

1. **Aptos CLI**: Install the Aptos CLI for contract deployment
2. **Aptos Wallet**: Petra wallet with testnet APT for deployment
3. **Node.js**: For running the frontend

## Step 1: Install Aptos CLI

```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Verify installation
aptos --version
```

## Step 2: Initialize Aptos Project

```bash
# Create a new Aptos project
aptos init --profile blue-carbon

# This will create a .aptos/config.yaml file
```

## Step 3: Configure Aptos Profile

Edit `.aptos/config.yaml`:

```yaml
profiles:
  blue-carbon:
    private_key: "0x..."
    public_key: "0x..."
    account: "0x..."
    rest_url: "https://fullnode.testnet.aptoslabs.com"
    faucet_url: "https://faucet.testnet.aptoslabs.com"
```

## Step 4: Fund Your Account

```bash
# Fund your account with testnet APT
aptos account fund-with-faucet --profile blue-carbon
```

## Step 5: Deploy Smart Contracts

```bash
# Navigate to the move directory
cd move/BlueCarbonRegistry

# Deploy the contracts
aptos move publish --profile blue-carbon
```

## Step 6: Initialize the Liquidity Pool

After deployment, you need to initialize the liquidity pool:

```bash
# Initialize the pool (replace with your account address)
aptos move run --profile blue-carbon --function-id 0xYOUR_ACCOUNT::LiquidityPool::initialize
```

## Step 7: Add Initial Liquidity

NGOs can add initial liquidity to the pool:

```bash
# Add liquidity (example: 1000 carbon tokens, 100 APT)
aptos move run --profile blue-carbon --function-id 0xYOUR_ACCOUNT::LiquidityPool::add_liquidity --args u64:100000000000 u64:10000000000
```

## Step 8: Configure Frontend

Update your `.env` file with the deployed contract address:

```env
# Environment Configuration
REACT_APP_CONTRACT_ADDRESS=0xYOUR_ACCOUNT
REACT_APP_APTOS_NETWORK=testnet
REACT_APP_TREASURY_ADDRESS=0xYOUR_ACCOUNT
```

## Step 9: Test the Marketplace

1. Start the frontend: `npm start`
2. Connect your wallet
3. Navigate to the Buyer Portal
4. Try swapping APT for carbon tokens
5. Check the transaction on Aptos Explorer

## Smart Contract Functions

### CarbonCreditToken Module

- `initialize(account: &signer)`: Initialize the carbon credit token
- `get_carbon_token_balance(addr: address): u64`: Get carbon token balance
- `get_apt_balance(addr: address): u64`: Get APT balance

### LiquidityPool Module

- `initialize(account: &signer)`: Initialize the liquidity pool
- `add_liquidity(account: &signer, carbon_token_amount: u64, apt_amount: u64)`: Add liquidity
- `swap_tokens(buyer: &signer, apt_amount_in: u64)`: Swap APT for carbon tokens
- `get_pool_info(): PoolInfo`: Get current pool information
- `calculate_tokens_out(apt_amount_in: u64): u64`: Calculate tokens out for given APT
- `calculate_apt_in(carbon_tokens_out: u64): u64`: Calculate APT needed for tokens

## Frontend Integration

The frontend uses the `marketplaceService.js` to interact with the smart contracts:

```javascript
import marketplaceService from '../services/marketplaceService';

// Get pool information
const poolInfo = await marketplaceService.getPoolInfo();

// Swap tokens
const result = await marketplaceService.swapTokens(signer, aptAmount);

// Add liquidity
const result = await marketplaceService.addLiquidity(signer, carbonTokens, aptAmount);
```

## Testing

### Test the Smart Contract

```bash
# Run Move tests
aptos move test --profile blue-carbon

# Test specific functions
aptos move run --profile blue-carbon --function-id 0xYOUR_ACCOUNT::LiquidityPool::get_pool_info
```

### Test the Frontend

1. Connect your wallet
2. Try adding liquidity (NGO role)
3. Try swapping tokens (Buyer role)
4. Verify balances update correctly
5. Check transactions on Aptos Explorer

## Troubleshooting

### Common Issues

1. **Contract not found**: Ensure the contract address in `.env` is correct
2. **Insufficient balance**: Make sure your wallet has enough APT
3. **Transaction failed**: Check the Aptos Explorer for error details
4. **Pool not initialized**: Run the initialize function first

### Debug Commands

```bash
# Check account balance
aptos account list --profile blue-carbon

# View account resources
aptos account list --query resources --account 0xYOUR_ACCOUNT

# Check transaction status
aptos transaction get --hash 0xTRANSACTION_HASH
```

## Production Deployment

For mainnet deployment:

1. Change network to mainnet in `.aptos/config.yaml`
2. Update `REACT_APP_APTOS_NETWORK=mainnet` in `.env`
3. Deploy with mainnet profile
4. Ensure sufficient APT for gas fees

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Access Control**: Implement proper access controls for admin functions
3. **Rate Limiting**: Consider implementing rate limiting for swaps
4. **Audit**: Consider professional audit before mainnet deployment

## Monitoring

- **Aptos Explorer**: Monitor transactions and contract state
- **Logs**: Check browser console for frontend errors
- **Metrics**: Track pool reserves and swap volumes

## Support

For issues or questions:
1. Check the Aptos documentation
2. Review transaction logs
3. Test with small amounts first
4. Verify network connectivity

