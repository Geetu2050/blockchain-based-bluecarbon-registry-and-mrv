import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import transactionManager from '../utils/transactionManager';
import { APTOS_CONFIG, aptToOctas, isRealTransactionsEnabled } from '../config/aptosConfig';

const WalletContext = createContext();

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children, currentUser }) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizeAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'object') {
      if (addr.data) return String(addr.data);
      if (addr.address) return String(addr.address);
      return String(addr.toString ? addr.toString() : '');
    }
    return String(addr);
  };


  // Load transactions on mount
  useEffect(() => {
    // Start with empty until a wallet is connected
    setTransactions([]);

    // Subscribe to transaction updates
    const unsubscribe = transactionManager.subscribe((updatedTransactions) => {
      setTransactions(updatedTransactions);
    });

    return unsubscribe;
  }, []);

  // Track app user changes to scope transactions per user
  useEffect(() => {
    const userId = currentUser?.id || currentUser?.email || null;
    transactionManager.setActiveUser(userId);
  }, [currentUser?.id, currentUser?.email]);

  // Update balance when wallet connects
  useEffect(() => {
    if (connected && account?.address) {
      // Switch transaction scope to this wallet
      const addr = normalizeAddress(account.address);
      transactionManager.setActiveAddress(addr);
      setTransactions(transactionManager.getTransactions());
      // Optionally sync with server for this address
      if (typeof transactionManager.syncFromServerAsync === 'function') {
        transactionManager.syncFromServerAsync().catch(() => {});
      }
      updateBalance();
    } else {
      // Clear scope when disconnected
      transactionManager.setActiveAddress(null);
      setTransactions([]);
      setBalance(0);
    }
  }, [connected, account]);

  // Update wallet balance
  const updateBalance = async () => {
    if (!account?.address) return;
    
    try {
      const walletBalance = await transactionManager.getWalletBalance(account.address);
      setBalance(walletBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
      // Don't throw the error, just log it and set balance to 0
      setBalance(0);
    }
  };

  // Execute a transaction
  const executeTransaction = async (type, description, amount, to) => {
    console.log('executeTransaction called with:', { type, description, amount, to });
    console.log('Amount type:', typeof amount, 'Amount value:', amount);
    console.log('Wallet state:', { connected, account: account?.address });
    
    if (!connected || !account || !account.address || typeof signAndSubmitTransaction !== 'function') {
      console.error('Wallet not connected or no account');
      throw new Error('Wallet not connected');
    }

    // Get wallet address for transaction
    const walletAddress = normalizeAddress(account.address);
    console.log('Using wallet address:', walletAddress);
    console.log('Amount in octas:', aptToOctas(amount));
    
    console.log('Proceeding with transaction...');
    setIsLoading(true);
    
    try {
      const treasuryAddress = APTOS_CONFIG.TREASURY_ADDRESS;

      // If a treasury address is configured and amount > 0, perform a real on-chain transfer
      if (treasuryAddress && typeof amount === 'number' && amount > 0) {
        console.log('Performing real APT transfer to treasury:', treasuryAddress);
        console.log('Amount in APT:', amount);
        const amountInOctas = aptToOctas(amount);
        console.log('Amount in octas:', amountInOctas);
        console.log('Treasury address:', treasuryAddress);
        console.log('Wallet address:', walletAddress);
        
        const response = await signAndSubmitTransaction({
          sender: walletAddress,
          data: {
            function: '0x1::coin::transfer',
            typeArguments: [APTOS_CONFIG.APT_COIN_TYPE],
            functionArguments: [treasuryAddress, amountInOctas],
          },
        });
        
        console.log('Transaction response:', response);

        const onChainHash = response?.hash || response;

        // Record pending transaction with the on-chain hash
        const transaction = transactionManager.createTransactionRecordWithHash(
          onChainHash,
          type,
          description,
          amount,
          walletAddress,
          to || treasuryAddress,
          'pending'
        );

        // Optimistically decrease local balance
        setBalance(prev => {
          const next = (typeof prev === 'number' ? prev : 0) - amount;
          return next < 0 ? 0 : next;
        });

        // Wait for confirmation and update status
        await transactionManager.waitForAndConfirmTransaction(onChainHash);

        // Notify subscribers
        transactionManager.notifySubscribers();

        return transaction;
      }

      // Fallback to simulation (no real on-chain transfer)
      console.log('Treasury not configured; simulating transaction.');
      console.log('To enable real transactions, set REACT_APP_TREASURY_ADDRESS in your environment variables.');
      const transaction = await transactionManager.simulateWalletTransaction(
        type,
        description,
        amount,
        walletAddress,
        to
      );

      if (typeof amount === 'number' && amount > 0) {
        setBalance(prev => {
          const next = (typeof prev === 'number' ? prev : 0) - amount;
          return next < 0 ? 0 : next;
        });
      }

      transactionManager.notifySubscribers();

      return transaction;
    } catch (error) {
      console.error('Error executing transaction:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      if (error.name === 'WalletNotConnectedError' || /not connected/i.test(error.message || '')) {
        throw new Error('Wallet not connected');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase credits with direct payment to NGO
  const purchaseCredits = async (projectName, credits, pricePerCredit, totalCost, ngoWalletAddress = null) => {
    const description = `${credits} credits purchased for ${projectName} - $${totalCost.toFixed(2)}`;
    
    try {
      // If NGO wallet address is provided, send payment directly to NGO
      if (ngoWalletAddress) {
        return await executeDirectPayment(
          'credits_purchased',
          description,
          totalCost,
          ngoWalletAddress,
          projectName
        );
      } else {
        // Fallback to original behavior
        return await executeTransaction(
          'credits_purchased',
          description,
          totalCost,
          '0x1::blue_carbon_registry'
        );
      }
    } catch (error) {
      console.error('Purchase transaction failed, using simulation mode:', error);
      
      // If real transaction fails, simulate the purchase
      const simulatedTransaction = await transactionManager.simulateWalletTransaction(
        'credits_purchased',
        description,
        totalCost,
        normalizeAddress(account?.address || ''),
        ngoWalletAddress || '0x1::blue_carbon_registry'
      );
      
      // Update balance optimistically
      setBalance(prev => {
        const next = (typeof prev === 'number' ? prev : 0) - totalCost;
        return next < 0 ? 0 : next;
      });
      
      return simulatedTransaction;
    }
  };

  // Execute direct payment to NGO wallet
  const executeDirectPayment = async (type, description, amount, ngoWalletAddress, projectName) => {
    console.log('executeDirectPayment called with:', { type, description, amount, ngoWalletAddress, projectName });
    
    if (!connected || !account || !account.address || typeof signAndSubmitTransaction !== 'function') {
      console.error('Wallet not connected or no account');
      throw new Error('Wallet not connected');
    }

    const walletAddress = normalizeAddress(account.address);
    console.log('Sending payment to NGO wallet:', ngoWalletAddress);
    console.log('Amount in octas:', aptToOctas(amount));
    
    setIsLoading(true);
    
    try {
      // Send APT directly to NGO wallet
      const response = await signAndSubmitTransaction({
        sender: walletAddress,
        data: {
          function: '0x1::coin::transfer',
          typeArguments: [APTOS_CONFIG.APT_COIN_TYPE],
          functionArguments: [ngoWalletAddress, aptToOctas(amount)],
        },
      });
      
      console.log('Direct payment response:', response);

      const onChainHash = response?.hash || response;

      // Record transaction with NGO wallet as recipient
      const transaction = transactionManager.createTransactionRecordWithHash(
        onChainHash,
        type,
        `${description} - Direct payment to NGO`,
        amount,
        walletAddress,
        ngoWalletAddress,
        'pending'
      );

      // Optimistically decrease local balance
      setBalance(prev => {
        const next = (typeof prev === 'number' ? prev : 0) - amount;
        return next < 0 ? 0 : next;
      });

      // Wait for confirmation and update status
      await transactionManager.waitForAndConfirmTransaction(onChainHash);

      // Notify subscribers
      transactionManager.notifySubscribers();

      return transaction;
    } catch (error) {
      console.error('Error executing direct payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Retire credits
  const retireCredits = async (projectName, credits) => {
    const description = `${credits} credits retired for ${projectName}`;
    return await executeTransaction(
      'credits_retired',
      description,
      0, // No cost for retiring
      '0x1::blue_carbon_registry'
    );
  };

  // Get user's transactions
  const getUserTransactions = () => {
    if (!account?.address) return [];
    const normalizedAddress = normalizeAddress(account.address);
    return transactionManager.getTransactionsByAddress(normalizedAddress);
  };

  // Get total spent by user
  const getTotalSpent = () => {
    if (!account?.address) return 0;
    const normalizedAddress = normalizeAddress(account.address);
    return transactionManager.getTotalSpent(normalizedAddress);
  };

  const value = {
    connected,
    account,
    balance,
    transactions,
    isLoading,
    updateBalance,
    executeTransaction,
    purchaseCredits,
    retireCredits,
    getUserTransactions,
    getTotalSpent,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
