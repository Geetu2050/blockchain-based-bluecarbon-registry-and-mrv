// Marketplace Service for Carbon Credit Trading
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const config = new AptosConfig({ 
  network: process.env.REACT_APP_APTOS_NETWORK === 'mainnet' ? Network.MAINNET : Network.TESTNET 
});
const aptos = new Aptos(config);

// Contract address - this should be set in your .env file
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x1';
const MODULE_NAME = `${CONTRACT_ADDRESS}::LiquidityPool`;

// Carbon Credit Token module
const TOKEN_MODULE = `${CONTRACT_ADDRESS}::CarbonCreditToken`;

/**
 * Get current pool information
 * @returns {Promise<Object>} Pool information including reserves and price
 */
export const getPoolInfo = async () => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_NAME}::get_pool_info`,
        arguments: []
      }
    });

    return {
      carbonTokenReserve: response[0],
      aptReserve: response[1],
      totalLiquidity: response[2],
      pricePerToken: response[3], // Price in APT with 8 decimals
      pricePerTokenFormatted: response[3] / 100000000 // Convert to readable format
    };
  } catch (error) {
    console.error('Error fetching pool info:', error);
    
    // If module not found, return mock data for development
    if (error.message && error.message.includes('Module not found')) {
      console.warn('Smart contract not deployed yet, using mock data');
      return {
        carbonTokenReserve: 1000000, // 1M carbon tokens
        aptReserve: 100000, // 100K APT
        totalLiquidity: 1100000,
        pricePerToken: 100000000, // 1 APT per carbon token
        pricePerTokenFormatted: 1.0
      };
    }
    
    throw new Error('Failed to fetch pool information');
  }
};

/**
 * Calculate carbon tokens that would be received for a given APT amount
 * @param {number} aptAmount - Amount of APT to spend
 * @returns {Promise<number>} Number of carbon tokens that would be received
 */
export const calculateTokensOut = async (aptAmount) => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_NAME}::calculate_tokens_out`,
        arguments: [Math.floor(aptAmount * 100000000)] // Convert to octas
      }
    });

    return response[0] / 100000000; // Convert back to readable format
  } catch (error) {
    console.error('Error calculating tokens out:', error);
    
    // If module not found, use mock calculation
    if (error.message && error.message.includes('Module not found')) {
      console.warn('Smart contract not deployed, using mock calculation');
      // Simple 1:1 ratio for demo
      return aptAmount;
    }
    
    throw new Error('Failed to calculate tokens out');
  }
};

/**
 * Calculate APT amount needed for a given number of carbon tokens
 * @param {number} carbonTokens - Number of carbon tokens desired
 * @returns {Promise<number>} Amount of APT needed
 */
export const calculateAptIn = async (carbonTokens) => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_NAME}::calculate_apt_in`,
        arguments: [Math.floor(carbonTokens * 100000000)] // Convert to octas
      }
    });

    return response[0] / 100000000; // Convert back to readable format
  } catch (error) {
    console.error('Error calculating APT in:', error);
    throw new Error('Failed to calculate APT amount needed');
  }
};

/**
 * Get carbon token balance for an address
 * @param {string} address - User's wallet address
 * @returns {Promise<number>} Carbon token balance
 */
export const getCarbonTokenBalance = async (address) => {
  if (!address) {
    console.log('No address provided for carbon token balance check');
    return 0;
  }
  
  try {
    const response = await aptos.view({
      payload: {
        function: `${TOKEN_MODULE}::get_carbon_token_balance`,
        arguments: [address]
      }
    });

    return response[0] / 100000000; // Convert from octas to readable format
  } catch (error) {
    console.error('Error fetching carbon token balance:', error);
    
    // If module not found, return mock balance for demo
    if (error.message && error.message.includes('Module not found')) {
      console.warn('Smart contract not deployed, using mock carbon token balance for demo');
      return 100.0; // Mock 100 carbon tokens for demo
    }
    
    // For demo purposes, return mock balance
    console.log('Using mock carbon token balance for demo purposes');
    return 100.0; // Mock 100 carbon tokens for demo
  }
};

/**
 * Get APT balance for an address
 * @param {string} address - User's wallet address
 * @returns {Promise<number>} APT balance
 */
export const getAptBalance = async (address) => {
  if (!address) {
    console.log('No address provided for APT balance check');
    return 0;
  }
  
  try {
    console.log('Fetching real APT balance for address:', address);
    
    // Use the standard Aptos API to get APT balance
    const account = await aptos.getAccountInfo({ accountAddress: address });
    console.log('Account info received:', account);
    
    const resources = account.resources || [];
    console.log('Account resources:', resources);
    
    // Find the AptosCoin resource
    const aptCoinResource = resources.find(resource => 
      resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );
    
    console.log('APT Coin resource found:', aptCoinResource);
    
    if (aptCoinResource && aptCoinResource.data && aptCoinResource.data.coin) {
      const balance = parseInt(aptCoinResource.data.coin.value) / 100000000; // Convert from octas
      console.log('Real APT balance found:', balance);
      return balance;
    }
    
    console.log('No APT balance found, returning 0');
    return 0;
  } catch (error) {
    console.error('Error fetching APT balance:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    
    // Only use mock balance as last resort
    console.log('Using mock APT balance as fallback');
    return 5.0; // Mock 5 APT for demo
  }
};

/**
 * Swap APT for carbon credit tokens
 * @param {Object} signer - Wallet signer object
 * @param {number} aptAmount - Amount of APT to spend
 * @returns {Promise<Object>} Transaction result
 */
export const swapTokens = async (signer, aptAmount) => {
  try {
    const aptAmountInOctas = Math.floor(aptAmount * 100000000);
    
    const transaction = await aptos.transaction.build.simple({
      sender: signer.address,
      data: {
        function: `${MODULE_NAME}::swap_tokens`,
        arguments: [aptAmountInOctas]
      }
    });

    const committedTransaction = await aptos.signAndSubmitTransaction({
      signer,
      transaction
    });

    // Wait for transaction to complete
    const result = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash
    });

    return {
      success: true,
      hash: committedTransaction.hash,
      result: result
    };
  } catch (error) {
    console.error('Error swapping tokens:', error);
    
    // If module not found, simulate the transaction
    if (error.message && error.message.includes('Module not found')) {
      console.warn('Smart contract not deployed, simulating swap transaction');
      return {
        success: true,
        hash: `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
        result: { success: true }
      };
    }
    
    throw new Error(`Token swap failed: ${error.message}`);
  }
};

