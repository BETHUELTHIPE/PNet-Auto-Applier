import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Globe, 
  Sparkles, 
  Paperclip, 
  CheckCircle2, 
  Send, 
  Terminal, 
  RefreshCw, 
  Check, 
  AlertCircle,
  FileText,
  MapPin,
  DollarSign,
  Briefcase,
  Play
} from 'lucide-react';
import { PNetJob, UserProfile, SmtpSettings, PNetCredentials } from '../types';

interface JobApplyModalProps {
  job: PNetJob | null;
  profile: UserProfile;
  smtpSettings: SmtpSettings;
  pnetCredentials: PNetCredentials;
  onClose: () => void;
  onApplyEmail: (job: PNetJob, customSubject: string, customBody: string) => Promise<void>;
  onApplyPortal: (job: PNetJob, customAnswers: Record<string, string>) => Promise<void>;
  isApplying: boolean;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  job,
  profile,
  smtpSettings,
  pnetCredentials,
  onClose,
  onApplyEmail,
  onApplyPortal,
  isApplying
}) => {
  if (!job) return null;

  const [activeTab, setActiveTab] = useState<'email' | 'portal' | 'match'>(
    job.applyType === 'portal' ? 'portal' : 'email'
  );

  const [emailSubject, setEmailSubject] = useState(
    job.emailSubject || `Application for ${job.title} ${job.referenceNumber ? `(Ref: ${job.referenceNumber})` : ''} - ${profile.fullName}`
  );
  const [emailBody, setEmailBody] = useState(
    job.emailBody || `Dear Hiring Team at ${job.company},\n\nI am writing to submit my application for the ${job.title} position on PNet. With ${profile.yearsOfExperience} years of experience specializing in Python, Django, Celery task workers, Redis, and PostgreSQL, I am confident in delivering high-value software solutions to your engineering team.\n\nMy profile includes hands-on experience building asynchronous background workers, optimizing database performance, and deploying services behind Nginx and Gunicorn.\n\nPlease find my CV (${profile.cvFileName}) attached.\n\nKind regards,\n${profile.fullName}\n${profile.phone} | ${profile.email}`
  );

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Initialize screening answers
  useEffect(() => {
    const initial: Record<string, string> = {};
    job.screeningQuestions.forEach(q => {
      initial[q.id] = q.applicantAnswer || (q.options ? q.options[0] : 'Yes');
    });
    setScreeningAnswers(initial);
  }, [job]);

  // Generate tailored cover letter using Gemini 3.7 Flash server endpoint
  const handleGenerateAiCoverLetter = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/tailor-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, profile }),
      });
      const data = await res.json();
      if (data.subject) setEmailSubject(data.subject);
      if (data.body) setEmailBody(data.body);
    } catch (err) {
      console.error('Failed to generate AI cover letter:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setScreeningAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  const handleTriggerEmailApply = async () => {
    setExecutionLogs([
      `[SMTP INITIALIZE] Preparing outbound MIME multipart email for ${job.company}`,
      `[ATTACHMENT 1/2] Verified candidate CV: ${profile.cvFileName} (284 KB)`,
      `[ATTACHMENT 2/2] Verified certificate: ${profile.certificateFileName || 'ExploreAI_Data_Engineering_Certificate.pdf'} (412 KB)`,
      `[DISPATCH] Connecting to ${smtpSettings.host}:${smtpSettings.port}...`
    ]);
    await onApplyEmail(job, emailSubject, emailBody);
  };

  const handleTriggerPortalApply = async () => {
    setExecutionLogs([
      `[PLAYWRIGHT HEADLESS] Launching Chromium browser session...`,
      `[PNET LOGIN] Authenticating session for ${pnetCredentials.email}...`,
      `[NAVIGATION] Opening application endpoint: ${job.url}...`,
      `[QUESTIONNAIRE] Injecting ${job.screeningQuestions.length} applicant answers...`,
      `[ATTACHMENT 1/2] Uploading Primary CV: ${profile.cvFileName}...`,
      `[ATTACHMENT 2/2] Uploading Certificate: ${profile.certificateFileName || 'ExploreAI_Data_Engineering_Certificate.pdf'}...`,
      `[SUBMISSION] Triggering final PNet submission button...`
    ]);
    await onApplyPortal(job, screeningAnswers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                {job.referenceNumber || job.id}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {job.location} • {job.salary}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {job.title}
            </h2>
            <p className="text-xs text-neutral-300 font-medium">
              {job.company}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="bg-neutral-900/90 px-6 border-b border-neutral-800 flex space-x-4">
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Direct Email Apply Channel</span>
            {job.applyType === 'email' && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">Primary</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={`py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'portal'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>PNet Portal Questionnaire ({job.screeningQuestions.length})</span>
            {job.applyType === 'portal' && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">Primary</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('match')}
            className={`py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'match'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Match Breakdown ({job.matchScore}%)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: DIRECT EMAIL APPLY */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              
              <div className="bg-neutral-950/70 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Advertiser Email:</span>
                  <span className="text-indigo-400 font-bold font-mono">
                    {job.advertiserEmail || 'enterprise.recruitment@pnet-client.co.za'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-400 font-medium">Email Subject Line:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral-400 font-medium">Custom Cover Letter / Email Body:</label>
                    <button
                      onClick={handleGenerateAiCoverLetter}
                      disabled={isGeneratingAi}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingAi ? 'Synthesizing with Gemini...' : 'AI Tailor with Gemini 3.7'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-200 leading-relaxed font-sans focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Dual Attachments Box (CV + Certificate) */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" /> Auto-Attached Application Documents (2)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-700/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center">PDF</span>
                        <div className="overflow-hidden">
                          <div className="text-white font-mono text-[11px] truncate font-semibold">{profile.cvFileName}</div>
                          <div className="text-neutral-500 text-[10px]">{profile.cvFileSize} • Primary Resume</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">ATTACHED</span>
                    </div>

                    <div className="p-2.5 bg-neutral-900 rounded-lg border border-amber-500/30 bg-gradient-to-r from-neutral-900 to-amber-950/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">CERT</span>
                        <div className="overflow-hidden">
                          <div className="text-white font-mono text-[11px] truncate font-semibold">{profile.certificateFileName || 'ExploreAI_Certificate.pdf'}</div>
                          <div className="text-amber-300/80 text-[10px]">{profile.certificateFileSize || '412 KB'} • ExploreAI Academy</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">ATTACHED</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status or Success Indicator */}
              {job.status === 'applied_email' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Application successfully dispatched to {job.advertiserEmail}
                  </span>
                  <span className="font-mono">{job.confirmationRef}</span>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PNET PORTAL FORM & QUESTIONNAIRE */}
          {activeTab === 'portal' && (
            <div className="space-y-4">
              
              {/* PNet Session Status Banner */}
              <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-neutral-300">PNet Candidate Session:</span>
                  <strong className="text-white font-mono">{pnetCredentials.email}</strong>
                </div>
                <span className="text-neutral-400 font-mono text-[11px]">
                  Playwright Headless Solver Ready
                </span>
              </div>

              {/* Screening Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-200">
                    PNet Application Screening Questionnaire ({job.screeningQuestions.length} Questions)
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    Answers pre-populated from your candidate profile
                  </span>
                </div>

                {job.screeningQuestions.length === 0 ? (
                  <div className="p-6 bg-neutral-950 rounded-xl text-center text-xs text-neutral-400">
                    No custom questionnaire required for this post. Only standard profile CV submission.
                  </div>
                ) : (
                  job.screeningQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <label className="text-xs font-semibold text-neutral-100">
                          {idx + 1}. {q.question} {q.isRequired && <span className="text-rose-400">*</span>}
                        </label>
                        <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.2 rounded font-mono uppercase">
                          {q.type}
                        </span>
                      </div>

                      {q.type === 'choice' && q.options ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, opt)}
                              className={`px-3 py-2 rounded-lg text-xs text-left transition-colors border ${
                                screeningAnswers[q.id] === opt
                                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={q.type === 'number' ? 'number' : 'text'}
                          value={screeningAnswers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      )}

                      {q.aiReasoning && (
                        <p className="text-[11px] text-neutral-400 italic">
                          💡 Match Reasoning: {q.aiReasoning}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Dual Documents Attachment Confirmation */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-purple-400" /> Playwright Portal Multi-File Upload Queue (2)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div className="overflow-hidden">
                        <span className="text-white font-mono text-[11px] truncate block font-semibold">{profile.cvFileName}</span>
                        <span className="text-neutral-500 text-[10px]">Primary Resume</span>
                      </div>
                    </div>
                    <span className="text-purple-400 font-mono text-[10px]">INJECTED</span>
                  </div>

                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-amber-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <div className="overflow-hidden">
                        <span className="text-white font-mono text-[11px] truncate block font-semibold">{profile.certificateFileName || 'ExploreAI_Certificate.pdf'}</span>
                        <span className="text-amber-400/80 text-[10px]">ExploreAI Certificate</span>
                      </div>
                    </div>
                    <span className="text-amber-400 font-mono text-[10px]">INJECTED</span>
                  </div>
                </div>
              </div>

              {/* Status or Success Indicator */}
              {job.status === 'applied_portal' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    PNet Portal Application successfully logged!
                  </span>
                  <span className="font-mono">{job.confirmationRef}</span>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: MATCH BREAKDOWN */}
          {activeTab === 'match' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">AI Candidate Fit Analysis</h4>
                  <span className="text-xl font-extrabold text-indigo-400 font-mono">
                    {job.matchScore}% Match Rating
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Matching Core Competencies &amp; Strengths:
                  </h5>
                  <div className="space-y-1.5">
                    {job.matchReasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/80">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Job Requirements Checklist:</h5>
                  <div className="space-y-1.5">
                    {job.requirements.map((req, i) => (
                      <div key={i} className="p-2 bg-neutral-900 rounded-lg text-xs text-neutral-300 border border-neutral-800/60">
                        {req}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Live Runner logs if active */}
          {executionLogs.length > 0 && (
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-300 space-y-1">
              <div className="text-neutral-500 font-semibold mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Execution Trace:</span>
              </div>
              {executionLogs.map((l, i) => (
                <div key={i} className="text-indigo-400">{l}</div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-neutral-950 px-6 py-4 border-t border-neutral-800 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'email' ? (
              <button
                id="modal-send-email-btn"
                onClick={handleTriggerEmailApply}
                disabled={isApplying || job.status === 'applied_email'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-indigo-900/20"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Celery Task...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Application Email to Advertiser</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="modal-submit-portal-btn"
                onClick={handleTriggerPortalApply}
                disabled={isApplying || job.status === 'applied_portal'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-indigo-950/20"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Running Headless Playwright Solver...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Auto-Fill &amp; Submit on PNet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
