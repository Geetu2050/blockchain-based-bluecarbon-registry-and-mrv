import React, { useState, useEffect } from 'react';
import ViewEditToggle from '../components/ViewEditToggle';
import projectManager from '../utils/projectManager';

const RegistryPage = () => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectViewMode, setProjectViewMode] = useState('view');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    // Load projects from project manager
    const loadProjects = () => {
      setIsLoading(true);
      const allProjects = projectManager.getProjects();
      
      // Add some mock data if no projects exist yet (for initial demo)
      if (allProjects.length === 0) {
        const mockProjects = [
          {
            id: 1,
            name: "Mangrove Restoration - Sundarbans",
            organization: "Green Earth Foundation",
            location: "Sundarbans, Bangladesh",
            hectares: 150,
            creditsIssued: 1200,
            status: "approved",
            dateRegistered: "2024-01-15",
            description: "Large-scale mangrove restoration project in the Sundarbans delta",
            verificationDate: "2024-02-01",
            carbonSequestration: 4500
          },
          {
            id: 2,
            name: "Seagrass Meadow Protection",
            organization: "Ocean Conservation Society",
            location: "Mediterranean Sea, Spain",
            hectares: 75,
            creditsIssued: 600,
            status: "approved",
            dateRegistered: "2024-01-20",
            description: "Protection and restoration of seagrass meadows in the Mediterranean",
            verificationDate: "2024-02-05",
            carbonSequestration: 2250
          },
          {
            id: 3,
            name: "Salt Marsh Restoration",
            organization: "Coastal Restoration Alliance",
            location: "Chesapeake Bay, USA",
            hectares: 200,
            creditsIssued: 1600,
            status: "pending",
            dateRegistered: "2024-02-01",
            description: "Comprehensive salt marsh restoration in Chesapeake Bay",
            verificationDate: null,
            carbonSequestration: 6000
          },
          {
            id: 4,
            name: "Kelp Forest Conservation",
            organization: "Marine Life Foundation",
            location: "California Coast, USA",
            hectares: 100,
            creditsIssued: 800,
            status: "approved",
            dateRegistered: "2024-01-25",
            description: "Conservation and restoration of kelp forest ecosystems",
            verificationDate: "2024-02-10",
            carbonSequestration: 3000
          },
          {
            id: 5,
            name: "Mangrove Reforestation",
            organization: "Tropical Conservation Trust",
            location: "Amazon Delta, Brazil",
            hectares: 300,
            creditsIssued: 0,
            status: "rejected",
            dateRegistered: "2024-01-30",
            description: "Mangrove reforestation project in the Amazon delta region",
            verificationDate: "2024-02-15",
            carbonSequestration: 9000
          }
        ];
        setProjects(mockProjects);
      } else {
        setProjects(allProjects);
      }
      setIsLoading(false);
    };

    loadProjects();
    
    // Subscribe to project updates
    const unsubscribe = projectManager.subscribe((updatedProjects) => {
      setProjects(updatedProjects);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewModeChange = (mode) => {
    setProjectViewMode(mode);
    if (mode === 'view') {
      setSelectedProject(null);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setProjectViewMode('view');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const totalHectares = projects.reduce((sum, project) => sum + (project.hectares || 0), 0);
  const totalCredits = projects.reduce((sum, project) => sum + (project.creditsIssued || 0), 0);
  const approvedProjects = projects.filter(p => p.status === 'approved').length;

  return (
    <div className="container-fluid py-5" style={{ marginTop: '80px' }}>
      <div className="container">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-4 fw-bold text-gradient mb-3">
                  <i className="bi bi-list-ul me-3"></i>
                  Blue Carbon Registry
                </h1>
                <p className="lead text-muted">
                  Explore all registered blue carbon projects and their impact on our planet
                </p>
              </div>
              <ViewEditToggle 
                mode={projectViewMode}
                onModeChange={handleViewModeChange}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-primary">{totalHectares.toLocaleString()}</div>
                <div className="stat-label">Total Hectares</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-success">{totalCredits.toLocaleString()}</div>
                <div className="stat-label">Credits Issued</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-info">{approvedProjects}</div>
                <div className="stat-label">Approved Projects</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="stat-number text-warning">{projects.length}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
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
            <select
              className="form-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Projects</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary">
                <i className="bi bi-download me-2"></i>
                Export
              </button>
              {connected && (
                <button className="btn btn-primary">
                  <i className="bi bi-plus me-2"></i>
                  Add Project
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-0">
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="loading mb-3"></div>
                    <p>Loading projects from blockchain...</p>
                  </div>
                ) : (
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
                        {filteredProjects.map((project) => (
                          <tr key={project.id}>
                            <td>
                              <div>
                                <div className="fw-semibold">{project.name}</div>
                                <small className="text-muted">{project.description}</small>
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
                              <div>
                                <i className="bi bi-geo-alt me-1 text-muted"></i>
                                {project.location}
                              </div>
                            </td>
                            <td>
                              <span className="fw-semibold">{project.hectares || 0}</span>
                              <small className="text-muted d-block">hectares</small>
                            </td>
                            <td>
                              <span className="fw-semibold text-success">{(project.creditsIssued || 0).toLocaleString()}</span>
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
                                  onClick={() => handleProjectSelect(project)}
                                  title="View Project Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setProjectViewMode('edit');
                                  }}
                                  title="Edit Project"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Explorer */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="mb-4">
              <i className="bi bi-diagram-3 me-2"></i>
              Blockchain Activity
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistryPage;
