import api from './axios';

export interface Activity {
  _id: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    roleId?: string;
    roleTitle?: string;
    company?: string;
    industry?: string;
    [key: string]: any;
  };
}

export interface ActivityResponse {
  success: boolean;
  data: {
    activities: Activity[];
  };
}

// Get user's recent activities
export const getRecentActivities = async (limit: number = 10): Promise<Activity[]> => {
  try {
    const response = await api.get<ActivityResponse>(`/api/profile/activity?limit=${limit}`);
    return response.data.data.activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

// Get user's profile with activities
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/profile');
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Get user analytics
export const getUserAnalytics = async () => {
  try {
    const response = await api.get('/api/profile/analytics');
    return response.data.data.analytics;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
};

// Get user's applications
export const getUserApplications = async () => {
  try {
    const response = await api.get('/api/projects/user/applications');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return [];
  }
};

// Update application status (for project owners)
export const updateApplicationStatus = async (
  projectId: string,
  roleId: string,
  applicationId: string,
  status: string
) => {
  try {
    const response = await api.put(`/api/projects/${projectId}/roles/${roleId}/applications/${applicationId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};