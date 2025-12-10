import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';

const WalletDemo = () => {
  const { connected, account, balance, transactions, getUserTransactions } = useWalletContext();

  const userTransactions = getUserTransactions();

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-wallet2 me-2"></i>
          Wallet Integration Demo
        </h5>
      </div>
      <div className="card-body">
        {connected && account ? (
          <div>
            <div className="alert alert-success">
              <h6><i className="bi bi-check-circle me-2"></i>Wallet Connected</h6>
              <p className="mb-1"><strong>Address:</strong> {(() => {
                let address = account.address;
                
                // Petra wallet returns address as object with toString() method
                if (typeof address === 'object' && address.toString) {
                  address = address.toString();
                } else {
                  address = String(address || '');
                }
                
                return address;
              })()}</p>
              <p className="mb-0"><strong>Balance:</strong> {typeof balance === 'number' ? balance.toFixed(4) : '0.0000'} APT</p>
            </div>
            
            <div className="mt-4">
              <h6>Your Transactions</h6>
              {userTransactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Hash</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <span className={`badge bg-${tx.type === 'credits_purchased' ? 'success' : 'info'}`}>
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{tx.description}</td>
                          <td>{tx.amount ? `$${tx.amount.toFixed(2)}` : '-'}</td>
                          <td>
                            <code className="small">
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                            </code>
                          </td>
                          <td>
                            <span className={`badge ${tx.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No transactions yet. Connect your wallet and make a purchase!</p>
              )}
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            <h6><i className="bi bi-info-circle me-2"></i>Wallet Not Connected</h6>
            <p className="mb-0">Connect your Petra wallet to see your balance and transaction history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDemo;
