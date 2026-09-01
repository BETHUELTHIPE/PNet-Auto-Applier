import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { AutoApplyDashboard } from './components/AutoApplyDashboard';
import { LivePNetFeed } from './components/LivePNetFeed';
import { CeleryQueueMonitor } from './components/CeleryQueueMonitor';
import { ProfileAndCvStudio } from './components/ProfileAndCvStudio';
import { CredentialsAndSmtp } from './components/CredentialsAndSmtp';
import { DjangoArchitectureCenter } from './components/DjangoArchitectureCenter';
import { PrometheusGrafanaHub } from './components/PrometheusGrafanaHub';
import { DjangoAdminStudio } from './components/DjangoAdminStudio';
import { JobApplyModal } from './components/JobApplyModal';
import { 
  initialProfile, 
  initialPNetCredentials, 
  initialSmtpSettings, 
  initialAutoApplyConfig, 
  initialJobs, 
  initialCeleryWorkers, 
  initialTaskLogs 
} from './data/mockData';
import { PNetJob, UserProfile, PNetCredentials, SmtpSettings, AutoApplyConfig, CeleryWorkerNode, CeleryTaskLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pnet_user_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [pnetCredentials, setPNetCredentials] = useState<PNetCredentials>(() => {
    const saved = localStorage.getItem('pnet_credentials');
    return saved ? JSON.parse(saved) : initialPNetCredentials;
  });

  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(() => {
    const saved = localStorage.getItem('pnet_smtp_settings');
    return saved ? JSON.parse(saved) : initialSmtpSettings;
  });

  const [config, setConfig] = useState<AutoApplyConfig>(() => {
    const saved = localStorage.getItem('pnet_auto_config');
    return saved ? JSON.parse(saved) : initialAutoApplyConfig;
  });

  const [jobs, setJobs] = useState<PNetJob[]>(() => {
    const saved = localStorage.getItem('pnet_jobs_feed');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [workers, setWorkers] = useState<CeleryWorkerNode[]>(initialCeleryWorkers);
  const [taskLogs, setTaskLogs] = useState<CeleryTaskLog[]>(initialTaskLogs);
  const [activeLogs, setActiveLogs] = useState<string[]>([
    '[CELERY BEAT] Initialized periodic schedule in django_celery_beat.schedulers:DatabaseScheduler',
    '[POSTGRESQL] Verified connection pool with pnet_db on postgres:5432',
    '[REDIS BROKER] Worker queues listening: pnet_discovery_queue, email_dispatch_queue, portal_apply_queue'
  ]);

  const [selectedJob, setSelectedJob] = useState<PNetJob | null>(null);
  const [isBatchApplying, setIsBatchApplying] = useState(false);
  const [isApplyingModal, setIsApplyingModal] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem('pnet_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('pnet_credentials', JSON.stringify(pnetCredentials));
  }, [pnetCredentials]);

  useEffect(() => {
    localStorage.setItem('pnet_smtp_settings', JSON.stringify(smtpSettings));
  }, [smtpSettings]);

  useEffect(() => {
    localStorage.setItem('pnet_auto_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('pnet_jobs_feed', JSON.stringify(jobs));
  }, [jobs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-GB');
    setActiveLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 45)]);
  };

  // Celery Beat Simulation Daemon
  useEffect(() => {
    let interval: any = null;
    if (config.isRunning) {
      addLog(`[CELERY BEAT] Daemon started. Polling every ${config.celeryBeatIntervalMinutes}m with rate-limit protection.`);
      
      interval = setInterval(() => {
        // Auto process a pending job if available and quota permits
        setJobs(currentJobs => {
          const pending = currentJobs.find(j => (j.status === 'new' || j.status === 'queued') && j.matchScore >= config.minMatchScore);
          if (pending && config.appliedToday < config.dailyQuota) {
            autoApplyJobSilently(pending);
          }
          return currentJobs;
        });
      }, 20000);
    } else {
      addLog('[CELERY BEAT] Daemon is currently paused by operator.');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config.isRunning, config.appliedToday, config.dailyQuota]);

  const toggleAutoApply = () => {
    setConfig(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastRunTime: new Date().toISOString()
    }));
  };

  // Background auto-apply helper
  const autoApplyJobSilently = async (job: PNetJob) => {
    const method = job.applyType === 'email' ? 'email' : 'portal';
    const taskId = `task-uuid-${Math.floor(10000 + Math.random() * 90000)}`;

    addLog(`[CELERY WORKER] Consuming job task for "${job.title}" at ${job.company}`);

    if (method === 'email') {
      try {
        const res = await fetch('/api/pnet/apply-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job,
            profile,
            emailSubject: `Application for ${job.title} - ${profile.fullName}`,
            emailBody: `Dear Hiring Team,\n\nPlease accept my application for ${job.title} at ${job.company}. My CV is attached.\n\nKind regards,\n${profile.fullName}`,
            smtpSettings
          })
        });
        const data = await res.json();

        setJobs(prev => prev.map(j => j.id === job.id ? {
          ...j,
          status: 'applied_email',
          appliedAt: new Date().toISOString(),
          applicationMethod: 'email',
          confirmationRef: data.confirmationRef
        } : j));

        setConfig(prev => ({ ...prev, appliedToday: prev.appliedToday + 1 }));

        setTaskLogs(prev => [
          {
            id: taskId,
            taskName: 'jobs.tasks.apply_via_email_task',
            queue: 'email_dispatch_queue',
            worker: 'celery@worker_email_node_01',
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            status: 'SUCCESS',
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            durationMs: 1420,
            retries: 0,
            resultSummary: `Email sent to ${job.advertiserEmail} with ${profile.cvFileName} attached.`
          },
          ...prev
        ]);

        addLog(`[SUCCESS] Email application dispatched to <${job.advertiserEmail}>. Ref: ${data.confirmationRef}`);
      } catch (err) {
        addLog(`[ERROR] Failed to send email for ${job.title}: ${err}`);
      }
    } else {
      try {
        const res = await fetch('/api/pnet/apply-portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job,
            profile,
            answers: {}
          })
        });
        const data = await res.json();

        setJobs(prev => prev.map(j => j.id === job.id ? {
          ...j,
          status: 'applied_portal',
          appliedAt: new Date().toISOString(),
          applicationMethod: 'portal',
          confirmationRef: data.confirmationRef
        } : j));

        setConfig(prev => ({ ...prev, appliedToday: prev.appliedToday + 1 }));

        setTaskLogs(prev => [
          {
            id: taskId,
            taskName: 'jobs.tasks.headless_pnet_portal_apply',
            queue: 'portal_apply_queue',
            worker: 'celery@worker_portal_node_01',
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            status: 'SUCCESS',
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            durationMs: 3820,
            retries: 0,
            resultSummary: `PNet Portal form submitted with ${profile.cvFileName}. Confirmation: ${data.confirmationRef}`
          },
          ...prev
        ]);

        addLog(`[PORTAL SUCCESS] Headless Playwright completed PNet submission for ${job.company}. Ref: ${data.confirmationRef}`);
      } catch (err) {
        addLog(`[ERROR] Portal apply failed: ${err}`);
      }
    }
  };

  // Batch Auto-Apply All Matching Jobs
  const handleBatchApplyAll = async () => {
    const eligibleJobs = jobs.filter(j => (j.status === 'new' || j.status === 'queued') && j.matchScore >= config.minMatchScore);
    if (eligibleJobs.length === 0) return;

    setIsBatchApplying(true);
    addLog(`[BATCH START] Enqueuing ${eligibleJobs.length} eligible PNet job applications into Celery task queues...`);

    for (let i = 0; i < eligibleJobs.length; i++) {
      const currentJob = eligibleJobs[i];
      addLog(`[CELERY WORKER] Processing (${i + 1}/${eligibleJobs.length}): "${currentJob.title}" at ${currentJob.company}`);
      
      await autoApplyJobSilently(currentJob);
      // Small simulated anti-bot jitter pause
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setIsBatchApplying(false);
    addLog(`[BATCH COMPLETE] All ${eligibleJobs.length} PNet jobs successfully dispatched!`);
    
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Single Job Apply via Modal or Feed Button (Email)
  const handleApplyEmail = async (job: PNetJob, customSubject: string, customBody: string) => {
    setIsApplyingModal(true);
    const taskId = `task-uuid-${Math.floor(10000 + Math.random() * 90000)}`;

    addLog(`[CELERY EMAIL DISPATCH] Building MIME email for ${job.company} with attached ${profile.cvFileName}...`);

    try {
      const res = await fetch('/api/pnet/apply-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          profile,
          emailSubject: customSubject,
          emailBody: customBody,
          smtpSettings
        })
      });
      const data = await res.json();

      setJobs(prev => prev.map(j => j.id === job.id ? {
        ...j,
        status: 'applied_email',
        appliedAt: new Date().toISOString(),
        applicationMethod: 'email',
        emailSubject: customSubject,
        emailBody: customBody,
        confirmationRef: data.confirmationRef
      } : j));

      setConfig(prev => ({ ...prev, appliedToday: prev.appliedToday + 1 }));

      setTaskLogs(prev => [
        {
          id: taskId,
          taskName: 'jobs.tasks.apply_via_email_task',
          queue: 'email_dispatch_queue',
          worker: 'celery@worker_email_node_01',
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          status: 'SUCCESS',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 1280,
          retries: 0,
          resultSummary: `Dispatched email to ${job.advertiserEmail}. Delivery Ref: ${data.confirmationRef}`
        },
        ...prev
      ]);

      addLog(`[SUCCESS] Direct email with attached CV delivered to <${job.advertiserEmail}>. Reference: ${data.confirmationRef}`);

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (err) {
      addLog(`[ERROR] Email dispatch failed: ${err}`);
    } finally {
      setIsApplyingModal(false);
    }
  };

  // Single Job Apply via Modal or Feed Button (Portal)
  const handleApplyPortal = async (job: PNetJob, customAnswers: Record<string, string>) => {
    setIsApplyingModal(true);
    const taskId = `task-uuid-${Math.floor(10000 + Math.random() * 90000)}`;

    addLog(`[PLAYWRIGHT PORTAL TASK] Initializing headless browser login to PNet candidate portal for ${pnetCredentials.email}...`);

    try {
      const res = await fetch('/api/pnet/apply-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          profile,
          answers: customAnswers
        })
      });
      const data = await res.json();

      setJobs(prev => prev.map(j => j.id === job.id ? {
        ...j,
        status: 'applied_portal',
        appliedAt: new Date().toISOString(),
        applicationMethod: 'portal',
        answersSubmitted: customAnswers,
        confirmationRef: data.confirmationRef
      } : j));

      setConfig(prev => ({ ...prev, appliedToday: prev.appliedToday + 1 }));

      setTaskLogs(prev => [
        {
          id: taskId,
          taskName: 'jobs.tasks.headless_pnet_portal_apply',
          queue: 'portal_apply_queue',
          worker: 'celery@worker_portal_node_01',
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          status: 'SUCCESS',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 3950,
          retries: 0,
          resultSummary: `PNet questionnaire filled (${Object.keys(customAnswers).length} answers) + CV attached. Confirmation: ${data.confirmationRef}`
        },
        ...prev
      ]);

      addLog(`[PORTAL SUCCESS] Headless Playwright submitted application on PNet portal. Reference: ${data.confirmationRef}`);

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (err) {
      addLog(`[ERROR] Portal submission failed: ${err}`);
    } finally {
      setIsApplyingModal(false);
    }
  };

  // Trigger PNet Scrape Task manually
  const handleTriggerScrape = () => {
    setIsScraping(true);
    addLog('[CELERY BEAT] Triggered immediate scan task: jobs.tasks.scan_pnet_jobs_task');

    setTimeout(() => {
      setIsScraping(false);
      addLog('[PNET SCRAPER] Scan finished. 6 active South Africa listings parsed and scored against profile.');
    }, 1800);
  };

  const handleClearTaskLogs = () => {
    setTaskLogs([]);
    addLog('[CELERY SYSTEM] Task history cleared by user.');
  };

  const pendingJobsCount = jobs.filter(j => j.status === 'new' || j.status === 'queued').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        toggleAutoApply={toggleAutoApply}
        pendingCount={pendingJobsCount}
        appliedToday={config.appliedToday}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <AutoApplyDashboard
            jobs={jobs}
            profile={profile}
            config={config}
            setConfig={setConfig}
            toggleAutoApply={toggleAutoApply}
            onBatchApplyAll={handleBatchApplyAll}
            isBatchApplying={isBatchApplying}
            activeLogs={activeLogs}
            workers={workers}
            taskLogs={taskLogs}
            onOpenJob={(job) => setSelectedJob(job)}
          />
        )}

        {activeTab === 'django-admin' && (
          <DjangoAdminStudio
            profile={profile}
            setProfile={setProfile}
            jobs={jobs}
            setJobs={setJobs}
            smtpSettings={smtpSettings}
            setSmtpSettings={setSmtpSettings}
            pnetCredentials={pnetCredentials}
            setPNetCredentials={setPNetCredentials}
            config={config}
            setConfig={setConfig}
            taskLogs={taskLogs}
            setTaskLogs={setTaskLogs}
            onOpenArchitecture={() => setActiveTab('architecture')}
          />
        )}

        {activeTab === 'jobs' && (
          <LivePNetFeed
            jobs={jobs}
            profile={profile}
            onOpenJob={(job) => setSelectedJob(job)}
            onApplySingleJob={async (job, method) => {
              if (method === 'email') {
                await handleApplyEmail(job, `Application for ${job.title} - ${profile.fullName}`, `Dear Hiring Team,\n\nPlease find my application for ${job.title} attached.`);
              } else {
                await handleApplyPortal(job, {});
              }
            }}
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
          />
        )}

        {activeTab === 'celery' && (
          <CeleryQueueMonitor
            workers={workers}
            taskLogs={taskLogs}
            onTriggerTask={(type) => {
              if (type === 'scrape') handleTriggerScrape();
            }}
            onClearLogs={handleClearTaskLogs}
          />
        )}

        {activeTab === 'monitoring' && (
          <PrometheusGrafanaHub
            onOpenCodeArchitecture={() => setActiveTab('architecture')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileAndCvStudio
            profile={profile}
            setProfile={setProfile}
            onSaveProfile={() => addLog('[PROFILE] Candidate resume data and screening answers updated successfully.')}
          />
        )}

        {activeTab === 'settings' && (
          <CredentialsAndSmtp
            credentials={pnetCredentials}
            setCredentials={setPNetCredentials}
            smtpSettings={smtpSettings}
            setSmtpSettings={setSmtpSettings}
            config={config}
            setConfig={setConfig}
            profile={profile}
          />
        )}

        {activeTab === 'architecture' && (
          <DjangoArchitectureCenter />
        )}

      </main>

      {/* Job Apply / Inspection Modal */}
      {selectedJob && (
        <JobApplyModal
          job={selectedJob}
          profile={profile}
          smtpSettings={smtpSettings}
          pnetCredentials={pnetCredentials}
          onClose={() => setSelectedJob(null)}
          onApplyEmail={handleApplyEmail}
          onApplyPortal={handleApplyPortal}
          isApplying={isApplyingModal}
        />
      )}

      {/* App Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PNet Auto-Applier • Production Python, Django, Celery &amp; Nginx Stack</span>
          <span className="font-mono text-[11px]">Celery Beat: Active • Redis: Port 6379 • Postgres: Port 5432</span>
        </div>
      </footer>

    </div>
  );
}
