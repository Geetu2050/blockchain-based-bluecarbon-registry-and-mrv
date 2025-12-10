// Liquidity Manager Component for NGOs
import React, { useState, useEffect } from 'react';
import marketplaceService from '../services/marketplaceService';
import { useWalletContext } from '../contexts/WalletContext';

const LiquidityManager = ({ user }) => {
  const { connected, account } = useWalletContext();
  const [carbonTokenAmount, setCarbonTokenAmount] = useState(0);
  const [aptAmount, setAptAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [poolInfo, setPoolInfo] = useState(null);

  useEffect(() => {
    loadPoolInfo();
  }, []);

  const loadPoolInfo = async () => {
    try {
      const pool = await marketplaceService.getPoolInfo();
      setPoolInfo(pool);
    } catch (error) {
      console.error('Error loading pool info:', error);
      // Set a default pool info if there's an error
      setPoolInfo({
        carbonTokenReserve: 0,
        aptReserve: 0,
        totalLiquidity: 0,
        pricePerTokenFormatted: 0
      });
    }
  };

  const handleAddLiquidity = async () => {
    if (!connected || !account) {
      setNotification({
        message: 'Please connect your wallet first to add liquidity.',
        type: 'error'
      });
      return;
    }

    if (carbonTokenAmount <= 0 || aptAmount <= 0) {
      setNotification({
        message: 'Please enter valid amounts for both carbon tokens and APT.',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      setNotification({
        message: 'Processing add liquidity transaction...',
        type: 'info'
      });

      const result = await marketplaceService.addLiquidity(account, carbonTokenAmount, aptAmount);
      
      if (result.success) {
        setNotification({
          message: `Successfully added liquidity! ${carbonTokenAmount.toFixed(2)} carbon tokens and ${aptAmount.toFixed(6)} APT. Transaction: ${result.hash}`,
          type: 'success'
        });

        // Refresh pool info
        await loadPoolInfo();
        
        // Reset form
        setCarbonTokenAmount(0);
        setAptAmount(0);
      }
    } catch (error) {
      console.error('Error adding liquidity:', error);
      setNotification({
        message: `Add liquidity failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="liquidity-manager">
      <div className="card">
        <div className="card-header bg-gradient-primary text-white">
          <h5 className="card-title mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Add Liquidity to Pool
          </h5>
        </div>
        <div className="card-body">
          {notification && (
            <div className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type === 'success' ? 'success' : 'info'} alert-dismissible fade show`}>
              {notification.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setNotification(null)}
              ></button>
            </div>
          )}

          <div className="row">
            {/* Pool Information */}
            <div className="col-md-6">
              <h6 className="text-primary mb-3">Current Pool Status</h6>
              {poolInfo ? (
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="fw-bold text-primary">{poolInfo.carbonTokenReserve.toFixed(2)}</div>
                      <small className="text-muted">Carbon Tokens</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="fw-bold text-success">{poolInfo.aptReserve.toFixed(6)}</div>
                      <small className="text-muted">APT Reserve</small>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="text-center p-3 bg-info text-white rounded">
                      <div className="fw-bold">1 CARBON = {poolInfo.pricePerTokenFormatted.toFixed(6)} APT</div>
                      <small>Current Price</small>
                    </div>
                  </div>
                  {poolInfo.carbonTokenReserve === 0 && poolInfo.aptReserve === 0 && (
                    <div className="col-12">
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Smart Contract Not Deployed</strong>
                        <br />
                        <small>The liquidity pool is not available yet. Deploy the smart contract first.</small>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-hourglass-split"></i>
                  <p>Loading pool information...</p>
                </div>
              )}
            </div>

            {/* Add Liquidity Form */}
            <div className="col-md-6">
              <h6 className="text-primary mb-3">Add Liquidity</h6>
              <div className="mb-3">
                <label className="form-label">Carbon Tokens to Add</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={carbonTokenAmount}
                    onChange={(e) => setCarbonTokenAmount(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                  <span className="input-group-text">CARBON</span>
                </div>
                <small className="text-muted">
                  Amount of carbon credit tokens to add to the pool
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">APT Amount to Add</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={aptAmount}
                    onChange={(e) => setAptAmount(parseFloat(e.target.value) || 0)}
                    step="0.000001"
                    min="0"
                  />
                  <span className="input-group-text">APT</span>
                </div>
                <small className="text-muted">
                  Amount of APT to add to the pool
                </small>
              </div>

              <div className="d-grid">
                <button
                  className="btn btn-primary"
                  onClick={handleAddLiquidity}
                  disabled={!connected || carbonTokenAmount <= 0 || aptAmount <= 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Liquidity
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Adding liquidity helps maintain the carbon credit marketplace. 
                  The ratio of carbon tokens to APT should be reasonable for the current market price.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityManager;
