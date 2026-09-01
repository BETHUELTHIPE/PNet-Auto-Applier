import React, { useState, useRef } from 'react';
import { 
  Shield, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Briefcase, 
  Mail, 
  Server, 
  Sparkles, 
  Globe, 
  Clock, 
  Database, 
  Play, 
  ChevronRight, 
  Check, 
  X, 
  FolderPlus,
  Layers,
  Code2
} from 'lucide-react';
import { 
  UserProfile, 
  PNetJob, 
  SmtpSettings, 
  PNetCredentials, 
  AutoApplyConfig, 
  CeleryTaskLog,
  CVDocument,
  WorkExperience,
  EducationRecord,
  EmailTemplate,
  WebsiteContentConfig
} from '../types';
import { 
  initialCvDocuments, 
  initialExperiences, 
  initialEducations, 
  initialEmailTemplates, 
  initialWebsiteContent 
} from '../data/mockData';

interface DjangoAdminStudioProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  jobs: PNetJob[];
  setJobs: React.Dispatch<React.SetStateAction<PNetJob[]>>;
  smtpSettings: SmtpSettings;
  setSmtpSettings: React.Dispatch<React.SetStateAction<SmtpSettings>>;
  pnetCredentials: PNetCredentials;
  setPNetCredentials: React.Dispatch<React.SetStateAction<PNetCredentials>>;
  config: AutoApplyConfig;
  setConfig: React.Dispatch<React.SetStateAction<AutoApplyConfig>>;
  taskLogs: CeleryTaskLog[];
  setTaskLogs: React.Dispatch<React.SetStateAction<CeleryTaskLog[]>>;
  onOpenArchitecture?: () => void;
}

type AdminModelKey = 
  | 'applicant_profile' 
  | 'cv_documents' 
  | 'work_experience' 
  | 'education' 
  | 'job_posts' 
  | 'application_records' 
  | 'email_templates' 
  | 'smtp_configs' 
  | 'website_content' 
  | 'celery_audit_logs';

