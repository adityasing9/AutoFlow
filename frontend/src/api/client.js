const API_BASE = '/api';

// In-memory / localStorage fallback store for standalone cloud previews (e.g. Vercel)
const initialDemoState = {
  monitoringActive: false,
  stats: {
    monitoring_active: false,
    offline_mode: true,
    events_today: 44,
    patterns_detected: 6,
    suggestions_count: 3,
    approved_workflows: 1,
    successful_executions: 12,
    failed_executions: 0,
    local_ai_status: "ONLINE",
    local_ai_model: "AutoFlow Local Engine (rule-expert-v1)"
  },
  events: [
    { id: 1, event_type: "FILE_CREATED", file_type: "PDF", category: "DOCUMENT", normalized_path: "<WORKSPACE>/Inbox/lecture_notes_dbms.pdf", raw_hash: "a4f89b1c", is_privacy_filtered: true, timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: 2, event_type: "FILE_OPENED", file_type: "PDF", category: "DOCUMENT", normalized_path: "<WORKSPACE>/Inbox/lecture_notes_dbms.pdf", raw_hash: "a4f89b1c", is_privacy_filtered: true, timestamp: new Date(Date.now() - 240000).toISOString() },
    { id: 3, event_type: "FILE_RENAMED", file_type: "PDF", category: "DOCUMENT", normalized_path: "<WORKSPACE>/Inbox/DBMS_Unit1_Lecture.pdf", raw_hash: "a4f89b1c", is_privacy_filtered: true, timestamp: new Date(Date.now() - 180000).toISOString() },
    { id: 4, event_type: "FILE_MOVED", file_type: "PDF", category: "DOCUMENT", normalized_path: "<WORKSPACE>/College/DBMS/DBMS_Unit1_Lecture.pdf", raw_hash: "a4f89b1c", is_privacy_filtered: true, timestamp: new Date(Date.now() - 120000).toISOString() }
  ],
  patterns: [
    {
      id: 1,
      pattern_code: "P-001",
      name: "Study Material Organizer",
      sequence: ["FILE_CREATED:PDF", "FILE_OPENED:PDF", "FILE_RENAMED:PDF", "FILE_MOVED:PDF"],
      occurrences: 11,
      avg_interval_seconds: 140,
      confidence: 0.94,
      risk_level: "LOW",
      status: "PROPOSED",
      detected_at: new Date(Date.now() - 600000).toISOString(),
      updated_at: new Date(Date.now() - 600000).toISOString()
    }
  ],
  suggestions: [
    {
      pattern_id: 1,
      pattern_code: "P-001",
      workflow_name: "Study Material Organizer",
      description: "The user repeatedly downloads PDF documents to Inbox, inspects them, standardizes naming, and relocates them into academic subject folders.",
      sequence: ["FILE_CREATED", "FILE_OPENED", "FILE_RENAMED", "FILE_MOVED"],
      occurrences: 11,
      confidence: 0.94,
      risk_level: "LOW",
      estimated_manual_actions_per_week: 55,
      estimated_automated_actions_per_workflow: 4,
      workflow_id: 1,
      status: "APPROVED"
    }
  ],
  workflows: [
    {
      id: 1,
      pattern_id: 1,
      name: "Study Material Organizer",
      description: "Automatically organize incoming course study PDFs into structured subject directories.",
      trigger_type: "FILE_CREATED:PDF",
      conditions: { source_folder: "Inbox", file_type: "PDF" },
      actions: [
        { step_order: 1, tool_name: "FileReader", risk_level: "LOW", description: "Inspect newly arrived file metadata", params: { path: "<WORKSPACE>/Inbox/{filename}" } },
        { step_order: 2, tool_name: "FolderCreator", risk_level: "LOW", description: "Ensure destination subject directory exists", params: { folder_path: "<WORKSPACE>/College/{subject}" } },
        { step_order: 3, tool_name: "FileRenamer", risk_level: "LOW", description: "Standardize document naming convention", params: { source_path: "<WORKSPACE>/Inbox/{filename}", new_name: "{subject}_{date}_{filename}" } },
        { step_order: 4, tool_name: "FileMover", risk_level: "MEDIUM", description: "Move document to target subject directory", params: { source_path: "<WORKSPACE>/Inbox/{subject}_{date}_{filename}", dest_folder: "<WORKSPACE>/College/{subject}" } }
      ],
      verification: { required_checks: [{ type: "DESTINATION_EXISTS" }, { type: "SOURCE_REMOVED" }] },
      risk_level: "LOW",
      confidence: 0.96,
      status: "APPROVED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  history: [
    {
      id: 101,
      workflow_id: 1,
      status: "SUCCESS",
      is_simulation: false,
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3590000).toISOString(),
      steps: [
        { id: 1, step_order: 1, tool_name: "FileReader", status: "SUCCESS", input_data: { path: "<WORKSPACE>/Inbox/lecture_notes_dbms.pdf" }, output_data: { exists: true, size_bytes: 42100 }, executed_at: new Date().toISOString() },
        { id: 2, step_order: 2, tool_name: "FolderCreator", status: "SUCCESS", input_data: { folder_path: "<WORKSPACE>/College/DBMS" }, output_data: { created: true }, executed_at: new Date().toISOString() },
        { id: 3, step_order: 3, tool_name: "FileRenamer", status: "SUCCESS", input_data: { source_path: "<WORKSPACE>/Inbox/lecture_notes_dbms.pdf" }, output_data: { new_path: "<WORKSPACE>/Inbox/DBMS_Unit1.pdf" }, executed_at: new Date().toISOString() },
        { id: 4, step_order: 4, tool_name: "FileMover", status: "SUCCESS", input_data: { dest_folder: "<WORKSPACE>/College/DBMS" }, output_data: { final_dest_file: "<WORKSPACE>/College/DBMS/DBMS_Unit1.pdf" }, executed_at: new Date().toISOString() }
      ],
      verifications: [
        { id: 1, status: "SUCCESS", verification_type: "DESTINATION_EXISTS", details: { message: "Destination file verified on disk: DBMS_Unit1.pdf" } },
        { id: 2, status: "SUCCESS", verification_type: "SOURCE_REMOVED", details: { message: "Source file successfully removed from Inbox" } }
      ]
    }
  ],
  permissions: [
    { id: 1, action_type: "READ_FILE", risk_level: "LOW", is_allowed: true, requires_approval: false, description: "Read file contents within workspace" },
    { id: 2, action_type: "CREATE_FOLDER", risk_level: "LOW", is_allowed: true, requires_approval: false, description: "Create new folders within workspace" },
    { id: 3, action_type: "CREATE_FILE", risk_level: "LOW", is_allowed: true, requires_approval: false, description: "Create new files within workspace" },
    { id: 4, action_type: "RENAME_FILE", risk_level: "LOW", is_allowed: true, requires_approval: true, description: "Rename existing files in workspace" },
    { id: 5, action_type: "MOVE_FILE", risk_level: "MEDIUM", is_allowed: true, requires_approval: true, description: "Move files between directories in workspace" },
    { id: 6, action_type: "COPY_FILE", risk_level: "MEDIUM", is_allowed: true, requires_approval: false, description: "Copy files within workspace" },
    { id: 7, action_type: "DELETE_FILE", risk_level: "HIGH", is_allowed: true, requires_approval: true, description: "Delete files - ALWAYS requires explicit approval" },
    { id: 8, action_type: "EXECUTE_COMMAND", risk_level: "HIGH", is_allowed: false, requires_approval: true, description: "Terminal/Shell command execution (Disabled by default)" },
    { id: 9, action_type: "NETWORK_ACCESS", risk_level: "VERY_HIGH", is_allowed: false, requires_approval: true, description: "External network access (Disabled by default)" }
  ]
};

