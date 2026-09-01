import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  RefreshCw,
  Send,
  Zap,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { PNetJob, UserProfile } from '../types';

interface LivePNetFeedProps {
  jobs: PNetJob[];
  profile: UserProfile;
  onOpenJob: (job: PNetJob) => void;
  onApplySingleJob: (job: PNetJob, method: 'email' | 'portal') => Promise<void>;
  onTriggerScrape: () => void;
  isScraping: boolean;
}

export const LivePNetFeed: React.FC<LivePNetFeedProps> = ({
  jobs,
  profile,
  onOpenJob,
  onApplySingleJob,
  onTriggerScrape,
  isScraping
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'email' | 'portal'>('all');
  const [minMatch, setMinMatch] = useState(60);

  const locations = ['All', 'Gauteng', 'Johannesburg', 'Western Cape', 'Cape Town', 'Remote'];

  const filteredJobs = jobs.filter((job) => {
    const matchesKeyword = 
      searchKeyword === '' ||
      job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchesLocation = 
      selectedLocation === 'All' || 
      job.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      job.province.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesChannel = 
      selectedChannel === 'all' ||
      job.applyType === selectedChannel ||
      job.applyType === 'both';

    const matchesScore = job.matchScore >= minMatch;

    return matchesKeyword && matchesLocation && matchesChannel && matchesScore;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="pnet-feed-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search PNet jobs by title, skills (Python, Django, Celery...), or company..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Scrape Trigger Button */}
          <button
            id="pnet-feed-trigger-scrape-btn"
            onClick={onTriggerScrape}
            disabled={isScraping}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping PNet.co.za...' : 'Poll PNet for New Posts'}</span>
          </button>

        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80 text-xs">
          
          {/* Location filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-400 font-medium mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location:
            </span>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedLocation === loc
                    ? 'bg-neutral-800 text-indigo-400 font-bold ring-1 ring-indigo-500/40'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Apply Channel filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium">Apply Channel:</span>
            <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
              <button
                onClick={() => setSelectedChannel('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedChannel === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedChannel('email')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  selectedChannel === 'email' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Mail className="w-3 h-3 text-indigo-400" /> Email Only
              </button>
              <button
                onClick={() => setSelectedChannel('portal')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  selectedChannel === 'portal' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Globe className="w-3 h-3 text-purple-400" /> PNet Forms Only
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Jobs Listing Grid */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>Showing <strong className="text-white font-mono">{filteredJobs.length}</strong> matching PNet job postings</span>
          <span>Matched to candidate: <strong className="text-indigo-400">{profile.fullName}</strong> ({profile.primaryRole})</span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-400 space-y-3">
            <Briefcase className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No job postings found matching your filters</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Try adjusting your search keywords, location filters, or click "Poll PNet for New Posts" to fetch fresh listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
              const isApplied = job.status === 'applied_email' || job.status === 'applied_portal';

              return (
                <div 
                  key={job.id}
                  className={`bg-neutral-900 border rounded-xl p-5 shadow-lg transition-all flex flex-col justify-between ${
                    isApplied 
                      ? 'border-emerald-500/30 bg-gradient-to-b from-neutral-900 to-emerald-950/10' 
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Header: Title, Company, Match Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-300 font-medium mt-0.5">
                          {job.company}
                        </p>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                          {job.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Metadata Row: Location, Salary, Reference, Date */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1 text-neutral-300">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        {job.salary}
                      </span>
                      {job.referenceNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-neutral-400">Ref: {job.referenceNumber}</span>
                        </>
                      )}
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Requirements Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-950 text-neutral-300 border border-neutral-800"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-neutral-400 bg-neutral-950 border border-neutral-800">
                          +{job.requirements.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Application Method & Questionnaire Indicator */}
                    <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {job.applyType === 'email' ? (
                          <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[11px]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Direct Email: <strong className="text-neutral-200">{job.advertiserEmail}</strong></span>
                          </div>
                        ) : job.applyType === 'portal' ? (
                          <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[11px]">
                            <Globe className="w-3.5 h-3.5" />
                            <span>PNet Portal Form ({job.screeningQuestions.length} Questions)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Dual Channel: Email &amp; PNet Portal</span>
                          </div>
                        )}
                      </div>

                      {job.screeningQuestions.length > 0 && (
                        <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                          {job.screeningQuestions.length} Form Qs
                        </span>
                      )}
                    </div>

                    {/* If Applied: Display Confirmation Reference */}
                    {isApplied && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Applied via {job.applicationMethod === 'email' ? 'Direct Email' : 'PNet Portal'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-400">
                          {job.confirmationRef}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Action Buttons Footer */}
                  <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    
                    <button
                      id={`pnet-inspect-btn-${job.id}`}
                      onClick={() => onOpenJob(job)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 transition-colors flex items-center gap-1.5"
                    >
                      <span>Inspect &amp; Customize</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {job.applyType === 'email' || job.applyType === 'both' ? (
                        <button
                          id={`pnet-apply-email-${job.id}`}
                          onClick={() => onApplySingleJob(job, 'email')}
                          disabled={isApplied}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white transition-colors flex items-center gap-1 shadow-md shadow-indigo-900/20"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isApplied ? 'Applied' : 'Email CV'}</span>
                        </button>
                      ) : null}

                      {job.applyType === 'portal' || job.applyType === 'both' ? (
                        <button
                          id={`pnet-apply-portal-${job.id}`}
                          onClick={() => onApplySingleJob(job, 'portal')}
                          disabled={isApplied}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white transition-colors flex items-center gap-1 shadow-md shadow-purple-950/20"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{isApplied ? 'Applied' : 'Auto-Fill Form'}</span>
                        </button>
                      ) : null}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