export const DjangoAdminStudio: React.FC<DjangoAdminStudioProps> = ({
  profile,
  setProfile,
  jobs,
  setJobs,
  smtpSettings,
  setSmtpSettings,
  pnetCredentials,
  setPNetCredentials,
  config,
  setConfig,
  taskLogs,
  setTaskLogs,
  onOpenArchitecture
}) => {
  // Navigation State
  const [currentModel, setCurrentModel] = useState<AdminModelKey>('cv_documents');
  const [viewMode, setViewMode] = useState<'list' | 'change' | 'add'>('list');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [adminAction, setAdminAction] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local state for models stored in localStorage
  const [cvDocs, setCvDocs] = useState<CVDocument[]>(() => {
    const saved = localStorage.getItem('django_admin_cv_docs');
    return saved ? JSON.parse(saved) : initialCvDocuments;
  });

  const [experiences, setExperiences] = useState<WorkExperience[]>(() => {
    const saved = localStorage.getItem('django_admin_experiences');
    return saved ? JSON.parse(saved) : initialExperiences;
  });

  const [educations, setEducations] = useState<EducationRecord[]>(() => {
    const saved = localStorage.getItem('django_admin_educations');
    return saved ? JSON.parse(saved) : initialEducations;
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('django_admin_email_templates');
    return saved ? JSON.parse(saved) : initialEmailTemplates;
  });

  const [websiteContent, setWebsiteContent] = useState<WebsiteContentConfig>(() => {
    const saved = localStorage.getItem('django_admin_website_content');
    return saved ? JSON.parse(saved) : initialWebsiteContent;
  });

  // CV Upload file ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewingCv, setPreviewingCv] = useState<CVDocument | null>(null);

  // Save changes to localStorage and synchronize
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const persistCvDocs = (docs: CVDocument[]) => {
    setCvDocs(docs);
    localStorage.setItem('django_admin_cv_docs', JSON.stringify(docs));
    // sync primary cv to profile
    const primary = docs.find(d => d.isPrimary) || docs[0];
    if (primary) {
      setProfile(prev => ({
        ...prev,
        cvFileName: primary.fileName,
        cvFileSize: primary.fileSize,
        cvUploadedAt: primary.uploadedAt,
        cvDocuments: docs
      }));
    }
  };

  const persistExperiences = (exps: WorkExperience[]) => {
    setExperiences(exps);
    localStorage.setItem('django_admin_experiences', JSON.stringify(exps));
  };

  const persistEducations = (edus: EducationRecord[]) => {
    setEducations(edus);
    localStorage.setItem('django_admin_educations', JSON.stringify(edus));
  };

  const persistEmailTemplates = (templates: EmailTemplate[]) => {
    setEmailTemplates(templates);
    localStorage.setItem('django_admin_email_templates', JSON.stringify(templates));
  };

  const persistWebsiteContent = (content: WebsiteContentConfig) => {
    setWebsiteContent(content);
    localStorage.setItem('django_admin_website_content', JSON.stringify(content));
  };

  // CV Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    const newDocId = `cv-doc-${Date.now().toString().slice(-4)}`;

    const newDoc: CVDocument = {
      id: newDocId,
      fileName: file.name,
      fileSize: sizeStr,
      uploadedAt: new Date().toISOString(),
      fileUrl: file.name.toLowerCase().includes('cert') ? `/media/certificates/${file.name}` : `/media/resumes/${file.name}`,
      isPrimary: cvDocs.length === 0,
      docType: file.name.toLowerCase().includes('cert') ? 'certificate' : (file.name.toLowerCase().includes('degree') ? 'degree' : 'cv'),
      alwaysAttach: true,
      version: `v${(cvDocs.length + 1).toFixed(1)} (Uploaded via Admin)`,
      parsedSummary: `Parsed candidate document for ${profile.fullName}. Skills extracted: Python, SQL, Apache Spark, Django, Celery, PostgreSQL, AWS.`,
      parsedSkills: ['Python', 'SQL', 'Apache Spark', 'Django', 'Celery', 'PostgreSQL', 'Docker', 'AWS']
    };

    const updated = [newDoc, ...cvDocs];
    persistCvDocs(updated);
    showToast(`Successfully uploaded "${file.name}" to media/resumes/ and registered in Django CVDocument model.`);
  };

  const handleSetPrimaryCv = (id: string) => {
    const updated = cvDocs.map(d => ({
      ...d,
      isPrimary: d.id === id
    }));
    persistCvDocs(updated);
    const prim = updated.find(d => d.id === id);
    showToast(`Set "${prim?.fileName}" as the primary active CV for PNet auto-apply operations.`);
  };

  const handleDeleteCv = (id: string) => {
    const updated = cvDocs.filter(d => d.id !== id);
    if (updated.length > 0 && !updated.some(d => d.isPrimary)) {
      updated[0].isPrimary = true;
    }
    persistCvDocs(updated);
    showToast('CV document removed from Django database.');
  };

  // Execute Batch Admin Action
  const handleExecuteAction = () => {
    if (selectedRows.length === 0) {
      showToast('Please select at least one record to execute action.');
      return;
    }

    if (currentModel === 'job_posts') {
      if (adminAction === 'queue_auto_apply') {
        setJobs(prev => prev.map(j => selectedRows.includes(j.id) ? { ...j, status: 'queued' } : j));
        showToast(`Queued ${selectedRows.length} job(s) for Celery auto-apply workers.`);
      } else if (adminAction === 'mark_applied') {
        setJobs(prev => prev.map(j => selectedRows.includes(j.id) ? { ...j, status: 'applied_email', appliedAt: new Date().toISOString(), confirmationRef: `ADMIN-MANUAL-${Date.now().toString().slice(-4)}` } : j));
        showToast(`Marked ${selectedRows.length} job(s) as applied.`);
      } else if (adminAction === 'recalculate_scores') {
        setJobs(prev => prev.map(j => selectedRows.includes(j.id) ? { ...j, matchScore: Math.min(99, j.matchScore + 5) } : j));
        showToast(`Recalculated match scores for ${selectedRows.length} job(s) with AI.`);
      } else if (adminAction === 'delete_selected') {
        setJobs(prev => prev.filter(j => !selectedRows.includes(j.id)));
        showToast(`Deleted ${selectedRows.length} job record(s).`);
      }
    } else if (currentModel === 'cv_documents') {
      if (adminAction === 'make_primary' && selectedRows.length === 1) {
        handleSetPrimaryCv(selectedRows[0]);
      } else if (adminAction === 'delete_selected') {
        persistCvDocs(cvDocs.filter(d => !selectedRows.includes(d.id)));
        showToast(`Deleted ${selectedRows.length} CV document(s).`);
      }
    } else if (currentModel === 'email_templates') {
      if (adminAction === 'delete_selected') {
        persistEmailTemplates(emailTemplates.filter(t => !selectedRows.includes(t.id)));
        showToast(`Deleted ${selectedRows.length} email template(s).`);
      }
    }
    setSelectedRows([]);
    setAdminAction('');
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleSelectAll = (allIds: string[]) => {
    if (selectedRows.length === allIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allIds);
    }
  };

  // Model Metadata Configuration
  const appModels = [
    {
      group: 'CANDIDATE & RESUME MANAGEMENT',
      models: [
        { key: 'applicant_profile' as AdminModelKey, label: 'Applicant Profile', count: 1, icon: UserIcon },
        { key: 'cv_documents' as AdminModelKey, label: 'CV Documents & Uploads', count: cvDocs.length, icon: FileText, badge: 'Media' },
        { key: 'work_experience' as AdminModelKey, label: 'Work Experience', count: experiences.length, icon: Briefcase },
        { key: 'education' as AdminModelKey, label: 'Education & Certifications', count: educations.length, icon: Layers },
      ]
    },
    {
      group: 'PNET JOBS & AUTO-APPLY',
      models: [
        { key: 'job_posts' as AdminModelKey, label: 'Job Postings', count: jobs.length, icon: Briefcase, badge: 'Live' },
        { key: 'application_records' as AdminModelKey, label: 'Application Records', count: jobs.filter(j => j.status === 'applied_email' || j.status === 'applied_portal').length, icon: CheckCircle2 },
        { key: 'celery_audit_logs' as AdminModelKey, label: 'Celery Task Audit Logs', count: taskLogs.length, icon: Clock },
      ]
    },
    {
      group: 'COMMUNICATION & SITE CONTENT',
      models: [
        { key: 'email_templates' as AdminModelKey, label: 'Email Cover Letter Templates', count: emailTemplates.length, icon: Mail },
        { key: 'smtp_configs' as AdminModelKey, label: 'SMTP Server Configurations', count: 1, icon: Server },
        { key: 'website_content' as AdminModelKey, label: 'Website Content & Banners', count: 1, icon: Globe },
      ]
    }
  ];

  function UserIcon(props: any) {
    return <FileText {...props} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Django Admin Iconic Top Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Top Dark Green/Teal Django Admin Bar */}
        <div className="bg-[#417690] px-6 py-3 text-white flex flex-wrap items-center justify-between gap-4 border-b border-[#305c70]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#205067] flex items-center justify-center font-bold font-mono text-sm tracking-wider shadow-inner">
              dj
            </div>
            <div>
              <div className="font-bold text-base tracking-wide flex items-center gap-2">
                <span>Django administration</span>
                <span className="text-xs bg-[#2b5970] px-2 py-0.5 rounded text-teal-100 font-mono font-normal">v5.0.3</span>
              </div>
              <p className="text-[11px] text-teal-100/80 font-mono">
                Site: PNet Auto-Applier Management Portal • DB: PostgreSQL 16
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-teal-100 hidden sm:inline">
              Welcome, <strong className="text-white">admin</strong> (superuser).
            </span>
            <span className="text-teal-200/40">•</span>
            <button 
              onClick={() => showToast('Authenticated as superuser admin.')}
              className="text-teal-100 hover:text-white underline text-xs"
            >
              View Site
            </button>
            <span className="text-teal-200/40">•</span>
            <button 
              onClick={onOpenArchitecture}
              className="px-2.5 py-1 rounded bg-[#2c586e] hover:bg-[#204355] text-white flex items-center gap-1 text-xs font-mono transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-300" />
              <span>models.py &amp; admin.py</span>
            </button>
          </div>
        </div>

        {/* Django Admin Breadcrumbs */}
        <div className="bg-neutral-950 px-6 py-2 border-b border-neutral-800 flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <span className="hover:text-neutral-200 cursor-pointer" onClick={() => { setCurrentModel('applicant_profile'); setViewMode('list'); }}>Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-500">jobs</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-teal-400 font-semibold uppercase">
            {currentModel.replace('_', ' ')}
          </span>
          {viewMode !== 'list' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-neutral-300 capitalize">{viewMode} Record</span>
            </>
          )}
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-6 py-2.5 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fadeIn font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main 2-Column Django Admin Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* Left Sidebar: Django Apps & Models Navigator */}
          <div className="lg:col-span-3 bg-neutral-950 border-r border-neutral-800 p-4 space-y-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center justify-between">
              <span>Django Apps &amp; Models</span>
              <span className="text-[10px] text-teal-400 font-mono">ORM Ready</span>
            </div>

            {appModels.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 pt-1 font-mono">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.models.map(m => {
                    const Icon = m.icon;
                    const isActive = currentModel === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => {
                          setCurrentModel(m.key);
                          setViewMode('list');
                          setSelectedRows([]);
                          setSelectedRecordId(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                          isActive 
                            ? 'bg-[#417690]/20 text-teal-300 border border-[#417690]/50 font-semibold' 
                            : 'text-neutral-300 hover:bg-neutral-900 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-neutral-500'}`} />
                          <span className="truncate">{m.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {m.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                              {m.badge}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                            {m.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Upload Action in Sidebar */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.docx,.doc,.txt" 
                onChange={handleFileUpload} 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 bg-[#417690] hover:bg-[#326077] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors font-mono"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New CV (Media)</span>
              </button>
            </div>
          </div>

          {/* Right Main Area: Changelist / Change Form */}
          <div className="lg:col-span-9 bg-neutral-900/50 p-6 flex flex-col justify-between">
            
            {/* ======================================================== */}
            {/* MODEL 1: CV DOCUMENTS & UPLOADS                          */}
            {/* ======================================================== */}
            {currentModel === 'cv_documents' && (
              <div className="space-y-6">
                
                {/* Header with Title and Add Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-400" />
                      <span>Select CV Document to change</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.CVDocument</code> • Stored in <code className="text-neutral-300">/app/media/resumes/</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#417690] hover:bg-[#326077] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload &amp; Add CV document</span>
                    </button>
                  </div>
                </div>

                {/* Django Action Bar */}
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-mono">Action:</span>
                    <select
                      value={adminAction}
                      onChange={(e) => setAdminAction(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    >
                      <option value="">-------------------</option>
                      <option value="make_primary">Set selected as Primary CV for Auto-Apply</option>
                      <option value="delete_selected">Delete selected CV documents</option>
                    </select>
                    <button
                      onClick={handleExecuteAction}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-mono text-xs border border-neutral-700 transition-colors"
                    >
                      Go
                    </button>
                    {selectedRows.length > 0 && (
                      <span className="text-[11px] text-teal-400 font-mono">
                        {selectedRows.length} of {cvDocs.length} selected
                      </span>
                    )}
                  </div>

                  <div className="text-neutral-400 font-mono text-xs">
                    Total: <strong className="text-white">{cvDocs.length}</strong> CV versions
                  </div>
                </div>

                {/* Changelist Table */}
                <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-300 font-mono text-[11px] uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedRows.length === cvDocs.length && cvDocs.length > 0} 
                            onChange={() => toggleSelectAll(cvDocs.map(d => d.id))}
                            className="rounded bg-neutral-800 border-neutral-700 text-teal-600 focus:ring-0"
                          />
                        </th>
                        <th className="p-3">File Name / Path</th>
                        <th className="p-3">Version Tag</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Primary Active</th>
                        <th className="p-3">Uploaded At</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-mono">
                      {cvDocs.map((doc) => {
                        const isSelected = selectedRows.includes(doc.id);
                        return (
                          <tr 
                            key={doc.id}
                            className={`hover:bg-neutral-900/60 transition-colors ${isSelected ? 'bg-[#417690]/10' : ''}`}
                          >
                            <td className="p-3 text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleSelectRow(doc.id)}
                                className="rounded bg-neutral-800 border-neutral-700 text-teal-600 focus:ring-0"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <FileText className={`w-4 h-4 ${doc.isPrimary ? 'text-emerald-400' : 'text-neutral-400'}`} />
                                <div>
                                  <div className="font-bold text-white hover:text-teal-300 cursor-pointer font-sans" onClick={() => setPreviewingCv(doc)}>
                                    {doc.fileName}
                                  </div>
                                  <div className="text-[10px] text-neutral-500">
                                    /media/resumes/{doc.fileName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-neutral-300">
                              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-teal-300">
                                {doc.version}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-400">{doc.fileSize}</td>
                            <td className="p-3">
                              {doc.isPrimary ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                                  <Check className="w-3 h-3" /> Primary (Used for Auto-Apply)
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetPrimaryCv(doc.id)}
                                  className="text-neutral-400 hover:text-teal-300 text-[11px] underline"
                                >
                                  Make Primary
                                </button>
                              )}
                            </td>
                            <td className="p-3 text-neutral-500 text-[11px]">
                              {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setPreviewingCv(doc)}
                                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-teal-300 rounded-md transition-colors"
                                  title="Inspect CV metadata and parsed skills"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCv(doc.id)}
                                  className="p-1.5 bg-neutral-800 hover:bg-rose-900/60 text-rose-400 rounded-md transition-colors"
                                  title="Delete CV document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* CV Document Upload Dropzone & Django Media File Widget */}
                <div className="p-5 bg-neutral-950 border border-dashed border-teal-900/80 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-teal-400" /> Django Media Storage &amp; FileField Upload Handler
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono">
                        Handles multipart/form-data POST uploads, stores file on disk, and updates ApplicantProfile.cv_file.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      MEDIA_ROOT: /app/media/
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1">
                      <div className="text-[10px] text-neutral-500 font-mono">Active Primary File</div>
                      <div className="text-xs font-bold text-white truncate">{profile.cvFileName}</div>
                      <div className="text-[10px] text-teal-400 font-mono">{profile.cvFileSize}</div>
                    </div>

                    <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1">
                      <div className="text-[10px] text-neutral-500 font-mono">Nginx Media Direct URL</div>
                      <div className="text-xs font-bold text-indigo-300 truncate">/media/resumes/{profile.cvFileName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Static &amp; Media Cached</div>
                    </div>

                    <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1">
                      <div className="text-[10px] text-neutral-500 font-mono">Attached in Celery Tasks</div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Direct Email &amp; Portal
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">Auto-Attached as PDF</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* MODEL 2: APPLICANT PROFILE (CHANGE FORM)                 */}
            {/* ======================================================== */}
            {currentModel === 'applicant_profile' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-teal-400" />
                      <span>Change Applicant Profile: {profile.fullName}</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.ApplicantProfile</code> (ID: 1)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        showToast('Candidate profile fields saved successfully to PostgreSQL.');
                      }}
                      className="px-4 py-1.5 bg-[#417690] hover:bg-[#326077] text-white rounded-lg text-xs font-semibold transition-colors font-mono"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>

                {/* Fieldsets */}
                <div className="space-y-6">
                  
                  {/* Fieldset 1: Personal & Contact Information */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
                      1. Personal &amp; Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Full Name</label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Phone (SA)</label>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">City</label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Province</label>
                        <input
                          type="text"
                          value={profile.province}
                          onChange={(e) => setProfile(prev => ({ ...prev, province: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Primary Role</label>
                        <input
                          type="text"
                          value={profile.primaryRole}
                          onChange={(e) => setProfile(prev => ({ ...prev, primaryRole: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fieldset 2: South African Employment Screening Answers */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
                      2. South African Screening Answers (Auto-populated in PNet Forms)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Years of Experience</label>
                        <input
                          type="number"
                          value={profile.yearsOfExperience}
                          onChange={(e) => setProfile(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Notice Period (Days)</label>
                        <input
                          type="number"
                          value={profile.noticePeriodDays}
                          onChange={(e) => setProfile(prev => ({ ...prev, noticePeriodDays: Number(e.target.value) }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Expected Salary (ZAR/pm)</label>
                        <input
                          type="number"
                          value={profile.expectedSalaryZAR}
                          onChange={(e) => setProfile(prev => ({ ...prev, expectedSalaryZAR: Number(e.target.value) }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Driver&apos;s License</label>
                        <input
                          type="text"
                          value={profile.driversLicenseCode}
                          onChange={(e) => setProfile(prev => ({ ...prev, driversLicenseCode: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fieldset 3: Inlines for CV Documents */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                        Inline Form: CV Documents (Foreign Key: ApplicantProfile)
                      </h3>
                      <span className="text-xs text-neutral-400 font-mono">{cvDocs.length} Documents Attached</span>
                    </div>

                    <div className="space-y-2">
                      {cvDocs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
                          <div className="flex items-center gap-3">
                            <FileText className={`w-4 h-4 ${doc.isPrimary ? 'text-emerald-400' : 'text-neutral-400'}`} />
                            <div>
                              <div className="font-bold text-white">{doc.fileName}</div>
                              <div className="text-[10px] text-neutral-400 font-mono">{doc.version} • {doc.fileSize}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.isPrimary ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                                Primary Active
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetPrimaryCv(doc.id)}
                                className="text-teal-400 hover:underline text-[11px] font-mono"
                              >
                                Set as Primary
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* MODEL 3: JOB POSTINGS CHANGELIST                         */}
            {/* ======================================================== */}
            {currentModel === 'job_posts' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-teal-400" />
                      <span>Select Job Post to change</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.JobPost</code> • {jobs.length} Records in Database
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search title, company, pnet_job_id..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-mono">Action:</span>
                    <select
                      value={adminAction}
                      onChange={(e) => setAdminAction(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    >
                      <option value="">-------------------</option>
                      <option value="queue_auto_apply">Queue selected for Celery auto-apply</option>
                      <option value="mark_applied">Mark selected as Applied (Email/Portal)</option>
                      <option value="recalculate_scores">Recalculate AI Match Scores</option>
                      <option value="delete_selected">Delete selected job postings</option>
                    </select>
                    <button
                      onClick={handleExecuteAction}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-mono text-xs border border-neutral-700"
                    >
                      Go
                    </button>
                    {selectedRows.length > 0 && (
                      <span className="text-[11px] text-teal-400 font-mono">
                        {selectedRows.length} of {jobs.length} selected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-neutral-500">Filter by status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-0.5 text-xs text-white"
                    >
                      <option value="all">All Statuses ({jobs.length})</option>
                      <option value="new">New ({jobs.filter(j => j.status === 'new').length})</option>
                      <option value="queued">Queued ({jobs.filter(j => j.status === 'queued').length})</option>
                      <option value="applied_email">Applied (Email) ({jobs.filter(j => j.status === 'applied_email').length})</option>
                      <option value="applied_portal">Applied (Portal) ({jobs.filter(j => j.status === 'applied_portal').length})</option>
                    </select>
                  </div>
                </div>

                {/* Job Post Table */}
                <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-300 font-mono text-[11px] uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedRows.length === jobs.length && jobs.length > 0} 
                            onChange={() => toggleSelectAll(jobs.map(j => j.id))}
                            className="rounded bg-neutral-800 border-neutral-700 text-teal-600 focus:ring-0"
                          />
                        </th>
                        <th className="p-3">Job Title / Company</th>
                        <th className="p-3">Location / Province</th>
                        <th className="p-3">Apply Channel</th>
                        <th className="p-3">Match Score</th>
                        <th className="p-3">Status Badge</th>
                        <th className="p-3">Ref / Confirmation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-mono">
                      {jobs
                        .filter(j => statusFilter === 'all' || j.status === statusFilter)
                        .filter(j => !searchQuery || j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(job => {
                          const isSelected = selectedRows.includes(job.id);
                          return (
                            <tr key={job.id} className={`hover:bg-neutral-900/60 transition-colors ${isSelected ? 'bg-[#417690]/10' : ''}`}>
                              <td className="p-3 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => toggleSelectRow(job.id)}
                                  className="rounded bg-neutral-800 border-neutral-700 text-teal-600 focus:ring-0"
                                />
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-white font-sans">{job.title}</div>
                                <div className="text-[10px] text-neutral-400 font-mono">{job.company} • ID: {job.id}</div>
                              </td>
                              <td className="p-3 text-neutral-400">{job.location}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] border ${
                                  job.applyType === 'email' 
                                    ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800' 
                                    : 'bg-teal-950/40 text-teal-300 border-teal-800'
                                }`}>
                                  {job.applyType === 'email' ? 'Direct Email' : 'PNet Portal'}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  job.matchScore >= 80 
                                    ? 'text-emerald-400 bg-emerald-950/40' 
                                    : 'text-amber-400 bg-amber-950/40'
                                }`}>
                                  {job.matchScore}%
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  job.status === 'applied_email' || job.status === 'applied_portal'
                                    ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800'
                                    : job.status === 'queued'
                                    ? 'text-amber-300 bg-amber-950/80 border border-amber-800'
                                    : 'text-neutral-400 bg-neutral-900 border border-neutral-800'
                                }`}>
                                  {job.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3 text-[11px] text-neutral-400 truncate max-w-[140px]">
                                {job.confirmationRef || '—'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* MODEL 4: WEBSITE CONTENT & BANNERS                       */}
            {/* ======================================================== */}
            {currentModel === 'website_content' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-teal-400" />
                      <span>Change Website Content &amp; Public Copy</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.WebsiteContent</code> • Dynamically modifies website header, announcement banner, and metadata
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      persistWebsiteContent(websiteContent);
                      showToast('Website content configuration updated successfully!');
                    }}
                    className="px-4 py-1.5 bg-[#417690] hover:bg-[#326077] text-white rounded-lg text-xs font-semibold font-mono transition-colors"
                  >
                    Save Changes
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
                      1. Announcement Banner &amp; Header
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="bannerEnabled"
                          checked={websiteContent.bannerEnabled}
                          onChange={(e) => setWebsiteContent(prev => ({ ...prev, bannerEnabled: e.target.checked }))}
                          className="rounded bg-neutral-800 border-neutral-700 text-teal-600 focus:ring-0"
                        />
                        <label htmlFor="bannerEnabled" className="text-xs text-white font-mono cursor-pointer">
                          Enable Announcement Banner at top of page
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Announcement Banner Text</label>
                        <input
                          type="text"
                          value={websiteContent.bannerAnnouncement}
                          onChange={(e) => setWebsiteContent(prev => ({ ...prev, bannerAnnouncement: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Website Title</label>
                        <input
                          type="text"
                          value={websiteContent.siteTitle}
                          onChange={(e) => setWebsiteContent(prev => ({ ...prev, siteTitle: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
                      2. Hero Headline &amp; Subtitle
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Hero Main Headline</label>
                        <input
                          type="text"
                          value={websiteContent.heroHeadline}
                          onChange={(e) => setWebsiteContent(prev => ({ ...prev, heroHeadline: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-neutral-400">Hero Subheadline</label>
                        <textarea
                          rows={2}
                          value={websiteContent.heroSubheadline}
                          onChange={(e) => setWebsiteContent(prev => ({ ...prev, heroSubheadline: e.target.value }))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* MODEL 5: EMAIL COVER LETTER TEMPLATES                    */}
            {/* ======================================================== */}
            {currentModel === 'email_templates' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-teal-400" />
                      <span>Select Email Template to change</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.EmailTemplate</code> • Used for Celery direct SMTP email dispatch
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newTmpl: EmailTemplate = {
                        id: `tmpl-${Date.now().toString().slice(-4)}`,
                        name: 'Custom Tailored Cover Letter Template',
                        subjectTemplate: 'Application: {{job_title}} - {{full_name}}',
                        bodyTemplate: `Dear {{company}} Team,\n\nPlease find my attached CV for the {{job_title}} role.\n\nKind regards,\n{{full_name}}`,
                        isDefault: false,
                        category: 'direct_apply',
                        createdAt: new Date().toISOString()
                      };
                      persistEmailTemplates([...emailTemplates, newTmpl]);
                      showToast('Added new email template record.');
                    }}
                    className="px-3.5 py-1.5 bg-[#417690] hover:bg-[#326077] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Email Template</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {emailTemplates.map(tmpl => (
                    <div key={tmpl.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{tmpl.name}</span>
                          {tmpl.isDefault && (
                            <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded text-[10px] font-mono">
                              Default Template
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">ID: {tmpl.id}</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400">Subject Template</label>
                          <input
                            type="text"
                            value={tmpl.subjectTemplate}
                            onChange={(e) => {
                              const updated = emailTemplates.map(t => t.id === tmpl.id ? { ...t, subjectTemplate: e.target.value } : t);
                              persistEmailTemplates(updated);
                            }}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400">Body Template (supports Jinja2 variables like &#123;&#123; job_title &#125;&#125;)</label>
                          <textarea
                            rows={4}
                            value={tmpl.bodyTemplate}
                            onChange={(e) => {
                              const updated = emailTemplates.map(t => t.id === tmpl.id ? { ...t, bodyTemplate: e.target.value } : t);
                              persistEmailTemplates(updated);
                            }}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* MODEL 6: SMTP CONFIGURATION                              */}
            {/* ======================================================== */}
            {currentModel === 'smtp_configs' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Server className="w-5 h-5 text-teal-400" />
                      <span>Change SMTP Server Configuration</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.SMTPConfiguration</code> • Host: {smtpSettings.host}:{smtpSettings.port}
                    </p>
                  </div>

                  <button
                    onClick={() => showToast('SMTP settings verified and updated in database.')}
                    className="px-4 py-1.5 bg-[#417690] hover:bg-[#326077] text-white rounded-lg text-xs font-semibold font-mono"
                  >
                    Save &amp; Test Connection
                  </button>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">SMTP Host</label>
                      <input
                        type="text"
                        value={smtpSettings.host}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, host: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">Port (587 TLS / 465 SSL)</label>
                      <input
                        type="number"
                        value={smtpSettings.port}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, port: Number(e.target.value) }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">From Address (Application Sender)</label>
                      <input
                        type="email"
                        value={smtpSettings.fromEmail}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-neutral-800/80">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">SMTP Username</label>
                      <input
                        type="email"
                        value={smtpSettings.username}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">App Password / Auth Key</label>
                      <input
                        type="password"
                        value={smtpSettings.passwordMasked}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, passwordMasked: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">Sender Display Name (From Name)</label>
                      <input
                        type="text"
                        value={smtpSettings.fromName}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, fromName: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-neutral-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smtpSettings.useTls}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, useTls: e.target.checked, secure: !e.target.checked }))}
                        className="rounded border-neutral-700 text-teal-600 focus:ring-teal-500"
                      />
                      <span>USE_TLS (STARTTLS 587)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smtpSettings.bccSelf}
                        onChange={(e) => setSmtpSettings(prev => ({ ...prev, bccSelf: e.target.checked }))}
                        className="rounded border-neutral-700 text-teal-600 focus:ring-teal-500"
                      />
                      <span>BCC Super Admin Copy</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* OTHER MODELS (Work Experience, Education, Celery Logs)   */}
            {/* ======================================================== */}
            {(currentModel === 'work_experience' || currentModel === 'education' || currentModel === 'application_records' || currentModel === 'celery_audit_logs') && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-teal-400" />
                      <span className="capitalize">{currentModel.replace('_', ' ')} Changelist</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Model: <code className="text-teal-300">jobs.models.{currentModel === 'work_experience' ? 'WorkExperience' : currentModel === 'education' ? 'Education' : currentModel === 'application_records' ? 'ApplicationRecord' : 'CeleryAuditLog'}</code>
                    </p>
                  </div>
                </div>

                {currentModel === 'work_experience' && (
                  <div className="space-y-3">
                    {experiences.map(exp => (
                      <div key={exp.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{exp.role}</span>
                          <span className="text-xs text-teal-400 font-mono">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div className="text-xs text-neutral-400">{exp.company} • {exp.location}</div>
                        <p className="text-xs text-neutral-300 pt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentModel === 'education' && (
                  <div className="space-y-3">
                    {educations.map(edu => (
                      <div key={edu.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{edu.degree}</span>
                          <span className="text-xs text-teal-400 font-mono">{edu.graduationYear}</span>
                        </div>
                        <div className="text-xs text-neutral-400">{edu.institution} • {edu.fieldOfStudy}</div>
                      </div>
                    ))}
                  </div>
                )}

                {currentModel === 'celery_audit_logs' && (
                  <div className="space-y-2">
                    {taskLogs.map(log => (
                      <div key={log.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <div className="font-bold text-white">{log.taskName}</div>
                          <div className="text-[10px] text-neutral-500">{log.worker} • Queue: {log.queue}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                          {log.status} ({log.durationMs}ms)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {currentModel === 'application_records' && (
                  <div className="space-y-2">
                    {jobs.filter(j => j.status === 'applied_email' || j.status === 'applied_portal').map(job => (
                      <div key={job.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <div className="font-bold text-white font-sans">{job.title} at {job.company}</div>
                          <div className="text-[10px] text-neutral-400">Method: {job.status === 'applied_email' ? 'Direct Email with CV' : 'PNet Portal Form'}</div>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold">
                          {job.confirmationRef || 'CONFIRMED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Django Admin Footer */}
            <div className="pt-6 mt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-neutral-500 font-mono">
              <span>Django 5.0.3 • PostgreSQL Admin • Python 3.11</span>
              <span className="text-teal-400">PNet Auto-Applier Suite</span>
            </div>

          </div>
        </div>

      </div>

      {/* CV Inspection & Metadata Modal */}
      {previewingCv && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fadeIn font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-white font-sans text-base">{previewingCv.fileName}</span>
              </div>
              <button onClick={() => setPreviewingCv(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-neutral-500">Document Version:</div>
                <div className="text-teal-300 font-bold">{previewingCv.version}</div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-neutral-500">Extracted AI Summary:</div>
                <p className="text-neutral-300 font-sans">{previewingCv.parsedSummary}</p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-neutral-500">Parsed Skills for Match Engine:</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewingCv.parsedSkills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-teal-950/60 text-teal-300 border border-teal-800 rounded text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {!previewingCv.isPrimary && (
                <button
                  onClick={() => {
                    handleSetPrimaryCv(previewingCv.id);
                    setPreviewingCv(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Set as Primary CV
                </button>
              )}
              <button
                onClick={() => setPreviewingCv(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
