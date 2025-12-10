// Project Management System
class ProjectManager {
  constructor() {
    // Attempt to load from localStorage first
    const stored = this.readFromStorage();
    this.projects = Array.isArray(stored) && stored.length > 0 ? stored : [
      {
        id: 1,
        name: "Mangrove Restoration - Sundarbans",
        organization: "Green Earth Foundation",
        location: "Sundarbans, Bangladesh",
        hectares: 150,
        estimatedCredits: 1200,
        creditsIssued: 1200,
        status: "approved",
        dateRegistered: "2024-01-15",
        verificationDate: "2024-02-01",
        description: "Large-scale mangrove restoration project in the Sundarbans delta",
        methodology: "VCS",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        ngoWalletAddress: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        submittedBy: "Sarah Johnson",
        verifiedBy: "Admin System"
      },
      {
        id: 2,
        name: "Seagrass Meadow Protection",
        organization: "Ocean Conservation Society",
        location: "Mediterranean Sea, Spain",
        hectares: 75,
        estimatedCredits: 600,
        creditsIssued: 600,
        status: "approved",
        dateRegistered: "2024-01-20",
        verificationDate: "2024-02-05",
        description: "Protection and restoration of seagrass meadows in the Mediterranean",
        methodology: "Gold Standard",
        startDate: "2024-01-15",
        endDate: "2024-11-30",
        ngoWalletAddress: "0x2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
        submittedBy: "Dr. Michael Chen",
        verifiedBy: "Admin System"
      },
      {
        id: 3,
        name: "Salt Marsh Restoration",
        organization: "Coastal Restoration Alliance",
        location: "Chesapeake Bay, USA",
        hectares: 200,
        estimatedCredits: 1600,
        creditsIssued: 0,
        status: "pending",
        dateRegistered: "2024-02-01",
        verificationDate: null,
        description: "Comprehensive salt marsh restoration in Chesapeake Bay",
        methodology: "VCS",
        startDate: "2024-02-01",
        endDate: "2024-12-31",
        ngoWalletAddress: "0x3456789012cdef1234567890abcdef1234567890abcdef1234567890abcdef12",
        submittedBy: "Emma Rodriguez",
        verifiedBy: null
      },
      {
        id: 4,
        name: "Kelp Forest Conservation",
        organization: "Marine Life Foundation",
        location: "California Coast, USA",
        hectares: 100,
        estimatedCredits: 800,
        creditsIssued: 0,
        status: "rejected",
        dateRegistered: "2024-01-25",
        verificationDate: "2024-02-15",
        description: "Conservation and restoration of kelp forest ecosystems",
        methodology: "CDM",
        startDate: "2024-01-25",
        endDate: "2024-10-31",
        ngoWalletAddress: "0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef123",
        submittedBy: "James Wilson",
        verifiedBy: "Admin System",
        rejectionReason: "Insufficient verification documentation"
      }
    ];

    // Compute nextId based on current projects
    this.nextId = this.projects.reduce((maxId, p) => Math.max(maxId, Number(p?.id) || 0), 0) + 1;
    this.listeners = [];

    // Ensure initial state is saved (particularly when loading defaults)
    this.saveToStorage();
  }

  // Storage helpers
  getStorageKey() {
    return 'blueCarbonProjects';
  }

  readFromStorage() {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Error reading projects from storage:', e);
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.projects || []));
    } catch (e) {
      console.error('Error saving projects to storage:', e);
    }
  }

  // Subscribe to project updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of changes
  notify() {
    this.listeners.forEach(callback => callback(this.projects));
  }

  // Get all projects
  getProjects() {
    return [...this.projects];
  }

  // Get projects by status
  getProjectsByStatus(status) {
    return this.projects.filter(project => project.status === status);
  }

  // Get projects by organization
  getProjectsByOrganization(organization) {
    return this.projects.filter(project => project.organization === organization);
  }

  // Add new project
  addProject(projectData, submittedBy) {
    const newProject = {
      id: this.nextId++,
      ...projectData,
      status: "pending",
      creditsIssued: 0,
      dateRegistered: new Date().toISOString().split('T')[0],
      verificationDate: null,
      submittedBy: submittedBy,
      verifiedBy: null
    };

    this.projects.unshift(newProject);
    this.saveToStorage();
    this.notify();
    return newProject;
  }

  // Approve project
  approveProject(projectId, verifiedBy) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.status = "approved";
      project.creditsIssued = project.estimatedCredits;
      project.verificationDate = new Date().toISOString().split('T')[0];
      project.verifiedBy = verifiedBy;
      this.saveToStorage();
      this.notify();
      return project;
    }
    return null;
  }

  // Reject project
  rejectProject(projectId, verifiedBy, rejectionReason) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.status = "rejected";
      project.verificationDate = new Date().toISOString().split('T')[0];
      project.verifiedBy = verifiedBy;
      project.rejectionReason = rejectionReason;
      this.saveToStorage();
      this.notify();
      return project;
    }
    return null;
  }

  // Get project by ID
  getProjectById(projectId) {
    return this.projects.find(p => p.id === projectId);
  }

  // Get statistics
  getStatistics() {
    const totalProjects = this.projects.length;
    const approvedProjects = this.projects.filter(p => p.status === 'approved').length;
    const pendingProjects = this.projects.filter(p => p.status === 'pending').length;
    const rejectedProjects = this.projects.filter(p => p.status === 'rejected').length;
    const totalHectares = this.projects.reduce((sum, p) => sum + p.hectares, 0);
    const totalCreditsIssued = this.projects.reduce((sum, p) => sum + p.creditsIssued, 0);

    return {
      totalProjects,
      approvedProjects,
      pendingProjects,
      rejectedProjects,
      totalHectares,
      totalCreditsIssued
    };
  }
}

// Create singleton instance
const projectManager = new ProjectManager();

export default projectManager;



