import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Upload, 
  Check, 
  Plus, 
  X, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Shield, 
  Briefcase, 
  Layers,
  Award,
  Paperclip,
  Eye,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileAndCvStudioProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSaveProfile: () => void;
}

export const ProfileAndCvStudio: React.FC<ProfileAndCvStudioProps> = ({
  profile,
  setProfile,
  onSaveProfile
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'documents' | 'experience' | 'certificate_preview'>('profile');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSave = () => {
    onSaveProfile();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        cvFileName: file.name,
        cvFileSize: `${Math.round(file.size / 1024)} KB`,
        cvUploadedAt: new Date().toISOString()
      }));
    }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        certificateFileName: file.name,
        certificateFileSize: `${Math.round(file.size / 1024)} KB`,
        certificateUploadedAt: new Date().toISOString()
      }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Active Candidate & Dual Attachment Status */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl shadow-inner">
            RB
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {profile.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> South African Citizen (EE/AA)
              </span>
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
              <span className="text-indigo-300 font-medium">{profile.primaryRole}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-neutral-500" /> {profile.city}, {profile.province}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-neutral-500" /> {profile.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" /> Saved &amp; Synced!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </div>

      {/* Persistent Dual-Attachment Indicator */}
      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <span>Automatic Application Dispatch Payload (Dual Attachments Active)</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.2 rounded font-mono">ALWAYS ATTACHED</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Every email dispatch and PNet portal submission automatically includes both your primary CV and ExploreAI Data Engineering Certificate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCvModal(true)}
            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-[11px] flex items-center gap-1"
          >
            <Eye className="w-3 h-3 text-indigo-400" /> View CV
          </button>
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-[11px] flex items-center gap-1"
          >
            <Award className="w-3 h-3 text-amber-400" /> View Certificate
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Personal, Credentials, Contact, Screening (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Contact & Personal Details */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <User className="w-4 h-4 text-indigo-400" /> Personal &amp; Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Full Legal Name:</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Primary Email Address:</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Cell Phones (Primary / Alt):</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Residential Address:</label>
                <input
                  type="text"
                  value={profile.address || '02 Erasmus, Norkem Park, Kempton Park 1618'}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">City &amp; Postal Code:</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Province:</label>
                <input
                  type="text"
                  value={profile.province}
                  onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Primary Professional Title:</label>
                <input
                  type="text"
                  value={profile.primaryRole}
                  onChange={(e) => setProfile({ ...profile, primaryRole: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Years of Experience:</label>
                <input
                  type="number"
                  value={profile.yearsOfExperience}
                  onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs text-neutral-400 font-medium">LinkedIn Profile URL:</label>
              <input
                type="text"
                value={profile.linkedinUrl || 'https://www.linkedin.com/in/bethuel-moukangwe'}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: PNet Screening Defaults */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <Shield className="w-4 h-4 text-indigo-400" /> South African Work Authorization &amp; Screening Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Notice Period (Days):</label>
                <input
                  type="number"
                  value={profile.noticePeriodDays}
                  onChange={(e) => setProfile({ ...profile, noticePeriodDays: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Expected Salary (ZAR/mo):</label>
                <input
                  type="number"
                  value={profile.expectedSalaryZAR}
                  onChange={(e) => setProfile({ ...profile, expectedSalaryZAR: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Current Salary (ZAR/mo):</label>
                <input
                  type="number"
                  value={profile.currentSalaryZAR}
                  onChange={(e) => setProfile({ ...profile, currentSalaryZAR: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Driver's License (Code 08 / EB):</label>
                <select
                  value={profile.hasDriversLicense ? 'yes' : 'no'}
                  onChange={(e) => setProfile({ ...profile, hasDriversLicense: e.target.value === 'yes' })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="yes">Yes - Code 08 (EB) Valid License</option>
                  <option value="no">No Driver's License</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Work Authorization:</label>
                <select
                  value={profile.workPermitStatus}
                  onChange={(e) => setProfile({ ...profile, workPermitStatus: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="South African Citizen">South African Citizen (EE/AA)</option>
                  <option value="Permanent Resident">Permanent Resident</option>
                  <option value="Critical Skills Work Visa">Critical Skills Work Visa</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs text-neutral-400 font-medium">Highest Formal Qualification:</label>
              <input
                type="text"
                value={profile.highestQualification}
                onChange={(e) => setProfile({ ...profile, highestQualification: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 3: Technical Skills Tags */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <Layers className="w-4 h-4 text-indigo-400" /> Core Technical Skills &amp; Stack Keywords
            </h3>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-950 text-neutral-200 border border-neutral-800 group"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add skill (e.g. PySpark, Airflow, Snowflake)..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: CV & Certificate Documents (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Document 1: Primary CV Document */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" /> 1. Primary Candidate CV
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ALWAYS ATTACH
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{profile.cvFileName}</h4>
                    <p className="text-[11px] text-neutral-400">{profile.cvFileSize} • Primary Resume</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCvModal(true)}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded text-xs flex items-center gap-1"
                >
                  <Eye className="w-3 h-3 text-indigo-400" /> Preview
                </button>
              </div>

              <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-neutral-800 hover:border-indigo-500/60 rounded-lg cursor-pointer text-xs font-medium text-neutral-400 hover:text-indigo-300 transition-colors bg-neutral-900/40">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace CV (.pdf)</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCvUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Document 2: ExploreAI Certificate of Completion */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> 2. Official Certificate
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ALWAYS ATTACH
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/20 bg-gradient-to-br from-neutral-950 to-amber-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                    CERT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {profile.certificateFileName || 'ExploreAI_Data_Engineering_Certificate.pdf'}
                    </h4>
                    <p className="text-[11px] text-amber-300/80">
                      Explore AI Academy • Data Engineering Course (09 Dec 2023)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3 h-3" /> View Seal
                </button>
              </div>

              <div className="p-2.5 bg-neutral-900/80 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                  <span>Awarded: 09 December 2023</span>
                  <span className="text-emerald-400">Verified by ExploreAI</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Skills: Cloud Computing, Big Data, Database Management, ETL/ELT, Python Programming, Big Data Processing, Distributed Computing.
                </p>
              </div>

              <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-neutral-800 hover:border-amber-500/60 rounded-lg cursor-pointer text-xs font-medium text-neutral-400 hover:text-amber-300 transition-colors bg-neutral-900/40">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Certificate (.pdf)</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCertUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Professional Objective & Cover Letter Context */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Career Objective / Summary
            </h3>
            <textarea
              rows={4}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Parsed CV Text Content */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <FileText className="w-4 h-4 text-indigo-400" /> Parsed Resume Text (OCR &amp; AI Context)
            </h3>
            <textarea
              rows={6}
              value={profile.cvTextContent}
              onChange={(e) => setProfile({ ...profile, cvTextContent: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-[11px] font-mono text-neutral-400 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL: OFFICIAL CERTIFICATE OF COMPLETION VIEWER          */}
      {/* ========================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    EXPLORE AI ACADEMY - Certificate of Completion
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    Russia_Bethuel_Moukangwe_ExploreAI_Certificate.pdf
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCertificateModal(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Certificate Card Frame */}
            <div className="bg-neutral-950 border-2 border-neutral-800 rounded-xl p-8 text-center space-y-6 relative overflow-hidden shadow-inner">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Explore AI Academy Logo Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-black text-xl mb-1">
                  ▲
                </div>
                <div className="text-sm font-black tracking-widest text-teal-300 uppercase font-sans">
                  EXPLORE AI ACADEMY
                </div>
              </div>

              {/* Certificate Title */}
              <div className="space-y-1">
                <div className="text-2xl font-serif text-white tracking-wide">
                  Certificate of completion
                </div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-mono">
                  AWARDED TO
                </div>
              </div>

              {/* Candidate Name */}
              <div className="text-2xl font-bold text-sky-400 tracking-tight font-sans border-b border-neutral-800 pb-4 inline-block px-8">
                Russia Bethuel Moukangwe
              </div>

              {/* Course Title */}
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 uppercase tracking-wider">
                  FOR COMPLETING
                </div>
                <div className="text-lg font-bold text-white">
                  Data Engineering Course
                </div>
              </div>

              {/* Skills Acquired List */}
              <div className="max-w-md mx-auto bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 text-left text-xs text-neutral-300 space-y-2">
                <div className="font-bold text-neutral-200 text-center uppercase tracking-wider text-[11px] text-teal-300">
                  Skills Acquired
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-neutral-300">
                  <div>• Cloud Computing &amp; Automation</div>
                  <div>• Big Data Gathering &amp; Processing</div>
                  <div>• Database Management &amp; SQL</div>
                  <div>• ETL / ELT Development</div>
                  <div>• Python Programming</div>
                  <div>• Distributed Computing &amp; Spark</div>
                  <div>• Data Delivery Development</div>
                  <div>• THRIVE (Soft Skills)</div>
                </div>
              </div>

              {/* Date & Signature Row */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs text-neutral-400">
                <div className="text-left font-mono">
                  <div className="font-bold text-white">09 December 2023</div>
                  <div className="text-[10px]">DATE ISSUED</div>
                </div>

                <div className="w-16 h-16 rounded-full border border-teal-500/30 bg-teal-500/5 flex flex-col items-center justify-center text-[9px] text-teal-300 font-mono">
                  <span>ExploreAI</span>
                  <span className="font-bold">Est 2018</span>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-white italic">Shaun Dippnall</div>
                  <div className="text-[10px]">SHAUN DIPPNALL, CEO</div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configured to always attach to all PNet applications</span>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CANDIDATE CV DOCUMENT VIEWER                      */}
      {/* ========================================================= */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Russia Bethuel Moukangwe - Candidate CV
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    Russia_Bethuel_Moukangwe_CV.pdf (284 KB)
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCvModal(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 overflow-y-auto flex-1 text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
              {profile.cvTextContent}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Primary CV for Auto-Applier</span>
              </div>
              <button
                onClick={() => setShowCvModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Close CV
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
