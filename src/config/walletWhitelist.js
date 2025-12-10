// Whitelist of allowed wallet addresses
export const ALLOWED_WALLET_ADDRESSES = [
  // Your actual Petra wallet address
  '0x2269de2cd6dc511d6841276ade4a37e6c642a8cc373ff8fe389bae1109a6d536',
  // Add more addresses as needed
];

// Check if a wallet address is allowed
export const isWalletAllowed = (address) => {
  if (!address) return false;
  
  // Debug logging to see what address we're getting
  console.log('Checking wallet address:', address);
  console.log('Address type:', typeof address);
  console.log('Address length:', address.length);
  
  // Convert address to string and handle different formats
  const addressStr = String(address);
  
  // Check if it's a valid Aptos address format (starts with 0x and is 66 chars)
  const isValidFormat = addressStr.startsWith('0x') && addressStr.length === 66;
  
  console.log('Is valid format:', isValidFormat);
  
  // Check against whitelist
  const isInWhitelist = ALLOWED_WALLET_ADDRESSES.includes(addressStr);
  console.log('Is in whitelist:', isInWhitelist);
  
  if (isInWhitelist) {
    console.log('✅ Wallet address is in whitelist and allowed');
    return true;
  }
  
  console.log('❌ Wallet address is not in whitelist');
  return false;
};

// Get allowed addresses for display
export const getAllowedAddresses = () => {
  return ALLOWED_WALLET_ADDRESSES;
};

// Helper function to add a wallet address to the whitelist
export const addWalletToWhitelist = (address) => {
  if (address && address.startsWith('0x') && address.length === 66) {
    if (!ALLOWED_WALLET_ADDRESSES.includes(address)) {
      ALLOWED_WALLET_ADDRESSES.push(address);
      console.log('✅ Added wallet address to whitelist:', address);
      return true;
    } else {
      console.log('⚠️ Wallet address already in whitelist:', address);
      return false;
    }
  } else {
    console.log('❌ Invalid wallet address format:', address);
    return false;
  }
};

// Helper function to get the current connected wallet address for easy copying
export const getCurrentWalletAddress = () => {
  // This will be called from the browser console to get the current wallet address
  console.log('Current wallet address:', window.currentWalletAddress || 'No wallet connected');
  return window.currentWalletAddress;
};
