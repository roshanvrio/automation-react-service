// API base URL - change this to match your backend
const API_BASE_URL = 'http://localhost:8000';

// Fetch overview statistics (In Queue, In Progress, Completed, etc.)
export async function fetchOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/process-statistics/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Map backend response to frontend format
    return {
      total_bots: data.total_processes || 0,
      in_queue: data.in_queue || 0,
      in_progress: data.in_progress || 0,
      completed: data.completed || 0,
      errors: data.failed || 0,
      avg_exec_time_mins: data.avg_exec_time_mins || 20,
      success_rate: calculateSuccessRate(data.completed, data.failed)
    };
  } catch (error) {
    console.error('Error fetching overview:', error);
    // Return fallback data
    return {
      total_bots: 25,
      in_queue: 9,
      in_progress: 7,
      completed: 25,
      errors: 5,
      avg_exec_time_mins: 20,
      success_rate: 79
    };
  }
}

// Calculate success rate percentage
function calculateSuccessRate(completed, failed) {
  const total = completed + failed;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Fetch VM machines status
export async function fetchVMs() {
  try {
    const response = await fetch(`${API_BASE_URL}/vm-status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Return the data in the format expected by VMGrid component
    return {
      machines: data.machines || [],  // Changed from 'vms' to 'machines'
      active_count: data.active_count || 0,
      pending_count: data.pending_count || 0
    };
  } catch (error) {
    console.error('Error fetching VMs:', error);
    return { machines: [], active_count: 0, pending_count: 0 };  // Changed 'vms' to 'machines'
  }
}

// Fetch bots in queue
export async function fetchBots() {
  try {
    const response = await fetch(`${API_BASE_URL}/bots`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.bots || [];
  } catch (error) {
    console.error('Error fetching bots:', error);
    return [];
  }
}

// Fetch bots in progress
export async function fetchBotsInProgress() {
  try {
    const response = await fetch(`${API_BASE_URL}/bots-in-progress`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.bots || [];
  } catch (error) {
    console.error('Error fetching bots in progress:', error);
    return [];
  }
}

// Upload CSV file
export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/upload-csv/`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading CSV:', error);
    throw error;
  }
}