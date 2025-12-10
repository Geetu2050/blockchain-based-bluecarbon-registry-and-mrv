# Environment Setup for Real Aptos Transactions

To enable real blockchain transactions that will appear in the Aptos Explorer, you need to create a `.env` file in your project root.

## Step 1: Create .env file

Create a file named `.env` in your project root directory with the following content:

```bash
# Environment Configuration for Real Aptos Transactions
REACT_APP_TREASURY_ADDRESS=0x2269de2cd6dc511d6841276ade4a37e6c642a8cc373ff8fe389bae1109a6d536
REACT_APP_APTOS_NETWORK=testnet
REACT_APP_CONTRACT_ADDRESS=0x1::blue_carbon_registry
REACT_APP_TXN_API_BASE=
```

## Step 2: Understanding the Configuration

- **REACT_APP_TREASURY_ADDRESS**: This is where APT tokens will be sent when users purchase credits
- **REACT_APP_APTOS_NETWORK**: Set to 'testnet' for testing (or 'mainnet' for production)
- **REACT_APP_CONTRACT_ADDRESS**: Your smart contract address
- **REACT_APP_TXN_API_BASE**: Optional JSON server for transaction persistence

## Step 3: Treasury Address Options

### Option 1: Use your configured address (recommended)
Your address `0x2269de2cd6dc511d6841276ade4a37e6c642a8cc373ff8fe389bae1109a6d536` is now set as the default treasury address.

### Option 2: Create your own treasury wallet
1. Install Petra wallet browser extension
2. Create a new wallet or use an existing one
3. Copy the wallet address
4. Replace the treasury address in your `.env` file

### Option 3: Use a different address you control
If you have another Aptos wallet address, you can use that instead.

## Step 4: Test the Setup

1. **Restart your development server**: `npm start`
2. **Connect your Petra wallet** to the app
3. **Make a purchase** - you should see real APT deducted from your wallet
4. **Check Aptos Explorer**: Go to https://explorer.aptoslabs.com and search for your transaction hash
5. **Verify in your app**: The transaction should show with a link to the explorer

## Step 5: What Happens with Real Transactions

- **Real APT Transfer**: When users purchase credits, real APT tokens are transferred from their wallet to the treasury address
- **Real Transaction Hash**: You get a real blockchain transaction hash
- **Explorer Visibility**: Transactions appear in Aptos Explorer because they're on the actual blockchain
- **Wallet Balance**: User's Petra wallet balance actually decreases
- **Gas Fees**: Real transactions will have actual gas fees

## Important Notes

- **Testnet Only**: This configuration is for Aptos Testnet, not Mainnet
- **Test APT Required**: You need test APT tokens from the Aptos faucet
- **Gas Fees**: Real transactions will have actual gas fees
- **Confirmation Time**: Real transactions take time to confirm on-chain

## Troubleshooting

### Transactions not appearing in Explorer
1. Check that `REACT_APP_TREASURY_ADDRESS` is set in your `.env` file
2. Restart your development server after creating the `.env` file
3. Verify you're on the correct network (testnet vs mainnet)
4. Check that your wallet has sufficient APT for gas fees

### Still seeing simulated transactions
1. Make sure the `.env` file is in the project root directory
2. Restart your development server completely
3. Check the browser console for any error messages
4. Verify the treasury address is valid

## Getting Test APT

If you need test APT tokens:
1. Go to https://faucet.aptoslabs.com/
2. Enter your wallet address
3. Request test APT tokens
4. Wait for the tokens to arrive in your wallet
