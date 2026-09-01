import { 
  PNetJob, 
  UserProfile, 
  PNetCredentials, 
  SmtpSettings, 
  AutoApplyConfig, 
  CeleryWorkerNode, 
  CeleryTaskLog,
  CVDocument,
  WorkExperience,
  EducationRecord,
  EmailTemplate,
  WebsiteContentConfig
} from '../types';

export const initialProfile: UserProfile = {
  fullName: 'Russia Bethuel Moukangwe',
  email: 'bethuelmoukangwe8@gmail.com',
  phone: '+27 71 415 6665 / +27 72 037 8471',
  address: '02 Erasmus, Norkem Park, Kempton Park 1618, South Africa',
  city: 'Kempton Park',
  province: 'Gauteng',
  primaryRole: 'Data Engineer & Python / Django Specialist',
  yearsOfExperience: 5,
  highestQualification: 'BSc (Mathematics & Applied Mathematics) - UNISA | Data Engineering - EXPLOREAI Academy',
  noticePeriodDays: 30,
  expectedSalaryZAR: 58000,
  currentSalaryZAR: 46000,
  hasDriversLicense: true,
  driversLicenseCode: 'Code 08 (EB)',
  isSouthAfricanCitizen: true,
  workPermitStatus: 'South African Citizen',
  equityStatus: 'EE/AA Candidate',
  skills: [
    'Python',
    'Django',
    'Django REST Framework',
    'SQL',
    'PostgreSQL',
    'Docker',
    'AWS (S3, ECS, RDS, CloudFormation, CloudFront, SNS, IAM, CloudWatch, Secrets Manager)',
    'GitHub Actions',
    'Apache Spark',
    'PySpark',
    'Airflow',
    'Redis',
    'Celery',
    'Power BI',
    'ETL / ELT Pipelines',
    'REST APIs',
    'Linux',
    'Nginx',
    'Gunicorn',
    'Big Data Processing',
    'Pandas',
    'NumPy',
    'SAS',
    'Statistical Modeling',
    'Automated Data Testing',
    'Data Quality & Profiling'
  ],
  summary:
    'What excites me most about your company is your reputation for innovation and commitment to leveraging data to drive business growth. I am particularly impressed by your recent IT application development, which showcases your dedication to pushing the boundaries of data-driven decision-making. Skilled in Python, Django, SQL, Apache Spark, Celery, Redis, and cloud architectures.',
  cvFileName: 'Russia_Bethuel_Moukangwe_CV.pdf',
  cvFileSize: '284 KB',
  cvUploadedAt: '2026-08-30T09:00:00Z',
  certificateFileName: 'ExploreAI_Data_Engineering_Certificate_Russia_Bethuel_Moukangwe.pdf',
  certificateFileSize: '412 KB',
  certificateUploadedAt: '2026-08-30T09:05:00Z',
  alwaysAttachCertificate: true,
  certificateTextContent: `EXPLORE AI ACADEMY - Certificate of Completion
Awarded to: Russia Bethuel Moukangwe
For completing: Data Engineering Course
Date: 09 December 2023
Skills Acquired:
- Cloud Computing and Automation Scripting
- Gathering and Managing Big Data
- Database Management
- ETL/ELT Development
- Python Programming
- Data Delivery Development
- Big Data Processing
- Distributed Computing
- THRIVE (Soft Skills)
Signed: Shaun Dippnall, CEO (ExploreAI Academy, Est 2018)`,
  cvTextContent: `RUSSIA BETHUEL MOUKANGWE
South Africa | 02 Erasmus Norkem Park Kempton Park 1618 | https://www.linkedin.com/in/bethuel-moukangwe | bethuelmoukangwe8@gmail.com
CELL: 0714156665 / 0720378471

OBJECTIVE/SUMMARY:
What excites me most about company is your reputation for innovation and commitment to leveraging data to drive business growth. I am particularly impressed by your recent IT application development, which showcases your dedication to pushing the boundaries of data-driven decision-making.

SKILLS:
■ Processing Big Data
■ Python and SQL (Programming Languages)
■ ELT/ETL Development
■ Microsoft Power BI
■ Team Leadership
■ Analytical Skills
■ Able to adapt to change
■ Project Management

CORPORATE SKILLS:
■ Building Statistical Models using Python, Pandas, NumPy, SAS
■ Building ETL data pipelines using Apache Spark and Power BI
■ Designing data model on SQL & Building reports on SQL
■ Using data for insights and recommendations
■ Data injection & Data profiling & Data quality
■ Automated Data testing & Process Documentation & Writing Business Documentation
■ Presentation Skills & Engaging with internal and external stakeholders
■ Team leading and actively playing my role within the broader team

TECHNOLOGIES:
Python • Django • Django REST Framework • SQL • PostgreSQL • Docker • AWS (S3, ECS, RDS, CloudFormation, CloudFront, SNS, IAM, CloudWatch, Secrets Manager) • GitHub Actions • Apache Spark • PySpark • Airflow • Redis • Celery • Power BI • ETL • REST APIs • Linux • Nginx • Gunicorn

WORK EXPERIENCE:
• EXPLOREAI Cape Town South Africa
  Data Engineer Intern | 21 August 2023 - December 2023 | Integrated Project
  - Architected automated ELT/ETL pipelines, database schemas, and Big Data transformations using Apache Spark and Python.
  - Implemented cloud automation scripts and data profiling routines ensuring high data quality and automated test coverage.
• Department of Higher Education and Training
  Mathematics, Physical Sciences and Mathematics Literacy Lecturer (Grade 12) | 02 February 2008 – 17 March 2025
  - Educated students in advanced quantitative analysis, statistical modeling, and physics fundamentals.
• Umalusi Quality Council
  Evaluator / Subject Specialist / Team Leader | 15 January 2014 (Part time)
  - Supervised quality assessment frameworks, curriculum alignment, and standardized evaluation processes.
• University of Pretoria
  Physics Tutor and Mentor | 2005 - 2007

EDUCATION & CERTIFICATIONS:
• EXPLOREAI Academy, South Africa | Data Engineering Course | 16 January 2023 - 30 Jul 2023 (Certificate Awarded Dec 2023)
• University of South Africa (UNISA) | BSc - Baccalaureus Scientiae (Mathematics and Applied Mathematics) | 2012 - 2019 (BSC Certificate fully completed)
• University of Pretoria | BSc - Baccalaureus Scientiae (Physics) | 2007 partially completed
• Valid Driver's License: Code 08 (EB) | South African Citizen`,
  portfolioUrl: 'https://bethuel-portfolio.co.za',
  linkedinUrl: 'https://www.linkedin.com/in/bethuel-moukangwe',
  githubUrl: 'https://github.com/bethuelmoukangwe'
};

