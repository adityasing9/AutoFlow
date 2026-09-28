import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SimulationModal from './components/SimulationModal';
import DashboardPage from './pages/DashboardPage';
import ActivityPage from './pages/ActivityPage';
import PatternsPage from './pages/PatternsPage';
import SuggestionsPage from './pages/SuggestionsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowDetailPage from './pages/WorkflowDetailPage';
import PermissionsPage from './pages/PermissionsPage';
import HistoryPage from './pages/HistoryPage';
import PrivacyPage from './pages/PrivacyPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './api/client';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [stats, setStats] = useState(null);
  const [monitoringActive, setMonitoringActive] = useState(false);

  // Simulation modal state
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      setMonitoringActive(data.monitoring_active);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMonitoring = async () => {
    try {
      if (monitoringActive) {
        await api.stopMonitor();
        setMonitoringActive(false);
      } else {
        await api.startMonitor();
        setMonitoringActive(true);
      }
      fetchStats();
    } catch (err) {
      alert(`Monitoring toggle error: ${err.message}`);
    }
  };

  const handleOpenSimulation = async (workflowId) => {
    try {
      const sim = await api.simulateWorkflow(workflowId);
      setSimulationData(sim);
      setIsSimModalOpen(true);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    }
  };

  const handleApproveWorkflowFromSimulation = async (workflowId) => {
    setIsApproving(true);
    try {
      await api.approveWorkflow(workflowId);
      setIsSimModalOpen(false);
      fetchStats();
      alert(`Workflow #${workflowId} has been APPROVED and is ready for controlled execution!`);
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const navigateTo = (page, workflowId = null) => {
    if (workflowId) {
      setSelectedWorkflowId(workflowId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        monitoringActive={monitoringActive}
        onToggleMonitoring={handleToggleMonitoring}
        localAiStatus={stats?.local_ai_model}
      />

      <div className="flex flex-1">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(p) => navigateTo(p)}
          suggestionsCount={stats?.suggestions_count ?? 0}
        />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            <DashboardPage
              stats={stats}
              onNavigate={navigateTo}
              onRefresh={fetchStats}
              onSimulateWorkflow={handleOpenSimulation}
            />
          )}

          {currentPage === 'activity' && (
            <ActivityPage
              monitoringActive={monitoringActive}
              onToggleMonitoring={handleToggleMonitoring}
            />
          )}

          {currentPage === 'patterns' && (
            <PatternsPage onNavigate={navigateTo} />
          )}

          {currentPage === 'suggestions' && (
            <SuggestionsPage
              onSimulate={handleOpenSimulation}
              onRefreshStats={fetchStats}
            />
          )}

          {currentPage === 'workflows' && (
            <WorkflowsPage
              onSelectWorkflow={(id) => navigateTo('workflow-detail', id)}
              onSimulate={handleOpenSimulation}
              onRefreshStats={fetchStats}
            />
          )}

          {currentPage === 'workflow-detail' && (
            <WorkflowDetailPage
              workflowId={selectedWorkflowId}
              onBack={() => navigateTo('workflows')}
              onSimulate={handleOpenSimulation}
              onRefreshStats={fetchStats}
            />
          )}

          {currentPage === 'permissions' && <PermissionsPage />}

          {currentPage === 'history' && <HistoryPage />}

          {currentPage === 'privacy' && <PrivacyPage />}

          {currentPage === 'settings' && (
            <SettingsPage stats={stats} onRefreshStats={fetchStats} />
          )}
        </main>
      </div>

      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        simulationData={simulationData}
        onApprove={handleApproveWorkflowFromSimulation}
        isApproving={isApproving}
      />
    </div>
  );
}
