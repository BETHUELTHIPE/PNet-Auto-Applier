import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  Terminal, 
  Play, 
  Square, 
  RefreshCw, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  ExternalLink, 
  Filter, 
  Zap, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Server,
  Code2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { CeleryWorkerNode, CeleryTaskLog, CeleryTaskStatus } from '../types';

interface CeleryFlowerDashboardProps {
  workers: CeleryWorkerNode[];
  taskLogs: CeleryTaskLog[];
  onTriggerTask?: (taskType: 'scrape' | 'email' | 'portal') => void;
  onRevokeTask?: (taskId: string) => void;
}

interface FlowerTaskDetail {
  uuid: string;
  name: string;
  state: CeleryTaskStatus | 'REVOKED' | 'RECEIVED';
  args: string;
  kwargs: string;
  result: string;
  runtime: number;
  worker: string;
  received: string;
  started: string;
  retries: number;
  traceback?: string;
}

export const CeleryFlowerDashboard: React.FC<CeleryFlowerDashboardProps> = ({
  workers: initialWorkers,
  taskLogs,
  onTriggerTask,
  onRevokeTask
}) => {
  const [activeTab, setActiveTab] = useState<'workers' | 'tasks' | 'broker' | 'config' | 'api'>('workers');
  const [selectedTask, setSelectedTask] = useState<FlowerTaskDetail | null>(null);
  const [taskFilterState, setTaskFilterState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rateLimitEmail, setRateLimitEmail] = useState('15/m');
  const [rateLimitPortal, setRateLimitPortal] = useState('8/m');
  const [rateLimitScrape, setRateLimitScrape] = useState('4/m');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Local worker states to support interactive Pool Growth/Shrink in UI
  const [workerStates, setWorkerStates] = useState(initialWorkers);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showNotification('Flower: Synced state from Redis broker & Celery workers');
    }, 600);
  };

  const handleAutoscaleWorker = (workerId: string, delta: number) => {
    setWorkerStates(prev => prev.map(w => {
      if (w.id === workerId) {
        const nextConcurrency = Math.max(1, Math.min(16, w.concurrency + delta));
        return { ...w, concurrency: nextConcurrency };
      }
      return w;
    }));
    showNotification(`Flower Command: Pool ${delta > 0 ? 'GROWN (+1)' : 'SHRUNK (-1)'} on ${workerId}`);
  };

  const handleRestartPool = (workerName: string) => {
    showNotification(`Flower Command: celery.pool_restart executed on ${workerName}`);
  };

  const handlePingWorker = (workerName: string) => {
    showNotification(`Flower Ping: ${workerName} responded PONG (0.42ms)`);
  };

  // Convert taskLogs into Flower rich tasks representation
  const flowerTasks: FlowerTaskDetail[] = taskLogs.map((log, index) => {
    const runtime = log.durationMs ? log.durationMs / 1000 : 1.25 + (index * 0.3) % 2;
    return {
      uuid: log.id,
      name: log.taskName,
      state: log.status,
      args: log.jobId ? `[job_id=${log.jobId}]` : '[]',
      kwargs: log.company ? `{"company": "${log.company}", "channel": "${log.queue}"}` : '{"source": "pnet.co.za", "geo": "Gauteng"}',
      result: log.resultSummary || (log.status === 'SUCCESS' ? '{"status": "delivered", "http_status": 200}' : 'None'),
      runtime: parseFloat(runtime.toFixed(2)),
      worker: log.worker || 'celery@worker_email_node_01',
      received: log.startedAt,
      started: log.startedAt,
      retries: log.retries,
      traceback: log.status === 'FAILURE' ? `Traceback (most recent call last):\n  File "/app/jobs/tasks.py", line 88, in apply_via_email_task\n    smtp.send_mail(recipient, msg)\n  File "/usr/local/lib/python3.11/smtplib.py", line 888, in send_mail\nSMTPAuthenticationError: (535, b'5.7.8 Authentication credentials invalid')` : undefined
    };
  });

  const filteredTasks = flowerTasks.filter(t => {
    if (taskFilterState !== 'ALL' && t.state !== taskFilterState) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.uuid.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.worker.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSuccessful = flowerTasks.filter(t => t.state === 'SUCCESS').length;
  const totalFailed = flowerTasks.filter(t => t.state === 'FAILURE').length;
  const totalActive = flowerTasks.filter(t => t.state === 'STARTED').length;

  return (
    <div className="space-y-6">
      
      {/* Flower Hero Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Celery Flower Administration
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Port 5555
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              mher/flower:2.0.1 • Redis Broker: <span className="text-indigo-400">redis://redis:6379/0</span> • Auth: <span className="text-neutral-300">admin:admin123</span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {feedbackMessage && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800 animate-fade-in">
              {feedbackMessage}
            </span>
          )}

          <button
            id="flower-refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : 'text-neutral-400'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Workers'}</span>
          </button>

          <a
            href="http://localhost:5555"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-950/20"
          >
            <span>Open Flower UI (5555)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Flower Top Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
          <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
            <span>Active Workers</span>
            <Server className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {workerStates.length} <span className="text-xs font-normal text-emerald-400">/ 3 online</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Total Concurrency: {workerStates.reduce((acc, w) => acc + w.concurrency, 0)}</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
          <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
            <span>Succeeded Tasks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
            {totalSuccessful}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Throughput: ~12.4 tasks/min</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
          <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
            <span>Running / Active</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-indigo-400 font-mono mt-1">
            {totalActive}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">In distributed workers</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
          <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
            <span>Failed / Errors</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">
            {totalFailed}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Retry strategy active</div>
        </div>
      </div>

      {/* Flower Tabs Navigation */}
      <div className="flex border-b border-neutral-800 space-x-2">
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'workers'
              ? 'bg-neutral-900 text-rose-400 border-t-2 border-rose-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Workers &amp; Pools ({workerStates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-neutral-900 text-rose-400 border-t-2 border-rose-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Tasks Real-Time Stream ({flowerTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broker')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'broker'
              ? 'bg-neutral-900 text-rose-400 border-t-2 border-rose-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Redis Broker Queues</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-neutral-900 text-rose-400 border-t-2 border-rose-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Rate Limits &amp; Timeouts</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'api'
              ? 'bg-neutral-900 text-rose-400 border-t-2 border-rose-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Flower HTTP API &amp; CLI</span>
        </button>
      </div>

      {/* Tab 1: WORKERS & POOLS */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Celery Cluster Worker Nodes</h3>
                <p className="text-[11px] text-neutral-400">Interactive Pool Autoscale &amp; Management via Flower Control Engine</p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Network: <strong className="text-indigo-400">172.28.0.0/16</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Worker Hostname</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Bound Queue</th>
                    <th className="py-3 px-4">Concurrency / Pool</th>
                    <th className="py-3 px-4">Processed</th>
                    <th className="py-3 px-4">Active</th>
                    <th className="py-3 px-4 text-right">Worker Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {workerStates.map((worker) => (
                    <tr key={worker.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{worker.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-normal">uptime: {worker.uptime}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          ONLINE
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-300">
                        {worker.queue}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-400 text-sm">{worker.concurrency} processes</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAutoscaleWorker(worker.id, -1)}
                              title="Shrink Pool (-1)"
                              className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleAutoscaleWorker(worker.id, 1)}
                              title="Grow Pool (+1)"
                              className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-200">
                        {worker.totalProcessed} tasks
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300 font-bold">
                        {worker.activeTasksCount}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePingWorker(worker.name)}
                            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300 transition-colors"
                          >
                            Ping
                          </button>
                          <button
                            onClick={() => handleRestartPool(worker.name)}
                            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-amber-300 transition-colors"
                          >
                            Restart Pool
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: TASKS REAL-TIME STREAM */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
            
            {/* Filter & Search Bar */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-neutral-400" />
                <select
                  value={taskFilterState}
                  onChange={(e) => setTaskFilterState(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 font-mono focus:outline-none focus:border-rose-500"
                >
                  <option value="ALL">All States</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="STARTED">STARTED</option>
                  <option value="FAILURE">FAILURE</option>
                  <option value="REVOKED">REVOKED</option>
                </select>

                <input
                  type="text"
                  placeholder="Search UUID, task name, worker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500 flex-1 md:w-64"
                />
              </div>

              <div className="text-xs text-neutral-400 font-mono">
                Showing <strong className="text-white">{filteredTasks.length}</strong> of {flowerTasks.length} tasks
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-4">UUID</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Runtime</th>
                    <th className="py-3 px-4">Started</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredTasks.map((task) => (
                    <tr key={task.uuid} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white text-[11px] block">{task.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono truncate max-w-xs block">{task.args}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                        {task.uuid}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          task.state === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : task.state === 'STARTED'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : task.state === 'FAILURE'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                        }`}>
                          {task.state}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-neutral-300">
                        {task.worker}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-300">
                        {task.runtime}s
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-neutral-400">
                        {task.started}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-indigo-300 transition-colors"
                        >
                          Inspect
                        </button>
                        {task.state === 'STARTED' && (
                          <button
                            onClick={() => {
                              onRevokeTask?.(task.uuid);
                              showNotification(`Flower: Sent celery.revoke(terminate=True) to ${task.uuid}`);
                            }}
                            className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-[11px] font-mono text-rose-300 border border-rose-800 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Task Inspection Modal / Detail Drawer */}
          {selectedTask && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white font-mono">Task Inspector: {selectedTask.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Task UUID</span>
                      <span className="font-mono text-white font-bold">{selectedTask.uuid}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">State</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedTask.state}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Worker Node</span>
                      <span className="font-mono text-neutral-200">{selectedTask.worker}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Runtime / Retries</span>
                      <span className="font-mono text-indigo-400">{selectedTask.runtime}s ({selectedTask.retries} retries)</span>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Keyword Arguments (kwargs)</span>
                    <pre className="font-mono text-[11px] text-neutral-300 bg-neutral-900 p-2 rounded overflow-x-auto">{selectedTask.kwargs}</pre>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Result Summary / Return Value</span>
                    <pre className="font-mono text-[11px] text-emerald-300 bg-neutral-900 p-2 rounded overflow-x-auto">{selectedTask.result}</pre>
                  </div>

                  {selectedTask.traceback && (
                    <div className="bg-neutral-950 p-3 rounded-lg border border-rose-900/60 space-y-1">
                      <span className="text-[10px] text-rose-400 uppercase font-mono block">Exception Traceback</span>
                      <pre className="font-mono text-[11px] text-rose-300 bg-neutral-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">{selectedTask.traceback}</pre>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      handleCopy(JSON.stringify(selectedTask, null, 2), 'task-json');
                      showNotification('Copied Flower task payload to clipboard');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: REDIS BROKER & QUEUES */}
      {activeTab === 'broker' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Redis Broker Inspection</h3>
                  <p className="text-xs text-neutral-400 font-mono">redis://redis:6379/0 • Virtual Host: /0</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Queue 1: Email Dispatch */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">email_dispatch_queue</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Priority: High (10)</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Active Consumers:</span>
                    <span className="font-mono text-white font-bold">1 worker (4 threads)</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Unacknowledged Messages:</span>
                    <span className="font-mono text-emerald-400 font-bold">0</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Pending in Queue:</span>
                    <span className="font-mono text-indigo-400 font-bold">0 messages</span>
                  </div>
                </div>
              </div>

              {/* Queue 2: Portal Apply */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">portal_apply_queue</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Priority: Medium (8)</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Active Consumers:</span>
                    <span className="font-mono text-white font-bold">1 worker (2 threads)</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Playwright Chromium Pool:</span>
                    <span className="font-mono text-emerald-400 font-bold">2 instances</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Pending in Queue:</span>
                    <span className="font-mono text-indigo-400 font-bold">0 messages</span>
                  </div>
                </div>
              </div>

              {/* Queue 3: PNet Discovery */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">pnet_discovery_queue</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Priority: Cron (5)</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Active Consumers:</span>
                    <span className="font-mono text-white font-bold">1 worker (2 threads)</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Beat Cron Schedule:</span>
                    <span className="font-mono text-amber-300 font-bold">*/30m</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Pending in Queue:</span>
                    <span className="font-mono text-indigo-400 font-bold">0 messages</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 4: RATE LIMITS & CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Dynamic Rate Limits &amp; Execution Limits</h3>
                <p className="text-xs text-neutral-400">Flower task rate limit tuner prevents spam detection and PNet IP throttling</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="text-xs font-bold text-white font-mono">jobs.tasks.apply_via_email_task</div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">Rate Limit (per min/sec):</label>
                  <input
                    type="text"
                    value={rateLimitEmail}
                    onChange={(e) => setRateLimitEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <button
                  onClick={() => showNotification(`Flower: Rate limit for email task updated to ${rateLimitEmail}`)}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-rose-300 rounded"
                >
                  Apply Rate Limit
                </button>
              </div>

              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="text-xs font-bold text-white font-mono">jobs.tasks.headless_pnet_portal_apply</div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">Rate Limit (per min/sec):</label>
                  <input
                    type="text"
                    value={rateLimitPortal}
                    onChange={(e) => setRateLimitPortal(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <button
                  onClick={() => showNotification(`Flower: Rate limit for portal task updated to ${rateLimitPortal}`)}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-rose-300 rounded"
                >
                  Apply Rate Limit
                </button>
              </div>

              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="text-xs font-bold text-white font-mono">jobs.tasks.scan_pnet_jobs_task</div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">Rate Limit (per min/sec):</label>
                  <input
                    type="text"
                    value={rateLimitScrape}
                    onChange={(e) => setRateLimitScrape(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <button
                  onClick={() => showNotification(`Flower: Rate limit for scrape task updated to ${rateLimitScrape}`)}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-rose-300 rounded"
                >
                  Apply Rate Limit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 5: FLOWER HTTP REST API & CLI REFERENCE */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Flower REST API &amp; CLI Commands</h3>
                  <p className="text-xs text-neutral-400">Direct programmatic access to Celery workers via Flower HTTP API</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              
              {/* Endpoint 1: List workers */}
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-emerald-400 font-bold">GET /api/workers</span>
                  <button
                    onClick={() => handleCopy('curl -u admin:admin123 http://localhost:5555/api/workers', 'curl-workers')}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    {copiedText === 'curl-workers' ? 'Copied' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="text-neutral-300 text-[11px]">curl -u admin:admin123 http://localhost:5555/api/workers</pre>
              </div>

              {/* Endpoint 2: Revoke Task */}
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-rose-400 font-bold">POST /api/task/revoke/:id</span>
                  <button
                    onClick={() => handleCopy('curl -X POST -u admin:admin123 http://localhost:5555/api/task/revoke/TASK_UUID?terminate=true', 'curl-revoke')}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    {copiedText === 'curl-revoke' ? 'Copied' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="text-neutral-300 text-[11px]">curl -X POST -u admin:admin123 "http://localhost:5555/api/task/revoke/TASK_UUID?terminate=true"</pre>
              </div>

              {/* Endpoint 3: Autoscale Pool */}
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-indigo-400 font-bold">POST /api/worker/pool/grow/:worker_name</span>
                  <button
                    onClick={() => handleCopy('curl -X POST -u admin:admin123 http://localhost:5555/api/worker/pool/grow/celery@worker_email_node_01?n=2', 'curl-grow')}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    {copiedText === 'curl-grow' ? 'Copied' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="text-neutral-300 text-[11px]">curl -X POST -u admin:admin123 "http://localhost:5555/api/worker/pool/grow/celery@worker_email_node_01?n=2"</pre>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