export const initialPNetCredentials: PNetCredentials = {
  email: 'bethuelmoukangwe8@gmail.com',
  passwordMasked: '••••••••••••',
  sessionActive: true,
  lastLogin: '2026-09-01T08:15:00Z',
  twoFactorEnabled: false,
  pnetCandidateId: 'PNET-ZA-8942104',
  sessionToken: 'pnet_sess_live_9a8f7c6e5d4b3a2'
};

export const initialSmtpSettings: SmtpSettings = {
  host: 'smtp.gmail.com',
  port: 587,
  username: 'bethuelmoukangwe8@gmail.com',
  passwordMasked: 'upzp vwnw hhwo dzio',
  fromEmail: 'bethuelmoukangwe8@gmail.com',
  fromName: 'AMARIS Learning HUB',
  useTls: true,
  secure: false,
  subjectTemplate: 'Application: {{job_title}} (Ref: {{ref_number}}) - {{full_name}}',
  bccSelf: true
};

export const initialAutoApplyConfig: AutoApplyConfig = {
  isRunning: false,
  autoMode: 'all',
  dailyQuota: 30,
  appliedToday: 8,
  minMatchScore: 65,
  jitterDelayMinSeconds: 15,
  jitterDelayMaxSeconds: 45,
  celeryBeatIntervalMinutes: 30,
  targetKeywords: ['Python', 'Django', 'Full Stack', 'Software Developer', 'Backend Developer', 'Postgres', 'Celery'],
  excludedKeywords: ['Unpaid', 'Internship', 'WordPress', 'Cold Calling', 'Door-to-door'],
  targetLocations: ['Johannesburg', 'Sandton', 'Pretoria', 'Gauteng', 'Cape Town', 'Remote / Work From Home'],
  targetCategories: ['Information Technology', 'Software Engineering', 'FinTech', 'Telecoms'],
  notifyEmailOnApply: true,
  autoTailorCoverLetter: true,
  lastRunTime: '2026-09-01T12:00:00Z',
  nextScheduledRun: '2026-09-01T12:30:00Z'
};

