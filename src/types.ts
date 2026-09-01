export type ApplyMethod = 'email' | 'portal' | 'both';
export type JobStatus = 'new' | 'queued' | 'applying' | 'applied_email' | 'applied_portal' | 'failed' | 'skipped';
export type CeleryTaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';

export type AuthWorkflowStep = 'register' | 'verify_login' | 'dashboard';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  registeredAt: string;
  lastLogin: string;
  token?: string;
  verificationCode?: string;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'number' | 'boolean';
  options?: string[];
  applicantAnswer?: string;
  aiReasoning?: string;
  isRequired?: boolean;
}

export interface CVDocument {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileUrl?: string;
  isPrimary: boolean;
  docType: 'cv' | 'certificate' | 'degree' | 'other';
  alwaysAttach: boolean;
  version: string;
  parsedSummary: string;
  parsedSkills: string[];
  issuingOrganization?: string;
  issueDate?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface EducationRecord {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  isDefault: boolean;
  category: 'direct_apply' | 'follow_up' | 'recruiter_outreach';
  createdAt: string;
}

export interface WebsiteContentConfig {
  siteTitle: string;
  bannerAnnouncement: string;
  bannerEnabled: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  footerNote: string;
  targetLocations: string[];
  targetSkills: string[];
  dailyQuotaDefault: number;
}

export interface PNetJob {
  id: string;
  title: string;
  company: string;
  location: string;
  province: string;
  salary: string;
  datePosted: string;
  url: string;
  applyType: ApplyMethod;
  advertiserEmail?: string;
  referenceNumber?: string;
  category: string;
  employmentType: string;
  description: string;
  requirements: string[];
  screeningQuestions: ScreeningQuestion[];
  matchScore: number;
  matchReasons: string[];
  missingKeywords: string[];
  status: JobStatus;
  appliedAt?: string;
  applicationMethod?: 'email' | 'portal';
  emailSubject?: string;
  emailBody?: string;
  answersSubmitted?: Record<string, string>;
  confirmationRef?: string;
  errorLog?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  province: string;
  primaryRole: string;
  yearsOfExperience: number;
  highestQualification: string;
  noticePeriodDays: number;
  expectedSalaryZAR: number;
  currentSalaryZAR: number;
  hasDriversLicense: boolean;
  driversLicenseCode: string;
  isSouthAfricanCitizen: boolean;
  workPermitStatus: string;
  equityStatus: string;
  skills: string[];
  summary: string;
  cvFileName: string;
  cvFileSize: string;
  cvUploadedAt: string;
  cvTextContent: string;
  certificateFileName?: string;
  certificateFileSize?: string;
  certificateUploadedAt?: string;
  certificateTextContent?: string;
  alwaysAttachCertificate?: boolean;
  cvDocuments?: CVDocument[];
  experiences?: WorkExperience[];
  educations?: EducationRecord[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface PNetCredentials {
  email: string;
  passwordMasked: string;
  sessionActive: boolean;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  pnetCandidateId?: string;
  sessionToken?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  passwordMasked: string;
  fromEmail: string;
  fromName: string;
  useTls: boolean;
  secure?: boolean;
  subjectTemplate: string;
  bccSelf: boolean;
}

export interface AutoApplyConfig {
  isRunning: boolean;
  autoMode: 'all' | 'email_only' | 'portal_only';
  dailyQuota: number;
  appliedToday: number;
  minMatchScore: number;
  jitterDelayMinSeconds: number;
  jitterDelayMaxSeconds: number;
  celeryBeatIntervalMinutes: number;
  targetKeywords: string[];
  excludedKeywords: string[];
  targetLocations: string[];
  targetCategories: string[];
  notifyEmailOnApply: boolean;
  autoTailorCoverLetter: boolean;
  lastRunTime?: string;
  nextScheduledRun?: string;
}

export interface CeleryWorkerNode {
  id: string;
  name: string;
  concurrency: number;
  activeTasksCount: number;
  totalProcessed: number;
  uptime: string;
  queue: string;
  status: 'ONLINE' | 'BUSY' | 'IDLE' | 'OFFLINE';
  lastHeartbeat: string;
}

export interface CeleryTaskLog {
  id: string;
  taskName: string;
  queue: string;
  worker: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  status: CeleryTaskStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  retries: number;
  resultSummary?: string;
  error?: string;
}

export interface AutomationStats {
  totalJobsScanned: number;
  totalApplied: number;
  appliedViaEmail: number;
  appliedViaPortal: number;
  failedCount: number;
  averageMatchScore: number;
  applicationsThisWeek: number[];
  redisMemoryUsage: string;
  postgresDbSize: string;
  celeryBeatNextRunInSeconds: number;
}
