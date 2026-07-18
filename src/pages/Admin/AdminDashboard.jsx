import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ShieldCheck, ShieldAlert, Video, ClipboardList,
  FileText, Brain, BookOpen, Briefcase, Bell, BarChart2, FolderOpen,
  ScrollText, Settings, Database, FileBarChart, UserCog, Globe, Zap,
  Activity, Cpu, HardDrive, Lock, ChevronDown, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Ban,
  Unlock, UserMinus, Eye, Trash2, Download, Upload, Plus, Search,
  Filter, Edit, RefreshCw, Play, Pause, Square, Wifi, WifiOff,
  Camera, Mic, Monitor, Server, Shield, Key, Webhook, GitBranch,
  Package, BookMarked, GraduationCap, Building2, Megaphone, Mail,
  BellRing, Wrench, Archive, CloudDownload, CloudUpload, Terminal,
  Sparkles, Layers, Radio, MessageSquare, Star, Award, Target,
  PieChart, LineChart, AreaChart, Calendar, Send, RotateCcw,
  Save, Copy, ExternalLink, Info, ChevronUp, Flame, Rocket,
  Bot, Network, Binary, Gauge, MemoryStick, Sliders, History,
  FileJson, FileSpreadsheet, Printer, UserPlus, UserCheck, UserX,
  ToggleLeft, ToggleRight, Scroll, AlertCircle, CheckSquare,
  BarChart, Headphones, Image, Music, Code2, Bug, Antenna, LogOut
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_STATS = {
  totalUsers: 0, activeUsers: 0, interviewsToday: 0,
  resumesAnalyzed: 0, aiRequests: 0, avgScore: 0,
  securityAlerts: 0, suspendedUsers: 0, placementReadiness: 0,
  systemHealth: 100,
};

const MOCK_LIVE_SESSIONS = [];
const MOCK_TEMPLATES = [];
const MOCK_APTITUDE_TESTS = [];
const MOCK_OLLAMA_MODELS = [];
const MOCK_KB_DOCS = [];
const MOCK_MEMORIES = [];
const MOCK_COMPANIES = [];

const MOCK_ROLES = [
  { id: 1, name: 'Super Admin', users: 1, color: '#ef4444', permissions: ['read', 'create', 'update', 'delete', 'export', 'manage_ai', 'manage_security'] },
  { id: 2, name: 'Admin', users: 0, color: '#8b5cf6', permissions: ['read', 'create', 'update', 'export', 'manage_ai'] },
  { id: 3, name: 'HR', users: 0, color: '#06b6d4', permissions: ['read', 'create', 'update'] },
  { id: 4, name: 'Recruiter', users: 0, color: '#10b981', permissions: ['read', 'export'] },
  { id: 5, name: 'Trainer', users: 0, color: '#f59e0b', permissions: ['read', 'create'] },
  { id: 6, name: 'Moderator', users: 0, color: '#ec4899', permissions: ['read', 'update'] },
  { id: 7, name: 'Support', users: 0, color: '#64748b', permissions: ['read'] },
];

const MOCK_API_KEYS = [];
const MOCK_AUDIT_LOGS = [];

const ALL_PERMISSIONS = ['read', 'create', 'update', 'delete', 'export', 'manage_ai', 'manage_security'];

/* ═══════════════════════════════════════════════
   NAVIGATION CONFIG
═══════════════════════════════════════════════ */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#6366f1' },
    ]
  },
  {
    label: 'User Management',
    items: [
      { id: 'candidates', label: 'Candidates', icon: Users, color: '#8b5cf6' },
      { id: 'roles', label: 'Role Management', icon: UserCog, color: '#ec4899' },
    ]
  },
  {
    label: 'Security',
    items: [
      { id: 'live-monitoring', label: 'Live Monitoring', icon: Radio, color: '#ef4444' },
      { id: 'security-control', label: 'Security Control', icon: ShieldCheck, color: '#f59e0b' },
      { id: 'audit', label: 'Audit & Compliance', icon: ScrollText, color: '#64748b' },
    ]
  },
  {
    label: 'Assessments',
    items: [
      { id: 'interviews', label: 'Interview Mgmt', icon: Video, color: '#06b6d4' },
      { id: 'aptitude', label: 'Aptitude Mgmt', icon: ClipboardList, color: '#10b981' },
      { id: 'resume', label: 'Resume Mgmt', icon: FileText, color: '#f97316' },
    ]
  },
  {
    label: 'AI & Intelligence',
    items: [
      { id: 'ai-settings', label: 'AI Management', icon: Bot, color: '#8b5cf6' },
      { id: 'ai-knowledge', label: 'Knowledge Base', icon: BookOpen, color: '#6366f1' },
      { id: 'ai-analytics', label: 'AI Analytics', icon: AreaChart, color: '#06b6d4' },
      { id: 'ai-memory', label: 'AI Memory', icon: MemoryStick, color: '#ec4899' },
      { id: 'ai-control', label: 'AI Control Center', icon: Cpu, color: '#f59e0b' },
    ]
  },
  {
    label: 'Learning & Placement',
    items: [
      { id: 'learning', label: 'Learning Mgmt', icon: GraduationCap, color: '#10b981' },
      { id: 'placement', label: 'Placement Mgmt', icon: Briefcase, color: '#06b6d4' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { id: 'announcements', label: 'Announcements', icon: Megaphone, color: '#f59e0b' },
    ]
  },
  {
    label: 'Analytics & Reports',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart2, color: '#6366f1' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, color: '#8b5cf6' },
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'files', label: 'File Manager', icon: FolderOpen, color: '#64748b' },
      { id: 'logs', label: 'Logs', icon: Terminal, color: '#10b981' },
      { id: 'settings', label: 'System Settings', icon: Settings, color: '#475569' },
      { id: 'database', label: 'Database', icon: Database, color: '#ef4444' },
      { id: 'api', label: 'API Management', icon: Globe, color: '#06b6d4' },
      { id: 'backup', label: 'Backup & Recovery', icon: CloudDownload, color: '#f97316' },
    ]
  },
];

/* ═══════════════════════════════════════════════
   SHARED UI PRIMITIVES
═══════════════════════════════════════════════ */
const GlassCard = ({ children, className = '', style = {} }) => (
  <div className={`rounded-2xl border p-5 ${className}`}
    style={{
      background: 'rgba(255, 255, 255, 0.45)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
      backdropFilter: 'blur(12px)',
      ...style
    }}>
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon, color, actions }) => (
  <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <GlassCard className="flex items-start justify-between hover:scale-[1.02] transition-transform cursor-default">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black mt-1.5" style={{ color }}>{value}</h3>
      {sub && <p className="text-[10px] text-slate-500 mt-1">{sub}</p>}
    </div>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
  </GlassCard>
);

const Badge = ({ children, color = '#6366f1', size = 'sm' }) => (
  <span className={`inline-flex items-center font-bold rounded-md border ${size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}
    style={{ background: `${color}10`, borderColor: `${color}20`, color }}>
    {children}
  </span>
);

const ActionBtn = ({ children, icon: Icon, onClick, variant = 'default', size = 'sm', disabled = false }) => {
  const variants = {
    default: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', color: '#4f46e5' },
    danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#dc2626' },
    success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#059669' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#d97706' },
    ghost: { bg: 'transparent', border: 'rgba(0,0,0,0.06)', color: '#64748b' },
  };
  const v = variants[variant] || variants.default;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition-all active:scale-95 ${size === 'xs' ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-2'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-95 cursor-pointer'}`}
      style={{ background: v.bg, border: `1px solid ${v.border}`, color: v.color }}>
      {Icon && <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {children}
    </button>
  );
};