export const initialJobs: PNetJob[] = [
  {
    id: 'pnet-job-101',
    title: 'Senior Python / Django Backend Developer',
    company: 'Vodacom Group Enterprise Solutions',
    location: 'Midrand, Johannesburg',
    province: 'Gauteng',
    salary: 'R55,000 - R70,000 per month (CTC)',
    datePosted: '2 hours ago',
    url: 'https://www.pnet.co.za/jobs/senior-python-django-developer-midrand-101',
    applyType: 'email',
    advertiserEmail: 'enterprise.recruitment@vodacom-hr.co.za',
    referenceNumber: 'VOD-PY-9821',
    category: 'Information Technology',
    employmentType: 'Permanent / Hybrid',
    description: `Vodacom is looking for an experienced Senior Python Backend Developer to join our Cloud and Enterprise Digital platforms team. You will be responsible for architecting backend microservices in Django, managing asynchronous message processing with Celery and Redis, and deploying scalable services behind Nginx and Gunicorn.

Key Responsibilities:
- Design and develop robust Python/Django microservices and APIs.
- Scale Celery task worker queues with Redis broker for real-time customer data feeds.
- Write complex PostgreSQL queries, schema migrations, and stored procedures.
- Maintain high security, unit test coverage (>85%), and automated CI/CD pipelines.

Interested candidates must submit their CV with Subject line referencing VOD-PY-9821 directly to enterprise.recruitment@vodacom-hr.co.za.`,
    requirements: [
      '3+ years solid experience in Python and Django / DRF',
      'Strong expertise with PostgreSQL database optimization',
      'Demonstrated experience with Celery worker & Celery Beat asynchronous queues with Redis',
      'Familiarity with Docker, Nginx, and Linux server environments',
      'Good communication skills and problem-solving mindset'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'What is your current notice period in calendar days?',
        type: 'number',
        applicantAnswer: '30',
        aiReasoning: 'Applicant profile indicates standard 30 calendar days notice period.',
        isRequired: true
      },
      {
        id: 'q2',
        question: 'What is your expected monthly CTC salary in ZAR?',
        type: 'number',
        applicantAnswer: '55000',
        aiReasoning: 'Within the advertised budget range (R55k - R70k).',
        isRequired: true
      },
      {
        id: 'q3',
        question: 'Do you have hands-on experience with Celery and Redis message brokers?',
        type: 'choice',
        options: ['Yes, 3+ years', 'Yes, 1-2 years', 'Limited exposure', 'No'],
        applicantAnswer: 'Yes, 3+ years',
        aiReasoning: 'Matched high-confidence experience in profile CV.',
        isRequired: true
      }
    ],
    matchScore: 96,
    matchReasons: [
      'Strong Python & Django stack match (100%)',
      'Direct experience with Celery, Celery Beat, Redis, and PostgreSQL',
      'Location in Midrand/Gauteng is within preferred commute zone',
      'Salary expectation fits within advertised range'
    ],
    missingKeywords: [],
    status: 'new'
  },
  {
    id: 'pnet-job-102',
    title: 'Full Stack Software Engineer (Python, Django, React)',
    company: 'Takealot Group / Superbalist',
    location: 'Cape Town (or Remote ZA)',
    province: 'Western Cape',
    salary: 'R48,000 - R62,000 per month + Benefits',
    datePosted: '4 hours ago',
    url: 'https://www.pnet.co.za/jobs/full-stack-python-react-takealot-102',
    applyType: 'portal',
    referenceNumber: 'TAK-ENG-4402',
    category: 'Software Engineering',
    employmentType: 'Full-time / Remote Friendly',
    description: `Join Takealot’s core logistics and catalog engineering team! We are seeking a talented Full Stack Software Developer skilled in Python, Django, and modern React interfaces to build high-throughput eCommerce services.

What you will do:
- Implement end-to-end features across Django backend and React frontend.
- Optimize database transactions in PostgreSQL and caching layers with Redis.
- Orchestrate distributed tasks for order fulfillment and stock alerts.
- Participate in code reviews and automated testing.

Please complete the PNet online application form and questionnaire to be considered by our talent acquisition team.`,
    requirements: [
      'Degree or Diploma in Computer Science or equivalent practical experience',
      '3+ years building web applications with Python/Django and React',
      'Solid understanding of RESTful API design and SQL databases (PostgreSQL)',
      'Experience with background task queues and containerized deployments',
      'South African citizenship or valid work permit'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'Are you legally authorized to work in South Africa without visa sponsorship?',
        type: 'choice',
        options: ['Yes - South African Citizen', 'Yes - Permanent Resident', 'Yes - Valid Critical Skills Visa', 'No'],
        applicantAnswer: 'Yes - South African Citizen',
        aiReasoning: 'Profile confirms South African citizenship.',
        isRequired: true
      },
      {
        id: 'q2',
        question: 'How many years of professional experience do you have with Python and Django?',
        type: 'choice',
        options: ['Less than 1 year', '1 - 2 years', '3 - 5 years', '5+ years'],
        applicantAnswer: '3 - 5 years',
        aiReasoning: 'Profile reflects 4 years of hands-on professional Python experience.',
        isRequired: true
      },
      {
        id: 'q3',
        question: 'What is your highest level of completed education?',
        type: 'choice',
        options: ['High School / Matric', 'Diploma', 'Bachelor Degree', 'Postgraduate / Honours / Masters'],
        applicantAnswer: 'Bachelor Degree',
        aiReasoning: 'Matches BSc / IT Diploma qualification on file.',
        isRequired: true
      },
      {
        id: 'q4',
        question: 'Briefly describe your experience building background queues and caching mechanisms.',
        type: 'text',
        applicantAnswer: 'I have designed distributed task processing architectures utilizing Celery worker clusters and Celery Beat for periodic task orchestration backed by Redis queues in Django, achieving high fault-tolerance and sub-50ms cache retrieval.',
        aiReasoning: 'Tailored answer synthesized from CV background.',
        isRequired: true
      }
    ],
    matchScore: 94,
    matchReasons: [
      'Exact Python + Django + React stack alignment',
      'Remote friendly position in South Africa',
      'Full qualification criteria satisfied'
    ],
    missingKeywords: [],
    status: 'new'
  },
  {
    id: 'pnet-job-103',
    title: 'Python Backend & Data Systems Engineer',
    company: 'First National Bank (FNB) Digital Innovation Lab',
    location: 'Sandton, Johannesburg',
    province: 'Gauteng',
    salary: 'R50,000 - R65,000 pm',
    datePosted: '5 hours ago',
    url: 'https://www.pnet.co.za/jobs/python-data-systems-fnb-103',
    applyType: 'email',
    advertiserEmail: 'fnb.fintech.careers@firstrand.co.za',
    referenceNumber: 'FNB-DIL-771',
    category: 'FinTech',
    employmentType: 'Permanent',
    description: `FNB Digital Lab is searching for a Python Developer who loves building high-reliability financial data processing pipelines. You will collaborate with our cloud architecture team to maintain transactional services, Redis pub/sub streams, and Celery task execution nodes.

Applicants must email CV and cover letter to fnb.fintech.careers@firstrand.co.za with subject "FNB-DIL-771: Application for Python Data Systems Engineer".`,
    requirements: [
      'Experience in Python, Django or FastAPI, and relational databases (PostgreSQL)',
      'Working knowledge of asynchronous programming, Redis, and message brokers',
      'Experience in containerization (Docker) and Linux servers',
      'Banking or FinTech sector experience is an advantage'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'Do you have a clean credit record and criminal check (required for banking sector)?',
        type: 'choice',
        options: ['Yes', 'No'],
        applicantAnswer: 'Yes',
        aiReasoning: 'Standard affirmative qualification for bank recruitment.',
        isRequired: true
      },
      {
        id: 'q2',
        question: 'What is your current notice period?',
        type: 'choice',
        options: ['Immediate', '14 days', '30 days / 1 calendar month', '60 days+'],
        applicantAnswer: '30 days / 1 calendar month',
        aiReasoning: 'Standard 30 days notice.',
        isRequired: true
      }
    ],
    matchScore: 92,
    matchReasons: [
      'FinTech experience on CV matches role perfectly',
      'Strong proficiency in Python, Redis, and PostgreSQL'
    ],
    missingKeywords: [],
    status: 'new'
  },
  {
    id: 'pnet-job-104',
    title: 'Django Web Developer (Full Stack)',
    company: 'Standard Bank South Africa - Personal & Private Banking',
    location: 'Rosebank, Johannesburg',
    province: 'Gauteng',
    salary: 'R52,000 - R68,000 pm',
    datePosted: '1 day ago',
    url: 'https://www.pnet.co.za/jobs/django-developer-standard-bank-104',
    applyType: 'portal',
    referenceNumber: 'SB-ENG-9012',
    category: 'Information Technology',
    employmentType: 'Permanent',
    description: `Standard Bank is seeking a passionate Django Developer to build modern customer-facing portals. You will craft scalable APIs, design database schemas in PostgreSQL, and maintain background email/notification jobs via Celery.

Please complete the standard PNet online screening application.`,
    requirements: [
      '3+ years working with Python, Django, DRF',
      'Experience with PostgreSQL, Celery, Redis',
      'Sound understanding of REST APIs and UI integration'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'Do you hold a valid Code 08 Driver’s License?',
        type: 'choice',
        options: ['Yes', 'No'],
        applicantAnswer: 'Yes',
        aiReasoning: 'Profile confirms Code 08 (EB) Driver License.',
        isRequired: true
      },
      {
        id: 'q2',
        question: 'Have you worked with Celery Beat schedulers in production?',
        type: 'choice',
        options: ['Yes, extensively', 'Yes, basic tasks', 'No'],
        applicantAnswer: 'Yes, extensively',
        aiReasoning: 'Profile highlights Celery Beat scheduling background.',
        isRequired: true
      }
    ],
    matchScore: 91,
    matchReasons: [
      'Complete stack match: Django, Postgres, Celery, Redis',
      'Gauteng location close to applicant residence'
    ],
    missingKeywords: [],
    status: 'applied_email',
    appliedAt: '2026-09-01T09:45:00Z',
    applicationMethod: 'email',
    emailSubject: 'Application: Django Web Developer (Ref: SB-ENG-9012) - Bethuel Moukangwe',
    confirmationRef: 'PNET-DISPATCH-994182'
  },
  {
    id: 'pnet-job-105',
    title: 'DevOps & Python Automation Engineer',
    company: 'Discovery Health / Vitality',
    location: 'Sandton, Johannesburg',
    province: 'Gauteng',
    salary: 'R58,000 - R75,000 pm',
    datePosted: '1 day ago',
    url: 'https://www.pnet.co.za/jobs/devops-python-automation-discovery-105',
    applyType: 'email',
    advertiserEmail: 'techcareers@discovery-talent.co.za',
    referenceNumber: 'DISC-AUTO-3301',
    category: 'Information Technology',
    employmentType: 'Permanent',
    description: `Discovery is expanding its automated health data infrastructure. We require an Automation Engineer skilled in Python scripting, Nginx reverse proxy configuration, Linux server administration, and Celery job distribution to streamline data exchange with partner medical facilities.

Email CV with subject "DISC-AUTO-3301 Application" to techcareers@discovery-talent.co.za.`,
    requirements: [
      'Strong Python scripting and automated testing skills',
      'Knowledge of Linux, Nginx, Gunicorn, and Docker orchestration',
      'Experience setting up Redis task queues and Celery background workers'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'What is your expected monthly salary in ZAR?',
        type: 'number',
        applicantAnswer: '58000',
        aiReasoning: 'Matches starting salary band for this senior automation role.',
        isRequired: true
      }
    ],
    matchScore: 89,
    matchReasons: [
      'Matches Python automation, Nginx, Linux, and Celery skills',
      'Reputable enterprise employer in Sandton'
    ],
    missingKeywords: ['Vitality SDK'],
    status: 'applied_portal',
    appliedAt: '2026-09-01T10:12:00Z',
    applicationMethod: 'portal',
    confirmationRef: 'PNET-PORTAL-CONF-774128'
  },
  {
    id: 'pnet-job-106',
    title: 'Junior to Intermediate Python Django Developer',
    company: 'Capitec Bank Tech Hub',
    location: 'Stellenbosch / Remote Hybrid',
    province: 'Western Cape',
    salary: 'R40,000 - R52,000 pm',
    datePosted: '2 days ago',
    url: 'https://www.pnet.co.za/jobs/python-django-capitec-106',
    applyType: 'both',
    advertiserEmail: 'digital.recruitment@capitecbank.co.za',
    referenceNumber: 'CAP-TECH-6601',
    category: 'FinTech',
    employmentType: 'Permanent',
    description: `Capitec is South Africa’s leading digital bank. We are hiring a Python & Django Developer to build resilient backend services supporting our millions of active mobile banking clients.

Apply directly via PNet portal or send CV to digital.recruitment@capitecbank.co.za.`,
    requirements: [
      '2+ years experience in Python and Django',
      'Knowledge of PostgreSQL, Redis, REST APIs',
      'Eager to learn event-driven architectures and distributed workers'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'Are you willing to work in a hybrid model (partially remote / office in Stellenbosch or Gauteng hub)?',
        type: 'choice',
        options: ['Yes, fully flexible', 'Remote only', 'Office only'],
        applicantAnswer: 'Yes, fully flexible',
        aiReasoning: 'Applicant indicated hybrid/remote flexibility.',
        isRequired: true
      }
    ],
    matchScore: 95,
    matchReasons: [
      'Direct match for Python/Django and PostgreSQL',
      'Capitec provides top tier tech environment'
    ],
    missingKeywords: [],
    status: 'new'
  }
];

