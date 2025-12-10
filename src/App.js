
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import RegistryPage from './pages/RegistryPage';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import BuyerPortal from './pages/BuyerPortal';
import ErrorBoundary from './components/ErrorBoundary';
import { WalletProvider } from './contexts/WalletContext';

// Mock smart contract address
const CONTRACT_ADDRESS = "0x1::blue_carbon_registry";

const wallets = [
  new PetraWallet()
];

// Debug: Log wallet configuration
// console.log('Wallet configuration:', wallets);

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate Google login
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Restrict demo users to the requested two
      const users = [
        {
          id: '3',
          name: 'Emma Rodriguez',
          email: 'emma.rodriguez@coastalalliance.org',
          avatar: null,
          initials: 'ER',
          color: '#6b8e23',
          organization: 'Coastal Restoration Alliance'
        },
        {
          id: '4',
          name: 'James Wilson',
          email: 'j.wilson@marinelife.org',
          avatar: null,
          initials: 'JW',
          color: '#28a745',
          organization: 'Marine Life Foundation'
        }
      ];
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      setUser(randomUser);
      // Set role: both demo users are NGOs by default
      setUserRole('ngo');
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
  };

  const changeUserRole = (role) => {
    setUserRole(role);
  };

  return (
      <AptosWalletAdapterProvider 
        plugins={wallets} 
        autoConnect={false} 
        onError={(e) => {
          console.error('Wallet Error:', e);
          // Don't let wallet errors crash the app
        }}
      >
      <WalletProvider currentUser={user}>
        <Router>
          <div className="App">
            <Navbar 
              user={user} 
              userRole={userRole}
              onLogin={handleGoogleLogin}
              onLogout={handleLogout}
              onChangeRole={changeUserRole}
              isLoading={isLoading}
            />
            
            <Routes>
              <Route 
                path="/" 
                element={
                  <LandingPage 
                    onLogin={handleGoogleLogin}
                    isLoading={isLoading}
                  />
                } 
              />
              <Route path="/registry" element={<RegistryPage />} />
              <Route 
                path="/ngo" 
                element={
                  user && userRole === 'ngo' ? 
                  <NGODashboard user={user} /> : 
                  <Navigate to="/" />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  user && userRole === 'admin' ? 
                  <AdminDashboard user={user} /> : 
                  <Navigate to="/" />
                } 
              />
              <Route 
                path="/buyer" 
                element={
                  user && userRole === 'buyer' ? 
                  <ErrorBoundary>
                    <BuyerPortal user={user} />
                  </ErrorBoundary> : 
                  <Navigate to="/" />
                } 
              />
            </Routes>
          </div>
        </Router>
      </WalletProvider>
      </AptosWalletAdapterProvider>
  );
}

export default App;