const DataTable = ({ columns, data, emptyMsg = 'No data found.' }) => (
  <div className="overflow-x-auto -mx-5">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.015)' }}>
          {columns.map((col, i) => (
            <th key={i} className={`px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.align === 'right' ? 'text-right' : ''}`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400 text-xs font-semibold">{emptyMsg}</td></tr>
        ) : data.map((row, ri) => (
          <tr key={ri} className="transition-colors hover:bg-black/[0.01]" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
            {columns.map((col, ci) => (
              <td key={ci} className={`px-5 py-3.5 text-sm text-slate-700 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MiniBar = ({ value, color = '#6366f1', max = 100 }) => (
  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div className="relative" onClick={() => onChange(!value)}>
      <div className={`w-10 h-5 rounded-full transition-all duration-200 ${value ? 'bg-indigo-600' : 'bg-slate-300'}`} />
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`} />
    </div>
    {label && <span className="text-xs text-slate-650 font-medium">{label}</span>}
  </label>
);

/* ═══════════════════════════════════════════════
   SECTION: DASHBOARD OVERVIEW
═══════════════════════════════════════════════ */
const SectionDashboard = ({ stats }) => {
  const kpis = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#6366f1', sub: '+24 this week' },
    { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Activity, color: '#10b981', sub: 'Online now' },
    { label: 'Interviews Today', value: stats.interviewsToday, icon: Video, color: '#06b6d4', sub: '12 completed' },
    { label: 'Resumes Analyzed', value: stats.resumesAnalyzed.toLocaleString(), icon: FileText, color: '#f97316', sub: 'Total' },
    { label: 'AI Requests', value: stats.aiRequests.toLocaleString(), icon: Brain, color: '#8b5cf6', sub: 'Lifetime' },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: Award, color: '#fbbf24', sub: 'All interviews' },
    { label: 'Security Alerts', value: stats.securityAlerts, icon: ShieldAlert, color: '#ef4444', sub: 'Last 24h' },
    { label: 'Suspended Users', value: stats.suspendedUsers, icon: Ban, color: '#f97316', sub: 'Active suspensions' },
    { label: 'Placement Ready', value: `${stats.placementReadiness}%`, icon: Target, color: '#10b981', sub: 'Candidates' },
    { label: 'System Health', value: `${stats.systemHealth}%`, icon: Gauge, color: '#06b6d4', sub: 'All services up' },
  ];

  const systemServices = [
    { name: 'Backend API', status: 'online', latency: '12ms' },
    { name: 'Ollama / LLM', status: 'online', latency: '340ms' },
    { name: 'Face Detection', status: 'online', latency: '28ms' },
    { name: 'File Storage', status: 'online', latency: '8ms' },
    { name: 'Email Service', status: 'degraded', latency: '—' },
    { name: 'Push Notifications', status: 'online', latency: '5ms' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard Overview" subtitle="Real-time platform intelligence at a glance" icon={LayoutDashboard} color="#6366f1"
        actions={<ActionBtn icon={RefreshCw} variant="ghost">Refresh</ActionBtn>}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {/* System Health + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📡 System Health</p>
          <div className="space-y-3">
            {systemServices.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="text-xs text-slate-700 font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500">{s.latency}</span>
                  <Badge color={s.status === 'online' ? '#10b981' : '#f59e0b'}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📈 Platform Activity (7 Days)</p>
          <div className="space-y-3">
            {[
              { label: 'Interviews Conducted', value: 89, max: 120, color: '#6366f1' },
              { label: 'AI Conversations', value: 342, max: 500, color: '#8b5cf6' },
              { label: 'Resumes Uploaded', value: 67, max: 100, color: '#f97316' },
              { label: 'Aptitude Tests', value: 124, max: 200, color: '#06b6d4' },
              { label: 'New Registrations', value: 24, max: 50, color: '#10b981' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-slate-400">{item.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <MiniBar value={item.value} max={item.max} color={item.color} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: CANDIDATE MANAGEMENT
═══════════════════════════════════════════════ */
const SectionCandidates = ({ users, onUnlock, onExtend, onBan, onToggleRole }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'suspended') return matchSearch && u.suspendedUntil && u.suspendedUntil > Date.now();
    if (filter === 'banned') return matchSearch && u.isBanned;
    if (filter === 'admin') return matchSearch && u.role === 'admin';
    return matchSearch;
  });

  return (
    <div className="space-y-5">
      <SectionHeader title="Candidate Management" subtitle="Search, filter and manage all registered users" icon={Users} color="#8b5cf6"
        actions={<ActionBtn icon={Download} variant="ghost">Export CSV</ActionBtn>}
      />
      <GlassCard>
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-600 outline-none" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'suspended', 'banned', 'admin'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold border capitalize transition-all ${filter === f ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-slate-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={[
            { label: 'User', render: r => (
              <div>
                <div className="font-bold text-slate-900">{r.name}</div>
                <div className="text-[10px] font-mono text-slate-500">{r.email}</div>
              </div>
            )},
            { label: 'Role / Workspace Position', render: r => (
              <select value={r.role || 'student'} onChange={e => onToggleRole(r.id, e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-indigo-500/40">
                <option value="student">Student / Candidate</option>
                <option value="admin">Administrator</option>
                <option value="hr">HR Manager</option>
                <option value="recruiter">Talent Recruiter</option>
                <option value="trainer">Technical Trainer</option>
                <option value="moderator">Content Moderator</option>
                <option value="support">Help Desk Support</option>
              </select>
            )},
            { label: 'Status', render: r => {
              const isSuspended = r.suspendedUntil && r.suspendedUntil > Date.now();
              if (r.isBanned) return <Badge color="#ef4444">Banned</Badge>;
              if (isSuspended) return <Badge color="#f59e0b">Suspended</Badge>;
              if (r.isLocked) return <Badge color="#f97316">Locked</Badge>;
              return <Badge color="#10b981">Active</Badge>;
            }},
            { label: 'Target Role', render: r => <span className="text-xs text-slate-400">{r.title || 'General'}</span> },
            { label: 'Actions', align: 'right', render: r => {
              const isSuspended = r.suspendedUntil && r.suspendedUntil > Date.now();
              return (
                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                  {(r.isLocked || isSuspended || r.isBanned) && <ActionBtn size="xs" icon={Unlock} variant="success" onClick={() => onUnlock(r.id)}>Unlock</ActionBtn>}
                  {isSuspended && <ActionBtn size="xs" icon={Clock} variant="warning" onClick={() => onExtend(r.id)}>+30m</ActionBtn>}
                  {!r.isBanned && r.role !== 'admin' && <ActionBtn size="xs" icon={Ban} variant="danger" onClick={() => onBan(r.id)}>Ban</ActionBtn>}
                </div>
              );
            }}
          ]}
          data={filtered}
          emptyMsg="No users match the filter."
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: LIVE MONITORING
═══════════════════════════════════════════════ */
const SectionLiveMonitoring = () => {
  const [sessions, setSessions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const warnings = await interviewService.getWarningsList() || [];
        const mapped = warnings.slice(-5).reverse().map((w, idx) => ({
          id: idx,
          user: w.candidateName || w.userEmail || 'Candidate',
          type: w.type || 'Integrity Violation',
          time: new Date(w.timestamp).toLocaleTimeString(),
          severity: w.warningCount >= 3 ? 'high' : 'medium'
        }));
        setAlerts(mapped);
      } catch (e) {
        console.warn("Failed to load proctor warnings", e);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader title="Live Monitoring" subtitle="Real-time active interview sessions and alerts" icon={Radio} color="#ef4444"
        actions={<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-xs text-red-400 font-bold">LIVE</span></div>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Sessions', value: sessions.length, icon: Monitor, color: '#ef4444' },
          { label: 'Cameras Online', value: sessions.filter(s => s.camera).length, icon: Camera, color: '#06b6d4' },
          { label: 'Mic Active', value: sessions.filter(s => s.mic).length, icon: Mic, color: '#10b981' },
          { label: 'Warnings Today', value: alerts.length, icon: AlertTriangle, color: '#f59e0b' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🎥 Active Interview Sessions</p>
        <DataTable
          columns={[
            { label: 'Candidate', render: r => <span className="font-bold text-slate-900">{r.user}</span> },
            { label: 'Role', render: r => <span className="text-xs text-slate-400">{r.role}</span> },
            { label: 'Duration', render: r => <span className="text-xs font-mono text-cyan-400">{r.duration}</span> },
            { label: 'Camera', render: r => r.camera ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" /> },
            { label: 'Mic', render: r => r.mic ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" /> },
            { label: 'Warnings', render: r => <Badge color={r.warnings > 2 ? '#ef4444' : r.warnings > 0 ? '#f59e0b' : '#10b981'}>{r.warnings}</Badge> },
            { label: 'Status', render: r => <Badge color={r.status === 'warning' ? '#ef4444' : '#10b981'}>{r.status}</Badge> },
            { label: 'Actions', align: 'right', render: () => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Eye} variant="ghost">View</ActionBtn>
                <ActionBtn size="xs" icon={Square} variant="danger">End</ActionBtn>
              </div>
            )},
          ]}
          data={sessions}
          emptyMsg="No active interview sessions right now."
        />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">⚠️ Live Cheating Alerts</p>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold">No proctoring alerts recorded today.</div>
            ) : alerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div>
                  <p className="text-xs font-bold text-slate-900">{a.user}</p>
                  <p className="text-[10px] text-rose-400">{a.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{a.time}</span>
                  <Badge color={a.severity === 'high' ? '#ef4444' : '#f59e0b'} size="xs">{a.severity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🌐 Network Status</p>
          <div className="space-y-3">
            {[
              { label: 'Online Users', value: 347, icon: Wifi, color: '#10b981' },
              { label: 'Offline / Lost Connection', value: 3, icon: WifiOff, color: '#ef4444' },
              { label: 'Avg Latency', value: '28ms', icon: Gauge, color: '#06b6d4' },
              { label: 'Bandwidth Usage', value: '1.2 GB/h', icon: Antenna, color: '#8b5cf6' },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <n.icon className="w-3.5 h-3.5" style={{ color: n.color }} />
                  <span className="text-xs text-slate-400">{n.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: n.color }}>{n.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: SECURITY CONTROL
═══════════════════════════════════════════════ */
const SectionSecurityControl = () => {
  const [settings, setSettings] = useState({
    maxWarnings: 5, lockTime: 30, suspensionTime: 60,
    allowedDevices: 2, requireFullscreen: true, faceDetection: true,
    gazeTracking: true, allowedBrowsers: ['Chrome', 'Firefox'],
  });

  return (
    <div className="space-y-5">
      <SectionHeader title="Security Control" subtitle="Configure proctoring rules and access policies" icon={ShieldCheck} color="#f59e0b" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">🔒 Proctoring Thresholds</p>
          <div className="space-y-5">
            {[
              { label: 'Max Warnings Before Disqualification', key: 'maxWarnings', min: 1, max: 10 },
              { label: 'Account Lock Duration (minutes)', key: 'lockTime', min: 5, max: 120 },
              { label: 'Suspension Duration (minutes)', key: 'suspensionTime', min: 10, max: 1440 },
              { label: 'Max Devices Per Account', key: 'allowedDevices', min: 1, max: 5 },
            ].map((s) => (
              <div key={s.key}>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-slate-400">{s.label}</label>
                  <span className="text-xs font-bold text-indigo-400">{settings[s.key]}</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={settings[s.key]}
                  onChange={e => setSettings(p => ({ ...p, [s.key]: +e.target.value }))}
                  className="w-full accent-indigo-500 h-1.5" />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">⚙️ Security Toggles</p>
          <div className="space-y-4">
            <Toggle value={settings.requireFullscreen} onChange={v => setSettings(p => ({ ...p, requireFullscreen: v }))} label="Require Fullscreen Mode" />
            <Toggle value={settings.faceDetection} onChange={v => setSettings(p => ({ ...p, faceDetection: v }))} label="Face Detection (BlazeFace)" />
            <Toggle value={settings.gazeTracking} onChange={v => setSettings(p => ({ ...p, gazeTracking: v }))} label="Gaze / Eye Tracking" />
          </div>
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-slate-400 mb-3">Allowed Browsers</p>
            <div className="flex gap-2 flex-wrap">
              {['Chrome', 'Firefox', 'Edge', 'Safari'].map(b => (
                <button key={b} onClick={() => setSettings(p => ({
                  ...p, allowedBrowsers: p.allowedBrowsers.includes(b)
                    ? p.allowedBrowsers.filter(x => x !== b)
                    : [...p.allowedBrowsers, b]
                }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${settings.allowedBrowsers.includes(b) ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/[0.03] border-white/[0.07] text-slate-500'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <ActionBtn icon={Save} variant="success">Save Settings</ActionBtn>
            <ActionBtn icon={RotateCcw} variant="ghost">Reset Defaults</ActionBtn>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🛡️ Quick Security Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Force Logout All Users', icon: LogOut2, variant: 'danger' },
            { label: 'Reset All Warnings', icon: RotateCcw, variant: 'warning' },
            { label: 'Clear Blacklisted IPs', icon: Shield, variant: 'ghost' },
            { label: 'Unlock All Locked Accounts', icon: Unlock, variant: 'success' },
            { label: 'Whitelist All Pending', icon: CheckCircle, variant: 'success' },
          ].map((a, i) => (
            <ActionBtn key={i} icon={a.icon || Shield} variant={a.variant}>{a.label}</ActionBtn>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
// Workaround for LogOut2 not exported by lucide
const LogOut2 = Lock;

/* ═══════════════════════════════════════════════
   SECTION: INTERVIEW MANAGEMENT
═══════════════════════════════════════════════ */
const SectionInterviews = () => {
  const [templates, setTemplates] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', type: 'Technical', difficulty: 'Medium' });

  const load = useCallback(async () => {
    try {
      const data = await interviewService.getTemplates() || [];
      setTemplates(data);
    } catch (e) {
      console.warn("Failed to load interview templates", e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const types = ['Technical', 'HR', 'Analytical', 'Coding', 'Voice', 'Video'];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];

  return (
    <div className="space-y-5">
      <SectionHeader title="Interview Management" subtitle="Create, edit and manage interview templates" icon={Video} color="#06b6d4"
        actions={<ActionBtn icon={Plus} variant="success" onClick={() => setShowAdd(true)}>New Template</ActionBtn>}
      />
      {showAdd && (
        <GlassCard style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
          <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4">✨ Create New Template</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="col-span-1 sm:col-span-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Template Title</label>
              <input value={newTemplate.title} onChange={e => setNewTemplate(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Senior React Developer"
                className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-600 outline-none focus:border-cyan-500/40" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Interview Type</label>
              <select value={newTemplate.type} onChange={e => setNewTemplate(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-500/40">
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Difficulty</label>
              <select value={newTemplate.difficulty} onChange={e => setNewTemplate(p => ({ ...p, difficulty: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-500/40">
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <ActionBtn icon={Save} variant="success" onClick={() => {
              if (newTemplate.title) {
                setTemplates(p => [...p, { ...newTemplate, id: p.length + 1, questions: 0, uses: 0 }]);
                setShowAdd(false);
                setNewTemplate({ title: '', type: 'Technical', difficulty: 'Medium' });
              }
            }}>Create Template</ActionBtn>
            <ActionBtn icon={XCircle} variant="ghost" onClick={() => setShowAdd(false)}>Cancel</ActionBtn>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {[
          { label: 'AI Generate Questions', icon: Brain, color: '#8b5cf6' },
          { label: 'Import from CSV', icon: Upload, color: '#10b981' },
          { label: 'Import from Excel', icon: FileText, color: '#06b6d4' },
          { label: 'Bulk Upload', icon: Package, color: '#f59e0b' },
        ].map((a, i) => (
          <button key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: `${a.color}10`, border: `1px solid ${a.color}25` }}>
            <a.icon className="w-4 h-4" style={{ color: a.color }} />
            <span className="text-xs font-bold" style={{ color: a.color }}>{a.label}</span>
          </button>
        ))}
      </div>

      <GlassCard>
        <DataTable
          columns={[
            { label: 'Template', render: r => <span className="font-bold text-slate-900">{r.title}</span> },
            { label: 'Type', render: r => <Badge color="#06b6d4">{r.type}</Badge> },
            { label: 'Difficulty', render: r => <Badge color={r.difficulty === 'Expert' ? '#ef4444' : r.difficulty === 'Hard' ? '#f97316' : r.difficulty === 'Medium' ? '#f59e0b' : '#10b981'}>{r.difficulty}</Badge> },
            { label: 'Questions', render: r => <span className="text-xs font-mono text-slate-700">{r.questions}</span> },
            { label: 'Uses', render: r => <span className="text-xs text-slate-400">{r.uses}</span> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Edit} variant="ghost">Edit</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setTemplates(p => p.filter(t => t.id !== r.id))}>Delete</ActionBtn>
              </div>
            )}
          ]}
          data={templates}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: APTITUDE MANAGEMENT
═══════════════════════════════════════════════ */
const SectionAptitude = () => {
  const [tests, setTests] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await interviewService.getAptitudeQuestions() || [];
      const uniqueCategories = [...new Set(data.map(q => q.category))];
      const categoryTests = uniqueCategories.map((cat, idx) => ({
        id: idx + 1,
        title: `${cat} Assessment`,
        category: cat,
        questions: data.filter(q => q.category === cat).length,
        timer: data.filter(q => q.category === cat).length * 1.5,
        negativeMarking: false
      }));
      setTests(categoryTests);
    } catch (e) {
      console.warn("Failed to load aptitude questions", e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Aptitude Management" subtitle="Create and manage aptitude tests with MCQ, timers, and auto-evaluation" icon={ClipboardList} color="#10b981"
        actions={<ActionBtn icon={Plus} variant="success">New Test</ActionBtn>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tests', value: tests.length, icon: ClipboardList, color: '#10b981' },
          { label: 'Total Questions', value: tests.reduce((a, t) => a + t.questions, 0), icon: CheckSquare, color: '#06b6d4' },
          { label: 'Avg Duration', value: tests.length > 0 ? `${Math.round(tests.reduce((a, t) => a + t.timer, 0) / tests.length)}m` : '0m', icon: Clock, color: '#f59e0b' },
          { label: 'Submissions', value: 0, icon: FileBarChart, color: '#8b5cf6' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <GlassCard>
        <DataTable
          columns={[
            { label: 'Test Name', render: r => <span className="font-bold text-slate-900">{r.title}</span> },
            { label: 'Category', render: r => <Badge color="#10b981">{r.category}</Badge> },
            { label: 'Questions', render: r => <span className="text-xs font-mono text-slate-700">{r.questions}</span> },
            { label: 'Timer', render: r => <span className="text-xs text-slate-400">{r.timer} min</span> },
            { label: 'Neg. Marking', render: r => r.negativeMarking ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" /> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Edit} variant="ghost">Edit</ActionBtn>
                <ActionBtn size="xs" icon={BarChart2} variant="ghost">Results</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setTests(p => p.filter(t => t.id !== r.id))}>Del</ActionBtn>
              </div>
            )}
          ]}
          data={tests}
        />
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📊 Result Analytics</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tests.length === 0 ? (
            <div className="col-span-3 text-center py-4 text-slate-400 text-xs font-semibold">No aptitude tests configured yet.</div>
          ) : tests.map((t, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <p className="text-[10px] font-bold text-emerald-400 mb-1">{t.title}</p>
              <p className="text-xl font-black text-slate-800">{72 + i * 4}%</p>
              <p className="text-[10px] text-slate-500">Avg Score</p>
              <MiniBar value={72 + i * 4} color="#10b981" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: RESUME MANAGEMENT
═══════════════════════════════════════════════ */
const SectionResume = () => (
  <div className="space-y-5">
    <SectionHeader title="Resume Management" subtitle="View, analyze and manage candidate resumes" icon={FileText} color="#f97316" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Resumes', value: '2,341', icon: FileText, color: '#f97316' },
        { label: 'ATS Pass Rate', value: '68%', icon: CheckCircle, color: '#10b981' },
        { label: 'Avg ATS Score', value: '74/100', icon: Star, color: '#fbbf24' },
        { label: 'Templates Used', value: 6, icon: Layers, color: '#8b5cf6' },
      ].map((k, i) => <StatCard key={i} {...k} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🏆 Top Skills Detected</p>
        <div className="space-y-2.5">
          {[
            { skill: 'JavaScript / React', pct: 78, color: '#f7df1e' },
            { skill: 'Python / ML', pct: 65, color: '#3572a5' },
            { skill: 'Node.js / Express', pct: 54, color: '#68a063' },
            { skill: 'SQL / PostgreSQL', pct: 47, color: '#336791' },
            { skill: 'Docker / Kubernetes', pct: 32, color: '#0db7ed' },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{s.skill}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
              </div>
              <MiniBar value={s.pct} color={s.color} />
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📄 ATS Statistics</p>
        <div className="space-y-3">
          {[
            { label: 'Keyword Match ≥ 80%', value: 412, total: 2341, color: '#10b981' },
            { label: 'Formatting Issues', value: 234, total: 2341, color: '#f59e0b' },
            { label: 'Missing Sections', value: 156, total: 2341, color: '#ef4444' },
            { label: 'Optimal Length', value: 1876, total: 2341, color: '#06b6d4' },
          ].map((a, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{a.label}</span>
                <span className="text-xs font-bold" style={{ color: a.color }}>{a.value}</span>
              </div>
              <MiniBar value={a.value} max={a.total} color={a.color} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <ActionBtn icon={Download} variant="ghost">Export Report</ActionBtn>
          <ActionBtn icon={Trash2} variant="danger">Clear Old</ActionBtn>
        </div>
      </GlassCard>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   SECTION: AI MANAGEMENT
═══════════════════════════════════════════════ */
const SectionAISettings = ({ nexusConfig, onModelChange }) => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [contextSize, setContextSize] = useState(4096);
  const [personality, setPersonality] = useState('professional');
  const [systemPrompt, setSystemPrompt] = useState('You are Nexus, an AI career coach specialized in interview preparation and placement training. Be helpful, concise and encouraging.');
  const [models, setModels] = useState(MOCK_OLLAMA_MODELS);

  return (
    <div className="space-y-5">
      <SectionHeader title="AI Management" subtitle="Configure Nexus AI engine, models and behavior" icon={Bot} color="#8b5cf6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">⚙️ Core AI Settings</p>
          <div className="space-y-5">
            <Toggle value={aiEnabled} onChange={setAiEnabled} label={`AI System — ${aiEnabled ? 'Enabled' : 'Disabled'}`} />

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400">Temperature <span className="text-[10px] text-slate-600">(creativity)</span></label>
                <span className="text-xs font-bold text-purple-400">{temperature}</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full accent-purple-500 h-1.5" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400">Max Tokens</label>
                <span className="text-xs font-bold text-purple-400">{maxTokens}</span>
              </div>
              <input type="range" min={256} max={8192} step={256} value={maxTokens} onChange={e => setMaxTokens(+e.target.value)} className="w-full accent-purple-500 h-1.5" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400">Context Size</label>
                <span className="text-xs font-bold text-purple-400">{contextSize}</span>
              </div>
              <input type="range" min={512} max={16384} step={512} value={contextSize} onChange={e => setContextSize(+e.target.value)} className="w-full accent-purple-500 h-1.5" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">AI Personality</label>
              <div className="flex gap-2 flex-wrap">
                {['professional', 'friendly', 'strict', 'encouraging', 'concise'].map(p => (
                  <button key={p} onClick={() => setPersonality(p)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border capitalize transition-all ${personality === p ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-white/[0.03] border-white/[0.07] text-slate-500'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">System Prompt</label>
              <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={4}
                className="w-full bg-black/[0.02] border border-black/[0.05] rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-600 outline-none focus:border-purple-500/40 resize-none" />
            </div>

            <ActionBtn icon={Save} variant="success">Save AI Settings</ActionBtn>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">🤖 Ollama Model Manager</p>
          <div className="space-y-3">
            {models.map((m, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: m.status === 'running' ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.02)', border: `1px solid ${m.status === 'running' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-slate-500">{m.size} • Modified {m.modified}</p>
                  </div>
                  <Badge color={m.status === 'running' ? '#10b981' : '#64748b'}>{m.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MemoryStick className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">RAM: {m.ram}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">GPU: {m.gpu ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {m.status === 'running'
                    ? <ActionBtn size="xs" icon={Pause} variant="warning">Stop</ActionBtn>
                    : <ActionBtn size="xs" icon={Play} variant="success">Start</ActionBtn>}
                  <ActionBtn size="xs" icon={RefreshCw} variant="ghost">Update</ActionBtn>
                  <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setModels(p => p.filter((_, j) => j !== i))}>Delete</ActionBtn>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <ActionBtn icon={CloudDownload} variant="ghost">Download Model</ActionBtn>
            <ActionBtn icon={Plus} variant="ghost">Install Model</ActionBtn>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: AI KNOWLEDGE BASE
═══════════════════════════════════════════════ */
const SectionAIKnowledge = () => {
  const [docs, setDocs] = useState(MOCK_KB_DOCS);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader title="AI Knowledge Base" subtitle="Upload documents for RAG-based AI learning" icon={BookOpen} color="#6366f1" />

      <GlassCard style={{ border: dragging ? '1px solid rgba(99,102,241,0.4)' : undefined }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); }}>
        <div className="text-center py-8" style={{ borderRadius: '16px', border: '2px dashed rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.04)' }}>
          <Upload className="w-10 h-10 text-indigo-400/50 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Drag & drop documents here</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Supports PDF, DOCX, PPT, TXT · Max 50MB per file</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {['PDF', 'DOCX', 'PPT', 'TXT'].map(t => (
              <Badge key={t} color="#6366f1">{t}</Badge>
            ))}
          </div>
          <ActionBtn icon={Upload} variant="default" className="mt-4">Browse Files</ActionBtn>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">📚 Indexed Documents</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold">RAG Active</span>
          </div>
        </div>
        <DataTable
          columns={[
            { label: 'Document', render: r => (
              <div>
                <p className="font-bold text-slate-900 text-xs">{r.name}</p>
                <p className="text-[10px] text-slate-500">{r.size} • Uploaded {r.uploaded}</p>
              </div>
            )},
            { label: 'Type', render: r => <Badge color="#6366f1" size="xs">{r.type}</Badge> },
            { label: 'Status', render: r => (
              <div className="flex items-center gap-1.5">
                {r.status === 'processing' && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                {r.status === 'indexed' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                <Badge color={r.status === 'indexed' ? '#10b981' : '#f59e0b'}>{r.status}</Badge>
              </div>
            )},
            { label: 'Chunks', render: r => <span className="text-xs font-mono text-slate-400">{r.chunks || '—'}</span> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Eye} variant="ghost">View</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setDocs(p => p.filter(d => d.id !== r.id))}>Del</ActionBtn>
              </div>
            )}
          ]}
          data={docs}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: AI ANALYTICS
═══════════════════════════════════════════════ */
const SectionAIAnalytics = ({ nexusAnalytics }) => (
  <div className="space-y-5">
    <SectionHeader title="AI Analytics" subtitle="Monitor AI usage, performance and popular topics" icon={AreaChart} color="#06b6d4" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total AI Requests', value: '14,520', icon: Brain, color: '#8b5cf6' },
        { label: 'Success Rate', value: '98.7%', icon: CheckCircle, color: '#10b981' },
        { label: 'Failed Responses', value: 189, icon: XCircle, color: '#ef4444' },
        { label: 'Avg Response Time', value: '340ms', icon: Clock, color: '#f59e0b' },
      ].map((k, i) => <StatCard key={i} {...k} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🔥 Most Asked Questions</p>
        <div className="space-y-2">
          {[
            { q: 'How to prepare for system design?', count: 342, color: '#6366f1' },
            { q: 'DSA patterns for FAANG', count: 287, color: '#8b5cf6' },
            { q: 'How to negotiate salary?', count: 234, color: '#06b6d4' },
            { q: 'React hooks best practices', count: 198, color: '#10b981' },
            { q: 'SQL vs NoSQL comparison', count: 167, color: '#f59e0b' },
          ].map((q, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs text-slate-700 truncate flex-1 mr-3">{q.q}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${q.color}20`, color: q.color }}>{q.count}</span>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🎯 Popular Topics</p>
        <div className="space-y-3">
          {[
            { topic: 'Data Structures', pct: 78, color: '#6366f1' },
            { topic: 'System Design', pct: 65, color: '#8b5cf6' },
            { topic: 'Frontend Dev', pct: 54, color: '#06b6d4' },
            { topic: 'ML / AI', pct: 43, color: '#10b981' },
            { topic: 'Behavioral HR', pct: 38, color: '#f59e0b' },
          ].map((t, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{t.topic}</span>
                <span className="text-xs font-bold" style={{ color: t.color }}>{t.pct}%</span>
              </div>
              <MiniBar value={t.pct} color={t.color} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
    <GlassCard>
      <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📊 Token Usage (Monthly)</p>
      <div className="flex items-end gap-1.5 h-28">
        {[45, 62, 38, 71, 55, 88, 92, 67, 43, 76, 81, 95, 54, 68, 72, 84, 91, 58, 73, 86, 63, 77, 89, 94, 52, 66, 78, 85, 71, 88].map((v, i) => (
          <div key={i} className="flex-1 rounded-t-sm transition-all hover:brightness-125" style={{ height: `${v}%`, background: `linear-gradient(to top, #6366f1, #8b5cf6)`, opacity: 0.7 + (i / 60) }} />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-slate-600">Jul 1</span>
        <span className="text-[10px] text-slate-600">Jul 30</span>
      </div>
    </GlassCard>
  </div>
);

/* ═══════════════════════════════════════════════
   SECTION: AI MEMORY MANAGEMENT
═══════════════════════════════════════════════ */
const SectionAIMemory = () => {
  const [memories, setMemories] = useState(MOCK_MEMORIES);

  return (
    <div className="space-y-5">
      <SectionHeader title="AI Memory Management" subtitle="View, edit and control Nexus AI's persistent memory" icon={MemoryStick} color="#ec4899"
        actions={
          <div className="flex gap-2">
            <ActionBtn icon={CloudDownload} variant="ghost">Backup</ActionBtn>
            <ActionBtn icon={RotateCcw} variant="danger">Reset All</ActionBtn>
          </div>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Memories', value: memories.length, icon: MemoryStick, color: '#ec4899' },
          { label: 'Total Tokens', value: memories.reduce((a, m) => a + m.tokens, 0), icon: Binary, color: '#8b5cf6' },
          { label: 'Users with Memory', value: memories.length, icon: Users, color: '#06b6d4' },
          { label: 'Last Backup', value: '2h ago', icon: CloudDownload, color: '#10b981' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>
      <GlassCard>
        <DataTable
          columns={[
            { label: 'User', render: r => <span className="font-bold text-slate-900">{r.user}</span> },
            { label: 'Memory Content', render: r => <span className="text-xs text-slate-400 max-w-xs truncate block" title={r.content}>{r.content}</span> },
            { label: 'Tokens', render: r => <Badge color="#8b5cf6" size="xs">{r.tokens}</Badge> },
            { label: 'Created', render: r => <span className="text-[10px] font-mono text-slate-500">{r.created}</span> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Eye} variant="ghost">View</ActionBtn>
                <ActionBtn size="xs" icon={Copy} variant="ghost">Copy</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setMemories(p => p.filter(m => m.id !== r.id))}>Del</ActionBtn>
              </div>
            )}
          ]}
          data={memories}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: AI CONTROL CENTER (Enterprise)
═══════════════════════════════════════════════ */
const SectionAIControlCenter = ({ nexusConfig }) => {
  const [gpuUsage] = useState(67);
  const [cpuUsage] = useState(34);
  const [ramUsage] = useState(72);

  return (
    <div className="space-y-5">
      <SectionHeader title="AI Control Center" subtitle="Monitor Ollama infrastructure, GPU/CPU and queue" icon={Cpu} color="#f59e0b" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlassCard style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">🎮 GPU Utilization</p>
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${gpuUsage} ${100 - gpuUsage}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-amber-400">{gpuUsage}%</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-500">NVIDIA RTX 4060 · 8GB VRAM</p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">⚡ CPU Utilization</p>
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray={`${cpuUsage} ${100 - cpuUsage}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-cyan-400">{cpuUsage}%</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-500">Intel Core i7-13700 · 16 cores</p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">🧠 RAM Usage</p>
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray={`${ramUsage} ${100 - ramUsage}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-purple-400">{ramUsage}%</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-500">11.5 GB / 16 GB DDR5</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📋 Request Queue</p>
          <div className="space-y-2">
            {[
              { id: '#Q-1428', user: 'Priya Sharma', model: 'qwen3:8b', wait: '0.3s', status: 'processing' },
              { id: '#Q-1429', user: 'Rahul Kumar', model: 'qwen3:8b', wait: '1.2s', status: 'queued' },
              { id: '#Q-1430', user: 'Anita Patel', model: 'qwen3:8b', wait: '2.1s', status: 'queued' },
            ].map((q, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-xs font-mono text-amber-400">{q.id}</p>
                  <p className="text-[10px] text-slate-500">{q.user} · {q.model}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{q.wait}</span>
                  <Badge color={q.status === 'processing' ? '#10b981' : '#64748b'} size="xs">{q.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🔧 Service Controls</p>
          <div className="space-y-3">
            {MOCK_OLLAMA_MODELS.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-xs font-bold text-slate-900">{m.name}</p>
                  <p className="text-[10px] text-slate-500">{m.size}</p>
                </div>
                <div className="flex gap-1.5">
                  <ActionBtn size="xs" icon={Play} variant="success">Start</ActionBtn>
                  <ActionBtn size="xs" icon={Pause} variant="warning">Stop</ActionBtn>
                  <ActionBtn size="xs" icon={RefreshCw} variant="ghost">Restart</ActionBtn>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: LEARNING MANAGEMENT
═══════════════════════════════════════════════ */
const SectionLearning = () => {
  const courses = [
    { id: 1, title: 'DSA Masterclass', type: 'Course', modules: 24, enrolled: 342, status: 'Published' },
    { id: 2, title: 'System Design Bootcamp', type: 'Course', modules: 16, enrolled: 287, status: 'Published' },
    { id: 3, title: 'Frontend React Notes', type: 'Notes', modules: 8, enrolled: 198, status: 'Draft' },
    { id: 4, title: 'SQL Practice Set', type: 'Practice', modules: 50, enrolled: 156, status: 'Published' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Learning Management" subtitle="Create and manage courses, notes, videos and practice sets" icon={GraduationCap} color="#10b981"
        actions={<ActionBtn icon={Plus} variant="success">New Course</ActionBtn>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {['Course', 'Notes', 'Video', 'Practice Set', 'PDF', 'Coding Exercise'].map((t, i) => (
          <button key={i} className="flex items-center gap-2 px-4 py-3 rounded-xl hover:scale-[1.02] transition-all"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Add {t}</span>
          </button>
        ))}
      </div>
      <GlassCard>
        <DataTable
          columns={[
            { label: 'Title', render: r => <span className="font-bold text-slate-900">{r.title}</span> },
            { label: 'Type', render: r => <Badge color="#10b981">{r.type}</Badge> },
            { label: 'Modules', render: r => <span className="text-xs font-mono text-slate-700">{r.modules}</span> },
            { label: 'Enrolled', render: r => <span className="text-xs text-slate-400">{r.enrolled}</span> },
            { label: 'Status', render: r => <Badge color={r.status === 'Published' ? '#10b981' : '#64748b'}>{r.status}</Badge> },
            { label: 'Actions', align: 'right', render: () => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Edit} variant="ghost">Edit</ActionBtn>
                <ActionBtn size="xs" icon={Eye} variant="ghost">View</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger">Del</ActionBtn>
              </div>
            )}
          ]}
          data={courses}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: PLACEMENT MANAGEMENT
═══════════════════════════════════════════════ */
const SectionPlacement = () => {
  const [companies, setCompanies] = useState(MOCK_COMPANIES);

  return (
    <div className="space-y-5">
      <SectionHeader title="Placement Management" subtitle="Manage companies, job listings, drives and campus news" icon={Briefcase} color="#06b6d4"
        actions={<ActionBtn icon={Plus} variant="success">Add Company</ActionBtn>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Partner Companies', value: companies.length, icon: Building2, color: '#06b6d4' },
          { label: 'Open Positions', value: companies.filter(c => c.status === 'Open').reduce((a, c) => a + c.openings, 0), icon: Briefcase, color: '#10b981' },
          { label: 'Placement Drives', value: 3, icon: Calendar, color: '#f59e0b' },
          { label: 'Placed Students', value: 187, icon: Award, color: '#8b5cf6' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>
      <GlassCard>
        <DataTable
          columns={[
            { label: 'Company', render: r => <span className="font-bold text-slate-900">{r.name}</span> },
            { label: 'Type', render: r => <Badge color="#06b6d4">{r.type}</Badge> },
            { label: 'Openings', render: r => <span className="text-xs font-mono text-slate-700">{r.openings}</span> },
            { label: 'Package', render: r => <span className="text-xs text-emerald-400 font-bold">{r.package}</span> },
            { label: 'Deadline', render: r => <span className="text-[10px] font-mono text-slate-500">{r.deadline}</span> },
            { label: 'Status', render: r => <Badge color={r.status === 'Open' ? '#10b981' : '#ef4444'}>{r.status}</Badge> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Edit} variant="ghost">Edit</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setCompanies(p => p.filter(c => c.id !== r.id))}>Del</ActionBtn>
              </div>
            )}
          ]}
          data={companies}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: ANNOUNCEMENTS
═══════════════════════════════════════════════ */
const SectionAnnouncements = () => {
  const [type, setType] = useState('notification');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (title && message) { setSent(true); setTimeout(() => setSent(false), 3000); setTitle(''); setMessage(''); }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Announcement Center" subtitle="Send notifications, emails and system-wide alerts" icon={Megaphone} color="#f59e0b" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">📢 Compose Message</p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Channel</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'notification', icon: BellRing, label: 'Push' },
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'popup', icon: Bell, label: 'Popup' },
                  { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
                ].map(c => (
                  <button key={c.id} onClick={() => setType(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${type === c.id ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/[0.03] border-white/[0.07] text-slate-500'}`}>
                    <c.icon className="w-3 h-3" /> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title…"
                className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-600 outline-none focus:border-amber-500/40" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Write your message here…"
                className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-600 outline-none focus:border-amber-500/40 resize-none" />
            </div>
            <div className="flex gap-2">
              <ActionBtn icon={Send} variant={sent ? 'success' : 'warning'} onClick={handleSend}>
                {sent ? 'Sent!' : 'Send to All Users'}
              </ActionBtn>
              <ActionBtn icon={Users} variant="ghost">Select Audience</ActionBtn>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📜 Recent Announcements</p>
          <div className="space-y-3">
            {[
              { title: 'System Maintenance Notice', type: 'maintenance', time: '2 days ago', reach: 1284 },
              { title: 'New AI Features Released', type: 'notification', time: '5 days ago', reach: 1284 },
              { title: 'Campus Drive: Google & Microsoft', type: 'email', time: '1 week ago', reach: 1284 },
            ].map((a, i) => (
              <div key={i} className="flex items-start justify-between px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-xs font-bold text-slate-900">{a.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{a.time} · Reached {a.reach} users</p>
                </div>
                <Badge color={a.type === 'maintenance' ? '#f59e0b' : a.type === 'email' ? '#06b6d4' : '#8b5cf6'} size="xs">{a.type}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: ANALYTICS
═══════════════════════════════════════════════ */
const SectionAnalytics = () => {
  const chartData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, users: 20 + Math.floor(Math.random() * 80), interviews: 5 + Math.floor(Math.random() * 40) }));

  return (
    <div className="space-y-5">
      <SectionHeader title="Analytics Dashboard" subtitle="Comprehensive platform metrics and trends" icon={BarChart2} color="#6366f1" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Daily Active Users', value: '347', icon: Users, color: '#6366f1' },
          { label: 'Monthly Users', value: '1,284', icon: TrendingUp, color: '#10b981' },
          { label: 'Interview Success', value: '74%', icon: CheckCircle, color: '#f59e0b' },
          { label: 'Placement Rate', value: '67%', icon: Briefcase, color: '#8b5cf6' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📈 Daily Users — Last 30 Days</p>
        <div className="flex items-end gap-1 h-32">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-t-sm transition-all hover:brightness-125"
                style={{ height: `${(d.users / 100) * 100}%`, background: 'linear-gradient(to top, #6366f1, #8b5cf6)', opacity: 0.7 + (d.users / 200) }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-600">Jun 18</span>
          <span className="text-[10px] text-slate-600">Jul 18</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🏆 Score Distribution</p>
          <div className="space-y-2.5">
            {[
              { range: '90-100%', count: 87, color: '#10b981' },
              { range: '75-89%', count: 234, color: '#06b6d4' },
              { range: '60-74%', count: 412, color: '#f59e0b' },
              { range: '45-59%', count: 298, color: '#f97316' },
              { range: 'Below 45%', count: 167, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">{s.range}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.count}</span>
                </div>
                <MiniBar value={s.count} max={450} color={s.color} />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🔐 Security Overview</p>
          <div className="space-y-2.5">
            {[
              { label: 'Total Violations', value: 1247, color: '#ef4444' },
              { label: 'Tab Switch', value: 534, color: '#f97316' },
              { label: 'Face Not Detected', value: 312, color: '#f59e0b' },
              { label: 'Multiple Faces', value: 198, color: '#8b5cf6' },
              { label: 'Fullscreen Exit', value: 203, color: '#06b6d4' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
                <MiniBar value={s.value} max={1300} color={s.color} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: FILE MANAGER
═══════════════════════════════════════════════ */
const SectionFiles = () => {
  const [files] = useState([
    { name: 'interview_templates', type: 'folder', size: '—', modified: '2026-07-15', items: 24 },
    { name: 'resume_uploads', type: 'folder', size: '—', modified: '2026-07-18', items: 2341 },
    { name: 'ai_knowledge_base', type: 'folder', size: '—', modified: '2026-07-10', items: 12 },
    { name: 'company_logos.zip', type: 'zip', size: '4.2 MB', modified: '2026-07-01', items: 0 },
    { name: 'placement_report_Q2.pdf', type: 'pdf', size: '1.8 MB', modified: '2026-06-30', items: 0 },
    { name: 'db_backup_20260718.sql', type: 'sql', size: '12.4 MB', modified: '2026-07-18', items: 0 },
  ]);
  const typeIcon = (t) => ({ folder: FolderOpen, zip: Archive, pdf: FileText, sql: Database }[t] || FileText);
  const typeColor = (t) => ({ folder: '#f59e0b', zip: '#8b5cf6', pdf: '#ef4444', sql: '#10b981' }[t] || '#64748b');

  return (
    <div className="space-y-5">
      <SectionHeader title="File Manager" subtitle="Manage uploads, storage and organize platform files" icon={FolderOpen} color="#64748b"
        actions={
          <div className="flex gap-2">
            <ActionBtn icon={Upload} variant="ghost">Upload</ActionBtn>
            <ActionBtn icon={FolderOpen} variant="ghost">New Folder</ActionBtn>
          </div>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Files', value: '2,389', icon: FileText, color: '#64748b' },
          { label: 'Storage Used', value: '4.7 GB', icon: HardDrive, color: '#6366f1' },
          { label: 'Storage Free', value: '11.3 GB', icon: Server, color: '#10b981' },
          { label: 'Last Backup', value: '2h ago', icon: CloudDownload, color: '#f59e0b' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input placeholder="Search files…" className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-600 outline-none" />
          </div>
        </div>
        <DataTable
          columns={[
            { label: 'Name', render: r => {
              const Icon = typeIcon(r.type);
              const color = typeColor(r.type);
              return (
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  <span className="font-medium text-slate-900">{r.name}</span>
                  {r.items > 0 && <Badge color={color} size="xs">{r.items} items</Badge>}
                </div>
              );
            }},
            { label: 'Type', render: r => <Badge color={typeColor(r.type)} size="xs">{r.type}</Badge> },
            { label: 'Size', render: r => <span className="text-xs font-mono text-slate-400">{r.size}</span> },
            { label: 'Modified', render: r => <span className="text-[10px] font-mono text-slate-500">{r.modified}</span> },
            { label: 'Actions', align: 'right', render: () => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Download} variant="ghost">DL</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger">Del</ActionBtn>
              </div>
            )}
          ]}
          data={files}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: LOGS
═══════════════════════════════════════════════ */
const SectionLogs = () => {
  const [activeLog, setActiveLog] = useState('login');
  const logs = {
    login: [
      { ts: '2026-07-18 17:45:12', user: 'priya@example.com', ip: '192.168.1.10', device: 'Chrome/Win11', status: 'success' },
      { ts: '2026-07-18 17:42:08', user: 'rahul@example.com', ip: '192.168.1.12', device: 'Firefox/Win10', status: 'success' },
      { ts: '2026-07-18 17:38:55', user: 'unknown@evil.com', ip: '203.0.113.5', device: 'curl/7.68', status: 'failed' },
    ],
    security: [
      { ts: '2026-07-18 17:32:14', type: 'DISQUALIFICATION', user: 'anita@example.com', detail: '5 proctoring strikes', severity: 'high' },
      { ts: '2026-07-18 17:20:01', type: 'TAB_SWITCH', user: 'rahul@example.com', detail: 'Switched to another tab', severity: 'medium' },
    ],
    api: [
      { ts: '2026-07-18 17:45:10', method: 'POST', endpoint: '/api/interview/submit', status: 200, latency: '45ms' },
      { ts: '2026-07-18 17:45:08', method: 'GET', endpoint: '/api/auth/users', status: 200, latency: '12ms' },
      { ts: '2026-07-18 17:44:55', method: 'POST', endpoint: '/api/auth/login', status: 401, latency: '8ms' },
    ],
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="System Logs" subtitle="View real-time login, security, activity and API logs" icon={Terminal} color="#10b981"
        actions={<ActionBtn icon={Download} variant="ghost">Export Logs</ActionBtn>}
      />
      <div className="flex gap-2 flex-wrap">
        {['login', 'security', 'api'].map(l => (
          <button key={l} onClick={() => setActiveLog(l)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold border uppercase tracking-widest transition-all ${activeLog === l ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/[0.03] border-white/[0.07] text-slate-500'}`}>
            {l} logs
          </button>
        ))}
      </div>
      <GlassCard>
        {activeLog === 'login' && (
          <DataTable
            columns={[
              { label: 'Timestamp', render: r => <span className="text-[10px] font-mono text-slate-500">{r.ts}</span> },
              { label: 'User', render: r => <span className="text-xs text-slate-800">{r.user}</span> },
              { label: 'IP', render: r => <span className="text-[10px] font-mono text-slate-400">{r.ip}</span> },
              { label: 'Device', render: r => <span className="text-[10px] text-slate-500">{r.device}</span> },
              { label: 'Status', render: r => <Badge color={r.status === 'success' ? '#10b981' : '#ef4444'}>{r.status}</Badge> },
            ]}
            data={logs.login}
          />
        )}
        {activeLog === 'security' && (
          <DataTable
            columns={[
              { label: 'Timestamp', render: r => <span className="text-[10px] font-mono text-slate-500">{r.ts}</span> },
              { label: 'Type', render: r => <Badge color="#ef4444" size="xs">{r.type}</Badge> },
              { label: 'User', render: r => <span className="text-xs text-slate-800">{r.user}</span> },
              { label: 'Detail', render: r => <span className="text-xs text-slate-400">{r.detail}</span> },
              { label: 'Severity', render: r => <Badge color={r.severity === 'high' ? '#ef4444' : '#f59e0b'}>{r.severity}</Badge> },
            ]}
            data={logs.security}
          />
        )}
        {activeLog === 'api' && (
          <DataTable
            columns={[
              { label: 'Timestamp', render: r => <span className="text-[10px] font-mono text-slate-500">{r.ts}</span> },
              { label: 'Method', render: r => <Badge color={r.method === 'GET' ? '#06b6d4' : '#8b5cf6'} size="xs">{r.method}</Badge> },
              { label: 'Endpoint', render: r => <span className="text-[10px] font-mono text-slate-700">{r.endpoint}</span> },
              { label: 'Status', render: r => <Badge color={r.status < 300 ? '#10b981' : '#ef4444'}>{r.status}</Badge> },
              { label: 'Latency', render: r => <span className="text-[10px] font-mono text-slate-400">{r.latency}</span> },
            ]}
            data={logs.api}
          />
        )}
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: SYSTEM SETTINGS
═══════════════════════════════════════════════ */
const SectionSettings = () => {
  const [appName, setAppName] = useState('ElevateAI');
  const [maintenance, setMaintenance] = useState(false);
  const [jwtExpiry, setJwtExpiry] = useState(7);
  const [otpEnabled, setOtpEnabled] = useState(true);
  const [googleLogin, setGoogleLogin] = useState(true);
  const [pwdMinLen, setPwdMinLen] = useState(8);

  return (
    <div className="space-y-5">
      <SectionHeader title="System Settings" subtitle="Configure general, authentication and security settings" icon={Settings} color="#475569" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">🎨 General Settings</p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">App Name</label>
              <input value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Theme</label>
              <div className="flex gap-2">
                {['Dark', 'Light', 'System'].map(t => (
                  <button key={t} className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-slate-700 transition-all">{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Platform Logo</label>
              <ActionBtn icon={Upload} variant="ghost">Upload Logo</ActionBtn>
            </div>
            <Toggle value={maintenance} onChange={setMaintenance} label="Maintenance Mode" />
            {maintenance && (
              <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs text-amber-400 font-semibold">⚠️ Maintenance mode will restrict all user access.</p>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">🔐 Authentication Settings</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400">JWT Expiry (days)</label>
                <span className="text-xs font-bold text-indigo-400">{jwtExpiry}d</span>
              </div>
              <input type="range" min={1} max={30} value={jwtExpiry} onChange={e => setJwtExpiry(+e.target.value)} className="w-full accent-indigo-500 h-1.5" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-400">Min Password Length</label>
                <span className="text-xs font-bold text-indigo-400">{pwdMinLen}</span>
              </div>
              <input type="range" min={6} max={24} value={pwdMinLen} onChange={e => setPwdMinLen(+e.target.value)} className="w-full accent-indigo-500 h-1.5" />
            </div>
            <Toggle value={otpEnabled} onChange={setOtpEnabled} label="OTP / Device Verification" />
            <Toggle value={googleLogin} onChange={setGoogleLogin} label="Google OAuth Login" />
            <ActionBtn icon={Save} variant="success">Save Auth Settings</ActionBtn>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: DATABASE MANAGEMENT
═══════════════════════════════════════════════ */
const SectionDatabase = () => {
  const [loading, setLoading] = useState(null);
  const doAction = (action) => { setLoading(action); setTimeout(() => setLoading(null), 2000); };

  return (
    <div className="space-y-5">
      <SectionHeader title="Database Management" subtitle="Backup, restore, optimize and manage your database" icon={Database} color="#ef4444" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">💾 Database Operations</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Backup Database', icon: CloudDownload, variant: 'success', action: 'backup' },
              { label: 'Restore Database', icon: CloudUpload, variant: 'warning', action: 'restore' },
              { label: 'Export to JSON', icon: FileJson, variant: 'ghost', action: 'export_json' },
              { label: 'Export to CSV', icon: FileText, variant: 'ghost', action: 'export_csv' },
              { label: 'Clear Cache', icon: Trash2, variant: 'danger', action: 'cache' },
              { label: 'Optimize Tables', icon: Zap, variant: 'default', action: 'optimize' },
            ].map((a, i) => (
              <button key={i} onClick={() => doAction(a.action)} disabled={loading === a.action}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                {loading === a.action ? <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" /> : <a.icon className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-slate-700">{a.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📊 Database Stats</p>
          <div className="space-y-3">
            {[
              { label: 'Database Size', value: '124 MB', color: '#6366f1' },
              { label: 'Total Records', value: '48,291', color: '#10b981' },
              { label: 'Tables', value: '18', color: '#06b6d4' },
              { label: 'Last Backup', value: '2 hours ago', color: '#f59e0b' },
              { label: 'Last Optimize', value: '3 days ago', color: '#8b5cf6' },
              { label: 'Index Health', value: '98%', color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: REPORTS
═══════════════════════════════════════════════ */
const SectionReports = () => {
  const [generating, setGenerating] = useState(null);

  const reports = [
    { id: 'user', label: 'User Report', icon: Users, color: '#6366f1', desc: 'All registered candidates, roles, and statuses' },
    { id: 'interview', label: 'Interview Report', icon: Video, color: '#06b6d4', desc: 'All interviews, scores, and integrity metrics' },
    { id: 'placement', label: 'Placement Report', icon: Briefcase, color: '#10b981', desc: 'Company-wise placement stats and drive results' },
    { id: 'resume', label: 'Resume Report', icon: FileText, color: '#f97316', desc: 'ATS scores, skill distribution, and analytics' },
    { id: 'security', label: 'Security Report', icon: ShieldAlert, color: '#ef4444', desc: 'Violations, bans, and proctoring data' },
    { id: 'ai', label: 'AI Usage Report', icon: Brain, color: '#8b5cf6', desc: 'Token usage, response rates, and popular topics' },
  ];

  const handleGenerate = (id, fmt) => {
    setGenerating(`${id}-${fmt}`);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Reports" subtitle="Generate and export platform reports in PDF, Excel or CSV" icon={FileBarChart} color="#8b5cf6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <GlassCard key={r.id} className="hover:scale-[1.01] transition-transform">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}>
                <r.icon className="w-4 h-4" style={{ color: r.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{r.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['PDF', 'Excel', 'CSV'].map(fmt => (
                <button key={fmt} onClick={() => handleGenerate(r.id, fmt)} disabled={generating === `${r.id}-${fmt}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold border transition-all hover:brightness-125 disabled:opacity-50"
                  style={{ background: `${r.color}10`, border: `1px solid ${r.color}25`, color: r.color }}>
                  {generating === `${r.id}-${fmt}` ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  {generating === `${r.id}-${fmt}` ? 'Generating…' : fmt}
                </button>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: ROLE MANAGEMENT
═══════════════════════════════════════════════ */
const SectionRoles = () => {
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [selected, setSelected] = useState(null);

  const togglePermission = (roleId, perm) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const has = r.permissions.includes(perm);
      return { ...r, permissions: has ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm] };
    }));
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Role Management" subtitle="Define roles and assign granular permissions" icon={UserCog} color="#ec4899"
        actions={<ActionBtn icon={Plus} variant="success">New Role</ActionBtn>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">👥 Roles</p>
          <div className="space-y-2">
            {roles.map(r => (
              <button key={r.id} onClick={() => setSelected(r.id === selected ? null : r.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${selected === r.id ? 'ring-1' : 'hover:bg-white/[0.03]'}`}
                style={selected === r.id ? { background: `${r.color}12`, border: `1px solid ${r.color}30`, ringColor: r.color } : { border: '1px solid rgba(0,0,0,0.03)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-xs font-bold text-slate-900">{r.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={r.color} size="xs">{r.users} users</Badge>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="lg:col-span-2">
          {selected ? (
            <GlassCard>
              {(() => {
                const role = roles.find(r => r.id === selected);
                return (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-3 h-3 rounded-full" style={{ background: role.color }} />
                      <p className="text-sm font-black text-slate-900">{role.name} — Permissions</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ALL_PERMISSIONS.map(perm => {
                        const has = role.permissions.includes(perm);
                        return (
                          <button key={perm} onClick={() => togglePermission(role.id, perm)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all"
                            style={has ? { background: `${role.color}15`, border: `1px solid ${role.color}30`, color: role.color } : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}>
                            {has ? <CheckSquare className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded border-2 border-current opacity-30" />}
                            {perm.replace('_', ' ')}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <ActionBtn icon={Save} variant="success">Save Permissions</ActionBtn>
                      <ActionBtn icon={Trash2} variant="danger">Delete Role</ActionBtn>
                    </div>
                  </>
                );
              })()}
            </GlassCard>
          ) : (
            <GlassCard className="flex items-center justify-center" style={{ minHeight: 200 }}>
              <div className="text-center">
                <UserCog className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-semibold">Select a role to edit permissions</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: API MANAGEMENT
═══════════════════════════════════════════════ */
const SectionAPI = () => {
  const [keys, setKeys] = useState(MOCK_API_KEYS);

  return (
    <div className="space-y-5">
      <SectionHeader title="API Management" subtitle="Manage API keys, webhooks and rate limits" icon={Globe} color="#06b6d4"
        actions={<ActionBtn icon={Plus} variant="success">Generate Key</ActionBtn>}
      />
      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🔑 API Keys</p>
        <DataTable
          columns={[
            { label: 'Name', render: r => <span className="font-bold text-slate-900">{r.name}</span> },
            { label: 'Key', render: r => <span className="text-[10px] font-mono text-slate-400">{r.key}</span> },
            { label: 'Requests', render: r => <span className="text-xs text-slate-700">{r.requests.toLocaleString()}</span> },
            { label: 'Last Used', render: r => <span className="text-[10px] text-slate-500">{r.lastUsed}</span> },
            { label: 'Status', render: r => <Badge color={r.status === 'active' ? '#10b981' : '#ef4444'}>{r.status}</Badge> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={Copy} variant="ghost">Copy</ActionBtn>
                <ActionBtn size="xs" icon={Trash2} variant="danger" onClick={() => setKeys(p => p.filter(k => k.id !== r.id))}>Revoke</ActionBtn>
              </div>
            )}
          ]}
          data={keys}
        />
      </GlassCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">🔗 Webhooks</p>
          <div className="space-y-2 mb-4">
            {[
              { url: 'https://hooks.slack.com/services/xxx', event: 'interview.completed', status: 'active' },
              { url: 'https://api.partner.com/webhook', event: 'user.suspended', status: 'active' },
            ].map((w, i) => (
              <div key={i} className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-mono text-cyan-400 truncate">{w.url}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge color="#8b5cf6" size="xs">{w.event}</Badge>
                  <Badge color="#10b981" size="xs">{w.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <ActionBtn icon={Plus} variant="ghost">Add Webhook</ActionBtn>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">⚡ Rate Limits</p>
          <div className="space-y-3">
            {[
              { endpoint: 'Auth endpoints', limit: '10 req/min', used: 3 },
              { endpoint: 'AI chat', limit: '20 req/min', used: 12 },
              { endpoint: 'Interview submit', limit: '5 req/min', used: 1 },
              { endpoint: 'General API', limit: '100 req/min', used: 67 },
            ].map((r, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">{r.endpoint}</span>
                  <span className="text-[10px] text-slate-500">{r.used} / {r.limit}</span>
                </div>
                <MiniBar value={r.used} max={parseInt(r.limit)} color={r.used / parseInt(r.limit) > 0.8 ? '#ef4444' : '#06b6d4'} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: BACKUP & RECOVERY (Enterprise)
═══════════════════════════════════════════════ */
const SectionBackup = () => {
  const backups = [
    { id: 'bk-001', timestamp: '2026-07-18 00:00:01', size: '124 MB', type: 'Automatic', status: 'success' },
    { id: 'bk-002', timestamp: '2026-07-17 00:00:01', size: '121 MB', type: 'Automatic', status: 'success' },
    { id: 'bk-003', timestamp: '2026-07-16 12:00:00', size: '118 MB', type: 'Manual', status: 'success' },
    { id: 'bk-004', timestamp: '2026-07-16 00:00:01', size: '115 MB', type: 'Automatic', status: 'failed' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Backup & Recovery" subtitle="Manage automatic backups, restore points and disaster recovery" icon={CloudDownload} color="#f97316"
        actions={<ActionBtn icon={CloudDownload} variant="warning">Backup Now</ActionBtn>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Backups', value: backups.length, icon: Archive, color: '#f97316' },
          { label: 'Last Backup', value: '00:00 today', icon: Clock, color: '#10b981' },
          { label: 'Storage Used', value: '478 MB', icon: HardDrive, color: '#6366f1' },
          { label: 'Retention', value: '30 days', icon: Calendar, color: '#06b6d4' },
        ].map((k, i) => <StatCard key={i} {...k} />)}
      </div>
      <GlassCard>
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">📦 Backup History</p>
        <DataTable
          columns={[
            { label: 'ID', render: r => <span className="text-[10px] font-mono text-slate-500">{r.id}</span> },
            { label: 'Timestamp', render: r => <span className="text-xs font-mono text-slate-700">{r.timestamp}</span> },
            { label: 'Size', render: r => <span className="text-xs text-slate-400">{r.size}</span> },
            { label: 'Type', render: r => <Badge color={r.type === 'Manual' ? '#8b5cf6' : '#06b6d4'}>{r.type}</Badge> },
            { label: 'Status', render: r => <Badge color={r.status === 'success' ? '#10b981' : '#ef4444'}>{r.status}</Badge> },
            { label: 'Actions', align: 'right', render: r => (
              <div className="flex gap-1.5 justify-end">
                <ActionBtn size="xs" icon={CloudUpload} variant="warning">Restore</ActionBtn>
                <ActionBtn size="xs" icon={Download} variant="ghost">Download</ActionBtn>
              </div>
            )}
          ]}
          data={backups}
        />
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION: AUDIT & COMPLIANCE (Enterprise)
═══════════════════════════════════════════════ */
const SectionAudit = () => (
  <div className="space-y-5">
    <SectionHeader title="Audit & Compliance" subtitle="Immutable audit trail of every admin action" icon={ScrollText} color="#64748b"
      actions={<ActionBtn icon={Download} variant="ghost">Export Audit Log</ActionBtn>}
    />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Admin Actions Today', value: 47, icon: Activity, color: '#6366f1' },
        { label: 'Admins Active', value: 3, icon: Users, color: '#10b981' },
        { label: 'High Risk Actions', value: 5, icon: AlertTriangle, color: '#ef4444' },
        { label: 'Audit Integrity', value: '100%', icon: Shield, color: '#10b981' },
      ].map((k, i) => <StatCard key={i} {...k} />)}
    </div>
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <p className="text-xs font-black text-slate-700 uppercase tracking-widest">🔒 Immutable Audit Trail</p>
      </div>
      <DataTable
        columns={[
          { label: 'Timestamp', render: r => <span className="text-[10px] font-mono text-slate-500">{r.timestamp}</span> },
          { label: 'Admin', render: r => <span className="text-xs font-bold text-slate-900">{r.admin}</span> },
          { label: 'Action', render: r => <Badge color="#6366f1">{r.action}</Badge> },
          { label: 'Target', render: r => <span className="text-xs text-slate-400">{r.target}</span> },
          { label: 'IP', render: r => <span className="text-[10px] font-mono text-slate-600">{r.ip}</span> },
        ]}
        data={MOCK_AUDIT_LOGS}
      />
    </GlassCard>
    <GlassCard style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-emerald-400 mb-1">Audit Trail Integrity Verified</p>
          <p className="text-[11px] text-slate-400">All admin actions are cryptographically hashed and stored in an immutable append-only log. No records can be deleted or modified. Logs are retained for 365 days.</p>
        </div>
      </div>
    </GlassCard>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN ADMIN DASHBOARD SHELL
═══════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS);
  const [nexusConfig, setNexusConfig] = useState({ activeModel: 'qwen3:8b', ollamaStatus: 'OFFLINE', activeVersion: 'Nexus AI v1.0', ollamaUrl: 'http://localhost:11434' });
  const [nexusAnalytics, setNexusAnalytics] = useState({ totalInteractions: 0, avgLatencySeconds: 0, helpfulnessRatio: { helpful: 0, unhelpful: 0 }, topWeakTopics: [], frequentQuestions: [] });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => NAV_GROUPS.reduce((acc, g) => ({ ...acc, [g.label]: true }), {}));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadData = useCallback(async () => {
    let allUsers = [];
    try {
      allUsers = await authService.getUsersList();
      setUsers(allUsers);
    } catch {
      try {
        allUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        setUsers(allUsers);
      } catch {}
    }
    try {
      const config = await interviewService.getNexusConfig();
      setNexusConfig(config);
      const analytics = await interviewService.getNexusGlobalAnalytics();
      setNexusAnalytics(analytics);
      
      const interviewHistory = await interviewService.getPastInterviews() || [];
      const warnings = await interviewService.getWarningsList() || [];
      
      const avgScore = interviewHistory.length > 0
        ? Math.round(interviewHistory.reduce((acc, curr) => acc + curr.overallScore, 0) / interviewHistory.length)
        : 0;

      setStats({
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => !u.isBanned && (!u.suspendedUntil || u.suspendedUntil < Date.now())).length,
        interviewsToday: interviewHistory.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length,
        resumesAnalyzed: allUsers.filter(u => u.resumeUrl).length,
        aiRequests: interviewHistory.length * 4 + (analytics?.totalInteractions || 0),
        avgScore,
        securityAlerts: warnings.length,
        suspendedUsers: allUsers.filter(u => u.suspendedUntil && u.suspendedUntil > Date.now()).length,
        placementReadiness: allUsers.length > 0 ? Math.round((allUsers.filter(u => u.readinessScore >= 75).length / allUsers.length) * 100) : 0,
        systemHealth: 100,
      });
    } catch (e) {
      console.warn("Failed to calculate live admin stats:", e);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUnlock = async (id) => { try { await authService.unlockUser(id); loadData(); } catch {} };
  const handleExtend = async (id) => { try { await authService.extendSuspension(id); loadData(); } catch {} };
  const handleBan = async (id) => { if (!window.confirm('Permanently ban this user?')) return; try { await authService.banUser(id); loadData(); } catch {} };
  const handleToggleRole = async (id, role = null) => { try { await authService.toggleUserRole(id, role); loadData(); } catch {} };

  const toggleGroup = (label) => setOpenGroups(p => ({ ...p, [label]: !p[label] }));

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <SectionDashboard stats={stats} />;
      case 'candidates': return <SectionCandidates users={users} onUnlock={handleUnlock} onExtend={handleExtend} onBan={handleBan} onToggleRole={handleToggleRole} />;
      case 'live-monitoring': return <SectionLiveMonitoring />;
      case 'security-control': return <SectionSecurityControl />;
      case 'audit': return <SectionAudit />;
      case 'interviews': return <SectionInterviews />;
      case 'aptitude': return <SectionAptitude />;
      case 'resume': return <SectionResume />;
      case 'ai-settings': return <SectionAISettings nexusConfig={nexusConfig} />;
      case 'ai-knowledge': return <SectionAIKnowledge />;
      case 'ai-analytics': return <SectionAIAnalytics nexusAnalytics={nexusAnalytics} />;
      case 'ai-memory': return <SectionAIMemory />;
      case 'ai-control': return <SectionAIControlCenter nexusConfig={nexusConfig} />;
      case 'learning': return <SectionLearning />;
      case 'placement': return <SectionPlacement />;
      case 'announcements': return <SectionAnnouncements />;
      case 'analytics': return <SectionAnalytics />;
      case 'reports': return <SectionReports />;
      case 'files': return <SectionFiles />;
      case 'logs': return <SectionLogs />;
      case 'settings': return <SectionSettings />;
      case 'database': return <SectionDatabase />;
      case 'api': return <SectionAPI />;
      case 'backup': return <SectionBackup />;
      case 'roles': return <SectionRoles />;
      default: return <SectionDashboard stats={stats} />;
    }
  };

  const activeSectionMeta = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeSection);

  return (
    <div className="h-screen flex relative overflow-hidden font-sans"
      style={{ background: 'var(--app-bg)', backgroundColor: 'var(--app-bg-color)' }}>
      {/* Aurora background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] animate-morph animate-float-slow"
          style={{ background: `radial-gradient(circle, var(--orb-1) 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] animate-morph-slow animate-float-slower"
          style={{ background: `radial-gradient(circle, var(--orb-2) 0%, transparent 70%)`, filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] animate-morph-slower animate-float-drift"
          style={{ background: `radial-gradient(circle, var(--orb-3) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div className="bg-grid-animated opacity-40 dark:opacity-20" />
      </div>

      <div className="flex-1 flex relative overflow-hidden animate-fade-in-up" style={{ zIndex: 1 }}>
        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} />
        )}

        <aside className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300
          lg:relative lg:z-auto lg:top-auto lg:bottom-auto lg:left-auto
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-14' : 'lg:w-60'}
          w-64
        `}
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(20px)',
          }}>

          {/* Admin Nav Header */}
          <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center animate-morph" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-black text-slate-800 tracking-tight">SUPER ADMIN</span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(p => !p)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all hidden lg:flex">
              {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 rotate-90" />}
            </button>
            <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden">
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 admin-subnav">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-1">
                {!sidebarCollapsed && (
                  <button onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-2 py-1.5 mb-0.5 group">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] group-hover:text-slate-600 transition-colors">{group.label}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openGroups[group.label] ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                )}
                {(openGroups[group.label] || sidebarCollapsed) && group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileNavOpen(false); }}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all group ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-850'}`}
                      style={isActive ? { background: `${item.color}10`, border: `1px solid ${item.color}20` } : { border: '1px solid transparent' }}
                      title={sidebarCollapsed ? item.label : undefined}>
                      <item.icon className={`w-4 h-4 flex-shrink-0 transition-all ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                        style={{ color: isActive ? item.color : undefined }} />
                      {!sidebarCollapsed && (
                        <span className={`text-[11px] font-bold truncate ${isActive ? 'text-slate-900' : ''}`}>{item.label}</span>
                      )}
                      {isActive && !sidebarCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer controls */}
          {!sidebarCollapsed && (
            <div className="px-2 py-3 flex-shrink-0 space-y-1.5" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <button onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-all hover:bg-black/[0.03]">
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                Back to Dashboard
              </button>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-all hover:bg-rose-500/10">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center gap-3 px-5 py-3 flex-shrink-0"
            style={{ background: 'rgba(255, 255, 255, 0.65)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(12px)' }}>
            <button onClick={() => setMobileNavOpen(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 lg:hidden">
              <Layers className="w-4 h-4" />
            </button>
            {activeSectionMeta && (
              <div className="flex items-center gap-2">
                <activeSectionMeta.icon className="w-4 h-4" style={{ color: activeSectionMeta.color }} />
                <span className="text-sm font-black text-slate-805">{activeSectionMeta.label}</span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-650">SUPER ADMIN</span>
              </div>
            </div>
          </div>

          {/* Section content */}
          <div className="p-5 lg:p-8 animate-fade-in-up">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