export const initialCeleryWorkers: CeleryWorkerNode[] = [
  {
    id: 'worker-email-1',
    name: 'celery@worker_email_node_01',
    concurrency: 4,
    activeTasksCount: 0,
    totalProcessed: 142,
    uptime: '18h 42m',
    queue: 'email_dispatch_queue',
    status: 'ONLINE',
    lastHeartbeat: '5s ago'
  },
  {
    id: 'worker-portal-1',
    name: 'celery@worker_portal_node_01',
    concurrency: 2,
    activeTasksCount: 0,
    totalProcessed: 98,
    uptime: '18h 42m',
    queue: 'portal_apply_queue',
    status: 'ONLINE',
    lastHeartbeat: '3s ago'
  },
  {
    id: 'worker-scraper-1',
    name: 'celery@worker_scraper_node_01',
    concurrency: 2,
    activeTasksCount: 0,
    totalProcessed: 310,
    uptime: '18h 42m',
    queue: 'pnet_discovery_queue',
    status: 'ONLINE',
    lastHeartbeat: '2s ago'
  }
];

export const initialTaskLogs: CeleryTaskLog[] = [
  {
    id: 'task-uuid-88319',
    taskName: 'jobs.tasks.apply_via_email_task',
    queue: 'email_dispatch_queue',
    worker: 'celery@worker_email_node_01',
    jobId: 'pnet-job-104',
    jobTitle: 'Django Web Developer (Full Stack)',
    company: 'Standard Bank South Africa',
    status: 'SUCCESS',
    startedAt: '2026-09-01T09:44:48Z',
    finishedAt: '2026-09-01T09:45:00Z',
    durationMs: 1240,
    retries: 0,
    resultSummary: 'Email sent via SMTP (smtp.gmail.com:587) with Russia_Bethuel_Moukangwe_CV.pdf + ExploreAI_Certificate.pdf attached. Ref: SB-ENG-9012.'
  },
  {
    id: 'task-uuid-88320',
    taskName: 'jobs.tasks.headless_pnet_portal_apply',
    queue: 'portal_apply_queue',
    worker: 'celery@worker_portal_node_01',
    jobId: 'pnet-job-105',
    jobTitle: 'DevOps & Python Automation Engineer',
    company: 'Discovery Health / Vitality',
    status: 'SUCCESS',
    startedAt: '2026-09-01T10:11:32Z',
    finishedAt: '2026-09-01T10:12:00Z',
    durationMs: 4120,
    retries: 0,
    resultSummary: 'PNet login verified -> Questionnaire filled (1 question) -> Dual attachments uploaded (CV + ExploreAI Certificate) -> Application submitted. Confirmation: PNET-PORTAL-CONF-774128.'
  },
  {
    id: 'task-uuid-88321',
    taskName: 'jobs.tasks.scan_pnet_jobs_task',
    queue: 'pnet_discovery_queue',
    worker: 'celery@worker_scraper_node_01',
    status: 'SUCCESS',
    startedAt: '2026-09-01T11:30:00Z',
    finishedAt: '2026-09-01T11:30:14Z',
    durationMs: 14200,
    retries: 0,
    resultSummary: 'Scanned 6 active PNet posts across Gauteng & Western Cape. 4 matched criteria (score >= 65%).'
  }
];

