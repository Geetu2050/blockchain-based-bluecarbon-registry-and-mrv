import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useWalletContext } from '../contexts/WalletContext';

const Navbar = ({ user, userRole, onLogin, onLogout, onChangeRole, isLoading }) => {
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const { connect, connected, disconnect, account, wallets } = useWallet();
  const { balance, updateBalance } = useWalletContext();

  // Debug: Log wallet information
  console.log('Available wallets:', wallets);
  console.log('Connected:', connected);
  console.log('Account:', account);
  console.log('Account type:', typeof account);
  console.log('Account address:', account?.address);
  console.log('Account address type:', typeof account?.address);

  const handleConnectWallet = async () => {
    try {
      console.log('Attempting to connect wallet...');
      console.log('Available wallets:', wallets);
      if (!wallets || wallets.length === 0) {
        alert('No wallets available. Please install Petra wallet extension.');
        window.open('https://petra.app', '_blank');
        return;
      }

      // Prefer Petra if available; otherwise use the first wallet
      const hasPetra = wallets.some(w => (w?.name || '').toLowerCase().includes('petra'));
      await connect(hasPetra ? 'Petra' : wallets[0]?.name);
      console.log('Wallet connected successfully');
      
      // Check if the connected wallet is allowed
      setTimeout(() => {
        if (account?.address) {
          // Get the proper hex address from Petra wallet
          let walletAddress = account.address;
          
          // Petra wallet returns address as object with toString() method
          if (typeof walletAddress === 'object' && walletAddress.toString) {
            walletAddress = walletAddress.toString();
          } else {
            walletAddress = String(walletAddress || '');
          }
          
          console.log('Wallet connected with address:', walletAddress);
          
          console.log('Wallet connected successfully, updating balance...');
          // Store the wallet address globally for easy access
          window.currentWalletAddress = walletAddress;
          updateBalance();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Failed to connect wallet: ${error.message}. Please make sure Petra wallet extension is installed and unlocked.`);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ngo': return 'NGO';
      case 'admin': return 'Admin';
      case 'buyer': return 'Buyer';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ngo': return 'success';
      case 'admin': return 'danger';
      case 'buyer': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-tree-fill me-2"></i>
          Blue Carbon Registry
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/registry' ? 'active' : ''}`} 
                to="/registry"
              >
                Registry
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/ngo' ? 'active' : ''}`} 
                    to="/ngo"
                  >
                    NGO Portal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} 
                    to="/admin"
                  >
                    Admin Portal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/buyer' ? 'active' : ''}`} 
                    to="/buyer"
                  >
                    Buyer Portal
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Wallet Connection */}
            {connected ? (
              <div className="d-flex align-items-center gap-2">
                <div className="wallet-info">
                  <small className="d-block">
                    <i className="bi bi-wallet2 me-1"></i>
                    {account?.address ? 
                      (() => {
                        // Get the proper hex address from Petra wallet
                        let address = account.address;
                        
                        // Petra wallet returns address as object with toString() method
                        if (typeof address === 'object' && address.toString) {
                          address = address.toString();
                        } else {
                          address = String(address || '');
                        }
                        
                        // Display the address in shortened format
                        return `${address.slice(0, 6)}...${address.slice(-4)}`;
                      })()
                      : 
                      'Connected'
                    }
                  </small>
                  <small className="text-success">
                    <i className="bi bi-currency-bitcoin me-1"></i>
                    {typeof balance === 'number' ? balance.toFixed(4) : '0.0000'} APT
                  </small>
                </div>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleConnectWallet}
              >
                <i className="bi bi-wallet2 me-2"></i>
                Connect Wallet
              </button>
            )}

            {/* User Authentication */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                >
                  <div 
                    className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: user.color || '#2d5a27',
                      fontSize: '14px'
                    }}
                  >
                    {user.initials || user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.name}
                </button>
                <ul className={`dropdown-menu ${showRoleMenu ? 'show' : ''}`}>
                  <li>
                    <span className="dropdown-item-text d-flex align-items-center">
                      <span className={`badge bg-${getRoleColor(userRole)} me-2`}>
                        {getRoleDisplayName(userRole)}
                      </span>
                      <span className="text-nowrap">Current Role</span>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        onChangeRole('ngo');
                        setShowRoleMenu(false);
                      }}
                    >
                      <i className="bi bi-people me-2"></i>
                      Switch to NGO
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        onChangeRole('admin');
                        setShowRoleMenu(false);
                      }}
                    >
                      <i className="bi bi-shield-check me-2"></i>
                      Switch to Admin
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        onChangeRole('buyer');
                        setShowRoleMenu(false);
                      }}
                    >
                      <i className="bi bi-cart me-2"></i>
                      Switch to Buyer
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger"
                      onClick={() => {
                        onLogout();
                        setShowRoleMenu(false);
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={onLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading me-2"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-google me-2"></i>
                    Login with Google
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