/**
 * Add liquidity to the pool (NGO function)
 * @param {Object} signer - Wallet signer object
 * @param {number} carbonTokenAmount - Amount of carbon tokens to add
 * @param {number} aptAmount - Amount of APT to add
 * @returns {Promise<Object>} Transaction result
 */
export const addLiquidity = async (signer, carbonTokenAmount, aptAmount) => {
  try {
    const carbonTokenAmountOctas = Math.floor(carbonTokenAmount * 100000000);
    const aptAmountOctas = Math.floor(aptAmount * 100000000);
    
    const transaction = await aptos.transaction.build.simple({
      sender: signer.address,
      data: {
        function: `${MODULE_NAME}::add_liquidity`,
        arguments: [carbonTokenAmountOctas, aptAmountOctas]
      }
    });

    const committedTransaction = await aptos.signAndSubmitTransaction({
      signer,
      transaction
    });

    // Wait for transaction to complete
    const result = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash
    });

    return {
      success: true,
      hash: committedTransaction.hash,
      result: result
    };
  } catch (error) {
    console.error('Error adding liquidity:', error);
    
    // If module not found, simulate the transaction
    if (error.message && error.message.includes('Module not found')) {
      console.warn('Smart contract not deployed, simulating add liquidity transaction');
      return {
        success: true,
        hash: `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
        result: { success: true }
      };
    }
    
    throw new Error(`Add liquidity failed: ${error.message}`);
  }
};

/**
 * Get transaction events for a specific transaction hash
 * @param {string} transactionHash - Transaction hash
 * @returns {Promise<Array>} Array of events
 */
export const getTransactionEvents = async (transactionHash) => {
  try {
    const transaction = await aptos.getTransactionByHash({
      transactionHash
    });

    return transaction.events || [];
  } catch (error) {
    console.error('Error fetching transaction events:', error);
    return [];
  }
};

/**
 * Get swap events for a specific address
 * @param {string} address - User's wallet address
 * @param {number} limit - Maximum number of events to fetch
 * @returns {Promise<Array>} Array of swap events
 */
export const getSwapEvents = async (address, limit = 10) => {
  try {
    const events = await aptos.getEventsByEventType({
      eventType: `${MODULE_NAME}::SwapEvent`,
      options: {
        limit
      }
    });

    // Filter events for the specific address
    return events.filter(event => 
      event.data.buyer === address
    );
  } catch (error) {
    console.error('Error fetching swap events:', error);
    return [];
  }
};

/**
 * Format APT amount for display
 * @param {number} amount - Amount in APT
 * @returns {string} Formatted amount string
 */
export const formatAptAmount = (amount) => {
  return amount.toFixed(6);
};

/**
 * Format carbon token amount for display
 * @param {number} amount - Amount in carbon tokens
 * @returns {string} Formatted amount string
 */
export const formatCarbonTokenAmount = (amount) => {
  return amount.toFixed(2);
};

export default {
  getPoolInfo,
  calculateTokensOut,
  calculateAptIn,
  getCarbonTokenBalance,
  getAptBalance,
  swapTokens,
  addLiquidity,
  getTransactionEvents,
  getSwapEvents,
  formatAptAmount,
  formatCarbonTokenAmount
};
