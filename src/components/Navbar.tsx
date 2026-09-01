import React from 'react';
import { 
  Bot, 
  Briefcase, 
  Cpu, 
  FileText, 
  Key, 
  Code2, 
  Play, 
  Square, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Activity, 
  Shield,
  Fingerprint,
  UserCheck
} from 'lucide-react';
import { AutoApplyConfig, AuthUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: AutoApplyConfig;
  toggleAutoApply: () => void;
  pendingCount: number;
  appliedToday: number;
  currentUser: AuthUser | null;
  onOpenWorkflow: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  toggleAutoApply,
  pendingCount,
  appliedToday,
  currentUser,
  onOpenWorkflow
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Auto-Apply Hub', icon: Bot },
    { id: 'workflow', label: 'Workflow (Auth & Verify)', icon: Fingerprint, badge: currentUser?.isVerified ? 'Verified' : 'Step 1-2', highlightColor: 'emerald' },
    { id: 'django-admin', label: 'Django Admin CMS', icon: Shield, badge: 'Models & CVs', highlightColor: 'teal' },
    { id: 'jobs', label: 'PNet Job Scanner', icon: Briefcase, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'celery', label: 'Celery & Flower Admin', icon: Cpu, badge: '5555' },
    { id: 'monitoring', label: 'Prometheus & Grafana', icon: Activity, badge: 'Live' },
    { id: 'profile', label: 'CV & Candidate Profile', icon: FileText },
    { id: 'settings', label: 'PNet & SMTP Config', icon: Key },
    { id: 'architecture', label: 'Docker & Django Stack', icon: Code2, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-950/40 text-white font-bold text-lg ring-1 ring-indigo-400/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  PNet <span className="text-indigo-400 font-semibold">Auto-Applier</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Docker Stack
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono hidden sm:block">
                Django • Celery • Flower • Prometheus • Grafana • Redis • Postgres • Nginx
              </p>
            </div>
          </div>

          {/* Center Automation Quick Controls */}
          <div className="hidden lg:flex items-center gap-4 bg-neutral-950/60 px-3.5 py-1.5 rounded-full border border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${config.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span className="text-neutral-300 font-medium">
                Celery Beat: <span className="font-mono text-indigo-400">{config.isRunning ? 'Every 30m' : 'Paused'}</span>
              </span>
            </div>
            <div className="w-px h-3.5 bg-neutral-800" />
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400">
                Applied Today: <strong className="text-white font-mono">{appliedToday}/{config.dailyQuota}</strong>
              </span>
            </div>
            <div className="w-px h-3.5 bg-neutral-800" />
            <button
              id="header-toggle-daemon-btn"
              onClick={toggleAutoApply}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                config.isRunning
                  ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
              }`}
            >
              {config.isRunning ? (
                <>
                  <Square className="w-3 h-3 fill-current" /> Pause Daemon
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> Start Daemon
                </>
              )}
            </button>
          </div>

          {/* Right Action: Verified Candidate Status & Workflow Trigger */}
          <div className="flex items-center gap-2.5">
            {currentUser?.isVerified ? (
              <button
                type="button"
                onClick={onOpenWorkflow}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all text-left"
                title="Click to view Workflow details"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  ✓
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white max-w-[130px] truncate">{currentUser.fullName}</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-mono">Verified</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[140px]">{currentUser.email}</div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenWorkflow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>1) Register & 2) Log In</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini 3.7</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-1 border-t border-neutral-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors relative ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.badge === 'Live' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : tab.badge === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && (
                  <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Code
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

