import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ onLogin, isLoading }) => {
  const [stats, setStats] = useState({
    hectaresRestored: 0,
    creditsIssued: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);

  // Simulate fetching stats from smart contract
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      // Simulate API call delay
      setTimeout(() => {
        setStats({
          hectaresRestored: 1250,
          creditsIssued: 8750
        });
        setIsLoadingStats(false);
      }, 1000);
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '120px 0 60px 0' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="display-5 fw-bold mb-3">
                  Restore Our Planet with
                  <span className="text-warning"> Blue Carbon</span>
                </h1>
                <p className="lead mb-4">
                  Join the world's first blockchain-powered Blue Carbon Registry. 
                  Track, verify, and trade carbon credits from coastal ecosystem restoration projects 
                  with complete transparency and immutability.
                </p>
                <div className="d-flex flex-wrap gap-3 mb-4">
                  <button 
                    className="btn btn-warning btn-lg"
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
                        Get Started
                      </>
                    )}
                  </button>
                  <Link to="/registry" className="btn btn-outline-light btn-lg">
                    <i className="bi bi-eye me-2"></i>
                    View Registry
                  </Link>
                </div>
                {connected && account && (
                  <div className="alert alert-success d-inline-block">
                    <i className="bi bi-wallet2 me-2"></i>
                    Wallet Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <div className="position-relative">
                  <div className="bg-white rounded-4 p-4 shadow-lg">
                    <i className="bi bi-tree-fill text-success" style={{ fontSize: '6rem' }}></i>
                    <h3 className="mt-3 text-gradient">Blockchain Verified</h3>
                    <p className="text-muted">Every credit is verified on the Aptos blockchain</p>
                  </div>
                  <div className="position-absolute top-0 start-0 translate-middle">
                    <div className="bg-warning rounded-circle p-2">
                      <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                  </div>
                  <div className="position-absolute bottom-0 end-0 translate-middle">
                    <div className="bg-info rounded-circle p-2">
                      <i className="bi bi-graph-up text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Impact by Numbers</h2>
              <p className="section-subtitle">
                Real-time data from our blockchain registry
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="stat-card">
                <div className="stat-number">
                  {isLoadingStats ? (
                    <span className="loading"></span>
                  ) : (
                    stats.hectaresRestored.toLocaleString()
                  )}
                </div>
                <div className="stat-label">Hectares Restored</div>
                <div className="text-muted mt-2">
                  <i className="bi bi-geo-alt me-1"></i>
                  Coastal ecosystems worldwide
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="stat-card">
                <div className="stat-number text-success">
                  {isLoadingStats ? (
                    <span className="loading"></span>
                  ) : (
                    stats.creditsIssued.toLocaleString()
                  )}
                </div>
                <div className="stat-label">Carbon Credits Issued</div>
                <div className="text-muted mt-2">
                  <i className="bi bi-currency-bitcoin me-1"></i>
                  Verified on Aptos blockchain
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Blue Carbon Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Why Blue Carbon?</h2>
              <p className="section-subtitle">
                Coastal ecosystems are among the most effective carbon sinks on Earth
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-speedometer2" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="card-title">10x More Effective</h5>
                  <p className="card-text">
                    Blue carbon ecosystems can store up to 10 times more carbon per hectare 
                    than terrestrial forests, making them incredibly efficient carbon sinks.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-shield-check" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="card-title">Long-term Storage</h5>
                  <p className="card-text">
                    Carbon stored in coastal ecosystems can remain locked away for thousands 
                    of years, providing permanent climate benefits.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-heart-pulse" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="card-title">Biodiversity Benefits</h5>
                  <p className="card-text">
                    These ecosystems support incredible biodiversity and provide essential 
                    services like coastal protection and fisheries support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What are Carbon Credits Section */}
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">What are Carbon Credits?</h2>
              <p className="section-subtitle">
                Understanding the carbon credit system and its environmental impact
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="h-100 d-flex flex-column justify-content-center">
                <h3 className="h2 mb-4">A Market-Based Solution to Climate Change</h3>
                <p className="lead mb-4">
                  Carbon credits represent one metric ton of carbon dioxide (CO₂) that has been 
                  removed from the atmosphere or prevented from being emitted. Each credit is 
                  verified, tracked, and can be traded in carbon markets.
                </p>
                <div className="space-y-3">
                  <div className="d-flex align-items-start mb-4">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                         style={{ width: '50px', height: '50px' }}>
                      <span className="fw-bold">1</span>
                    </div>
                    <div>
                      <h5 className="mb-2">Measurement</h5>
                      <p className="text-muted mb-0">Projects are measured to determine how much CO₂ they remove or prevent from entering the atmosphere.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-4">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                         style={{ width: '50px', height: '50px' }}>
                      <span className="fw-bold">2</span>
                    </div>
                    <div>
                      <h5 className="mb-2">Verification</h5>
                      <p className="text-muted mb-0">Independent third parties verify the carbon reduction claims to ensure accuracy and credibility.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                         style={{ width: '50px', height: '50px' }}>
                      <span className="fw-bold">3</span>
                    </div>
                    <div>
                      <h5 className="mb-2">Trading</h5>
                      <p className="text-muted mb-0">Credits can be bought and sold, creating financial incentives for climate action and environmental restoration.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <div className="position-relative d-inline-block">
                  <div className="bg-gradient-primary text-white rounded-4 p-5 shadow-lg" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <i className="bi bi-recycle mb-3" style={{ fontSize: '4rem' }}></i>
                    <h3 className="mb-3">1 Credit = 1 Ton CO₂</h3>
                    <p className="mb-4">Each carbon credit represents one metric ton of carbon dioxide removed from the atmosphere</p>
                  </div>
                  <div className="position-absolute top-0 start-0 translate-middle">
                    <div className="bg-warning text-dark rounded-circle p-3 shadow">
                      <i className="bi bi-graph-up" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                  </div>
                  <div className="position-absolute bottom-0 end-0 translate-middle">
                    <div className="bg-success text-white rounded-circle p-3 shadow">
                      <i className="bi bi-check-circle" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                A simple, transparent process for carbon credit trading
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-tree" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="card-title">1. Project Registration</h5>
                  <p className="card-text">
                    NGOs register their coastal restoration projects with detailed documentation 
                    and verification requirements.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-shield-check" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="card-title">2. Verification & Approval</h5>
                  <p className="card-text">
                    Independent verifiers and administrators review projects and approve 
                    carbon credit issuance on the blockchain.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-arrow-left-right" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="card-title">3. Trading & Retirement</h5>
                  <p className="card-text">
                    Corporate buyers can purchase and retire carbon credits, 
                    creating a transparent and liquid market.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Why Choose Our Platform</h2>
              <p className="section-subtitle">
                Built on cutting-edge blockchain technology for maximum transparency
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="text-center">
                <div className="bg-gradient-primary text-white rounded-3 p-4 mb-3">
                  <i className="bi bi-shield-lock" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5>Blockchain Security</h5>
                <p className="text-muted">
                  Immutable records on Aptos blockchain ensure data integrity and transparency.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="text-center">
                <div className="bg-gradient-secondary text-white rounded-3 p-4 mb-3">
                  <i className="bi bi-eye" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5>Full Transparency</h5>
                <p className="text-muted">
                  Every transaction and project detail is publicly verifiable on the blockchain.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="text-center">
                <div className="bg-gradient-primary text-white rounded-3 p-4 mb-3">
                  <i className="bi bi-lightning" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5>Fast Transactions</h5>
                <p className="text-muted">
                  Aptos blockchain provides high throughput and low latency for all operations.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="text-center">
                <div className="bg-gradient-secondary text-white rounded-3 p-4 mb-3">
                  <i className="bi bi-globe" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h5>Global Impact</h5>
                <p className="text-muted">
                  Connect with restoration projects worldwide and make a real environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="mb-3">Ready to Make a Difference?</h2>
              <p className="lead mb-0">
                Join the Blue Carbon Registry today and be part of the solution to climate change.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button 
                className="btn btn-warning btn-lg"
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
                    <i className="bi bi-arrow-right me-2"></i>
                    Get Started Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Explorer */}
      <section className="section bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="section-title">Recent Blockchain Activity</h2>
              <p className="section-subtitle">
                Live transaction feed from our smart contract
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
