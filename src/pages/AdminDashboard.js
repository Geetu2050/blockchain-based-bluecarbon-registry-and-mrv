import React, { useState, useEffect } from 'react';
import Notification from '../components/Notification';
import ViewEditToggle from '../components/ViewEditToggle';
import projectManager from '../utils/projectManager';

const AdminDashboard = ({ user }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [notification, setNotification] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [projectViewMode, setProjectViewMode] = useState('view');
  const [editingProject, setEditingProject] = useState(null);
  
  // Quick Actions state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    autoApproval: false,
    maxCreditsPerProject: 10000,
    verificationRequired: true,
    notificationEmail: '',
    maintenanceMode: false
  });

  // Mock projects data
  const mockProjects = [
    {
      id: 1,
      name: "Mangrove Restoration - Sundarbans",
      organization: "Green Earth Foundation",
      location: "Sundarbans, Bangladesh",
      hectares: 150,
      estimatedCredits: 1200,
      status: "pending",
      dateRegistered: "2024-01-15",
      description: "Large-scale mangrove restoration project in the Sundarbans delta",
      methodology: "VCS",
      verificationDocuments: "sundarbans_verification.pdf"
    },
    {
      id: 2,
      name: "Seagrass Meadow Protection",
      organization: "Ocean Conservation Society",
      location: "Mediterranean Sea, Spain",
      hectares: 75,
      estimatedCredits: 600,
      status: "pending",
      dateRegistered: "2024-01-20",
      description: "Protection and restoration of seagrass meadows in the Mediterranean",
      methodology: "Gold Standard",
      verificationDocuments: "seagrass_verification.pdf"
    },
    {
      id: 3,
      name: "Salt Marsh Restoration",
      organization: "Coastal Restoration Alliance",
      location: "Chesapeake Bay, USA",
      hectares: 200,
      estimatedCredits: 1600,
      status: "approved",
      dateRegistered: "2024-02-01",
      description: "Comprehensive salt marsh restoration in Chesapeake Bay",
      methodology: "VCS",
      verificationDocuments: "saltmarsh_verification.pdf"
    },
    {
      id: 4,
      name: "Kelp Forest Conservation",
      organization: "Marine Life Foundation",
      location: "California Coast, USA",
      hectares: 100,
      estimatedCredits: 800,
      status: "rejected",
      dateRegistered: "2024-01-25",
      description: "Conservation and restoration of kelp forest ecosystems",
      methodology: "CDM",
      verificationDocuments: "kelp_verification.pdf"
    }
  ];

  useEffect(() => {
    // Load projects from project manager
    setProjects(projectManager.getProjects());
    
    // Subscribe to project updates
    const unsubscribe = projectManager.subscribe((updatedProjects) => {
      setProjects(updatedProjects);
    });

    // Load saved system settings
    const savedSettings = localStorage.getItem('adminSystemSettings');
    if (savedSettings) {
      try {
        setSystemSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading system settings:', error);
      }
    }

    return () => unsubscribe();
  }, []);

  const handleApproveProject = async (projectId) => {
    setIsLoading(true);
    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Approve project through project manager
      const approvedProject = projectManager.approveProject(projectId, user.name);
      
      if (approvedProject) {
        setNotification({
          message: `Project "${approvedProject.name}" approved successfully! ${approvedProject.creditsIssued} credits have been minted.`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error approving project:', error);
      setNotification({
        message: 'Error approving project. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
    setShowRejectModal(true);
  };

  const handleViewModeChange = (mode) => {
    setProjectViewMode(mode);
    if (mode === 'view') {
      setEditingProject(null);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectViewMode('edit');
  };

  const confirmRejectProject = async () => {
    if (!rejectionReason.trim()) {
      setNotification({
        message: 'Please provide a reason for rejection',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reject project through project manager
      const rejectedProject = projectManager.rejectProject(selectedProject.id, user.name, rejectionReason);
      
      if (rejectedProject) {
        setNotification({
          message: `Project "${rejectedProject.name}" rejected successfully.`,
          type: 'success'
        });
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      setNotification({
        message: 'Error rejecting project. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Actions Handlers
  const handleExportProjects = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      const exportData = projects.map(project => ({
        id: project.id,
        name: project.name,
        organization: project.organization,
        location: project.location,
        hectares: project.hectares,
        estimatedCredits: project.estimatedCredits,
        creditsIssued: project.creditsIssued || 0,
        status: project.status,
        methodology: project.methodology,
        dateRegistered: project.dateRegistered,
        verificationDate: project.verificationDate,
        description: project.description
      }));

      if (exportFormat === 'csv') {
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, 'projects_export.csv', 'text/csv');
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, 'projects_export.json', 'application/json');
      }

      setNotification({
        message: `Projects exported successfully as ${exportFormat.toUpperCase()}!`,
        type: 'success'
      });
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting projects:', error);
      setNotification({
        message: 'Error exporting projects. Please try again.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate report generation
      
      const reportData = {
        totalProjects: projects.length,
        pendingProjects: projects.filter(p => p.status === 'pending').length,
        approvedProjects: projects.filter(p => p.status === 'approved').length,
        rejectedProjects: projects.filter(p => p.status === 'rejected').length,
        totalCreditsIssued: projects
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + (p.creditsIssued || p.estimatedCredits), 0),
        totalHectares: projects.reduce((sum, p) => sum + p.hectares, 0),
        averageProjectSize: projects.length > 0 ? 
          projects.reduce((sum, p) => sum + p.hectares, 0) / projects.length : 0,
        methodologyBreakdown: projects.reduce((acc, p) => {
          acc[p.methodology] = (acc[p.methodology] || 0) + 1;
          return acc;
        }, {}),
        generatedAt: new Date().toISOString(),
        generatedBy: user.name
      };

      const reportContent = JSON.stringify(reportData, null, 2);
      downloadFile(reportContent, `admin_report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');

      setNotification({
        message: 'Report generated and downloaded successfully!',
        type: 'success'
      });
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setNotification({
        message: 'Error generating report. Please try again.',
        type: 'error'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem('adminSystemSettings', JSON.stringify(systemSettings));
    setNotification({
      message: 'System settings saved successfully!',
      type: 'success'
    });
    setShowSettingsModal(false);
  };

  // Utility functions
  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending Review</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredProjects = projects.filter(project => 
    filter === 'all' || project.status === filter
  );

  const pendingCount = projects.filter(p => p.status === 'pending').length;
  const approvedCount = projects.filter(p => p.status === 'approved').length;
  const rejectedCount = projects.filter(p => p.status === 'rejected').length;
  const totalCreditsIssued = projects
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.creditsIssued || p.estimatedCredits), 0);

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
                  <i className="bi bi-shield-check me-3"></i>
                  Admin Dashboard
                </h1>
                <p className="lead text-muted">
                  Welcome, {user.name}! Review and manage blue carbon projects.
                </p>
              </div>
              <ViewEditToggle 
                mode={projectViewMode}
                onModeChange={handleViewModeChange}
              />
            </div>
          </div>
        </div>

        {/* Wallet Status */}
        {connected && account && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-success">
                <i className="bi bi-wallet2 me-2"></i>
                <strong>Wallet Connected:</strong> {(() => {
                  let address = account.address;
                  if (typeof address === 'object' && address?.toString) {
                    address = address.toString();
                  } else {
                    address = String(address || '');
                  }
                  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
                })()}
                <span className="ms-3">
                  <i className="bi bi-shield-check me-1"></i>
                  Ready for admin transactions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-warning">{pendingCount}</div>
                <div className="stat-label">Pending Review</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-success">{approvedCount}</div>
                <div className="stat-label">Approved Projects</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-danger">{rejectedCount}</div>
                <div className="stat-label">Rejected Projects</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-primary">{totalCreditsIssued.toLocaleString()}</div>
                <div className="stat-label">Credits Issued</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending Review ({pendingCount})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${filter === 'approved' ? 'active' : ''}`}
                  onClick={() => setFilter('approved')}
                >
                  Approved ({approvedCount})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${filter === 'rejected' ? 'active' : ''}`}
                  onClick={() => setFilter('rejected')}
                >
                  Rejected ({rejectedCount})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Projects
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Projects Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-list-check me-2"></i>
                  Project Review Queue
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Project Details</th>
                        <th>Organization</th>
                        <th>Location</th>
                        <th>Hectares</th>
                        <th>Credits</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{project.name}</div>
                              <small className="text-muted">{project.description}</small>
                              <div className="mt-1">
                                <span className="badge bg-info">{project.methodology}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                   style={{ width: '32px', height: '32px' }}>
                                {project.organization.charAt(0)}
                              </div>
                              {project.organization}
                            </div>
                          </td>
                          <td>
                            <i className="bi bi-geo-alt me-1 text-muted"></i>
                            {project.location}
                          </td>
                          <td>
                            <span className="fw-semibold">{project.hectares}</span>
                            <small className="text-muted d-block">hectares</small>
                          </td>
                          <td>
                            <span className="fw-semibold text-success">
                              {(project.creditsIssued || project.estimatedCredits).toLocaleString()}
                            </span>
                            <small className="text-muted d-block">credits</small>
                          </td>
                          <td>{getStatusBadge(project.status)}</td>
                          <td>
                            {new Date(project.dateRegistered).toLocaleDateString()}
                          </td>
                          <td>
                            {project.status === 'pending' ? (
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleApproveProject(project.id)}
                                  disabled={isLoading}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRejectProject(project.id)}
                                  disabled={isLoading}
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => {
                                    setEditingProject(project);
                                    setProjectViewMode('view');
                                  }}
                                  title="View Project Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleEditProject(project)}
                                  title="Edit Project"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
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

        {/* Quick Actions */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-lightning me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={() => setShowExportModal(true)}
                      disabled={projects.length === 0}
                    >
                      <i className="bi bi-download me-2"></i>
                      Export All Projects
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-success w-100"
                      onClick={() => setShowReportModal(true)}
                      disabled={projects.length === 0}
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      Generate Report
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-info w-100"
                      onClick={() => setShowSettingsModal(true)}
                    >
                      <i className="bi bi-gear me-2"></i>
                      System Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-x-circle me-2 text-danger"></i>
                  Reject Project
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedProject(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Project:</strong> {selectedProject?.name}
                </div>
                <div className="mb-3">
                  <strong>Organization:</strong> {selectedProject?.organization}
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Reason for Rejection *</strong>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejecting this project..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedProject(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmRejectProject}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading me-2"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-2"></i>
                      Reject Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Projects Modal */}
      {showExportModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-download me-2"></i>
                  Export All Projects
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowExportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Export Format</strong>
                  </label>
                  <select 
                    className="form-select"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <option value="csv">CSV (Excel compatible)</option>
                    <option value="json">JSON (Machine readable)</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Export includes:</strong> Project details, organization info, status, credits, and verification data.
                </div>
                <div className="text-muted">
                  <small>Total projects to export: <strong>{projects.length}</strong></small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleExportProjects}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <span className="loading me-2"></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Export Projects
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-graph-up me-2"></i>
                  Generate Admin Report
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowReportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <div className="h4 text-primary mb-0">{projects.length}</div>
                        <div className="text-muted">Total Projects</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <div className="h4 text-success mb-0">
                          {projects.filter(p => p.status === 'approved').length}
                        </div>
                        <div className="text-muted">Approved Projects</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <div className="h4 text-warning mb-0">
                          {projects.filter(p => p.status === 'pending').length}
                        </div>
                        <div className="text-muted">Pending Review</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <div className="h4 text-info mb-0">
                          {projects
                            .filter(p => p.status === 'approved')
                            .reduce((sum, p) => sum + (p.creditsIssued || p.estimatedCredits), 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-muted">Total Credits Issued</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Report includes:</strong> Project statistics, methodology breakdown, credit totals, and system metrics.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <span className="loading me-2"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-graph-up me-2"></i>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Modal */}
      {showSettingsModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-gear me-2"></i>
                  System Settings
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowSettingsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="autoApproval"
                        checked={systemSettings.autoApproval}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          autoApproval: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="autoApproval">
                        <strong>Auto-approval for verified projects</strong>
                        <small className="text-muted d-block">Automatically approve projects that meet verification criteria</small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Maximum Credits per Project</strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={systemSettings.maxCreditsPerProject}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        maxCreditsPerProject: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="verificationRequired"
                        checked={systemSettings.verificationRequired}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          verificationRequired: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="verificationRequired">
                        <strong>Verification Required</strong>
                        <small className="text-muted d-block">Require third-party verification for all projects</small>
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">
                      <strong>Admin Notification Email</strong>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={systemSettings.notificationEmail}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        notificationEmail: e.target.value
                      }))}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="maintenanceMode"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          maintenanceMode: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="maintenanceMode">
                        <strong>Maintenance Mode</strong>
                        <small className="text-muted d-block">Temporarily disable new project submissions</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveSettings}
                >
                  <i className="bi bi-save me-2"></i>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