export const initialCvDocuments: CVDocument[] = [
  {
    id: 'cv-doc-001',
    fileName: 'Russia_Bethuel_Moukangwe_CV.pdf',
    fileSize: '284 KB',
    uploadedAt: '2026-08-30T09:00:00Z',
    fileUrl: '/media/resumes/Russia_Bethuel_Moukangwe_CV.pdf',
    isPrimary: true,
    docType: 'cv',
    alwaysAttach: true,
    version: 'v4.2 (Production Candidate CV)',
    parsedSummary: '5+ years Data Engineering & Python/Django with Apache Spark, SQL, Celery, Redis, AWS, Docker & Big Data.',
    parsedSkills: ['Python', 'Django', 'SQL', 'PostgreSQL', 'Apache Spark', 'PySpark', 'Celery', 'Redis', 'AWS', 'Docker', 'Power BI', 'ETL/ELT']
  },
  {
    id: 'cv-doc-002',
    fileName: 'ExploreAI_Data_Engineering_Certificate_Russia_Bethuel_Moukangwe.pdf',
    fileSize: '412 KB',
    uploadedAt: '2026-08-30T09:05:00Z',
    fileUrl: '/media/certificates/ExploreAI_Data_Engineering_Certificate_Russia_Bethuel_Moukangwe.pdf',
    isPrimary: false,
    docType: 'certificate',
    alwaysAttach: true,
    version: 'Official Certificate (Issued 09 Dec 2023)',
    issuingOrganization: 'EXPLORE AI ACADEMY',
    issueDate: '09 December 2023',
    parsedSummary: 'Certificate of Completion in Data Engineering: Cloud Computing, Big Data, Database Management, ETL/ELT, Python, Distributed Computing & Spark.',
    parsedSkills: ['Cloud Computing', 'Automation Scripting', 'Big Data', 'Database Management', 'ETL/ELT', 'Python Programming', 'Distributed Computing', 'Spark']
  },
  {
    id: 'cv-doc-003',
    fileName: 'UNISA_BSc_Mathematics_Certificate_Russia_Bethuel_Moukangwe.pdf',
    fileSize: '356 KB',
    uploadedAt: '2026-08-25T11:20:00Z',
    fileUrl: '/media/degrees/UNISA_BSc_Mathematics_Certificate.pdf',
    isPrimary: false,
    docType: 'degree',
    alwaysAttach: false,
    version: 'Degree Certificate (2012-2019 Completed)',
    issuingOrganization: 'University of South Africa (UNISA)',
    issueDate: 'November 2019',
    parsedSummary: 'BSc - Baccalaureus Scientiae in Mathematics and Applied Mathematics qualification certificate.',
    parsedSkills: ['Mathematics', 'Applied Mathematics', 'Statistical Modeling', 'Quantitative Analysis']
  }
];

