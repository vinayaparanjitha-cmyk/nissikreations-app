import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  CloudUpload,
  CloudDownload,
  Key,
  Globe,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  isSupabaseConfigured,
  SUPABASE_SQL_SCHEMA,
  getSupabaseClient,
} from '../lib/supabase';

export const SupabaseSettingsCard: React.FC = () => {
  const {
    dbStatus,
    isDbConfigured,
    isSyncing,
    isLoadingData,
    lastSyncedAt,
    syncWithDatabase,
    testDatabaseConnection,
    refreshDataFromDatabase,
    showToast,
    customers,
    invoices,
    quotations,
    orders,
    payments,
    expenses,
    products,
  } = useApp();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  // Supabase Auth State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setUrl(config.url || '');
    setAnonKey(config.anonKey || '');

    // Check auth session
    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data }) => {
        setAuthUser(data.session?.user || null);
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
        setAuthUser(session?.user || null);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [dbStatus]);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    showToast('Supabase database credentials saved! Reconnecting...', 'success');
    setTimeout(() => {
      refreshDataFromDatabase();
    }, 300);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Temporarily save to test with latest typed values
      saveStoredSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
      const result = await testDatabaseConnection();
      setTestResult(result);
      if (result.ok) {
        showToast('Supabase connection verified successfully!', 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('Supabase PostgreSQL SQL script copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) {
      showToast('Please configure Supabase URL and Anon Key first', 'error');
      return;
    }

    if (!authEmail.trim() || !authPassword.trim()) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setIsAuthLoading(true);
    try {
      if (authMode === 'login') {
        const { data, error } = await client.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) throw error;
        setAuthUser(data.user);
        showToast(`Logged in as ${data.user?.email}`, 'success');
      } else {
        const { data, error } = await client.auth.signUp({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) throw error;
        setAuthUser(data.user);
        showToast('Account registered successfully!', 'success');
      }
      setAuthPassword('');
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
      setAuthUser(null);
      showToast('Logged out of Supabase Auth', 'info');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      {/* Title & Live Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Supabase Database & Realtime Cloud Persistence</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                PostgreSQL
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              All business data (Invoices, Customers, Quotations, Orders, Payments, Expenses) is persistently stored in PostgreSQL.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {dbStatus === 'connected' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Cloud Connected</span>
            </div>
          )}
          {dbStatus === 'connecting' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting to Supabase...</span>
            </div>
          )}
          {dbStatus === 'local_fallback' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local Persistent Storage Active</span>
            </div>
          )}
          {dbStatus === 'error' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Database Sync Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Database Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Customers</span>
          <span className="text-sm font-bold text-slate-900">{customers.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Invoices</span>
          <span className="text-sm font-bold text-slate-900">{invoices.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Quotations</span>
          <span className="text-sm font-bold text-slate-900">{quotations.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Orders</span>
          <span className="text-sm font-bold text-slate-900">{orders.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Payments</span>
          <span className="text-sm font-bold text-slate-900">{payments.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Expenses</span>
          <span className="text-sm font-bold text-slate-900">{expenses.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Catalog</span>
          <span className="text-sm font-bold text-slate-900">{products.length}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Last Sync</span>
          <span className="text-[11px] font-bold text-emerald-700 truncate block">
            {lastSyncedAt || 'Active'}
          </span>
        </div>
      </div>

      {/* Supabase Connection Credentials Form */}
      <form onSubmit={handleSaveCredentials} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Supabase Project URL</span>
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-xs text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Found under Project Settings &gt; API in your Supabase Dashboard.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Supabase Public Anon Key</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-xs text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              The public anonymous client key with Row Level Security.
            </span>
          </div>
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.ok
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !url || !anonKey}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={() => syncWithDatabase()}
              disabled={isSyncing || !isDbConfigured}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isSyncing ? 'Syncing to Cloud...' : 'Upload All to Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={() => refreshDataFromDatabase()}
              disabled={isLoadingData}
              className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-sky-800 font-bold rounded-xl border border-sky-200 flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
            >
              <CloudDownload className="w-3.5 h-3.5 text-sky-600" />
              <span>Pull from Cloud</span>
            </button>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
          >
            Save &amp; Connect
          </button>
        </div>
      </form>

      {/* SQL Setup Script Section */}
      <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-orange-400" />
              <span>Supabase Database Schema Setup Script</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Paste this SQL into your Supabase project's SQL Editor to create all 8 tables with RLS and realtime support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSqlPreview(!showSqlPreview)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors"
            >
              {showSqlPreview ? 'Hide SQL Code' : 'View SQL Code'}
            </button>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>
        </div>

        {showSqlPreview && (
          <div className="mt-3">
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>

      {/* Supabase Auth Administrative Access */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Supabase Authentication &amp; Multi-Device Access</h3>
          </div>

          {authUser && (
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-semibold">
              Authenticated: {authUser.email}
            </span>
          )}
        </div>

        {authUser ? (
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs">
            <div>
              <p className="font-semibold text-slate-800">Signed in as {authUser.email}</p>
              <p className="text-[11px] text-slate-500">Your session is active and synced with cloud security rules.</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
            <p className="text-[11px] text-slate-500">
              Sign in with your Supabase account to manage the business securely across multiple phones, tablets, or computers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="email"
                  placeholder="admin@nissikreations.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {isAuthLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Register'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-[11px] text-indigo-600 hover:underline px-1 cursor-pointer"
                >
                  {authMode === 'login' ? 'Need Account?' : 'Back to Login'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
