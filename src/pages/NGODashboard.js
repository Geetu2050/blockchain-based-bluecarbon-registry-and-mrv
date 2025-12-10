import React, { useState, useEffect } from 'react';
import Notification from '../components/Notification';
import ViewEditToggle from '../components/ViewEditToggle';
import DroneImageryUpload from '../components/DroneImageryUpload';
import projectManager from '../utils/projectManager';
import { getTransactionExplorerUrl } from '../config/aptosConfig';
import BlockchainExplorer from '../components/BlockchainExplorer';

const NGODashboard = ({ user }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [projectViewMode, setProjectViewMode] = useState('view');
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    organization: user.organization || '',
    description: '',
    location: '',
    hectares: '',
    estimatedCredits: '',
    startDate: '',
    endDate: '',
    methodology: '',
    verificationDocuments: null,
    ngoWalletAddress: ''
  });
  const [droneImagery, setDroneImagery] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Validate Aptos wallet address format
  const isValidAptosAddress = (address) => {
    if (!address) return false;
    // Basic Aptos address validation: starts with 0x and is 66 characters long (0x + 64 hex chars)
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  };

  // Mock projects for this NGO
  const mockProjects = [
    {
      id: 1,
      name: "Mangrove Restoration - Sundarbans",
      description: "Large-scale mangrove restoration project in the Sundarbans delta",
      location: "Sundarbans, Bangladesh",
      hectares: 150,
      creditsIssued: 1200,
      status: "approved",
      dateRegistered: "2024-01-15",
      verificationDate: "2024-02-01"
    },
    {
      id: 2,
      name: "Seagrass Meadow Protection",
      description: "Protection and restoration of seagrass meadows in the Mediterranean",
      location: "Mediterranean Sea, Spain",
      hectares: 75,
      creditsIssued: 600,
      status: "approved",
      dateRegistered: "2024-01-20",
      verificationDate: "2024-02-05"
    },
    {
      id: 3,
      name: "Salt Marsh Restoration",
      description: "Comprehensive salt marsh restoration in Chesapeake Bay",
      location: "Chesapeake Bay, USA",
      hectares: 200,
      creditsIssued: 0,
      status: "pending",
      dateRegistered: "2024-02-01",
      verificationDate: null
    }
  ];

  useEffect(() => {
    // Load projects from project manager
    setProjects(projectManager.getProjectsByOrganization(user.organization));
    
    // Subscribe to project updates
    const unsubscribe = projectManager.subscribe((updatedProjects) => {
      setProjects(updatedProjects.filter(p => p.organization === user.organization));
    });

    return () => unsubscribe();
  }, [user.organization]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleViewModeChange = (mode) => {
    setProjectViewMode(mode);
    if (mode === 'edit' && !editingProject) {
      // If switching to edit mode without a selected project, open new project form
      setShowProjectForm(true);
    } else if (mode === 'view') {
      // If switching to view mode, close any editing
      setEditingProject(null);
      setShowProjectForm(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectViewMode('edit');
    setCurrentProjectId(project.id.toString());
    setFormData({
      name: project.name,
      organization: project.organization || user.organization || '',
      description: project.description,
      location: project.location,
      hectares: project.hectares.toString(),
      estimatedCredits: project.estimatedCredits.toString(),
      startDate: project.startDate,
      endDate: project.endDate,
      methodology: project.methodology,
      verificationDocuments: null
    });
    setShowProjectForm(true);
  };

  // Handle drone imagery upload success
  const handleDroneImageryUploadSuccess = (uploadResult) => {
    const newImagery = {
      id: Date.now(),
      fileHash: uploadResult.fileHash,
      downloadURL: uploadResult.downloadURL,
      fileName: uploadResult.metadata.name,
      fileSize: uploadResult.metadata.size,
      contentType: uploadResult.metadata.contentType,
      uploadedAt: new Date().toISOString(),
      filePath: uploadResult.filePath
    };
    
    setDroneImagery(prev => [...prev, newImagery]);
    
    setNotification({
      message: `Drone imagery uploaded successfully! Hash: ${uploadResult.fileHash.slice(0, 8)}...`,
      type: 'success'
    });
  };

  // Handle drone imagery upload error
  const handleDroneImageryUploadError = (error) => {
    setNotification({
      message: `Failed to upload drone imagery: ${error.message}`,
      type: 'error'
    });
  };

  // Remove drone imagery
  const removeDroneImagery = (imageryId) => {
    setDroneImagery(prev => prev.filter(img => img.id !== imageryId));
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.organization || !formData.description || !formData.location || !formData.hectares || !formData.methodology || !formData.ngoWalletAddress) {
      setNotification({
        message: 'Please fill in all required fields including NGO wallet address',
        type: 'error'
      });
      return;
    }

    // Validate wallet address format (basic Aptos address validation)
    if (!isValidAptosAddress(formData.ngoWalletAddress)) {
      setNotification({
        message: 'Please enter a valid Aptos wallet address (starts with 0x and is 66 characters long)',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Simulate a transaction hash (in production, retrieve from blockchain SDK)
      const simulatedTxHash = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
      
      // Add project to project manager
      const newProject = projectManager.addProject({
        name: formData.name,
        description: formData.description,
        location: formData.location,
        hectares: parseInt(formData.hectares),
        estimatedCredits: parseInt(formData.estimatedCredits) || 0,
        methodology: formData.methodology,
        startDate: formData.startDate,
        endDate: formData.endDate,
        organization: formData.organization,
        ngoWalletAddress: formData.ngoWalletAddress,
        txHash: simulatedTxHash,
        droneImagery: droneImagery // Include uploaded drone imagery
      }, user.name);

      // Reset form
      setFormData({
        name: '',
        organization: user.organization || '',
        description: '',
        location: '',
        hectares: '',
        estimatedCredits: '',
        startDate: '',
        endDate: '',
        methodology: '',
        verificationDocuments: null,
        ngoWalletAddress: ''
      });
      setDroneImagery([]);
      setCurrentProjectId(null);
      
      setShowProjectForm(false);
      setEditingProject(null);
      setProjectViewMode('view');
      setNotification({
        message: `Project "${newProject.name}" submitted successfully! View on explorer: ${getTransactionExplorerUrl(newProject.txHash)}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error submitting project:', error);
      setNotification({
        message: 'Error submitting project. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
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

  const totalHectares = projects.reduce((sum, project) => sum + project.hectares, 0);
  const totalCredits = projects.reduce((sum, project) => sum + project.creditsIssued, 0);
  const pendingProjects = projects.filter(p => p.status === 'pending').length;

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
                  <i className="bi bi-people me-3"></i>
                  NGO Dashboard
                </h1>
                <p className="lead text-muted">
                  Welcome back, {user.name}! Manage your blue carbon projects.
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <ViewEditToggle 
                  mode={projectViewMode}
                  onModeChange={handleViewModeChange}
                />
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    setEditingProject(null);
                    setCurrentProjectId(Date.now().toString()); // Generate temporary project ID
                    setDroneImagery([]);
                    setShowProjectForm(true);
                    setProjectViewMode('edit');
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  New Project
                </button>
              </div>
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
                  let address = account?.address;
                  
                  // Petra wallet returns address as object with toString() method
                  if (typeof address === 'object' && address?.toString) {
                    address = address.toString();
                  } else {
                    address = String(address || '');
                  }
                  
                  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
                })()}
                <span className="ms-3">
                  <i className="bi bi-shield-check me-1"></i>
                  Ready for blockchain transactions
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
                <div className="stat-number text-primary">{totalHectares}</div>
                <div className="stat-label">Total Hectares</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-success">{totalCredits.toLocaleString()}</div>
                <div className="stat-label">Credits Earned</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-warning">{pendingProjects}</div>
                <div className="stat-label">Pending Projects</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-info">{projects.length}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Form Modal */}
        {showProjectForm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-plus-circle me-2"></i>
                    {editingProject ? 'Edit Project' : 'Submit New Project'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProject(null);
                      setProjectViewMode('view');
                    }}
                  ></button>
                </div>
                <form onSubmit={handleSubmitProject}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Organization *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Project Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Location *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          name="description"
                          rows="3"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Hectares *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="hectares"
                          value={formData.hectares}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Estimated Credits</label>
                        <input
                          type="number"
                          className="form-control"
                          name="estimatedCredits"
                          value={formData.estimatedCredits}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Methodology *</label>
                        <select
                          className="form-select"
                          name="methodology"
                          value={formData.methodology}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Methodology</option>
                          <option value="VCS">VCS (Verified Carbon Standard)</option>
                          <option value="Gold Standard">Gold Standard</option>
                          <option value="CDM">CDM (Clean Development Mechanism)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">End Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Verification Documents</label>
                        <input
                          type="file"
                          className="form-control"
                          name="verificationDocuments"
                          onChange={handleInputChange}
                          accept=".pdf,.doc,.docx"
                        />
                        <small className="text-muted">
                          Upload supporting documents (PDF, DOC, DOCX)
                        </small>
                      </div>
                      <div className="col-12">
                        <label className="form-label">NGO Wallet Address *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="ngoWalletAddress"
                          value={formData.ngoWalletAddress}
                          onChange={handleInputChange}
                          placeholder="0x..."
                          required
                        />
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          This is where payments for carbon credits will be sent directly. Must be a valid Aptos wallet address.
                        </small>
                      </div>
                      
                      {/* Drone Imagery Upload Section */}
                      <div className="col-12">
                        <label className="form-label">Drone Imagery</label>
                        <DroneImageryUpload
                          projectId={currentProjectId}
                          onUploadSuccess={handleDroneImageryUploadSuccess}
                          onUploadError={handleDroneImageryUploadError}
                          disabled={isLoading}
                        />
                        
                        {/* Display uploaded drone imagery */}
                        {droneImagery.length > 0 && (
                          <div className="mt-3">
                            <h6>Uploaded Drone Imagery:</h6>
                            <div className="list-group">
                              {droneImagery.map((imagery) => (
                                <div key={imagery.id} className="list-group-item">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <strong>{imagery.fileName}</strong>
                                      <br />
                                      <small className="text-muted">
                                        Hash: <code>{imagery.fileHash.slice(0, 16)}...</code> | 
                                        Size: {(imagery.fileSize / 1024 / 1024).toFixed(2)} MB | 
                                        Type: {imagery.contentType}
                                      </small>
                                    </div>
                                    <div className="btn-group">
                                      <a
                                        href={imagery.downloadURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                        title="View File"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </a>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeDroneImagery(imagery.id)}
                                        title="Remove"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProject(null);
                        setProjectViewMode('view');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Submit Project
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Projects Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Your Projects
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Organization</th>
                        <th>Location</th>
                        <th>Hectares</th>
                        <th>Credits</th>
                        <th>Status</th>
                        <th>Date Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{project.name}</div>
                              <small className="text-muted">{project.description}</small>
                            </div>
                          </td>
                          <td>{project.organization}</td>
                          <td>
                            <i className="bi bi-geo-alt me-1 text-muted"></i>
                            {project.location}
                          </td>
                          <td>
                            <span className="fw-semibold">{project.hectares}</span>
                            <small className="text-muted d-block">hectares</small>
                          </td>
                          <td>
                            <span className="fw-semibold text-success">{project.creditsIssued.toLocaleString()}</span>
                            <small className="text-muted d-block">credits</small>
                          </td>
                          <td>{getStatusBadge(project.status)}</td>
                          <td>
                            <div>
                              {new Date(project.dateRegistered).toLocaleDateString()}
                              {project.verificationDate && (
                                <small className="text-muted d-block">
                                  Verified: {new Date(project.verificationDate).toLocaleDateString()}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
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
                              {project?.txHash && (
                                <a
                                  className="btn btn-outline-success btn-sm"
                                  href={getTransactionExplorerUrl(project.txHash)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View on Explorer"
                                >
                                  <i className="bi bi-box-arrow-up-right"></i>
                                </a>
                              )}
                            </div>
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


        {/* Blockchain Explorer */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="mb-4">
              <i className="bi bi-diagram-3 me-2"></i>
              Recent On‑Chain Submissions
            </h3>
            <BlockchainExplorer organization={user.organization} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