export const initialExperiences: WorkExperience[] = [
  {
    id: 'exp-01',
    company: 'EXPLOREAI Cape Town South Africa',
    role: 'Data Engineer Intern (Integrated Project)',
    location: 'Cape Town (Remote), South Africa',
    startDate: '2023-08',
    endDate: '2023-12',
    isCurrent: false,
    description: 'Architected automated ELT/ETL pipelines, database schemas, and Big Data transformations using Apache Spark and Python. Implemented cloud automation scripts and data profiling routines ensuring high data quality and automated test coverage.'
  },
  {
    id: 'exp-02',
    company: 'Department of Higher Education and Training',
    role: 'Mathematics, Physical Sciences & Math Literacy Lecturer (Grade 12)',
    location: 'Gauteng, South Africa',
    startDate: '2008-02',
    endDate: '2025-03',
    isCurrent: false,
    description: 'Lectured Grade 12 students in advanced quantitative analysis, statistical modeling, physical sciences, and mathematical logic. Mentored over 1,500+ learners.'
  },
  {
    id: 'exp-03',
    company: 'Umalusi Quality Council',
    role: 'Evaluator / Subject Specialist / Team Leader',
    location: 'Pretoria, South Africa',
    startDate: '2014-01',
    endDate: 'Present',
    isCurrent: true,
    description: 'Lead evaluation teams and subject specialist panels for national educational standards, quality assurance framework development, and moderation.'
  },
  {
    id: 'exp-04',
    company: 'University of Pretoria',
    role: 'Physics Tutor and Mentor',
    location: 'Pretoria, South Africa',
    startDate: '2005-01',
    endDate: '2007-12',
    isCurrent: false,
    description: 'Conducted undergraduate laboratory mentoring, problem-solving workshops, and physics tutorial sessions.'
  }
];

