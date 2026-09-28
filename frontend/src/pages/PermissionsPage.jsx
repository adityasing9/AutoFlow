import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, AlertTriangle, ShieldAlert, Check, X } from 'lucide-react';
import { api } from '../api/client';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await api.getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleToggleAllowed = async (perm) => {
    try {
      const updated = await api.updatePermission(perm.id, { is_allowed: !perm.is_allowed });
      setPermissions(permissions.map(p => p.id === perm.id ? updated : p));
      setUpdateMsg(`Updated '${perm.action_type}' permission.`);
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  const handleToggleApproval = async (perm) => {
    try {
      const updated = await api.updatePermission(perm.id, { requires_approval: !perm.requires_approval });
      setPermissions(permissions.map(p => p.id === perm.id ? updated : p));
      setUpdateMsg(`Updated '${perm.action_type}' approval policy.`);
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">Permissions & Risk Governance</h1>
        <p className="text-xs text-slate-400">
          The centralized permission manager strictly regulates every tool before execution. The AI has zero authority to bypass this layer.
        </p>
      </div>

      {updateMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Sandbox Notice Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white block">Configured Safe Sandbox Workspace</span>
          <p className="text-slate-300 leading-relaxed">
            All file reads, writes, renames, and moves are strictly confined to <code className="text-emerald-400 font-mono">AutoFlowWorkspace/</code>.
            Path traversal attempts (e.g. <code className="text-rose-400 font-mono">../../</code>) are intercepted and rejected immediately by the sandbox validator.
          </p>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Action Type</th>
              <th className="px-4 py-3">Risk Classification</th>
              <th className="px-4 py-3">Operation Description</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Manual Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {permissions.map((perm) => {
              const riskColors = {
                LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                VERY_HIGH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
              };

              const isDangerous = perm.action_type === 'EXECUTE_COMMAND' || perm.action_type === 'NETWORK_ACCESS';

              return (
                <tr key={perm.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-white">
                    {perm.action_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${riskColors[perm.risk_level] || riskColors.LOW}`}>
                      {perm.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {perm.description}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleAllowed(perm)}
                      disabled={isDangerous}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors ${
                        perm.is_allowed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      } ${isDangerous ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {perm.is_allowed ? 'ALLOWED' : 'BLOCKED'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleApproval(perm)}
                      disabled={isDangerous || !perm.is_allowed}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors ${
                        perm.requires_approval
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      } ${isDangerous ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {perm.requires_approval ? 'MANDATORY' : 'AUTO-PASS'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
