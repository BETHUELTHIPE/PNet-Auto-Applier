import React, { useState } from 'react';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  Server, 
  Layers, 
  Database, 
  Cpu, 
  ShieldCheck,
  Zap,
  Globe,
  Activity,
  BarChart3
} from 'lucide-react';
import JSZip from 'jszip';
import { djangoProjectFiles, CodeFile } from '../data/djangoProjectCode';

export const DjangoArchitectureCenter: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const currentFile = djangoProjectFiles[selectedFileIndex] || djangoProjectFiles[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      djangoProjectFiles.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add a comprehensive README.md
      const readmeContent = `# PNet Auto-Applier: Python, Django, Celery, Redis, PostgreSQL, Prometheus & Grafana Stack

Production-ready automated job application system for PNet (South Africa) with complete observability.

## Architecture & Unified Docker Network

All services communicate over the isolated internal bridge network \`pnet_network\` (172.28.0.0/16):
- **Nginx Ingress**: Reverse proxy, Gzip compression, SSL, static file delivery & metric stub (Port 80/443)
- **Django Web / Admin**: Gunicorn WSGI + django-prometheus middleware (Port 8000, /metrics)
- **Celery Worker**: Distributed workers for automated email dispatch & Playwright portal form filling
- **Celery Beat**: Periodic cron scheduler for automated job polling every 30 minutes
- **Redis**: Message broker & result backend (Port 6379)
- **PostgreSQL 16**: Relational persistence for candidate profiles, jobs & application records (Port 5432)
- **Prometheus**: Metric aggregation scraping Django, Celery, Redis, and Postgres exporters (Port 9090)
- **Grafana**: Pre-provisioned visual observability dashboards (Port 3000, admin/admin)

## Quick Start (Docker Compose)

1. Clone or extract this repository:
   \`\`\`bash
   cd pnet_auto_applier
   \`\`\`

2. Configure environment variables in \`.env\`:
   \`\`\`env
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_HOST_USER=bethuelmoukangwe8@gmail.com
   EMAIL_HOST_PASSWORD=upzp vwnw hhwo dzio
   DATABASE_URL=postgresql://postgres:23498812@postgres:5432/pnetdb
   \`\`\`

3. Build and boot the entire stack in the same network:
   \`\`\`bash
   docker compose up --build -d
   \`\`\`

4. Run Django migrations:
   \`\`\`bash
   docker compose exec web python manage.py migrate
   \`\`\`

5. Access Endpoints:
   - **PNet Web App**: http://localhost
   - **Celery Flower Web Admin**: http://localhost:5555 (User: admin / Pass: admin123)
   - **Prometheus Metrics Console**: http://localhost:9090
   - **Grafana Visual Dashboards**: http://localhost:3000 (User: admin / Pass: admin)
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pnet-django-celery-prometheus-grafana-stack.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Python / Django / Celery / Prometheus / Grafana / Redis / Postgres Architecture
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Production codebase containerized with Docker &amp; Docker Compose on a single unified network with Prometheus monitoring and Grafana visualizations
          </p>
        </div>

        <button
          id="django-download-zip-btn"
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-950/20 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Packaging ZIP Archive...' : 'Download Full Stack (.ZIP)'}</span>
        </button>
      </div>

      {/* Architecture Topology Diagram */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Unified Docker Network Architecture (pnet_network)
          </h3>
          <span className="text-[11px] font-mono text-indigo-400">All 8 Core Services on 172.28.0.0/16</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
          
          {/* Step 1: Nginx & Web Ingress */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            <div className="text-indigo-400 font-bold text-xs flex items-center justify-center gap-1">
              <Server className="w-3.5 h-3.5" /> 1. Ingress
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Nginx (80/443)</div>
            <p className="text-[10px] text-neutral-400">SSL &amp; Gzip reverse proxy</p>
          </div>

          {/* Step 2: Gunicorn / Django */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            <div className="text-blue-400 font-bold text-xs flex items-center justify-center gap-1">
              <Globe className="w-3.5 h-3.5" /> 2. WSGI App
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Django + Gunicorn</div>
            <p className="text-[10px] text-neutral-400">REST API &amp; /metrics</p>
          </div>

          {/* Step 3: Redis & Celery Beat */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            <div className="text-rose-400 font-bold text-xs flex items-center justify-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> 3. Broker &amp; Cron
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Redis + Beat</div>
            <p className="text-[10px] text-neutral-400">PNet periodic scan schedule</p>
          </div>

          {/* Step 4: Celery Workers */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            <div className="text-purple-400 font-bold text-xs flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" /> 4. Workers
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Celery Workers</div>
            <p className="text-[10px] text-neutral-400">Playwright &amp; SMTP engine</p>
          </div>

          {/* Step 5: Celery Flower Admin */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-rose-800/80 bg-rose-950/20 space-y-1">
            <div className="text-rose-400 font-bold text-xs flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5" /> 5. Flower
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Flower (5555)</div>
            <p className="text-[10px] text-neutral-400">Worker &amp; task live admin</p>
          </div>

          {/* Step 6: PostgreSQL Database */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
              <Database className="w-3.5 h-3.5" /> 6. Database
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">PostgreSQL 16</div>
            <p className="text-[10px] text-neutral-400">Jobs, logs &amp; CV profiles</p>
          </div>

          {/* Step 7: Prometheus Monitor */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-indigo-800/80 bg-indigo-950/20 space-y-1">
            <div className="text-indigo-400 font-bold text-xs flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5" /> 7. Monitor
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Prometheus</div>
            <p className="text-[10px] text-neutral-400">Scrapes all 7 target nodes</p>
          </div>

          {/* Step 8: Grafana Visualizer */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-amber-800/80 bg-amber-950/20 space-y-1">
            <div className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> 8. Visualizer
            </div>
            <div className="font-mono text-xs text-white font-bold truncate">Grafana UI</div>
            <p className="text-[10px] text-neutral-400">Real-time charts &amp; alerts</p>
          </div>

        </div>
      </div>

      {/* Code Viewer: File Selector + Syntax Block */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left: Files List (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-950/80 border-r border-neutral-800 p-4 space-y-2">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
            Project Repository Files ({djangoProjectFiles.length})
          </div>

          <div className="space-y-1 max-h-[520px] overflow-y-auto">
            {djangoProjectFiles.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 text-indigo-400 font-bold ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-sans shrink-0 uppercase">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-neutral-950">
          
          {/* File Top Bar */}
          <div className="px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                <span>{currentFile.path}</span>
                <span className="text-[10px] text-neutral-400 font-sans font-normal">
                  ({currentFile.description})
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text Area */}
          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-neutral-300 leading-relaxed bg-neutral-950 selection:bg-indigo-600 selection:text-white">
            <pre className="whitespace-pre">{currentFile.content}</pre>
          </div>

        </div>

      </div>

    </div>
  );
};
