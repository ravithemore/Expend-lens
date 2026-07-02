'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import SpendChart from '@/components/spend-chart';
import WeeklyFlowChart from '@/components/weekly-flow-chart';
import SettingsDrawer from '@/components/settings-drawer';

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Ravi');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [selectedRange, setSelectedRange] = useState<'weekly' | 'monthly'>('weekly');

  // Interactive Upload & Toast states
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile name and avatar from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('spendLens_profileName');
      if (savedName) setDisplayName(savedName);

      const savedAvatar = localStorage.getItem('spendLens_avatarIndex');
      if (savedAvatar) setAvatarIndex(parseInt(savedAvatar, 10));
    }
  }, []);

  // Keyboard shortcut listener to focus search input on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search Transactions"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-clear Toast messages after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Queries
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me(),
    enabled: mounted,
  });

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api.getSummary(),
    enabled: mounted,
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategoryBreakdowns(),
    enabled: mounted,
  });

  const { data: insights } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.getInsights(),
    enabled: mounted,
  });

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.getTransactions(),
    enabled: mounted,
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadStatement(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center font-body text-on-surface">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant/80 mt-4">Loading ExpenseLens...</p>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processStagedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processStagedFile(e.target.files[0]);
    }
  };

  const processStagedFile = (file: File) => {
    if (file.name.toLowerCase().endsWith('.csv')) {
      setStagedFile(file);
      setUploadProgress(null);
    } else {
      setToastMessage("Invalid file format. Please upload a standard bank CSV.");
    }
  };

  const triggerUpload = () => {
    if (!stagedFile) return;
    setUploadProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        uploadMutation.mutate(stagedFile, {
          onSuccess: () => {
            setToastMessage(`${stagedFile.name} has been successfully processed!`);
            setStagedFile(null);
            setUploadProgress(null);
          },
          onError: () => {
            setToastMessage(`Failed to parse ${stagedFile.name}. Check file structure.`);
            setUploadProgress(null);
          }
        });
      }
    }, 100);
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.downloadPdfReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SpendLens_Wealth_Report_${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to compile PDF statement. Run backend services.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
      router.refresh();
    } catch (e) {
      alert('Logout failed');
    }
  };

  const avatars = [
    { bg: 'bg-[#6d5ef9]', text: 'RV' },
    { bg: 'bg-[#4b6a4f]', text: 'RV' },
    { bg: 'bg-[#ba1a1a]', text: 'RV' },
    { bg: 'bg-[#007fac]', text: 'RV' }
  ];

  // Render Ingestion Landing Empty State (Image 1)
  const renderLandingState = () => {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#f8f9fc] font-body text-on-surface p-6">
        {/* Top Header Bar */}
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full mb-8">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-9 h-9 shrink-0">
              <defs>
                <linearGradient id="logoGradLanding" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="#b4a9ff" />
                  <stop offset="100%" stopColor="#7c66ff" />
                </linearGradient>
              </defs>
              <circle cx="19" cy="15" r="7.5" fill="url(#logoGradLanding)" opacity="0.85" />
              <path d="M10 6V22H26" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display font-bold text-xl text-on-surface tracking-tight">ExpenseLens</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-on-surface-variant/80">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-[#ece9ff] text-primary text-xs font-bold rounded-full hover:bg-primary-container/80 transition-all border border-primary/10"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Center Jumbotron */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto text-center gap-8 py-8 w-full">
          <div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight tracking-tight text-on-surface">
              ExpenseLens – Know where<br />every <span className="text-primary italic font-medium">rupee</span> goes.
            </h1>
            <p className="text-sm text-on-surface-variant/80 mt-4 leading-relaxed max-w-xl mx-auto">
              Premium financial intelligence for the modern professional. Upload your bank statements and visualize your net worth in seconds.
            </p>
          </div>

          {/* Upload card */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full max-w-xl p-10 bg-white rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 shadow-sm ${
              dragActive ? "border-primary bg-[#ece9ff]/20 scale-102" : "border-outline-variant/60 hover:border-primary/50"
            }`}
          >
            {stagedFile ? (
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="flex items-center justify-between w-full p-4 bg-surface-container-low/60 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-on-surface truncate max-w-xs">{stagedFile.name}</p>
                      <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{(stagedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  {uploadProgress === null && (
                    <button 
                      onClick={() => setStagedFile(null)}
                      title="Remove file"
                      className="w-8 h-8 rounded-full bg-white hover:bg-surface-container-high transition-colors flex items-center justify-center border border-outline-variant/30 text-on-surface-variant shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                {uploadProgress !== null ? (
                  <div className="w-full flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold text-on-surface-variant/80">
                      <span>Processing metrics...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    {/* White empty bar with running blue filling */}
                    <div className="w-full h-2 bg-white border border-outline-variant/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={triggerUpload}
                    className="w-full h-11 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    Confirm Statement Ingestion
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#ece9ff] text-primary flex items-center justify-center shadow-sm shadow-primary/5">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-semibold text-on-surface">Drop your bank statement here</p>
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">Supports CSV or Excel formats from major banks</p>
                </div>

                <label className="h-11 px-6 bg-surface-container hover:bg-surface-container-high text-xs font-bold rounded-full transition-all border border-outline-variant/30 flex items-center gap-2 cursor-pointer shadow-sm select-none">
                  <span className="material-symbols-outlined text-[16px]">attachment</span>
                  Choose file to upload
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50">Optimized for leading institutions</span>
            <div className="flex items-center gap-8 text-sm font-bold text-on-surface-variant/40 select-none">
              <span>HDFC</span>
              <span>ICICI</span>
              <span>SBI</span>
              <span>AXIS</span>
            </div>
          </div>
        </div>

        {/* Footer info panels */}
        <div className="max-w-7xl mx-auto w-full border-t border-outline-variant/20 pt-6 mt-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/60 rounded-2xl border border-outline-variant/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">security</span>
              <span className="text-xs font-medium text-on-surface-variant">Secure local processing</span>
            </div>
            <div className="p-4 bg-white/60 rounded-2xl border border-outline-variant/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
              <span className="text-xs font-medium text-on-surface-variant">Automated categorization</span>
            </div>
            <div className="p-4 bg-white/60 rounded-2xl border border-outline-variant/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">devices</span>
              <span className="text-xs font-medium text-on-surface-variant">Works on any device</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant/60">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Your files stay isolated in your local host environment.</span>
            </div>
            <span>© 2026 ExpenseLens Financial. Built for privacy.</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasData = !isTransactionsLoading && transactions && transactions.length > 0;

  if (!hasData && !isTransactionsLoading) {
    return renderLandingState();
  }

  // Formatting aggregates
  const income = summary?.totalIncome || 0;
  const expenses = summary?.totalExpenses || 0;
  const netSavings = summary?.netSavings || 0;
  const savingsRate = summary?.savingsRate || 0;

  return (
    <div className="flex min-h-screen bg-background font-body text-on-surface relative">
      
      {/* Toast Notification slide-over alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-[#ece9ff] rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-sm select-none animate-bounce border-l-4 border-l-primary">
          <div className="w-8 h-8 rounded-full bg-[#ece9ff] text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface">System Action</p>
            <p className="text-[10px] text-on-surface-variant/80 mt-0.5">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-on-surface-variant hover:text-on-surface ml-auto shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className={`fixed left-4 top-6 bottom-6 z-40 flex flex-col items-center py-6 gap-6 rounded-3xl border border-outline-variant/20 bg-white shadow-sm transition-all duration-300 ${
          isSidebarExpanded ? "w-64 px-6" : "w-20 px-3"
        }`}
      >
        <div className="flex items-center w-full h-12 px-2 overflow-hidden shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-10 h-10 shrink-0">
            <defs>
              <linearGradient id="logoGradSidebar" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#b4a9ff" />
                <stop offset="100%" stopColor="#7c66ff" />
              </linearGradient>
            </defs>
            <circle cx="19" cy="15" r="7.5" fill="url(#logoGradSidebar)" opacity="0.85" />
            <path d="M10 6V22H26" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isSidebarExpanded && (
            <div className="ml-4 transition-opacity duration-300">
              <p className="font-display font-semibold text-lg text-primary tracking-tight leading-none">ExpenseLens</p>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-medium mt-0.5">Wealth Clarity</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 w-full mt-4">
          <Link href="/" className="flex items-center h-12 w-full rounded-xl bg-primary-container text-primary font-semibold transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined font-fill">grid_view</span>
            </div>
            {isSidebarExpanded && <span className="text-sm whitespace-nowrap">Dashboard</span>}
          </Link>
          <a href="/wrapped" className="flex items-center h-12 w-full rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            {isSidebarExpanded && <span className="text-sm whitespace-nowrap">Monthly Wrapped</span>}
          </a>
          <Link href="/investments" className="flex items-center h-12 w-full rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined">show_chart</span>
            </div>
            {isSidebarExpanded && <span className="text-sm whitespace-nowrap">Investments</span>}
          </Link>
          <Link href="/insights" className="flex items-center h-12 w-full rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            {isSidebarExpanded && <span className="text-sm whitespace-nowrap">Insights</span>}
          </Link>
        </nav>

        {/* Profile trigger in sidebar footer */}
        <div className="mt-auto w-full flex flex-col gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center h-12 w-full rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all text-left"
          >
            <div className="w-14 flex justify-center shrink-0">
              <div className={`w-8 h-8 rounded-full ${avatars[avatarIndex].bg} text-white font-bold flex items-center justify-center text-xs shadow-sm border border-white/20`}>
                {avatars[avatarIndex].text}
              </div>
            </div>
            {isSidebarExpanded && (
              <div className="overflow-hidden transition-opacity whitespace-nowrap ml-1.5">
                <p className="text-xs font-semibold text-on-surface leading-none">{displayName}</p>
                <p className="text-[9px] text-on-surface-variant/80 mt-0.5">Settings Drawer</p>
              </div>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center h-12 w-full rounded-xl text-error hover:bg-error/10 transition-all text-left"
          >
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined">logout</span>
            </div>
            {isSidebarExpanded && <span className="text-sm whitespace-nowrap font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 pl-28 pr-6 py-6 max-w-[1280px] mx-auto min-h-screen">
        
        {/* Top Header Bar */}
        <header className="flex justify-between items-center h-16 w-full mb-6">
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search Transactions"
              className="w-full h-11 pl-12 pr-12 bg-white border-none rounded-full focus:outline-none focus:ring-1 focus:ring-primary/20 text-xs font-medium transition-all shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/30 select-none">⌘K</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-primary text-xs font-bold rounded-full hover:bg-primary-container/80 transition-all border border-primary/10 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              PDF Report
            </button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px]">notifications</button>
            <button onClick={() => setIsSettingsOpen(true)} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px]">settings</button>
            
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className={`w-9 h-9 rounded-full ${avatars[avatarIndex].bg} text-white font-bold flex items-center justify-center text-xs border border-white/25 shadow-sm cursor-pointer hover:brightness-105`}
            >
              {avatars[avatarIndex].text}
            </div>
          </div>
        </header>

        {/* Greeting block */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="font-display font-bold text-2xl text-on-surface">Good Evening, {displayName} 👋</h2>
            <p className="text-xs text-on-surface-variant/80 mt-1">You've saved ₹{netSavings.toLocaleString('en-IN')} this month. That's {savingsRate > 0 ? `${savingsRate}%` : '12%'} more than last month.</p>
          </div>
          <div className="flex p-1 bg-white rounded-full shadow-sm border border-outline-variant/30">
            <button 
              onClick={() => setSelectedRange('weekly')}
              className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${
                selectedRange === 'weekly' ? 'bg-[#ece9ff] text-primary' : 'text-on-surface-variant/80 hover:text-on-surface'
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setSelectedRange('monthly')}
              className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${
                selectedRange === 'monthly' ? 'bg-[#ece9ff] text-primary' : 'text-on-surface-variant/80 hover:text-on-surface'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main area charts & lists */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Apple Health Style Line Graph Component */}
            {transactions && (
              <WeeklyFlowChart transactions={transactions} range={selectedRange} />
            )}

            {/* Ingestion dropzone with staged upload flow inside dashboard */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`glass-card p-6 flex flex-col items-center justify-center border-2 border-dashed transition-all rounded-3xl ${
                dragActive ? "border-primary bg-primary-container/20 scale-102" : "border-outline-variant/30 hover:border-primary/50"
              }`}
            >
              {stagedFile ? (
                <div className="w-full flex flex-col gap-4 items-center">
                  <div className="flex items-center justify-between w-full p-4 bg-surface-container-low/60 rounded-2xl border border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                      <div className="text-left">
                        <p className="text-xs font-bold text-on-surface truncate max-w-xs">{stagedFile.name}</p>
                        <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{(stagedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    {uploadProgress === null && (
                      <button 
                        onClick={() => setStagedFile(null)}
                        title="Remove file"
                        className="w-8 h-8 rounded-full bg-white hover:bg-surface-container-high transition-colors flex items-center justify-center border border-outline-variant/30 text-on-surface-variant shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>

                  {uploadProgress !== null ? (
                    <div className="w-full flex flex-col gap-2 text-left">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant/80">
                        <span>Uploading transactions...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white border border-outline-variant/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={triggerUpload}
                      className="w-full h-10 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      Confirm Upload Statement
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#ece9ff] text-primary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-on-surface">Upload Statement</p>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Drag and drop your bank CSV file to parse additional logs</p>
                  </div>
                  <label className="h-9 px-4 bg-surface-container hover:bg-surface-container-high text-[10px] font-bold rounded-full transition-all border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer mt-3 shadow-sm select-none">
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            {/* Transactions Ledger */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-base text-on-surface">Transactions Ledger</h3>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {transactions?.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-3.5 hover:bg-surface-container-low/50 rounded-2xl transition-colors border border-outline-variant/10 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform text-primary border border-outline-variant/20">
                        <span className="material-symbols-outlined text-[20px]">{t.categoryIcon || 'help'}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">{t.merchantName || t.description}</p>
                        <p className="text-[10px] text-on-surface-variant/80 mt-0.5">{new Date(t.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {t.categoryName || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${t.transactionType === 'DEBIT' ? 'text-error' : 'text-secondary'}`}>
                        {t.transactionType === 'DEBIT' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[9px] text-on-surface-variant/60 mt-0.5">Balance: ₹{t.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar aggregates panel (Column 3) */}
          <div className="flex flex-col gap-6">
            
            {/* Metric Card 1: Income */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex items-center justify-between border border-outline-variant/10">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">Total Income</p>
                <h4 className="font-display font-semibold text-lg mt-1 text-on-surface">₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="material-symbols-outlined text-[#47664b] text-[24px]">trending_up</span>
            </div>

            {/* Metric Card 2: Expenses */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex items-center justify-between border border-outline-variant/10">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">Total Expenses</p>
                <h4 className="font-display font-semibold text-lg mt-1 text-on-surface">₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="material-symbols-outlined text-error text-[24px]">trending_down</span>
            </div>

            {/* Metric Card 3: Net Savings */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex items-center justify-between border border-outline-variant/10">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">Net Savings</p>
                <h4 className="font-display font-semibold text-lg mt-1 text-on-surface">₹{netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="material-symbols-outlined text-primary text-[24px] font-fill">savings</span>
            </div>

            {/* Category progress cards list */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-sm text-on-surface">Category Insights</h3>
              {isCategoriesLoading ? (
                <div className="h-[250px] bg-surface-container rounded-xl animate-pulse" />
              ) : (
                <SpendChart data={categories || []} />
              )}
            </div>

            {/* Spending DNA heuristics card */}
            {insights && insights.filter(i => i.insightType === 'SPENDING_DNA').map((dna) => (
              <div key={dna.id} className="glass-card p-6 rounded-3xl border border-outline-variant/10 flex flex-col gap-3 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70">AI Spending DNA</span>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm text-on-surface">{dna.title}</h4>
                  <p className="text-[10px] text-on-surface-variant/80 mt-1 leading-relaxed">{dna.message}</p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </main>

      {/* Settings Sliding Drawer overlay */}
      {user && (
        <SettingsDrawer 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          userEmail={user.email} 
        />
      )}

    </div>
  );
}