export const initialEducations: EducationRecord[] = [
  {
    id: 'edu-01',
    institution: 'EXPLOREAI Academy, South Africa',
    degree: 'Data Engineering Course (Certificate of Completion)',
    fieldOfStudy: 'Cloud Computing, Big Data, ETL/ELT & Distributed Computing',
    graduationYear: '2023'
  },
  {
    id: 'edu-02',
    institution: 'University of South Africa (UNISA)',
    degree: 'BSc - Baccalaureus Scientiae (BSC Certificate Completed)',
    fieldOfStudy: 'Mathematics and Applied Mathematics',
    graduationYear: '2019'
  },
  {
    id: 'edu-03',
    institution: 'University of Pretoria',
    degree: 'BSc - Baccalaureus Scientiae (Physics)',
    fieldOfStudy: 'Physics & Mathematical Sciences',
    graduationYear: '2007 (Partially Completed)'
  }
];

export const initialEmailTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-01',
    name: 'High-Impact South Africa Data Engineer & Python Specialist Application',
    subjectTemplate: 'Application: {{job_title}} (Ref: {{ref_number}}) - {{full_name}}',
    bodyTemplate: `Dear {{company}} Hiring Team,

I am writing to express my strong interest in the {{job_title}} position advertised on PNet.

With over {{years_experience}} years of professional experience across Data Engineering, Python, Django, Apache Spark, SQL, Celery, and cloud data pipelines, I am confident in delivering immediate value to {{company}}.

Key Technical & Professional Highlights:
• Robust Data & Backend Pipelines: Python, Django REST Framework, Celery task workers, Redis, and Apache Spark / PySpark.
• Cloud & Big Data Infrastructure: AWS (S3, ECS, RDS), Docker containerization, Nginx, and Linux server environments.
• Database Mastery: Advanced PostgreSQL & SQL schema modeling, data profiling, and automated data quality testing.
• Qualifications & Credentials: BSc in Mathematics & Applied Mathematics (UNISA) and Certified Data Engineer (ExploreAI Academy).
• Location & Availability: Based in {{city}}, {{province}} with a {{notice_period}} days notice period.

Please find my comprehensive CV and ExploreAI Data Engineering Certificate attached for your review. I look forward to the possibility of discussing how my technical background aligns with your engineering goals.

Kind regards,
{{full_name}}
{{email}} | {{phone}}`,
    isDefault: true,
    category: 'direct_apply' as const,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'tmpl-02',
    name: 'Short & Direct Recruiter Outreach Template (CV + Certificate)',
    subjectTemplate: 'Application for {{job_title}} - {{full_name}} (Data Engineer & Python Specialist)',
    bodyTemplate: `Hi {{company}} Recruitment Team,

Please accept my application for the {{job_title}} opening. My comprehensive CV and ExploreAI Data Engineering Certificate are attached.

Summary of Qualifications:
- 5+ years experience in Python, SQL, Apache Spark, Django, Celery, and PostgreSQL engineering
- Certified in Data Engineering (ExploreAI Academy) & BSc in Mathematics (UNISA)
- Code 08 Driver's License | South African Citizen | Available within {{notice_period}} days

Thank you for your time and consideration.

Best regards,
{{full_name}}
{{phone}}`,
    isDefault: false,
    category: 'direct_apply' as const,
    createdAt: '2026-08-10T14:30:00Z'
  }
];

