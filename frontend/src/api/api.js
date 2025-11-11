const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchOverview = async () => {
  try {
    const response = await fetch(`${API_BASE}/overview`);
    if (!response.ok) throw new Error('Failed to fetch overview');
    return await response.json();
  } catch (error) {
    console.error('Error fetching overview:', error);
    // Return fallback data
    return {
      total_bots: 25,
      in_queue: 9,
      in_progress: 7,
      completed: 25,
      avg_exec_time_mins: 20,
      errors: 5
    };
  }
};

export const fetchBots = async () => {
  try {
    const response = await fetch(`${API_BASE}/bots`);
    if (!response.ok) throw new Error('Failed to fetch bots');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bots:', error);
    return [];
  }
};

export const fetchVMs = async () => {
  try {
    const response = await fetch(`${API_BASE}/vms`);
    if (!response.ok) throw new Error('Failed to fetch VMs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching VMs:', error);
    return { vms: [] };
  }
};

export const uploadCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading CSV:', error);
    throw error;
  }
};