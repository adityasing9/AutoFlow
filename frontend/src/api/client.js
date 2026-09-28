const API_BASE = '/api';

export const api = {
  // Stats & Health
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/stats/dashboard`);
    return res.json();
  },

  // Activity & Monitor
  getEvents: async (limit = 50, eventType = '') => {
    const q = new URLSearchParams({ limit });
    if (eventType) q.append('event_type', eventType);
    const res = await fetch(`${API_BASE}/activity/events?${q.toString()}`);
    return res.json();
  },
  getMonitorStatus: async () => {
    const res = await fetch(`${API_BASE}/activity/monitor/status`);
    return res.json();
  },
  startMonitor: async () => {
    const res = await fetch(`${API_BASE}/activity/monitor/start`, { method: 'POST' });
    return res.json();
  },
  stopMonitor: async () => {
    const res = await fetch(`${API_BASE}/activity/monitor/stop`, { method: 'POST' });
    return res.json();
  },
  simulateEvent: async (data) => {
    const res = await fetch(`${API_BASE}/activity/events/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Patterns
  getPatterns: async () => {
    const res = await fetch(`${API_BASE}/patterns`);
    return res.json();
  },
  discoverPatterns: async () => {
    const res = await fetch(`${API_BASE}/patterns/discover`, { method: 'POST' });
    return res.json();
  },
  getPatternGraph: async (patternId) => {
    const res = await fetch(`${API_BASE}/patterns/${patternId}/graph`);
    return res.json();
  },

  // Suggestions
  getSuggestions: async () => {
    const res = await fetch(`${API_BASE}/suggestions`);
    return res.json();
  },
  generateSuggestion: async (patternId) => {
    const res = await fetch(`${API_BASE}/suggestions/generate/${patternId}`, { method: 'POST' });
    return res.json();
  },

  // Workflows
  getWorkflows: async (status = '') => {
    const url = status ? `${API_BASE}/workflows?status=${status}` : `${API_BASE}/workflows`;
    const res = await fetch(url);
    return res.json();
  },
  getWorkflowDetail: async (id) => {
    const res = await fetch(`${API_BASE}/workflows/${id}`);
    return res.json();
  },
  approveWorkflow: async (id) => {
    const res = await fetch(`${API_BASE}/workflows/${id}/approve`, { method: 'POST' });
    return res.json();
  },
  rejectWorkflow: async (id) => {
    const res = await fetch(`${API_BASE}/workflows/${id}/reject`, { method: 'POST' });
    return res.json();
  },
  ignoreWorkflow: async (id) => {
    const res = await fetch(`${API_BASE}/workflows/${id}/ignore`, { method: 'POST' });
    return res.json();
  },
  simulateWorkflow: async (id, sampleFile = null) => {
    const res = await fetch(`${API_BASE}/workflows/${id}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_id: id, sample_target_file: sampleFile })
    });
    return res.json();
  },

  // Execution
  runWorkflow: async (workflowId, context = null) => {
    const res = await fetch(`${API_BASE}/execution/run/${workflowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context || {})
    });
    return res.json();
  },
  getExecutionHistory: async () => {
    const res = await fetch(`${API_BASE}/execution/history`);
    return res.json();
  },
  getExecutionDetail: async (id) => {
    const res = await fetch(`${API_BASE}/execution/${id}`);
    return res.json();
  },

  // Permissions
  getPermissions: async () => {
    const res = await fetch(`${API_BASE}/permissions`);
    return res.json();
  },
  updatePermission: async (id, data) => {
    const res = await fetch(`${API_BASE}/permissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Privacy
  getPrivacyStatus: async () => {
    const res = await fetch(`${API_BASE}/privacy/status`);
    return res.json();
  },
  runRetentionCleanup: async () => {
    const res = await fetch(`${API_BASE}/privacy/cleanup`, { method: 'POST' });
    return res.json();
  },

  // Academic Demo
  runDemoScenario: async () => {
    const res = await fetch(`${API_BASE}/demo/run-scenario`, { method: 'POST' });
    return res.json();
  },
  prepareWorkspace: async () => {
    const res = await fetch(`${API_BASE}/demo/prepare-workspace`, { method: 'POST' });
    return res.json();
  }
};
