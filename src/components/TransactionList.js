import React, { useState } from 'react';
import { getAccountExplorerUrl } from '../config/aptosConfig';

const TransactionList = ({ transactions, title = "Recent Transactions", showExplorerLinks = true }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedDemoTx, setSelectedDemoTx] = useState(null);
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount) => {
    return typeof amount === 'number' ? amount.toFixed(4) : '0.0000';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className="badge bg-success">Success</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'failed':
        return <span className="badge bg-danger">Failed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <i className="bi bi-cart-plus text-success"></i>;
      case 'transfer':
        return <i className="bi bi-arrow-left-right text-primary"></i>;
      case 'retire':
        return <i className="bi bi-recycle text-warning"></i>;
      default:
        return <i className="bi bi-arrow-right text-info"></i>;
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-list-ul me-2"></i>
            {title}
          </h5>
        </div>
        <div className="card-body text-center py-5">
          <i className="bi bi-inbox display-4 text-muted mb-3"></i>
          <p className="text-muted">No transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-list-ul me-2"></i>
          {title}
        </h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
                {showExplorerLinks && <th>Explorer</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id || tx.hash}>
                  <td>
                    <div className="d-flex align-items-center">
                      {getTransactionTypeIcon(tx.type)}
                      <span className="ms-2 text-capitalize">{tx.type}</span>
                      {tx.isSimulated && (
                        <span className="badge bg-warning ms-2" title="Demo Transaction">
                          <i className="bi bi-info-circle me-1"></i>
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="fw-semibold">{tx.description}</div>
                      {tx.from && (
                        <small className="text-muted">
                          From: {truncateAddress(tx.from)}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className={`fw-semibold ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatAmount(tx.amount)} APT
                      </span>
                      {tx.gasUsed && (
                        <small className="text-muted d-block">
                          Gas: -{formatAmount(tx.gasUsed / 100000000)} APT
                        </small>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(tx.status)}</td>
                  <td>
                    <div>
                      <div>{formatTimestamp(tx.timestamp)}</div>
                      {tx.blockNumber && (
                        <small className="text-muted">Block: {tx.blockNumber}</small>
                      )}
                    </div>
                  </td>
                  {showExplorerLinks && (
                    <td>
                      <div className="btn-group" role="group">
                        {tx.explorerUrl && tx.isRealTransaction && (
                          <a
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                            title="View in Aptos Explorer"
                          >
                            <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        )}
                        {tx.explorerUrl && tx.isSimulated && (
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => {
                              setSelectedDemoTx(tx);
                              setShowDemoModal(true);
                            }}
                            title="Demo Transaction - Click for details"
                          >
                            <i className="bi bi-info-circle"></i>
                          </button>
                        )}
                        {tx.from && tx.isRealTransaction && (
                          <a
                            href={getAccountExplorerUrl(tx.from)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary btn-sm"
                            title="View Sender in Explorer"
                          >
                            <i className="bi bi-person"></i>
                          </a>
                        )}
                        {tx.hash && (
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(tx.hash);
                              // You could add a toast notification here
                            }}
                            title="Copy Transaction Hash"
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Transaction Modal */}
      {showDemoModal && selectedDemoTx && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle me-2 text-warning"></i>
                  Demo Transaction Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowDemoModal(false);
                    setSelectedDemoTx(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Demo Mode:</strong> This is a simulated transaction for demonstration purposes.
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6>Transaction Hash</h6>
                    <p className="font-monospace small text-break">{selectedDemoTx.hash}</p>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDemoTx.hash);
                        alert('Transaction hash copied to clipboard!');
                      }}
                    >
                      <i className="bi bi-clipboard me-1"></i>
                      Copy Hash
                    </button>
                  </div>
                  <div className="col-md-6">
                    <h6>Transaction Type</h6>
                    <p className="text-capitalize">{selectedDemoTx.type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-12">
                    <h6>Description</h6>
                    <p>{selectedDemoTx.description}</p>
                  </div>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <h6>Amount</h6>
                    <p className="fw-semibold text-success">+{selectedDemoTx.amount.toFixed(4)} APT</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Status</h6>
                    <span className="badge bg-success">{selectedDemoTx.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <h6>Timestamp</h6>
                    <p>{formatTimestamp(selectedDemoTx.timestamp)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Block Number</h6>
                    <p>{selectedDemoTx.blockNumber}</p>
                  </div>
                </div>

                <div className="alert alert-info mt-3">
                  <i className="bi bi-lightbulb me-2"></i>
                  <strong>Note:</strong> In a real deployment with deployed smart contracts, this transaction would be viewable on the Aptos Explorer at the URL shown above.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDemoModal(false);
                    setSelectedDemoTx(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;

