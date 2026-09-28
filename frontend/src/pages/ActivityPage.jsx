import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Filter, Plus, RefreshCw, Clock, FileCode, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function ActivityPage({ monitoringActive, onToggleMonitoring }) {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simForm, setSimForm] = useState({
    event_type: 'FILE_CREATED',
    file_type: 'PDF',
    normalized_path: '<WORKSPACE>/Inbox/new_assignment.pdf'
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents(50, filterType);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filterType]);

  const handleCreateSimEvent = async (e) => {
    e.preventDefault();
    try {
      await api.simulateEvent({
        event_type: simForm.event_type,
        file_type: simForm.file_type,
        normalized_path: simForm.normalized_path,
        metadata: { source: 'manual_test' }
      });
      setIsSimulating(false);
      loadEvents();
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Activity Event Stream</h1>
          <p className="text-xs text-slate-400">All filesystem activities are filtered and normalized to protect user privacy.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Event</span>
          </button>

          <button
            onClick={loadEvents}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Manual Simulation Drawer */}
      {isSimulating && (
        <form onSubmit={handleCreateSimEvent} className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3">
          <span className="text-xs font-semibold text-white block">Inject Test Event</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Event Type</label>
              <select
                value={simForm.event_type}
                onChange={(e) => setSimForm({ ...simForm, event_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="FILE_CREATED">FILE_CREATED</option>
                <option value="FILE_OPENED">FILE_OPENED</option>
                <option value="FILE_RENAMED">FILE_RENAMED</option>
                <option value="FILE_MOVED">FILE_MOVED</option>
                <option value="FILE_DELETED">FILE_DELETED</option>
                <option value="FOLDER_CREATED">FOLDER_CREATED</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">File Type</label>
              <select
                value={simForm.file_type}
                onChange={(e) => setSimForm({ ...simForm, file_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="TXT">TXT</option>
                <option value="DIRECTORY">DIRECTORY</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Abstract Path</label>
              <input
                type="text"
                value={simForm.normalized_path}
                onChange={(e) => setSimForm({ ...simForm, normalized_path: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsSimulating(false)}
              className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
            >
              Emit Event
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      <div className="flex items-center space-x-2 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">Filter Event:</span>
        {['', 'FILE_CREATED', 'FILE_OPENED', 'FILE_RENAMED', 'FILE_MOVED'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterType === type
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {type || 'ALL'}
          </button>
        ))}
      </div>

      {/* Event list table */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Format / Category</th>
                <th className="px-4 py-3">Normalized Path</th>
                <th className="px-4 py-3">Identity Hash</th>
                <th className="px-4 py-3">Privacy Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No events recorded yet. Start activity monitoring or run the academic demo scenario.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-emerald-400">
                      {ev.event_type}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                        {ev.file_type} ({ev.category})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200">
                      {ev.normalized_path}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {ev.raw_hash || 'SHA256'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sanitized</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