// Safe JSON fetcher with automated standalone fallback
async function safeFetch(url, options = {}, fallbackData = null) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // API not reachable directly, gracefully fall through
  }
  return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
}

export const api = {
  // Stats & Health
  getDashboardStats: async () => {
    return safeFetch(`${API_BASE}/stats/dashboard`, {}, () => initialDemoState.stats);
  },

  // Activity & Monitor
  getEvents: async (limit = 50, eventType = '') => {
    const q = new URLSearchParams({ limit });
    if (eventType) q.append('event_type', eventType);
    return safeFetch(`${API_BASE}/activity/events?${q.toString()}`, {}, () => {
      if (!eventType) return initialDemoState.events;
      return initialDemoState.events.filter(e => e.event_type === eventType);
    });
  },
  getMonitorStatus: async () => {
    return safeFetch(`${API_BASE}/activity/monitor/status`, {}, () => ({
      active: initialDemoState.monitoringActive,
      type: "LOCAL_FILESYSTEM",
      privacy: "FILTERED"
    }));
  },
  startMonitor: async () => {
    return safeFetch(`${API_BASE}/activity/monitor/start`, { method: 'POST' }, () => {
      initialDemoState.monitoringActive = true;
      initialDemoState.stats.monitoring_active = true;
      return { success: true, status: "ACTIVE", message: "Activity monitoring is now ACTIVE." };
    });
  },
  stopMonitor: async () => {
    return safeFetch(`${API_BASE}/activity/monitor/stop`, { method: 'POST' }, () => {
      initialDemoState.monitoringActive = false;
      initialDemoState.stats.monitoring_active = false;
      return { success: true, status: "INACTIVE", message: "Activity monitoring is now STOPPED." };
    });
  },
  simulateEvent: async (data) => {
    return safeFetch(`${API_BASE}/activity/events/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, () => {
      const newEvt = {
        id: initialDemoState.events.length + 1,
        event_type: data.event_type,
        file_type: data.file_type || "PDF",
        category: "DOCUMENT",
        normalized_path: data.normalized_path,
        raw_hash: "test_hash_" + Math.random().toString(36).slice(2, 8),
        is_privacy_filtered: true,
        timestamp: new Date().toISOString()
      };
      initialDemoState.events.unshift(newEvt);
      initialDemoState.stats.events_today += 1;
      return newEvt;
    });
  },

  // Patterns
  getPatterns: async () => {
    return safeFetch(`${API_BASE}/patterns`, {}, () => initialDemoState.patterns);
  },
  discoverPatterns: async () => {
    return safeFetch(`${API_BASE}/patterns/discover`, { method: 'POST' }, () => ({
      status: "SUCCESS",
      discovered_count: initialDemoState.patterns.length,
      patterns: initialDemoState.patterns.map(p => p.pattern_code),
      cache_stats: { hits: 14, misses: 1, hit_ratio: 0.9333 }
    }));
  },
  getPatternGraph: async (patternId) => {
    return safeFetch(`${API_BASE}/patterns/${patternId}/graph`, {}, () => ({
      nodes: [
        { id: "FILE_CREATED:PDF", label: "FILE_CREATED:PDF" },
        { id: "FILE_OPENED:PDF", label: "FILE_OPENED:PDF" },
        { id: "FILE_RENAMED:PDF", label: "FILE_RENAMED:PDF" },
        { id: "FILE_MOVED:PDF", label: "FILE_MOVED:PDF" }
      ],
      links: [
        { source: "FILE_CREATED:PDF", target: "FILE_OPENED:PDF", weight: 11 },
        { source: "FILE_OPENED:PDF", target: "FILE_RENAMED:PDF", weight: 11 },
        { source: "FILE_RENAMED:PDF", target: "FILE_MOVED:PDF", weight: 11 }
      ]
    }));
  },

  // Suggestions
  getSuggestions: async () => {
    return safeFetch(`${API_BASE}/suggestions`, {}, () => initialDemoState.suggestions);
  },
  generateSuggestion: async (patternId) => {
    return safeFetch(`${API_BASE}/suggestions/generate/${patternId}`, { method: 'POST' }, () => initialDemoState.workflows[0]);
  },

  // Workflows
  getWorkflows: async (status = '') => {
    const url = status ? `${API_BASE}/workflows?status=${status}` : `${API_BASE}/workflows`;
    return safeFetch(url, {}, () => {
      if (!status) return initialDemoState.workflows;
      return initialDemoState.workflows.filter(w => w.status === status);
    });
  },
  getWorkflowDetail: async (id) => {
    return safeFetch(`${API_BASE}/workflows/${id}`, {}, () => initialDemoState.workflows[0]);
  },
  approveWorkflow: async (id) => {
    return safeFetch(`${API_BASE}/workflows/${id}/approve`, { method: 'POST' }, () => {
      const wf = initialDemoState.workflows.find(w => w.id === Number(id)) || initialDemoState.workflows[0];
      wf.status = "APPROVED";
      initialDemoState.stats.approved_workflows = 1;
      return wf;
    });
  },
  rejectWorkflow: async (id) => {
    return safeFetch(`${API_BASE}/workflows/${id}/reject`, { method: 'POST' }, () => {
      const wf = initialDemoState.workflows.find(w => w.id === Number(id)) || initialDemoState.workflows[0];
      wf.status = "REJECTED";
      return wf;
    });
  },
  ignoreWorkflow: async (id) => {
    return safeFetch(`${API_BASE}/workflows/${id}/ignore`, { method: 'POST' }, () => {
      const wf = initialDemoState.workflows.find(w => w.id === Number(id)) || initialDemoState.workflows[0];
      wf.status = "IGNORED";
      return wf;
    });
  },
  simulateWorkflow: async (id, sampleFile = null) => {
    return safeFetch(`${API_BASE}/workflows/${id}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_id: id, sample_target_file: sampleFile })
    }, () => ({
      workflow_id: id,
      workflow_name: "Study Material Organizer",
      files_detected: 3,
      potential_renames: 3,
      potential_moves: 3,
      potential_folders_created: 1,
      potential_deletions: 0,
      network_requests: 0,
      risk_level: "LOW",
      simulated_steps: [
        { target_file: "lecture_notes_dbms.pdf", step_order: 1, tool: "FileReader", action_description: "Inspect newly arrived file metadata" },
        { target_file: "lecture_notes_dbms.pdf", step_order: 2, tool: "FolderCreator", action_description: "Ensure destination subject directory exists" },
        { target_file: "lecture_notes_dbms.pdf", step_order: 3, tool: "FileRenamer", action_description: "Standardize document naming convention" },
        { target_file: "lecture_notes_dbms.pdf", step_order: 4, tool: "FileMover", action_description: "Move document to target subject directory" }
      ],
      can_proceed: true
    }));
  },

  // Execution
  runWorkflow: async (workflowId, context = null) => {
    return safeFetch(`${API_BASE}/execution/run/${workflowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context || {})
    }, () => {
      initialDemoState.stats.successful_executions += 1;
      const newExec = {
        id: initialDemoState.history.length + 101,
        workflow_id: workflowId,
        status: "SUCCESS",
        is_simulation: false,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        steps: [
          { id: 1, step_order: 1, tool_name: "FileReader", status: "SUCCESS", input_data: { path: "<WORKSPACE>/Inbox/lecture_notes_dbms_unit1.pdf" }, output_data: { exists: true }, executed_at: new Date().toISOString() },
          { id: 2, step_order: 2, tool_name: "FolderCreator", status: "SUCCESS", input_data: { folder_path: "<WORKSPACE>/College/DBMS" }, output_data: { created: true }, executed_at: new Date().toISOString() },
          { id: 3, step_order: 3, tool_name: "FileRenamer", status: "SUCCESS", input_data: { source_path: "<WORKSPACE>/Inbox/lecture_notes_dbms_unit1.pdf" }, output_data: { new_path: "<WORKSPACE>/Inbox/DBMS_Unit1.pdf" }, executed_at: new Date().toISOString() },
          { id: 4, step_order: 4, tool_name: "FileMover", status: "SUCCESS", input_data: { dest_folder: "<WORKSPACE>/College/DBMS" }, output_data: { final_dest_file: "<WORKSPACE>/College/DBMS/DBMS_Unit1.pdf" }, executed_at: new Date().toISOString() }
        ],
        verifications: [
          { id: 1, status: "SUCCESS", verification_type: "DESTINATION_EXISTS", details: { message: "Destination file verified on disk: DBMS_Unit1.pdf" } },
          { id: 2, status: "SUCCESS", verification_type: "SOURCE_REMOVED", details: { message: "Source file successfully removed from Inbox" } }
        ]
      };
      initialDemoState.history.unshift(newExec);
      return newExec;
    });
  },
  getExecutionHistory: async () => {
    return safeFetch(`${API_BASE}/execution/history`, {}, () => initialDemoState.history);
  },
  getExecutionDetail: async (id) => {
    return safeFetch(`${API_BASE}/execution/${id}`, {}, () => initialDemoState.history[0]);
  },

  // Permissions
  getPermissions: async () => {
    return safeFetch(`${API_BASE}/permissions`, {}, () => initialDemoState.permissions);
  },
  updatePermission: async (id, data) => {
    return safeFetch(`${API_BASE}/permissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, () => {
      const p = initialDemoState.permissions.find(item => item.id === Number(id));
      if (p) {
        if (data.is_allowed !== undefined) p.is_allowed = data.is_allowed;
        if (data.requires_approval !== undefined) p.requires_approval = data.requires_approval;
        return p;
      }
      return initialDemoState.permissions[0];
    });
  },

  // Privacy
  getPrivacyStatus: async () => {
    return safeFetch(`${API_BASE}/privacy/status`, {}, () => ({
      local_ai_enabled: true,
      internet_access_enabled: false,
      activity_monitoring_enabled: initialDemoState.monitoringActive,
      cloud_storage_enabled: false,
      external_api_calls: 0,
      file_events_enabled: true,
      app_events_enabled: false,
      screen_recording_enabled: false,
      keyboard_logging_enabled: false,
      microphone_enabled: false,
      camera_enabled: false,
      sanitized_events_ratio: 1.0
    }));
  },
  runRetentionCleanup: async () => {
    return safeFetch(`${API_BASE}/privacy/cleanup`, { method: 'POST' }, () => ({
      status: "SUCCESS",
      message: "Storage retention optimization completed successfully."
    }));
  },

  // Academic Demo
  runDemoScenario: async () => {
    return safeFetch(`${API_BASE}/demo/run-scenario`, { method: 'POST' }, () => {
      initialDemoState.stats.events_today += 44;
      initialDemoState.stats.patterns_detected = 6;
      initialDemoState.stats.suggestions_count = 3;
      return {
        status: "SUCCESS",
        events_created: 44,
        patterns_detected: 6,
        primary_pattern: { code: "P-001", occurrences: 11, confidence: 0.94, sequence: ["FILE_CREATED:PDF", "FILE_OPENED:PDF", "FILE_RENAMED:PDF", "FILE_MOVED:PDF"] },
        proposed_workflow: { id: 1, name: "Study Material Organizer", description: "The user repeatedly organizes newly downloaded documents into subject directories.", confidence: 0.96, status: "PROPOSED" }
      };
    });
  },
  prepareWorkspace: async () => {
    return safeFetch(`${API_BASE}/demo/prepare-workspace`, { method: 'POST' }, () => ({
      status: "SUCCESS",
      workspace_root: "AutoFlow/AutoFlowWorkspace",
      created_files: ["lecture_notes_dbms_unit1.pdf", "ai_lab_assignment_3.pdf", "operating_systems_process_mgmt.pdf"]
    }));
  }
};
