import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Trash2, 
  Terminal, 
  Activity,
  Server,
  Zap,
  Flame,
  ExternalLink
} from 'lucide-react';
import { CeleryWorkerNode, CeleryTaskLog } from '../types';
import { CeleryFlowerDashboard } from './CeleryFlowerDashboard';

interface CeleryQueueMonitorProps {
  workers: CeleryWorkerNode[];
  taskLogs: CeleryTaskLog[];
  onTriggerTask: (taskType: 'scrape' | 'email' | 'portal') => void;
  onClearLogs: () => void;
  onRevokeTask?: (taskId: string) => void;
}

export const CeleryQueueMonitor: React.FC<CeleryQueueMonitorProps> = ({
  workers,
  taskLogs,
  onTriggerTask,
  onClearLogs,
  onRevokeTask
}) => {
  const [viewMode, setViewMode] = useState<'flower' | 'queues'>('flower');
  const [selectedQueueFilter, setSelectedQueueFilter] = useState('ALL');

  const filteredLogs = taskLogs.filter((log) => {
    if (selectedQueueFilter === 'ALL') return true;
    return log.queue.toLowerCase().includes(selectedQueueFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* View Switcher: Flower Real-Time Admin vs Worker Queues */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            id="view-flower-tab-btn"
            onClick={() => setViewMode('flower')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'flower'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-300" />
            <span>Flower Web Admin (Port 5555)</span>
            <span className="text-[10px] bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-400/30 font-mono">
              Live
            </span>
          </button>

          <button
            id="view-queues-tab-btn"
            onClick={() => setViewMode('queues')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'queues'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-300" />
            <span>Celery Nodes &amp; Tasks Overview</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Broker: <strong className="text-white">redis://redis:6379/0</strong></span>
        </div>
      </div>

      {/* Render Flower Dashboard if viewMode === 'flower' */}
      {viewMode === 'flower' ? (
        <CeleryFlowerDashboard
          workers={workers}
          taskLogs={taskLogs}
          onTriggerTask={onTriggerTask}
          onRevokeTask={onRevokeTask}
        />
      ) : (
        <>
          {/* Topology / Infrastructure Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Node 1: Redis Broker */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-rose-400" />
                  Redis Message Broker
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE (Port 6379)
                </span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                redis://redis:6379/0
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Queues: <strong className="text-neutral-200">3 active</strong></span>
                <span>Memory: <strong className="text-indigo-400 font-mono">14.2 MB</strong></span>
              </div>
            </div>

            {/* Node 2: Celery Beat Scheduler */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Celery Beat Scheduler
                </span>
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  CRON ACTIVE
                </span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                DatabaseScheduler
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Next Tick: <strong className="text-amber-300 font-mono">in 14m 20s</strong></span>
                <span>Interval: <strong className="text-neutral-200 font-mono">*/30m</strong></span>
              </div>
            </div>

            {/* Node 3: PostgreSQL Database */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  PostgreSQL 16 DB
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  CONNECTED
                </span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                pnet_db (Port 5432)
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Schema: <strong className="text-neutral-200 font-mono">django-db backend</strong></span>
                <span>Pool: <strong className="text-indigo-400 font-mono">10 Conns</strong></span>
              </div>
            </div>

          </div>

          {/* Celery Worker Nodes Grid */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Active Celery Worker Nodes</h3>
                  <p className="text-xs text-neutral-400">Distributed task consumers running behind Gunicorn &amp; Redis</p>
                </div>
              </div>

              {/* Quick Manual Task Triggers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTriggerTask('scrape')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current text-indigo-400" />
                  <span>Queue PNet Scrape Task</span>
                </button>
              </div>
            </div>

            {/* Worker Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <div key={worker.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{worker.name}</h4>
                      <span className="text-[10px] text-neutral-400 font-mono">{worker.queue}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {worker.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center">
                    <div className="p-2 bg-neutral-900 rounded-lg">
                      <div className="text-[10px] text-neutral-400 uppercase">Concurrency</div>
                      <div className="text-xs font-bold text-white font-mono">{worker.concurrency}</div>
                    </div>
                    <div className="p-2 bg-neutral-900 rounded-lg">
                      <div className="text-[10px] text-neutral-400 uppercase">Processed</div>
                      <div className="text-xs font-bold text-indigo-400 font-mono">{worker.totalProcessed}</div>
                    </div>
                    <div className="p-2 bg-neutral-900 rounded-lg">
                      <div className="text-[10px] text-neutral-400 uppercase">Active</div>
                      <div className="text-xs font-bold text-white font-mono">{worker.activeTasksCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Uptime: <strong className="text-neutral-300 font-mono">{worker.uptime}</strong></span>
                    <span>Heartbeat: <strong className="text-emerald-400 font-mono">{worker.lastHeartbeat}</strong></span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Live Celery Tasks Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg space-y-0">
            
            {/* Table Header Controls */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Celery Task Execution History</h3>
                <span className="text-xs text-neutral-400 font-mono">({filteredLogs.length} records)</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter by Queue */}
                <select
                  value={selectedQueueFilter}
                  onChange={(e) => setSelectedQueueFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Queues</option>
                  <option value="email">email_dispatch_queue</option>
                  <option value="portal">portal_apply_queue</option>
                  <option value="discovery">pnet_discovery_queue</option>
                </select>

                <button
                  onClick={onClearLogs}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                  title="Clear task logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Task ID</th>
                    <th className="py-3 px-4">Task Name &amp; Queue</th>
                    <th className="py-3 px-4">Target Job / Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Result Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500">
                        No task execution records matching selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                          {log.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono text-[11px]">{log.taskName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{log.queue}</div>
                        </td>
                        <td className="py-3 px-4">
                          {log.jobTitle ? (
                            <div>
                              <div className="font-semibold text-neutral-200">{log.jobTitle}</div>
                              <div className="text-[11px] text-neutral-400">{log.company}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 font-mono">Routine Periodic Scan</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            log.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : log.status === 'STARTED'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-300">
                          {log.durationMs ? `${log.durationMs}ms` : '—'}
                        </td>
                        <td className="py-3 px-4 text-neutral-300 max-w-xs truncate font-sans text-xs">
                          {log.resultSummary || log.error || 'Running in background worker...'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
