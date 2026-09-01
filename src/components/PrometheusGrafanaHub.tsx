import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Layers, 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Search, 
  ExternalLink, 
  Radio, 
  ShieldCheck, 
  Clock, 
  Terminal,
  Send,
  Globe,
  HardDrive
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface PrometheusGrafanaHubProps {
  onOpenCodeArchitecture?: () => void;
}

export const PrometheusGrafanaHub: React.FC<PrometheusGrafanaHubProps> = ({ onOpenCodeArchitecture }) => {
  const [activeSubTab, setActiveSubTab] = useState<'grafana' | 'promql' | 'targets' | 'alerts'>('grafana');
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '6h'>('15m');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [promqlQuery, setPromqlQuery] = useState('rate(celery_tasks_completed_total[1m])');
  const [promqlResult, setPromqlResult] = useState<any[]>([]);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5); // seconds
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);

  // Time-series mock data for Grafana panels that updates in real-time
  const [taskMetrics, setTaskMetrics] = useState([
    { time: '14:20', emailTasks: 3, portalTasks: 2, scrapeTasks: 6, taskLatencyMs: 1420 },
    { time: '14:22', emailTasks: 5, portalTasks: 3, scrapeTasks: 8, taskLatencyMs: 1380 },
    { time: '14:24', emailTasks: 8, portalTasks: 4, scrapeTasks: 12, taskLatencyMs: 1510 },
    { time: '14:26', emailTasks: 4, portalTasks: 5, scrapeTasks: 7, taskLatencyMs: 1290 },
    { time: '14:28', emailTasks: 9, portalTasks: 6, scrapeTasks: 14, taskLatencyMs: 1620 },
    { time: '14:30', emailTasks: 12, portalTasks: 8, scrapeTasks: 18, taskLatencyMs: 1480 },
    { time: '14:32', emailTasks: 7, portalTasks: 4, scrapeTasks: 9, taskLatencyMs: 1350 },
    { time: '14:34', emailTasks: 11, portalTasks: 7, scrapeTasks: 15, taskLatencyMs: 1540 },
  ]);

  const [dbRedisMetrics, setDbRedisMetrics] = useState([
    { time: '14:20', pgConnections: 12, pgTps: 45, redisMemoryMb: 32.4, redisOps: 320 },
    { time: '14:22', pgConnections: 14, pgTps: 52, redisMemoryMb: 33.1, redisOps: 380 },
    { time: '14:24', pgConnections: 18, pgTps: 68, redisMemoryMb: 34.5, redisOps: 460 },
    { time: '14:26', pgConnections: 15, pgTps: 55, redisMemoryMb: 33.8, redisOps: 390 },
    { time: '14:28', pgConnections: 21, pgTps: 82, redisMemoryMb: 36.2, redisOps: 540 },
    { time: '14:30', pgConnections: 24, pgTps: 94, redisMemoryMb: 37.9, redisOps: 610 },
    { time: '14:32', pgConnections: 16, pgTps: 60, redisMemoryMb: 35.1, redisOps: 420 },
    { time: '14:34', pgConnections: 22, pgTps: 88, redisMemoryMb: 37.4, redisOps: 580 },
  ]);

  const [deliverySuccessMetrics, setDeliverySuccessMetrics] = useState([
    { time: '14:20', emailsSent: 3, emailsFailed: 0, portalSubmitted: 2, portalFailed: 0 },
    { time: '14:22', emailsSent: 5, emailsFailed: 0, portalSubmitted: 3, portalFailed: 0 },
    { time: '14:24', emailsSent: 8, emailsFailed: 0, portalSubmitted: 4, portalFailed: 0 },
    { time: '14:26', emailsSent: 4, emailsFailed: 0, portalSubmitted: 5, portalFailed: 0 },
    { time: '14:28', emailsSent: 9, emailsFailed: 0, portalSubmitted: 6, portalFailed: 0 },
    { time: '14:30', emailsSent: 12, emailsFailed: 1, portalSubmitted: 8, portalFailed: 0 },
    { time: '14:32', emailsSent: 7, emailsFailed: 0, portalSubmitted: 4, portalFailed: 0 },
    { time: '14:34', emailsSent: 11, emailsFailed: 0, portalSubmitted: 7, portalFailed: 0 },
  ]);

  // Prometheus Targets definition in the unified Docker network
  const [prometheusTargets] = useState([
    {
      job: 'django_web',
      instance: 'pnet_django_web:8000',
      ip: '172.28.0.5',
      endpoint: '/metrics',
      state: 'UP',
      lastScrape: '2s ago',
      scrapeDuration: '14.2ms',
      labels: { app: 'pnet-bot', env: 'production', framework: 'django-gunicorn' }
    },
    {
      job: 'celery_exporter',
      instance: 'pnet_celery_exporter:8888',
      ip: '172.28.0.8',
      endpoint: '/metrics',
      state: 'UP',
      lastScrape: '3s ago',
      scrapeDuration: '8.7ms',
      labels: { app: 'celery-worker', queues: 'email,portal,scrape' }
    },
    {
      job: 'redis_exporter',
      instance: 'pnet_redis_exporter:9121',
      ip: '172.28.0.9',
      endpoint: '/metrics',
      state: 'UP',
      lastScrape: '1s ago',
      scrapeDuration: '4.1ms',
      labels: { app: 'redis-broker', version: '7.2-alpine' }
    },
    {
      job: 'postgres_exporter',
      instance: 'pnet_postgres_exporter:9187',
      ip: '172.28.0.10',
      endpoint: '/metrics',
      state: 'UP',
      lastScrape: '2s ago',
      scrapeDuration: '18.9ms',
      labels: { app: 'postgresql', database: 'pnetdb' }
    },
    {
      job: 'nginx_ingress',
      instance: 'pnet_nginx:80',
      ip: '172.28.0.4',
      endpoint: '/stub_status',
      state: 'UP',
      lastScrape: '4s ago',
      scrapeDuration: '3.6ms',
      labels: { app: 'nginx-reverse-proxy', ports: '80,443' }
    },
    {
      job: 'prometheus_self',
      instance: 'pnet_prometheus:9090',
      ip: '172.28.0.11',
      endpoint: '/metrics',
      state: 'UP',
      lastScrape: '1s ago',
      scrapeDuration: '2.4ms',
      labels: { app: 'prometheus', retention: '15d' }
    },
    {
      job: 'celery_flower',
      instance: 'pnet_celery_flower:5555',
      ip: '172.28.0.13',
      endpoint: '/metrics',
      state: 'UP',
      lastScrape: '2s ago',
      scrapeDuration: '3.1ms',
      labels: { app: 'celery-flower', auth: 'basic', version: '2.0.1' }
    }
  ]);

  // Prometheus Alert Rules
  const alertRules = [
    {
      name: 'PNetRateLimitTriggered',
      severity: 'warning',
      state: 'OK',
      condition: 'rate(pnet_scrape_errors_total[5m]) > 0.1',
      description: 'PNet scraping received 429 or captcha block. Jitter auto-escalating.'
    },
    {
      name: 'CeleryQueueBacklogHigh',
      severity: 'critical',
      state: 'OK',
      condition: 'celery_queue_length{queue="email_dispatch_queue"} > 50',
      description: 'Application email dispatch queue exceeds 50 pending items.'
    },
    {
      name: 'PostgresConnectionPoolExhaustion',
      severity: 'warning',
      state: 'OK',
      condition: 'pg_stat_database_numbackends{datname="pnet_db"} > 80',
      description: 'PostgreSQL connection count is at >80% of max_connections (100).'
    },
    {
      name: 'SMTPDeliveryFailureSpike',
      severity: 'critical',
      state: 'OK',
      condition: 'rate(smtp_emails_failed_total[5m]) / rate(smtp_emails_sent_total[5m]) > 0.05',
      description: 'Outbound CV SMTP failure rate exceeds 5% threshold.'
    },
    {
      name: 'PlaywrightHeadlessBrowserTimeout',
      severity: 'warning',
      state: 'OK',
      condition: 'increase(playwright_portal_timeouts_total[10m]) > 2',
      description: 'Headless browser timed out filling PNet questionnaires.'
    }
  ];

  // PromQL query predefined suggestions
  const promqlPresets = [
    { label: 'Celery Tasks Rate', query: 'rate(celery_tasks_completed_total[1m])' },
    { label: 'PNet Scraped Total', query: 'pnet_jobs_scraped_total' },
    { label: 'SMTP Emails Sent', query: 'smtp_emails_sent_total{status="success"}' },
    { label: 'Playwright Portal Submissions', query: 'playwright_portal_submissions_total' },
    { label: 'Postgres Connections', query: 'pg_stat_database_numbackends{datname="pnet_db"}' },
    { label: 'Redis Memory (MB)', query: 'redis_memory_used_bytes / 1024 / 1024' },
    { label: 'HTTP Request Rate', query: 'rate(django_http_requests_total_by_view_transport_total[1m])' }
  ];

  // Execute PromQL simulation
  const handleExecutePromQL = (queryToRun?: string) => {
    const q = queryToRun || promqlQuery;
    setIsRefreshing(true);

    setTimeout(() => {
      let results: any[] = [];
      const timestamp = Math.floor(Date.now() / 1000);

      if (q.includes('celery_tasks')) {
        results = [
          { metric: { __name__: 'celery_tasks_completed_total', queue: 'email_dispatch_queue', worker: 'celery@worker_email_node_01' }, value: [timestamp, '18.4 req/min'] },
          { metric: { __name__: 'celery_tasks_completed_total', queue: 'portal_apply_queue', worker: 'celery@worker_portal_node_01' }, value: [timestamp, '9.2 req/min'] },
          { metric: { __name__: 'celery_tasks_completed_total', queue: 'pnet_discovery_queue', worker: 'celery@worker_scrape_node_01' }, value: [timestamp, '2.0 req/min'] }
        ];
      } else if (q.includes('pnet_jobs_scraped')) {
        results = [
          { metric: { __name__: 'pnet_jobs_scraped_total', region: 'ZA', province: 'Gauteng' }, value: [timestamp, '142'] },
          { metric: { __name__: 'pnet_jobs_scraped_total', region: 'ZA', province: 'Western Cape' }, value: [timestamp, '68'] }
        ];
      } else if (q.includes('smtp_emails')) {
        results = [
          { metric: { __name__: 'smtp_emails_sent_total', status: 'success', host: 'smtp.gmail.com:587' }, value: [timestamp, '48'] },
          { metric: { __name__: 'smtp_emails_sent_total', status: 'failed', host: 'smtp.gmail.com:587' }, value: [timestamp, '1'] }
        ];
      } else if (q.includes('pg_stat_database')) {
        results = [
          { metric: { __name__: 'pg_stat_database_numbackends', datname: 'pnetdb', instance: 'pnet_postgres:5432' }, value: [timestamp, '19'] }
        ];
      } else if (q.includes('redis_memory')) {
        results = [
          { metric: { __name__: 'redis_memory_used_bytes_mb', instance: 'pnet_redis:6379' }, value: [timestamp, '37.84 MB'] }
        ];
      } else {
        results = [
          { metric: { __name__: 'django_http_requests_total', view: 'api_apply_email', status: '200' }, value: [timestamp, '4.2 req/sec'] },
          { metric: { __name__: 'django_http_requests_total', view: 'api_apply_portal', status: '200' }, value: [timestamp, '1.8 req/sec'] },
          { metric: { __name__: 'django_http_requests_total', view: 'metrics', status: '200' }, value: [timestamp, '0.5 req/sec'] }
        ];
      }

      setPromqlResult(results);
      setIsRefreshing(false);
    }, 350);
  };

  useEffect(() => {
    handleExecutePromQL();
  }, []);

  // Trigger live simulated traffic burst
  const handleSimulateTraffic = () => {
    setIsLiveSimulating(true);
    const newTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTaskMetrics(prev => [
      ...prev.slice(1),
      {
        time: newTime,
        emailTasks: Math.floor(8 + Math.random() * 8),
        portalTasks: Math.floor(5 + Math.random() * 5),
        scrapeTasks: Math.floor(10 + Math.random() * 10),
        taskLatencyMs: Math.floor(1300 + Math.random() * 300)
      }
    ]);

    setDbRedisMetrics(prev => [
      ...prev.slice(1),
      {
        time: newTime,
        pgConnections: Math.floor(18 + Math.random() * 8),
        pgTps: Math.floor(70 + Math.random() * 35),
        redisMemoryMb: parseFloat((36 + Math.random() * 3).toFixed(1)),
        redisOps: Math.floor(500 + Math.random() * 200)
      }
    ]);

    setDeliverySuccessMetrics(prev => [
      ...prev.slice(1),
      {
        time: newTime,
        emailsSent: Math.floor(8 + Math.random() * 6),
        emailsFailed: 0,
        portalSubmitted: Math.floor(4 + Math.random() * 4),
        portalFailed: 0
      }
    ]);

    setTimeout(() => {
      setIsLiveSimulating(false);
      handleExecutePromQL();
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Docker Unified Network & Monitoring Control Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Prometheus Metrics &amp; Grafana Observability Dashboard
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              pnet_network (Docker Bridge)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time metric telemetry scraped from Django, Celery, Redis, PostgreSQL, and Nginx containers residing on the same Docker Compose network
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="simulate-metrics-burst-btn"
            onClick={handleSimulateTraffic}
            disabled={isLiveSimulating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSimulating ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isLiveSimulating ? 'Simulating Metric Push...' : 'Push Test Metric Scrape'}</span>
          </button>

          <button
            id="view-compose-config-btn"
            onClick={onOpenCodeArchitecture}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm shadow-indigo-950/40"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Inspect Docker Compose Stack</span>
          </button>
        </div>
      </div>

      {/* Unified Docker Network Topology Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Unified Container Network (Driver: bridge • Subnet: 172.28.0.0/16)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 10/10 Containers Healthy
            </span>
            <span className="text-neutral-400">DNS Resolver: 127.0.0.11</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
          
          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.4:80</div>
            <div className="text-xs font-bold text-white truncate">pnet_nginx</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">Ingress</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.5:8000</div>
            <div className="text-xs font-bold text-white truncate">pnet_web</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">Django WSGI</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.6</div>
            <div className="text-xs font-bold text-white truncate">celery_worker</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">Playwright/SMTP</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.7</div>
            <div className="text-xs font-bold text-white truncate">celery_beat</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">Scheduler</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-rose-900/60 bg-rose-950/20 text-center space-y-1">
            <div className="text-[10px] text-rose-400 font-mono">172.28.0.13:5555</div>
            <div className="text-xs font-bold text-rose-200 truncate">pnet_flower</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">Flower Admin</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.3:6379</div>
            <div className="text-xs font-bold text-white truncate">pnet_redis</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">Redis Broker</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.2:5432</div>
            <div className="text-xs font-bold text-white truncate">pnet_postgres</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">PostgreSQL 16</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800/90 text-center space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono">172.28.0.8:8888</div>
            <div className="text-xs font-bold text-white truncate">celery_exporter</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">Celery Prom</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-indigo-900/60 bg-indigo-950/20 text-center space-y-1">
            <div className="text-[10px] text-indigo-400 font-mono">172.28.0.11:9090</div>
            <div className="text-xs font-bold text-indigo-200 truncate">prometheus</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">Scraper</span>
          </div>

          <div className="p-2 bg-neutral-950 rounded-lg border border-amber-900/60 bg-amber-950/20 text-center space-y-1">
            <div className="text-[10px] text-amber-400 font-mono">172.28.0.12:3000</div>
            <div className="text-xs font-bold text-amber-200 truncate">grafana</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">Visualizer</span>
          </div>

        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-2">
        <div className="flex space-x-2">
          <button
            id="subtab-grafana-panels"
            onClick={() => setActiveSubTab('grafana')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'grafana'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafana Dashboard Visuals</span>
          </button>

          <button
            id="subtab-promql-console"
            onClick={() => setActiveSubTab('promql')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'promql'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>PromQL Query Console</span>
          </button>

          <button
            id="subtab-prometheus-targets"
            onClick={() => setActiveSubTab('targets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'targets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Scrape Targets (7 UP)</span>
          </button>

          <button
            id="subtab-alert-rules"
            onClick={() => setActiveSubTab('alerts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prometheus Alerts (5 Active)</span>
          </button>
        </div>

        {/* Time Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 font-mono">Range:</span>
          {(['5m', '15m', '1h', '6h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                timeRange === r
                  ? 'bg-neutral-800 text-indigo-400 font-bold ring-1 ring-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: GRAFANA DASHBOARD PANELS */}
      {activeSubTab === 'grafana' && (
        <div className="space-y-6">
          
          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow space-y-1">
              <span className="text-[11px] text-neutral-400">Celery Task Rate</span>
              <div className="text-xl font-extrabold text-white font-mono">29.6 <span className="text-xs text-indigo-400 font-normal">tasks/m</span></div>
              <span className="text-[10px] text-emerald-400 font-mono">99.8% Success Rate</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow space-y-1">
              <span className="text-[11px] text-neutral-400">PNet Listings Scraped</span>
              <div className="text-xl font-extrabold text-white font-mono">210 <span className="text-xs text-neutral-400 font-normal">posts</span></div>
              <span className="text-[10px] text-indigo-400 font-mono">Avg Match: 78.4%</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow space-y-1">
              <span className="text-[11px] text-neutral-400">Direct SMTP Delivery</span>
              <div className="text-xl font-extrabold text-white font-mono">48 <span className="text-xs text-indigo-400 font-normal">emails</span></div>
              <span className="text-[10px] text-emerald-400 font-mono">0 Bounces (Clean SPF)</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow space-y-1">
              <span className="text-[11px] text-neutral-400">Playwright Portal Forms</span>
              <div className="text-xl font-extrabold text-white font-mono">31 <span className="text-xs text-purple-400 font-normal">forms</span></div>
              <span className="text-[10px] text-purple-400 font-mono">Avg Latency: 3.8s</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow space-y-1">
              <span className="text-[11px] text-neutral-400">PostgreSQL Pool (16)</span>
              <div className="text-xl font-extrabold text-white font-mono">19 <span className="text-xs text-emerald-400 font-normal">/ 100 conns</span></div>
              <span className="text-[10px] text-emerald-400 font-mono">Cache Hit: 99.4%</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow space-y-1">
              <span className="text-[11px] text-neutral-400">Redis Broker Memory</span>
              <div className="text-xl font-extrabold text-white font-mono">37.8 <span className="text-xs text-amber-400 font-normal">MB</span></div>
              <span className="text-[10px] text-neutral-400 font-mono">Queue Backlog: 0</span>
            </div>
          </div>

          {/* Panel Row 1: Celery Tasks & PNet Scrape Throughput */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Celery Tasks Execution by Queue */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Celery Task Execution Rate (Tasks / Min)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  expr: sum by (queue) (rate(celery_tasks_total[1m]))
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={taskMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPortal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorScrape" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#737373" fontSize={10} fontStyle="mono" />
                    <YAxis stroke="#737373" fontSize={10} fontStyle="mono" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#e5e5e5' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="emailTasks" name="email_dispatch_queue" stroke="#6366f1" fillOpacity={1} fill="url(#colorEmail)" strokeWidth={2} />
                    <Area type="monotone" dataKey="portalTasks" name="portal_apply_queue" stroke="#a855f7" fillOpacity={1} fill="url(#colorPortal)" strokeWidth={2} />
                    <Area type="monotone" dataKey="scrapeTasks" name="pnet_discovery_queue" stroke="#10b981" fillOpacity={1} fill="url(#colorScrape)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Direct Email vs Playwright Portal Success */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Application Delivery Status (Success vs. Failures)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  expr: sum by (status, method) (pnet_applications_total)
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deliverySuccessMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#737373" fontSize={10} fontStyle="mono" />
                    <YAxis stroke="#737373" fontSize={10} fontStyle="mono" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#e5e5e5' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="emailsSent" name="SMTP CV Sent (Success)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="portalSubmitted" name="Playwright Portal (Success)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="emailsFailed" name="SMTP Errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Panel Row 2: PostgreSQL Connections & Redis Ops */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 3: PostgreSQL Active Connections & Transactions/sec */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    PostgreSQL 16 Connection Pool &amp; TPS
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  postgres_exporter:9187
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dbRedisMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#737373" fontSize={10} fontStyle="mono" />
                    <YAxis stroke="#737373" fontSize={10} fontStyle="mono" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#e5e5e5' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="pgConnections" name="Active DB Backends" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="pgTps" name="Transactions / sec (TPS)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Redis Broker Memory & Command Ops/sec */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Redis Broker Memory (MB) &amp; Command Throughput
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  redis_exporter:9121
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dbRedisMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#737373" fontSize={10} fontStyle="mono" />
                    <YAxis stroke="#737373" fontSize={10} fontStyle="mono" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#e5e5e5' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="redisMemoryMb" name="Allocated Memory (MB)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="redisOps" name="Processed Commands / sec" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PROMQL QUERY CONSOLE */}
      {activeSubTab === 'promql' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Prometheus PromQL Query Explorer</h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">Prometheus Server: http://prometheus:9090</span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-medium">Quick PromQL Metrics:</label>
            <div className="flex flex-wrap gap-2">
              {promqlPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromqlQuery(p.query);
                    handleExecutePromQL(p.query);
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Query Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promqlQuery}
                onChange={(e) => setPromqlQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecutePromQL()}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                placeholder="rate(http_requests_total[5m])..."
              />
            </div>

            <button
              onClick={() => handleExecutePromQL()}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute PromQL</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Evaluation Output: {promqlResult.length} metric vector(s)</span>
              <span>Resolution: 15s • Type: Vector</span>
            </div>

            <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden font-mono text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                    <tr>
                      <th className="p-3 font-medium">Metric Series &amp; Labels</th>
                      <th className="p-3 font-medium w-36 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {promqlResult.map((item, i) => (
                      <tr key={i} className="hover:bg-neutral-900/40">
                        <td className="p-3 text-neutral-300">
                          <span className="text-indigo-400 font-bold">{item.metric.__name__ || 'vector'}</span>
                          <span className="text-neutral-400 text-[11px] ml-2">
                            {JSON.stringify(item.metric).replace(/"/g, '')}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          {item.value[1]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROMETHEUS SCRAPE TARGETS */}
      {activeSubTab === 'targets' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Prometheus Service Discovery &amp; Target Endpoints</h3>
              <p className="text-xs text-neutral-400">All services discoverable over internal container DNS on <code className="text-indigo-400">pnet_network</code></p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              6/6 UP (100%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
                <tr>
                  <th className="p-3">Job Name</th>
                  <th className="p-3">Internal Endpoint</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Scrape Duration</th>
                  <th className="p-3">Last Scrape</th>
                  <th className="p-3">Target Labels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {prometheusTargets.map((t, idx) => (
                  <tr key={idx} className="hover:bg-neutral-950/40">
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.job}</span>
                    </td>
                    <td className="p-3 text-neutral-300">
                      <span className="text-indigo-300 font-semibold">{t.instance}</span>
                      <span className="text-neutral-500 text-[11px] ml-1">{t.endpoint}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {t.state} (1/1)
                      </span>
                    </td>
                    <td className="p-3 text-neutral-300">{t.scrapeDuration}</td>
                    <td className="p-3 text-neutral-400">{t.lastScrape}</td>
                    <td className="p-3 text-neutral-400 text-[11px]">
                      {Object.entries(t.labels).map(([k, v]) => `${k}="${v}"`).join(' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROMETHEUS ALERTS */}
      {activeSubTab === 'alerts' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Prometheus Alert Rules &amp; Health Watchdogs</h3>
              <p className="text-xs text-neutral-400">Rules configured in <code className="text-indigo-400 font-mono">prometheus/alert.rules.yml</code></p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              0 Firing • 5 Normal
            </span>
          </div>

          <div className="space-y-3">
            {alertRules.map((rule, i) => (
              <div key={i} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white font-mono">{rule.name}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                      rule.severity === 'critical' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{rule.description}</p>
                  <div className="text-[11px] font-mono text-indigo-400 bg-neutral-900 px-2 py-0.5 rounded inline-block border border-neutral-800">
                    {rule.condition}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    STATE: OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
