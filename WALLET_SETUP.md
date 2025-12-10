# Wallet Setup Instructions

## How to Add Your Petra Wallet Address to the Whitelist

### Step 1: Connect Your Wallet
1. Open the application in your browser
2. Click "Connect Wallet" to connect your Petra wallet
3. Open the browser console (F12 → Console tab)

### Step 2: Get Your Wallet Address
In the console, you should see debug messages showing your wallet address. Look for:
```
Checking wallet address: 0x...
Wallet connected with address: 0x...
```

### Step 3: Add Your Address to Whitelist
1. Copy your wallet address from the console
2. Open `src/config/walletWhitelist.js`
3. Add your address to the `ALLOWED_WALLET_ADDRESSES` array:

```javascript
export const ALLOWED_WALLET_ADDRESSES = [
  '0xYOUR_ACTUAL_PETRA_WALLET_ADDRESS_HERE',
  // Add more addresses as needed
];
```

### Step 4: Enable Strict Whitelist Mode
1. In `src/config/walletWhitelist.js`
2. Comment out the temporary validation:
```javascript
// TEMPORARY: Allow any valid Aptos address for testing
// TODO: Replace with strict whitelist checking
// if (isValidFormat) {
//   console.log('✅ Wallet address is valid and allowed');
//   return true;
// }
```

3. Uncomment the strict whitelist checking:
```javascript
// For strict whitelist checking, uncomment the line below and comment out the return above
return ALLOWED_WALLET_ADDRESSES.includes(address);
```

### Step 5: Test
1. Restart the application
2. Try connecting your wallet
3. It should now only accept your specific wallet address

## Current Status
- ✅ Debug logging is enabled to help identify your wallet address
- ✅ Temporary validation allows any valid Aptos address (66 characters, starts with 0x)
- ⚠️ Strict whitelist mode is disabled for testing
- 🔧 Ready for you to add your specific wallet address

## Troubleshooting
If you're still having issues:
1. Check the browser console for debug messages
2. Verify your wallet address is exactly 66 characters long
3. Make sure it starts with '0x'
4. Ensure you've added it to the whitelist array correctly
