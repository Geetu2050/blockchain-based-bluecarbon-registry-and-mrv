import React, { useEffect, useMemo, useState } from 'react';
import projectManager from '../utils/projectManager';
import { getTransactionExplorerUrl } from '../config/aptosConfig';

const BlockchainExplorer = ({ organization, limit = 10 }) => {
  const [projects, setProjects] = useState(() => {
    const initial = organization
      ? projectManager.getProjectsByOrganization(organization)
      : projectManager.getProjects();
    return Array.isArray(initial) ? initial : [];
  });

  useEffect(() => {
    const unsubscribe = projectManager.subscribe((updated) => {
      const scoped = organization
        ? updated.filter((p) => p.organization === organization)
        : updated;
      setProjects(scoped);
    });
    return () => unsubscribe();
  }, [organization]);

  const recentTransactions = useMemo(() => {
    const withTx = (projects || []).filter((p) => !!p.txHash);
    return withTx
      .slice()
      .sort((a, b) => new Date(b.dateRegistered) - new Date(a.dateRegistered))
      .slice(0, limit);
  }, [projects, limit]);

  if (!recentTransactions.length) {
    return (
      <div className="card">
        <div className="card-body text-muted">No recent on-chain submissions yet.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Project</th>
                <th>Tx Hash</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((p) => (
                <tr key={`${p.id}-${p.txHash}`}>
                  <td>
                    <div className="fw-semibold">{p.name}</div>
                    <small className="text-muted">{p.organization}</small>
                  </td>
                  <td>
                    <code>{p.txHash.slice(0, 10)}…{p.txHash.slice(-6)}</code>
                  </td>
                  <td>
                    {p.status === 'approved' && (
                      <span className="badge badge-approved">Approved</span>
                    )}
                    {p.status === 'pending' && (
                      <span className="badge badge-pending">Pending Review</span>
                    )}
                    {p.status === 'rejected' && (
                      <span className="badge badge-rejected">Rejected</span>
                    )}
                    {!['approved', 'pending', 'rejected'].includes(p.status) && (
                      <span className="badge bg-secondary">{p.status}</span>
                    )}
                  </td>
                  <td>{new Date(p.dateRegistered).toLocaleString()}</td>
                  <td className="text-end">
                    <a
                      href={getTransactionExplorerUrl(p.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-success"
                      title="View on Aptos Explorer"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplorer;


