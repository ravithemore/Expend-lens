'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import SettingsDrawer from '@/components/settings-drawer';

export default function InsightsPage() {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Ravi');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, error: userError } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me(),
    enabled: mounted,
    retry: false,
  });

  useEffect(() => {
    if (mounted && userError) {
      router.push('/login');
    }
  }, [userError, mounted, router]);

  // Load profile name and avatar from local storage or fallback to email prefix
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('spendLens_profileName');
      if (savedName) {
        setDisplayName(savedName);
      } else if (user?.email) {
        const namePart = user.email.split('@')[0];
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setDisplayName(capitalized);
      }

      const savedAvatar = localStorage.getItem('spendLens_avatarIndex');
      if (savedAvatar) setAvatarIndex(parseInt(savedAvatar, 10));
    }
  }, [user]);

  const { data: insights, isLoading: isInsightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.getInsights(),
    enabled: mounted,
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center font-body text-on-surface">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant/80 mt-4">Loading Insights...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
      router.refresh();
    } catch (e) {
      alert('Logout failed');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'RV';
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  };

  const initials = getInitials(displayName);
  const avatars = [
    { bg: 'bg-[#6d5ef9]', text: initials },
    { bg: 'bg-[#4b6a4f]', text: initials },
    { bg: 'bg-[#ba1a1a]', text: initials },
    { bg: 'bg-[#007fac]', text: initials }
  ];

  return (
    <div className="flex min-h-screen bg-background font-body text-on-surface">
      
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
              <linearGradient id="logoGradSidebarInsights" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#b4a9ff" />
                <stop offset="100%" stopColor="#7c66ff" />
              </linearGradient>
            </defs>
            <circle cx="19" cy="15" r="7.5" fill="url(#logoGradSidebarInsights)" opacity="0.85" />
            <path d="M10 6V22H26" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {isSidebarExpanded && (
            <div className="ml-4 transition-opacity duration-300">
              <p className="font-display font-semibold text-lg text-primary tracking-tight leading-none">ExpenseLens</p>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-medium mt-0.5">Wealth Clarity</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 w-full mt-4">
          <Link href="/" className="flex items-center h-12 w-full rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined">grid_view</span>
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
          <Link href="/insights" className="flex items-center h-12 w-full rounded-xl bg-primary-container text-primary font-semibold transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined font-fill">lightbulb</span>
            </div>
            {isSidebarExpanded && <span className="text-sm whitespace-nowrap">Insights</span>}
          </Link>
        </nav>

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
        
        {/* Header */}
        <header className="flex justify-between items-center h-16 w-full mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-on-surface">AI Insights Center</h2>
            <p className="text-xs text-on-surface-variant/80 mt-1">Analytical findings and spending genetics calculated from your statement logs.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px]">settings</button>
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className={`w-9 h-9 rounded-full ${avatars[avatarIndex].bg} text-white font-bold flex items-center justify-center text-xs border border-white/25 shadow-sm cursor-pointer`}
            >
              {avatars[avatarIndex].text}
            </div>
          </div>
        </header>

        {/* Insights Bento Grid */}
        {isInsightsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-44 bg-white/70 rounded-3xl animate-pulse" />
            <div className="h-44 bg-white/70 rounded-3xl animate-pulse" />
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((ins) => {
              const isDNA = ins.insightType === 'SPENDING_DNA';
              const isWarning = ins.insightType === 'ANOMALY';
              return (
                <div key={ins.id} className="glass-card p-8 rounded-3xl border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden shadow-sm bg-white">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${isDNA ? 'bg-primary/5' : isWarning ? 'bg-error/5' : 'bg-secondary/5'} rounded-full blur-xl pointer-events-none`} />
                  
                  <div className="flex items-center gap-2.5">
                    <span className={`material-symbols-outlined text-[20px] ${isDNA ? 'text-primary' : isWarning ? 'text-error' : 'text-secondary'}`}>
                      {isDNA ? 'psychology' : isWarning ? 'warning' : 'tips_and_updates'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDNA ? 'text-primary' : isWarning ? 'text-error' : 'text-secondary'}`}>
                      {ins.insightType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-on-surface">{ins.title}</h3>
                    <p className="text-xs text-on-surface-variant/80 mt-2 leading-relaxed">{ins.message}</p>
                  </div>

                  <div className="mt-2 text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wide">
                    Computed via Heuristics Engine
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center rounded-3xl bg-white border border-outline-variant/30 flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-outline text-[40px]">lightbulb</span>
            <div>
              <p className="text-sm font-bold">No insights detected yet</p>
              <p className="text-xs text-on-surface-variant/80 mt-1 max-w-sm">Please upload a bank statement CSV file to run automated pattern audits.</p>
            </div>
          </div>
        )}

      </main>

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
