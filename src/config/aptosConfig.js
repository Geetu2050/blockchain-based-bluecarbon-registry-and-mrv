// Aptos Configuration for Real Blockchain Transactions
export const APTOS_CONFIG = {
  // Network configuration
  NETWORK: process.env.REACT_APP_APTOS_NETWORK || 'testnet',
  
  // Treasury address for receiving APT payments
  TREASURY_ADDRESS: process.env.REACT_APP_TREASURY_ADDRESS || '0x2269de2cd6dc511d6841276ade4a37e6c642a8cc373ff8fe389bae1109a6d536',
  
  // Contract address
  CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS || '0x1::blue_carbon_registry',
  
  // Explorer URLs
  EXPLORER_BASE: process.env.REACT_APP_APTOS_EXPLORER_BASE || 'https://explorer.aptoslabs.com',
  EXPLORER_TESTNET: 'https://explorer.aptoslabs.com/transactions',
  EXPLORER_MAINNET: 'https://explorer.aptoslabs.com/transactions',
  
  // Transaction configuration
  GAS_UNIT_PRICE: 100,
  MAX_GAS_AMOUNT: 10000,
  
  // APT token configuration
  APT_DECIMALS: 8,
  APT_SYMBOL: 'APT',
  APT_COIN_TYPE: '0x1::aptos_coin::AptosCoin'
};

// Get explorer URL for current network
export const getExplorerUrl = (network = APTOS_CONFIG.NETWORK) => {
  return network === 'mainnet' ? APTOS_CONFIG.EXPLORER_MAINNET : APTOS_CONFIG.EXPLORER_TESTNET;
};

// Get transaction URL in explorer
export const getTransactionExplorerUrl = (txHash, network = APTOS_CONFIG.NETWORK) => {
  const baseUrl = getExplorerUrl(network);
  return `${baseUrl}/${txHash}`;
};

// Get account URL in explorer
export const getAccountExplorerUrl = (address, network = APTOS_CONFIG.NETWORK) => {
  const baseUrl = getExplorerUrl(network);
  return `${baseUrl.replace('/transactions', '')}/account/${address}`;
};

// Check if real transactions are enabled
export const isRealTransactionsEnabled = () => {
  return !!APTOS_CONFIG.TREASURY_ADDRESS;
};

// Convert APT to octas (smallest unit)
export const aptToOctas = (apt) => {
  return Math.floor(apt * Math.pow(10, APTOS_CONFIG.APT_DECIMALS));
};

// Convert octas to APT
export const octasToApt = (octas) => {
  return octas / Math.pow(10, APTOS_CONFIG.APT_DECIMALS);
};

export default APTOS_CONFIG;
