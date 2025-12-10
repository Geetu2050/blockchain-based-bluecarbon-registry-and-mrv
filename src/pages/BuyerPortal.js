import React, { useState, useEffect } from 'react';
import { formatCompact } from '../utils/numberFormat';
import Notification from '../components/Notification';
import TransactionList from '../components/TransactionList';
import WalletDemo from '../components/WalletDemo';
import DigitalBadge from '../components/DigitalBadge';
import projectManager from '../utils/projectManager';
import { useWalletContext } from '../contexts/WalletContext';
import { getAccountExplorerUrl } from '../config/aptosConfig';
import badgeService from '../services/badgeService';

const BuyerPortal = ({ user }) => {
  const { connected, account, balance, purchaseCredits, retireCredits, getUserTransactions, getTotalSpent, isLoading, transactions } = useWalletContext();
  const [credits, setCredits] = useState([]);
  const [purchasedCredits, setPurchasedCredits] = useState([]);
  const [filter, setFilter] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  
  // Transaction history state
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [transactionSort, setTransactionSort] = useState('newest');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [showTransactionDetails, setShowTransactionDetails] = useState(null);

  // Badge state
  const [showBadge, setShowBadge] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  const [badgeStats, setBadgeStats] = useState(null);



  // Generate credits from approved projects
  const generateCreditsFromProjects = (projects) => {
    return projects
      .filter(project => project.status === 'approved' && project.creditsIssued > 0)
      .map(project => {
        // Generate random price between $10-$30, then convert to APT (1 APT = $3)
        const priceInDollars = Math.random() * 20 + 10;
        const priceInAPT = priceInDollars / 3; // Convert to APT tokens
        
        return {
          id: project.id,
          projectName: project.name,
          organization: project.organization,
          location: project.location,
          hectares: project.hectares,
          creditsAvailable: project.creditsIssued,
          creditsSold: 0,
          pricePerCredit: priceInAPT, // Price in APT tokens
          pricePerCreditUSD: priceInDollars, // Keep USD price for reference
          methodology: project.methodology,
          vintage: new Date(project.verificationDate).getFullYear().toString(),
          status: "available",
          description: project.description,
          verificationDate: project.verificationDate,
          carbonSequestration: project.hectares * 30, // Estimate 30 tons CO2 per hectare
          ngoWalletAddress: project.ngoWalletAddress // Include NGO wallet address
        };
      });
  };

  // Mock purchased credits
  const mockPurchasedCredits = [
    {
      id: 1,
      projectName: "Mangrove Restoration - Sundarbans",
      creditsPurchased: 100,
      pricePerCredit: 5.17, // $15.50 / 3 = 5.17 APT
      pricePerCreditUSD: 15.50,
      totalCost: 517, // 100 * 5.17 APT
      totalCostUSD: 1550,
      purchaseDate: "2024-02-01",
      status: "active"
    },
    {
      id: 2,
      projectName: "Seagrass Meadow Protection",
      creditsPurchased: 50,
      pricePerCredit: 6.25, // $18.75 / 3 = 6.25 APT
      pricePerCreditUSD: 18.75,
      totalCost: 312.5, // 50 * 6.25 APT
      totalCostUSD: 937.50,
      purchaseDate: "2024-02-05",
      status: "retired"
    }
  ];

  useEffect(() => {
    // Load credits from approved projects
    const allProjects = projectManager.getProjects();
    setCredits(generateCreditsFromProjects(allProjects));
    setPurchasedCredits(mockPurchasedCredits);
    
    // Subscribe to project updates
    const unsubscribe = projectManager.subscribe((updatedProjects) => {
      setCredits(generateCreditsFromProjects(updatedProjects));
    });

    // Load badge statistics
    loadBadgeStats();

    return () => unsubscribe();
  }, [user]);

  // Load badge statistics
  const loadBadgeStats = async () => {
    if (!user?.id && !user?.email) return;
    
    try {
      const stats = await badgeService.getUserBadgeStats(user.id || user.email);
      setBadgeStats(stats);
    } catch (error) {
      console.error('Error loading badge stats:', error);
    }
  };


  const handlePurchaseCredits = (credit) => {
    setSelectedCredit(credit);
    setPurchaseQuantity(1);
    setShowPurchaseModal(true);
  };


  const confirmPurchase = async () => {
    if (!selectedCredit) return;

    if (!connected || !account) {
      setNotification({
        message: 'Please connect your wallet first to purchase credits.',
        type: 'error'
      });
      return;
    }

    try {
      const totalCost = selectedCredit.pricePerCredit * purchaseQuantity;
      const totalCostUSD = selectedCredit.pricePerCreditUSD * purchaseQuantity;

      console.log('Purchase attempt:', {
        projectName: selectedCredit.projectName,
        quantity: purchaseQuantity,
        pricePerCredit: selectedCredit.pricePerCredit,
        totalCost: totalCost,
        balance: balance,
        connected: connected,
        account: account
      });

      // Check if user has enough balance
      if (balance < totalCost) {
        setNotification({
          message: `Insufficient balance. You need ${totalCost.toFixed(4)} APT but have ${balance.toFixed(4)} APT.`,
          type: 'error'
        });
        return;
      }

      // Execute wallet transaction with direct payment to NGO
      console.log('Calling purchaseCredits with NGO wallet address...');
      const transaction = await purchaseCredits(
        selectedCredit.projectName,
        purchaseQuantity,
        selectedCredit.pricePerCredit,
        totalCost,
        selectedCredit.ngoWalletAddress // Pass NGO wallet address for direct payment
      );
      console.log('Transaction result:', transaction);
      
      const newPurchase = {
        id: purchasedCredits.length + 1,
        projectName: selectedCredit.projectName,
        creditsPurchased: purchaseQuantity,
        pricePerCredit: selectedCredit.pricePerCredit,
        pricePerCreditUSD: selectedCredit.pricePerCreditUSD,
        totalCost: totalCost,
        totalCostUSD: totalCostUSD,
        purchaseDate: new Date().toISOString().split('T')[0],
        status: "active",
        transactionHash: transaction.hash
      };
      
      setPurchasedCredits(prev => [newPurchase, ...prev]);
      setCredits(prev => prev.map(c => 
        c.id === selectedCredit.id 
          ? { ...c, creditsAvailable: c.creditsAvailable - purchaseQuantity, creditsSold: c.creditsSold + purchaseQuantity }
          : c
      ));
      
      setShowPurchaseModal(false);
      
      // Check if this was a simulated transaction
      const isSimulated = transaction.hash && transaction.hash.includes('simulated');
      const successMessage = isSimulated 
        ? `Successfully purchased ${purchaseQuantity} credits for ${totalCost.toFixed(4)} APT ($${totalCostUSD.toFixed(2)})! (Demo Mode - Simulated Transaction)`
        : `Successfully purchased ${purchaseQuantity} credits for ${totalCost.toFixed(4)} APT ($${totalCostUSD.toFixed(2)})! Transaction Hash: ${transaction.hash}`;
      
      setNotification({
        message: successMessage,
        type: 'success'
      });
    } catch (error) {
      console.error('Error purchasing credits:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Error purchasing credits. Please try again.';
      
      // Provide more specific error messages
      if (error.message && error.message.includes('not connected')) {
        errorMessage = 'Wallet not connected. Please connect your wallet first.';
      } else if (error.message && error.message.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this transaction.';
      } else if (error.message && error.message.includes('simulation')) {
        // This is actually a success in simulation mode
        errorMessage = null; // Don't show error for simulation mode
      } else if (error.message) {
        errorMessage = `Transaction failed: ${error.message}`;
      }
      
      if (errorMessage) {
        setNotification({
          message: errorMessage,
          type: 'error'
        });
      }
    }
  };

  const handleRetireCredits = async (purchaseId) => {
    if (!connected || !account) {
      setNotification({
        message: 'Please connect your wallet first to retire credits.',
        type: 'error'
      });
      return;
    }

    try {
      const purchase = purchasedCredits.find(p => p.id === purchaseId);
      if (!purchase) return;

      // Execute wallet transaction for retiring credits
      const transaction = await retireCredits(
        purchase.projectName,
        purchase.creditsPurchased
      );

      // Update the purchase status
      setPurchasedCredits(prev => prev.map(p => 
        p.id === purchaseId 
          ? { ...p, status: 'retired', transactionHash: transaction.hash }
          : p
      ));

      // Create badge data
      const badgeInfo = {
        companyName: user.name || 'Anonymous',
        projectName: purchase.projectName,
        creditsRetired: purchase.creditsPurchased,
        retirementDate: new Date().toISOString(),
        transactionHash: transaction.hash
      };

      // Store badge in Firebase
      try {
        await badgeService.createBadge({
          userId: user.id || user.email || 'anonymous',
          ...badgeInfo
        });
        console.log('Badge data stored in Firebase');
        
        // Refresh badge statistics
        await loadBadgeStats();
      } catch (firebaseError) {
        console.error('Error storing badge in Firebase:', firebaseError);
        // Don't fail the retirement if Firebase storage fails
      }

      // Show the digital badge
      setBadgeData(badgeInfo);
      setShowBadge(true);

      setNotification({
        message: `Credits retired successfully! Your digital badge is ready. Transaction Hash: ${transaction.hash}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error retiring credits:', error);
      setNotification({
        message: 'Error retiring credits. Please try again.',
        type: 'error'
      });
    }
  };

  const filteredCredits = credits.filter(credit => {
    const matchesFilter = filter === 'all' || credit.status === filter;
    const matchesSearch = (credit.projectName && credit.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (credit.organization && credit.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (credit.location && credit.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalSpent = getTotalSpent();
  const totalSpentAPT = purchasedCredits.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalSpentUSD = purchasedCredits.reduce((sum, purchase) => sum + purchase.totalCostUSD, 0);
  const totalCreditsPurchased = purchasedCredits.reduce((sum, purchase) => sum + purchase.creditsPurchased, 0);
  const retiredCredits = purchasedCredits.filter(p => p.status === 'retired').length;

  // Transaction history functions
  const getFilteredTransactions = () => {
    let transactions = getUserTransactions();
    
    // Filter by type
    if (transactionFilter !== 'all') {
      transactions = transactions.filter(tx => tx.type === transactionFilter);
    }
    
    // Search filter
    if (transactionSearch) {
      const searchLower = transactionSearch.toLowerCase();
      transactions = transactions.filter(tx => 
        (tx.description && tx.description.toLowerCase().includes(searchLower)) ||
        (tx.hash && tx.hash.toLowerCase().includes(searchLower)) ||
        (tx.type && tx.type.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort transactions
    transactions.sort((a, b) => {
      switch (transactionSort) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'amount_high':
          return (b.amount || 0) - (a.amount || 0);
        case 'amount_low':
          return (a.amount || 0) - (b.amount || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });
    
    return transactions;
  };

  const getTransactionStats = () => {
    const transactions = getUserTransactions();
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(tx => tx.status === 'success').length;
    const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
    const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    return {
      total: totalTransactions,
      successful: successfulTransactions,
      pending: pendingTransactions,
      volume: totalVolume
    };
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification({
        message: `${label} copied to clipboard!`,
        type: 'success'
      });
    } catch (error) {
      setNotification({
        message: `Failed to copy ${label}`,
        type: 'error'
      });
    }
  };

  return (
    <div className="container-fluid py-5" style={{ marginTop: '80px' }}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="container">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-4 fw-bold text-gradient mb-2">
                  <i className="bi bi-shop me-3"></i>
                  Carbon Credit Marketplace
                </h1>
                <p className="lead text-muted">
                  Welcome, {user.name}! Purchase and manage verified blue carbon credits.
                </p>
              </div>
              <div className="text-end">
                <div className="h4 text-success mb-0">{totalSpentAPT.toFixed(4)} APT</div>
                <small className="text-muted">Total Spent (${totalSpentUSD.toLocaleString()})</small>
              </div>
            </div>
          </div>
        </div>






        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-primary">{totalCreditsPurchased}</div>
                <div className="stat-label">Credits Purchased</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-success">{totalSpentAPT.toFixed(4)} APT</div>
                <div className="stat-label">Total Spent (${totalSpentUSD.toLocaleString()})</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-warning">{retiredCredits}</div>
                <div className="stat-label">Credits Retired</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-info">{badgeStats?.totalBadges || 0}</div>
                <div className="stat-label">Digital Badges</div>
                {badgeStats?.totalCreditsRetired > 0 && (
                  <small className="text-muted">
                    {badgeStats.totalCreditsRetired.toLocaleString()} credits verified
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${filter === 'available' ? 'active' : ''}`}
                  onClick={() => setFilter('available')}
                >
                  <i className="bi bi-shop me-2"></i>
                  Available Credits
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${filter === 'purchased' ? 'active' : ''}`}
                  onClick={() => setFilter('purchased')}
                >
                  <i className="bi bi-bag me-2"></i>
                  My Purchases
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Search and Filters */}
        {filter === 'available' && (
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search projects, organizations, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select">
                <option value="">All Methodologies</option>
                <option value="VCS">VCS</option>
                <option value="Gold Standard">Gold Standard</option>
                <option value="CDM">CDM</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select">
                <option value="">Sort by Price</option>
                <option value="low">Low to High</option>
                <option value="high">High to Low</option>
              </select>
            </div>
          </div>
        )}

        {/* Available Credits Marketplace */}
        {filter === 'available' && (
          <div className="row">
            <div className="col-12">
              <div className="row g-4">
                {filteredCredits.map((credit) => (
                  <div key={credit.id} className="col-lg-4 col-md-6">
                    <div className="card h-100 credit-card">
                      <div className="card-header bg-gradient-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="card-title mb-0">
                            <i className="bi bi-tree me-2"></i>
                            {credit.projectName}
                          </h6>
                          <span className="badge bg-light text-dark">{credit.methodology}</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-building me-2 text-muted"></i>
                            <small className="text-muted">{credit.organization}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-geo-alt me-2 text-muted"></i>
                            <small className="text-muted">{credit.location}</small>
                          </div>
                          {credit.ngoWalletAddress && (
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-wallet2 me-2 text-muted"></i>
                              <small className="text-muted">
                                NGO Wallet: {credit.ngoWalletAddress.slice(0, 6)}...{credit.ngoWalletAddress.slice(-4)}
                              </small>
                            </div>
                          )}
                          <p className="card-text text-muted small">{credit.description}</p>
                        </div>
                        
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="text-center p-2 bg-light rounded">
                              <div className="fw-bold text-primary">{credit.hectares}</div>
                              <small className="text-muted">Hectares</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-2 bg-light rounded">
                              <div className="fw-bold text-success">{credit.carbonSequestration}</div>
                              <small className="text-muted">CO₂ Tons</small>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <div className="h4 text-success mb-0">{credit.pricePerCredit.toFixed(4)} APT</div>
                            <small className="text-muted">per credit (${credit.pricePerCreditUSD.toFixed(2)})</small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-primary">{formatCompact(credit.creditsAvailable)}</div>
                            <small className="text-muted">available</small>
                          </div>
                        </div>

                        <div className="d-grid">
                          <button 
                            className="btn btn-primary"
                            onClick={() => handlePurchaseCredits(credit)}
                            disabled={credit.creditsAvailable === 0}
                          >
                            <i className="bi bi-cart-plus me-2"></i>
                            {credit.creditsAvailable === 0 ? 'Sold Out' : 'Purchase Credits'}
                          </button>
                        </div>
                      </div>
                      <div className="card-footer bg-light">
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          Verified: {new Date(credit.verificationDate).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredCredits.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="text-muted mt-3">No Credits Found</h4>
                  <p className="text-muted">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Purchased Credits */}
        {filter === 'purchased' && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-bag me-2"></i>
                    My Credit Purchases
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Credits</th>
                          <th>Price per Credit</th>
                          <th>Total Cost</th>
                          <th>Purchase Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchasedCredits.map((purchase) => (
                          <tr key={purchase.id}>
                            <td>
                              <div className="fw-semibold">{purchase.projectName}</div>
                            </td>
                            <td>
                              <span className="fw-semibold">{purchase.creditsPurchased}</span>
                              <small className="text-muted d-block">credits</small>
                            </td>
                            <td>
                              <span className="fw-semibold">{purchase.pricePerCredit.toFixed(4)} APT</span>
                              <small className="text-muted d-block">(${purchase.pricePerCreditUSD.toFixed(2)})</small>
                            </td>
                            <td>
                              <span className="fw-semibold text-success">{purchase.totalCost.toFixed(4)} APT</span>
                              <small className="text-muted d-block">(${purchase.totalCostUSD.toFixed(2)})</small>
                            </td>
                            <td>
                              {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`badge ${purchase.status === 'active' ? 'badge-pending' : 'badge-approved'}`}>
                                {purchase.status === 'active' ? 'Active' : 'Retired'}
                              </span>
                            </td>
                            <td>
                              {purchase.status === 'active' ? (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleRetireCredits(purchase.id)}
                                  disabled={isLoading}
                                >
                                  <i className="bi bi-recycle me-1"></i>
                                  Retire
                                </button>
                              ) : (
                                <div className="d-flex gap-2">
                                  <span className="text-muted">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Retired
                                  </span>
                                  {purchase.transactionHash && (
                                    <button 
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => {
                                        setBadgeData({
                                          companyName: user.name || 'Anonymous',
                                          projectName: purchase.projectName,
                                          creditsRetired: purchase.creditsPurchased,
                                          retirementDate: purchase.purchaseDate,
                                          transactionHash: purchase.transactionHash
                                        });
                                        setShowBadge(true);
                                      }}
                                      title="View Digital Badge"
                                    >
                                      <i className="bi bi-award me-1"></i>
                                      Badge
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Demo and Transaction History */}
        <div className="row mt-5">
          <div className="col-md-6">
            <WalletDemo />
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  How It Works
                </h5>
              </div>
              <div className="card-body">
                <ol className="mb-0">
                  <li>Connect your Petra wallet using the "Connect Wallet" button</li>
                  <li>Your wallet balance will be displayed in the navbar</li>
                  <li>When you purchase credits, the amount is deducted from your wallet</li>
                  <li>Each transaction gets a unique hash for tracking</li>
                  <li>All transactions are recorded in the transaction history</li>
                  <li>You can copy transaction hashes or view them on Aptos Explorer</li>
                </ol>
              </div>
            </div>
          </div>
        </div>


        {/* Transaction History */}
        <div className="row mt-5">
          <div className="col-12">
            <TransactionList 
              transactions={transactions} 
              title="Transaction History"
              showExplorerLinks={true}
            />
            <div className="alert alert-info mt-3">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Demo Mode:</strong> Transactions with a "Demo" badge are simulated for demonstration purposes. 
              Click the info icon to view transaction details. In a real deployment, these would be viewable on the Aptos Explorer.
            </div>
          </div>
        </div>

        {/* Wallet Explorer */}
        {connected && account && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-diagram-3 me-2"></i>
                    Wallet Explorer
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Wallet Address</h6>
                      <p className="font-monospace small text-break">
                        {(() => {
                          let address = account.address;
                          if (typeof address === 'object' && address.data) {
                            address = address.data;
                          } else if (typeof address === 'object') {
                            address = address.toString();
                          } else {
                            address = String(address);
                          }
                          return address;
                        })()}
                      </p>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => window.open(getAccountExplorerUrl(account.address), '_blank')}
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        View on Aptos Explorer
                      </button>
                    </div>
                    <div className="col-md-6">
                      <h6>Network Status</h6>
                      <p className="mb-1">
                        <span className="badge bg-success me-2">Connected</span>
                        <span className="badge bg-info">Testnet</span>
                      </p>
                      <p className="small text-muted mb-0">
                        Demo mode - using mock data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Digital Badge Modal */}
        {showBadge && badgeData && (
          <DigitalBadge
            companyName={badgeData.companyName}
            projectName={badgeData.projectName}
            creditsRetired={badgeData.creditsRetired}
            retirementDate={badgeData.retirementDate}
            transactionHash={badgeData.transactionHash}
            onClose={() => {
              setShowBadge(false);
              setBadgeData(null);
            }}
          />
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedCredit && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-cart-plus me-2"></i>
                  Purchase Carbon Credits
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedCredit(null);
                    setPurchaseQuantity(1);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>{selectedCredit.projectName}</h6>
                  <p className="text-muted mb-0">{selectedCredit.organization}</p>
                  <small className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i>
                    {selectedCredit.location}
                  </small>
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h5 text-success mb-0">{selectedCredit.pricePerCredit.toFixed(4)} APT</div>
                      <small className="text-muted">Price per Credit (${selectedCredit.pricePerCreditUSD.toFixed(2)})</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h5 text-primary mb-0">{formatCompact(selectedCredit.creditsAvailable)}</div>
                      <small className="text-muted">Available Credits</small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <strong>Quantity to Purchase</strong>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={selectedCredit.creditsAvailable}
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="alert alert-info">
                  <div className="d-flex justify-content-between">
                    <span>Total Cost:</span>
                    <strong>{(selectedCredit.pricePerCredit * purchaseQuantity).toFixed(4)} APT (${(selectedCredit.pricePerCreditUSD * purchaseQuantity).toFixed(2)})</strong>
                  </div>
                </div>

                {selectedCredit.ngoWalletAddress && (
                  <div className="alert alert-success">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-wallet2 me-2"></i>
                      <small>
                        <strong>Direct Payment:</strong> Payment will be sent directly to the NGO's wallet address: 
                        <code className="ms-1">{selectedCredit.ngoWalletAddress.slice(0, 6)}...{selectedCredit.ngoWalletAddress.slice(-4)}</code>
                      </small>
                    </div>
                  </div>
                )}
                <div className="alert alert-warning">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      <strong>Demo Mode:</strong> This purchase will be simulated since the smart contract is not deployed. 
                      Your balance will be updated locally for demonstration purposes.
                    </small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedCredit(null);
                    setPurchaseQuantity(1);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={confirmPurchase}
                  disabled={isLoading || purchaseQuantity < 1 || purchaseQuantity > selectedCredit.creditsAvailable}
                >
                  {isLoading ? (
                    <>
                      <span className="loading me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card me-2"></i>
                      Confirm Purchase
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionDetails && showTransactionDetails !== 'stats' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Transaction Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowTransactionDetails(null)}
                ></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const tx = getUserTransactions().find(t => t.id === showTransactionDetails);
                  if (!tx) return <div>Transaction not found</div>;
                  
                  return (
                    <div>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-hash me-2"></i>
                                Transaction Hash
                              </h6>
                              <p className="card-text font-monospace small">
                                {tx.hash}
                              </p>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => copyToClipboard(tx.hash, 'Transaction hash')}
                              >
                                <i className="bi bi-copy me-1"></i>
                                Copy Hash
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-tag me-2"></i>
                                Transaction Type
                              </h6>
                              <p className="card-text">
                                <span className={`badge bg-${tx.type === 'credits_purchased' ? 'success' : 'info'}`}>
                                  {tx.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-info-circle me-2"></i>
                                Description
                              </h6>
                              <p className="card-text">{tx.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-currency-bitcoin me-2"></i>
                                Amount
                              </h6>
                              <p className="card-text">
                                <span className="h5 text-success">
                                  {tx.amount ? `${tx.amount.toFixed(4)} APT` : 'N/A'}
                                </span>
                                {tx.amount && (
                                  <small className="text-muted d-block">
                                    (${(tx.amount * 3).toFixed(2)} USD)
                                  </small>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-clock me-2"></i>
                                Timestamp
                              </h6>
                              <p className="card-text">
                                <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
                                <small className="text-muted">
                                  {new Date(tx.timestamp).toLocaleTimeString()}
                                </small>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-check-circle me-2"></i>
                                Status
                              </h6>
                              <p className="card-text">
                                <span className={`badge ${tx.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                                  {tx.status.toUpperCase()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-arrow-right-circle me-2"></i>
                                From Address
                              </h6>
                              <p className="card-text font-monospace small">
                                {tx.from}
                              </p>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => copyToClipboard(tx.from, 'From address')}
                              >
                                <i className="bi bi-copy me-1"></i>
                                Copy Address
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">
                                <i className="bi bi-arrow-left-circle me-2"></i>
                                To Address
                              </h6>
                              <p className="card-text font-monospace small">
                                {tx.to}
                              </p>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => copyToClipboard(tx.to, 'To address')}
                              >
                                <i className="bi bi-copy me-1"></i>
                                Copy Address
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTransactionDetails(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    const tx = getUserTransactions().find(t => t.id === showTransactionDetails);
                    if (tx) {
                      window.open(`https://explorer.aptoslabs.com/txn/${tx.hash}`, '_blank');
                    }
                  }}
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  View on Aptos Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerPortal;
