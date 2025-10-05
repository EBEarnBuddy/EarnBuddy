import axios from './axios';

export interface Project {
  _id: string;
  title: string;
  description: string;
  company: string;
  industry: string;
  projectType: string;
  totalBudget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  location: string;
  remote: boolean;
  equity?: string;
  tags: string[];
  urgency: string;
  roles: Role[];
  benefits: string[];
  status: string;
  featured: boolean;
  owner: {
    _id: string;
    displayName: string;
    photoURL: string;
  };
  views: number;
  totalApplicants: number;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  title: string;
  description: string;
  experience: string;
  skills: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  equity?: string;
  benefits: string[];
  priority: string;
  filled: boolean;
  applicants: Application[];
}

export interface Application {
  userId: string;
  coverLetter: string;
  portfolio?: string;
  expectedSalary?: string;
  availability: string;
  appliedAt: string;
  status: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  company: string;
  industry: string;
  projectType: string;
  totalBudget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  location: string;
  remote: boolean;
  equity?: string;
  tags: string[];
  urgency: string;
  roles: Omit<Role, '_id' | 'filled' | 'applicants'>[];
  benefits: string[];
  requirements?: {
    teamSize: number;
    startDate?: string;
    endDate?: string;
    timezone: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  additionalInfo?: string;
}

export interface ProjectFilters {
  search?: string;
  industry?: string;
  projectType?: string;
  experience?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

// Get all projects with filters
export const getProjects = async (filters: ProjectFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await axios.get(`/api/projects?${params.toString()}`);
  return response.data;
};

// Get single project by ID
export const getProject = async (id: string) => {
  const response = await axios.get(`/api/projects/${id}`);
  return response.data;
};

// Create new project
export const createProject = async (projectData: CreateProjectData) => {
  const response = await axios.post('/api/projects', projectData);
  return response.data;
};

// Update project
export const updateProject = async (id: string, projectData: Partial<CreateProjectData>) => {
  const response = await axios.put(`/api/projects/${id}`, projectData);
  return response.data;
};

// Delete project
export const deleteProject = async (id: string) => {
  const response = await axios.delete(`/api/projects/${id}`);
  return response.data;
};

// Toggle bookmark
export const toggleBookmark = async (id: string) => {
  const response = await axios.post(`/api/projects/${id}/bookmark`);
  return response.data;
};

// Apply to role
export const applyToRole = async (projectId: string, roleId: string, applicationData: {
  coverLetter: string;
  portfolio?: string;
  expectedSalary?: string;
  availability: string;
}) => {
  const response = await axios.post(`/api/projects/${projectId}/roles/${roleId}/apply`, applicationData);
  return response.data;
};

// Get user's projects
export const getMyProjects = async () => {
  const response = await axios.get('/api/projects/user/my-projects');
  return response.data.data || [];
};

// Get user's bookmarked projects
export const getBookmarkedProjects = async () => {
  const response = await axios.get('/api/projects/user/bookmarks');
  return response.data;
};