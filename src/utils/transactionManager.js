import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { APTOS_CONFIG, getTransactionExplorerUrl, isRealTransactionsEnabled, aptToOctas } from '../config/aptosConfig';

class TransactionManager {
  constructor() {
    const network = APTOS_CONFIG.NETWORK === 'mainnet' ? Network.MAINNET : Network.TESTNET;
    const config = new AptosConfig({ network });
    this.client = new Aptos(config);
    this.activeAddress = null;
    this.activeUserId = null;
    this.transactions = [];
    this.apiBase = process.env.REACT_APP_TXN_API_BASE || null;
    this.network = APTOS_CONFIG.NETWORK;
    // Background sync with JSON server so history persists across refreshes
    this.syncFromServerAsync().catch(() => {});
  }

  // Normalize an address-like value to string
  normalizeAddress(addr) {
    if (!addr) return '';
    if (typeof addr === 'object') {
      if (addr.data) return String(addr.data);
      if (addr.address) return String(addr.address);
      return String(addr.toString ? addr.toString() : '');
    }
    return String(addr);
  }

  // Key used to store address-scoped transactions map
  getStorageKey() {
    return 'blueCarbonTransactionsByUserAndAddress';
  }

  // Read the entire map from storage
  readAllFromStorage() {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      const parsed = stored ? JSON.parse(stored) : {};
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Error loading transactions map:', error);
      return {};
    }
  }

  // Persist the entire map back to storage
  writeAllToStorage(mapObj) {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(mapObj || {}));
    } catch (error) {
      console.error('Error saving transactions map:', error);
    }
  }

  // Set active logical user (e.g., Google user id/email)
  setActiveUser(userId) {
    const id = userId ? String(userId) : null;
    this.activeUserId = id;
    // Changing user should reload transactions for current address under that user
    if (this.activeUserId && this.activeAddress) {
      const all = this.readAllFromStorage();
      const userMap = all[this.activeUserId] || {};
      this.transactions = Array.isArray(userMap[this.activeAddress]) ? userMap[this.activeAddress] : [];
    } else {
      this.transactions = [];
    }
    this.notifySubscribers();
  }

  // Switch active address and load its transactions (within active user scope)
  setActiveAddress(address) {
    const normalized = this.normalizeAddress(address);
    this.activeAddress = normalized || null;
    if (!this.activeAddress || !this.activeUserId) {
      this.transactions = [];
      this.notifySubscribers();
      return;
    }
    const all = this.readAllFromStorage();
    const userMap = all[this.activeUserId] || {};
    this.transactions = Array.isArray(userMap[this.activeAddress]) ? userMap[this.activeAddress] : [];
    this.notifySubscribers();
  }

  // Save current active address transactions back to storage map
  saveTransactions() {
    if (!this.activeAddress || !this.activeUserId) {
      return; // nothing to save if address unknown
    }
    const all = this.readAllFromStorage();
    const userMap = all[this.activeUserId] && typeof all[this.activeUserId] === 'object' ? all[this.activeUserId] : {};
    userMap[this.activeAddress] = this.transactions;
    all[this.activeUserId] = userMap;
    this.writeAllToStorage(all);
  }

  // Generate unique transaction hash
  generateTransactionHash() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const hash = `0x${timestamp.toString(16)}${random}${Math.random().toString(16).substring(2)}`;
    return hash.substring(0, 66); // Ensure 64 character hash
  }

  // Get wallet balance (APT)
  async getWalletBalance(address) {
    try {
      console.log('TransactionManager: Fetching real APT balance for address:', address);
      const balance = await this.client.getAccountAPTAmount({ accountAddress: address });
      const aptBalance = balance / 100000000; // Convert from octas to APT
      console.log('TransactionManager: Real APT balance found:', aptBalance);
      return aptBalance;
    } catch (error) {
      console.error('TransactionManager: Error fetching wallet balance:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      
      // Only use mock balance as last resort
      console.log('TransactionManager: Using mock APT balance as fallback');
      return 5.0; // Mock 5 APT for demo
    }
  }

  // Create a transaction record
  createTransactionRecord(type, description, amount, from, to, status = 'pending') {
    const fromAddr = this.normalizeAddress(from);
    const toAddr = this.normalizeAddress(to);
    const hash = this.generateTransactionHash();
    const transaction = {
      id: this.transactions.length + 1,
      hash,
      type,
      description,
      amount,
      from: fromAddr,
      to: toAddr,
      status,
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000, // Mock block number
      gasUsed: Math.floor(Math.random() * 100000) + 50000, // Mock gas usage
      network: this.network,
      explorerUrl: getTransactionExplorerUrl(hash, this.network),
      isRealTransaction: isRealTransactionsEnabled()
    };

    // Ensure active address is set to the sender for scoping
    if (!this.activeAddress) {
      this.activeAddress = fromAddr || null;
    }
    if (!this.activeUserId) {
      // default to a shared bucket if user not set explicitly
      this.activeUserId = 'shared';
    }
    this.transactions.unshift(transaction);
    this.saveTransactions();
    // Persist to JSON server if configured
    this.persistTransactionAsync(transaction).catch(() => {});
    return transaction;
  }

  // Create a transaction record with a provided on-chain hash
  createTransactionRecordWithHash(hash, type, description, amount, from, to, status = 'pending') {
    const fromAddr = this.normalizeAddress(from);
    const toAddr = this.normalizeAddress(to);
    
    console.log('Creating transaction record with hash:', {
      hash,
      type,
      description,
      amount,
      from: fromAddr,
      to: toAddr,
      status
    });
    
    const transaction = {
      id: this.transactions.length + 1,
      hash,
      type,
      description,
      amount,
      from: fromAddr,
      to: toAddr,
      status,
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
      network: this.network,
      explorerUrl: getTransactionExplorerUrl(hash, this.network),
      isRealTransaction: true // This is always a real transaction when hash is provided
    };

    if (!this.activeAddress) {
      this.activeAddress = fromAddr || null;
    }
    if (!this.activeUserId) {
      this.activeUserId = 'shared';
    }
    this.transactions.unshift(transaction);
    this.saveTransactions();
    // Persist to JSON server if configured
    this.persistTransactionAsync(transaction).catch(() => {});
    return transaction;
  }

  // Simulate wallet transaction (for demo purposes)
  async simulateWalletTransaction(type, description, amount, from, to) {
    try {
      console.log('simulateWalletTransaction called with:', { type, description, amount, from, to });
      
      // Validate inputs
      if (!type || !description || amount === undefined || !from) {
        throw new Error('Missing required transaction parameters');
      }
      
      if (amount < 0) {
        throw new Error('Transaction amount cannot be negative');
      }
      
      // Create simulated transaction with proper flags
      console.log('Creating simulated transaction record...');
      const fromAddr = this.normalizeAddress(from);
      const toAddr = this.normalizeAddress(to);
      const hash = this.generateTransactionHash();
      const transaction = {
        id: this.transactions.length + 1,
        hash,
        type,
        description,
        amount,
        from: fromAddr,
        to: toAddr,
        status: 'pending',
        timestamp: new Date().toISOString(),
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000, // Mock block number
        gasUsed: Math.floor(Math.random() * 100000) + 50000, // Mock gas usage
        network: this.network,
        explorerUrl: getTransactionExplorerUrl(hash, this.network),
        isRealTransaction: false, // This is a simulated transaction
        isSimulated: true // Additional flag to identify simulated transactions
      };

      // Ensure active address is set to the sender for scoping
      if (!this.activeAddress) {
        this.activeAddress = fromAddr || null;
      }
      if (!this.activeUserId) {
        this.activeUserId = 'shared';
      }
      
      this.transactions.unshift(transaction);
      this.saveTransactions();
      console.log('Simulated transaction record created:', transaction);
      
      // Simulate blockchain processing delay
      console.log('Simulating blockchain processing delay...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update transaction status to success
      console.log('Updating transaction status to success...');
      transaction.status = 'success';
      this.saveTransactions();
      // Update in JSON server if configured
      this.updatePersistedTransactionStatusAsync(transaction.hash, 'success').catch(() => {});
      
      console.log('Transaction simulation completed successfully');
      return transaction;
    } catch (error) {
      console.error('Error simulating transaction:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  // Get all transactions
  getTransactions() {
    return this.transactions;
  }

  // Get transactions by type
  getTransactionsByType(type) {
    return this.transactions.filter(tx => tx.type === type);
  }

  // Get transactions by address
  getTransactionsByAddress(address) {
    const normalized = this.normalizeAddress(address);
    if (!normalized) return [];
    if (!this.activeUserId) return [];
    const all = this.readAllFromStorage();
    const userMap = all[this.activeUserId] || {};
    const list = Array.isArray(userMap[normalized]) ? userMap[normalized] : [];
    // Also include any inbound txs within the same user's other addresses
    const inbound = [];
    for (const [key, arr] of Object.entries(userMap)) {
      if (key === normalized || !Array.isArray(arr)) continue;
      for (const tx of arr) {
        if (tx && (tx.to === normalized || tx.from === normalized)) inbound.push(tx);
      }
    }
    const merged = [...list, ...inbound]
      .filter((tx, idx, self) => tx?.hash ? self.findIndex(t => t?.hash === tx.hash) === idx : true)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return merged;
  }

  // Get recent transactions
  getRecentTransactions(limit = 10) {
    return this.transactions.slice(0, limit);
  }

  // Calculate total spent
  getTotalSpent(address) {
    return this.transactions
      .filter(tx => tx.from === address && tx.status === 'success')
      .reduce((total, tx) => total + (tx.amount || 0), 0);
  }

  // Calculate total received
  getTotalReceived(address) {
    return this.transactions
      .filter(tx => tx.to === address && tx.status === 'success')
      .reduce((total, tx) => total + (tx.amount || 0), 0);
  }

  // Subscribe to transaction updates
  subscribe(callback) {
    this.subscribers = this.subscribers || [];
    this.subscribers.push(callback);
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Wait for a transaction to be confirmed on-chain and update status
  async waitForAndConfirmTransaction(hash) {
    try {
      await this.client.waitForTransaction({ transactionHash: hash });
      const tx = this.transactions.find(t => t.hash === hash);
      if (tx) {
        tx.status = 'success';
        this.saveTransactions();
        this.updatePersistedTransactionStatusAsync(hash, 'success').catch(() => {});
      }
      return true;
    } catch (error) {
      console.error('Error waiting for transaction confirmation:', error);
      return false;
    }
  }

  // --- JSON Server persistence helpers ---
  async persistTransactionAsync(transaction) {
    if (!this.apiBase) return;
    try {
      await fetch(`${this.apiBase.replace(/\/$/, '')}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
    } catch (error) {
      console.error('Failed to persist transaction:', error);
    }
  }

  async updatePersistedTransactionStatusAsync(hash, status) {
    if (!this.apiBase) return;
    try {
      // Assuming DB has unique index on hash. Find by hash then patch.
      const res = await fetch(`${this.apiBase.replace(/\/$/, '')}/transactions?hash=${encodeURIComponent(hash)}`);
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0 && list[0].id != null) {
        const id = list[0].id;
        await fetch(`${this.apiBase.replace(/\/$/, '')}/transactions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      }
    } catch (error) {
      console.error('Failed to update persisted transaction:', error);
    }
  }

  // Pull transactions from server and merge with localStorage (by unique hash)
  async syncFromServerAsync() {
    if (!this.apiBase) return;
    try {
      const res = await fetch(`${this.apiBase.replace(/\/$/, '')}/transactions`);
      const serverList = await res.json();
      if (!Array.isArray(serverList)) return;
      if (!this.activeAddress || !this.activeUserId) return; // we only merge for an active scope

      const relevant = serverList.filter(tx => {
        const fromAddr = this.normalizeAddress(tx?.from);
        const toAddr = this.normalizeAddress(tx?.to);
        return fromAddr === this.activeAddress || toAddr === this.activeAddress;
      });

      const byHash = new Map();
      for (const tx of this.transactions) {
        if (tx?.hash) byHash.set(tx.hash, tx);
      }
      for (const tx of relevant) {
        if (tx?.hash) byHash.set(tx.hash, { ...byHash.get(tx.hash), ...tx });
      }

      this.transactions = Array.from(byHash.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      this.saveTransactions();
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to sync transactions from server:', error);
    }
  }

  // Notify subscribers of transaction updates
  notifySubscribers() {
    if (this.subscribers) {
      this.subscribers.forEach(callback => callback(this.transactions));
    }
  }

  // Clear all transactions (for testing)
  clearTransactions() {
    if (this.activeUserId && this.activeAddress) {
      this.transactions = [];
      this.saveTransactions();
    } else if (this.activeUserId && !this.activeAddress) {
      const all = this.readAllFromStorage();
      all[this.activeUserId] = {};
      this.writeAllToStorage(all);
      this.transactions = [];
      this.notifySubscribers();
    } else {
      // If no active user, clear the whole map
      this.writeAllToStorage({});
      this.transactions = [];
      this.notifySubscribers();
    }
  }
}

// Create singleton instance
const transactionManager = new TransactionManager();

export default transactionManager;