export const initialWebsiteContent: WebsiteContentConfig = {
  siteTitle: 'PNet Auto-Applier & Job Automation System',
  bannerAnnouncement: '⚡ Live Celery Worker Fleet Active: Automated discovery & direct application pipelines enabled for Russia Bethuel Moukangwe across Gauteng and South Africa.',
  bannerEnabled: true,
  heroHeadline: 'Autonomous PNet Job Discovery & Instant Application Engine',
  heroSubheadline: 'Production Django 5.0 backend paired with Celery distributed workers, Redis queues, and Playwright browser automation with automated CV and ExploreAI Certificate delivery.',
  footerNote: 'Engineered with Django, Celery, Redis, PostgreSQL, Prometheus, and Nginx. Compliant with POPIA and South African labor standards.',
  targetLocations: ['Johannesburg, Gauteng', 'Pretoria, Gauteng', 'Kempton Park, Gauteng', 'Sandton, Gauteng', 'Midrand, Gauteng', 'Cape Town, Western Cape', 'Durban, KwaZulu-Natal', 'Remote / Hybrid (South Africa)'],
  targetSkills: ['Python', 'Data Engineering', 'Django', 'SQL', 'Apache Spark', 'PySpark', 'Celery', 'Redis', 'PostgreSQL', 'Docker', 'AWS', 'Power BI'],
  dailyQuotaDefault: 30
};

