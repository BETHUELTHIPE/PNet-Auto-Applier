import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Clock, 
  Send, 
  Terminal, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { PNetJob, UserProfile, AutoApplyConfig, CeleryWorkerNode, CeleryTaskLog } from '../types';

interface AutoApplyDashboardProps {
  jobs: PNetJob[];
  profile: UserProfile;
  config: AutoApplyConfig;
  setConfig: React.Dispatch<React.SetStateAction<AutoApplyConfig>>;
  toggleAutoApply: () => void;
  onBatchApplyAll: () => Promise<void>;
  isBatchApplying: boolean;
  activeLogs: string[];
  workers: CeleryWorkerNode[];
  taskLogs: CeleryTaskLog[];
  onOpenJob: (job: PNetJob) => void;
}

export const AutoApplyDashboard: React.FC<AutoApplyDashboardProps> = ({
  jobs,
  profile,
  config,
  setConfig,
  toggleAutoApply,
  onBatchApplyAll,
  isBatchApplying,
  activeLogs,
  workers,
  taskLogs,
  onOpenJob
}) => {
  const newJobs = jobs.filter(j => j.status === 'new' || j.status === 'queued');
  const appliedEmailJobs = jobs.filter(j => j.status === 'applied_email');
  const appliedPortalJobs = jobs.filter(j => j.status === 'applied_portal');
  const totalApplied = appliedEmailJobs.length + appliedPortalJobs.length;

  const emailEligibleCount = newJobs.filter(j => j.applyType === 'email' || j.applyType === 'both').length;
  const portalEligibleCount = newJobs.filter(j => j.applyType === 'portal' || j.applyType === 'both').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / System Status Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Hero Content */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className={`w-2 h-2 rounded-full ${config.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
              <span>{config.isRunning ? 'Auto-Apply Daemon Active (Celery Beat Running)' : 'Auto-Apply Daemon Standby'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              PNet South Africa Auto-Apply Pipeline
            </h1>
            
            <p className="text-sm text-neutral-300 leading-relaxed">
              Automated dual-channel application engine for <strong className="text-indigo-400">PNet.co.za</strong>. Automatically sends emails with your attached CV to job poster email addresses, or logs into your PNet candidate portal, auto-completes screening forms, and submits your application with Celery worker task queues.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/60 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CV: <strong className="text-white font-mono">{profile.cvFileName}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/60 text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Anti-Bot Jitter: <span className="font-mono text-white">{config.jitterDelayMinSeconds}s - {config.jitterDelayMaxSeconds}s</span>
              </span>
              <span className="flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/60 text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Gemini 3.7 Cover Letter Tailoring
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              id="dashboard-batch-apply-btn"
              onClick={onBatchApplyAll}
              disabled={isBatchApplying || newJobs.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-600/25 active:scale-[0.98]"
            >
              {isBatchApplying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Celery Tasks...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Auto-Apply All Matching Jobs ({newJobs.length})</span>
                </>
              )}
            </button>

            <button
              id="dashboard-toggle-daemon-btn"
              onClick={toggleAutoApply}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all border ${
                config.isRunning
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700/70'
              }`}
            >
              {config.isRunning ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Pause Background Celery Beat</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Enable Celery Beat Daemon</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Applied */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>Total Applications Submitted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalApplied}</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {appliedEmailJobs.length} via Email • {appliedPortalJobs.length} via PNet Form
          </p>
        </div>

        {/* Metric 2: Email Direct Channel */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>Direct Email + CV Attached</span>
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{appliedEmailJobs.length}</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {emailEligibleCount} ready in queue
          </p>
        </div>

        {/* Metric 3: PNet Portal Forms Solved */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>PNet Portal Auto-Forms</span>
            <Globe className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{appliedPortalJobs.length}</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {portalEligibleCount} ready in queue
          </p>
        </div>

        {/* Metric 4: Daily Quota & Anti-Bot Status */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>Daily Rate-Limit Quota</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{config.appliedToday}</span>
            <span className="text-xs text-neutral-400 font-mono">/ {config.dailyQuota} max/day</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (config.appliedToday / config.dailyQuota) * 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Dual View: Live Terminal Stream & Pending Ready Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Terminal Activity Logs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[460px]">
            
            {/* Terminal Header */}
            <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium ml-2">
                  Celery Worker stdout / Celery Beat Daemon Log
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                LIVE STREAM
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-300 overflow-y-auto flex-1 space-y-2">
              <div className="text-neutral-500">
                [SYSTEM BOOT] Django 5.0.3 | Celery 5.3.6 | Redis 7.0 | PostgreSQL 16
              </div>
              <div className="text-neutral-500">
                [REDIS BROKER] Connected to redis://redis:6379/0 (3 worker queues online)
              </div>
              <div className="text-neutral-500">
                [CELERY BEAT] Periodic task `scan_pnet_jobs_task` active every {config.celeryBeatIntervalMinutes}m
              </div>
              
              {activeLogs.map((log, index) => {
                let colorClass = 'text-neutral-300';
                if (log.includes('[SUCCESS]') || log.includes('SUCCESS:')) colorClass = 'text-emerald-400';
                else if (log.includes('[SMTP]') || log.includes('EMAIL:')) colorClass = 'text-indigo-400';
                else if (log.includes('[PORTAL]') || log.includes('PLAYWRIGHT:')) colorClass = 'text-purple-400';
                else if (log.includes('[GEMINI]')) colorClass = 'text-indigo-300';
                else if (log.includes('[WARN]') || log.includes('JITTER')) colorClass = 'text-amber-300';
                else if (log.includes('[ERROR]')) colorClass = 'text-rose-400';

                return (
                  <div key={index} className={`leading-relaxed break-words ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
            </div>

            {/* Terminal Footer Info */}
            <div className="bg-neutral-900/90 px-4 py-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Task Queues: <code className="text-indigo-400">email_dispatch_queue</code>, <code className="text-purple-400">portal_apply_queue</code></span>
              <span className="font-mono">Rate-Limit Safe</span>
            </div>

          </div>
        </div>

        {/* Right Column: High Match PNet Jobs Ready to Apply (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg flex flex-col h-[460px]">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Discovered PNet Jobs</h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {newJobs.length} awaiting dispatch
              </span>
            </div>

            <div className="overflow-y-auto flex-1 py-2 space-y-2.5 pr-1">
              {newJobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mb-2" />
                  <p className="text-sm font-semibold text-white">All Discovered Jobs Applied!</p>
                  <p className="text-xs text-neutral-400 mt-1">Celery Beat will automatically poll PNet for new listings.</p>
                </div>
              ) : (
                newJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group"
                    onClick={() => onOpenJob(job)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-medium">
                          {job.company} • <span className="text-neutral-400">{job.location}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 font-mono">
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-800/80 text-[11px]">
                      <span className="flex items-center gap-1 text-neutral-400 font-mono">
                        {job.applyType === 'email' ? (
                          <>
                            <Mail className="w-3 h-3 text-indigo-400" />
                            <span>Direct Email Apply</span>
                          </>
                        ) : job.applyType === 'portal' ? (
                          <>
                            <Globe className="w-3 h-3 text-purple-400" />
                            <span>PNet Questionnaire</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>Dual Channel</span>
                          </>
                        )}
                      </span>

                      <button
                        id={`job-quick-apply-${job.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenJob(job);
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-indigo-600 hover:text-white text-neutral-200 font-semibold text-[10px] transition-colors"
                      >
                        Inspect & Apply →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Quick Action */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Auto-Apply Policy:</span>
              <span className="font-semibold text-indigo-400">Score &gt;= {config.minMatchScore}%</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
