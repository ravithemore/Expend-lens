'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import SettingsDrawer from '@/components/settings-drawer';

export default function InvestmentsPage() {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Ravi');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('spendLens_profileName');
      if (savedName) setDisplayName(savedName);

      const savedAvatar = localStorage.getItem('spendLens_avatarIndex');
      if (savedAvatar) setAvatarIndex(parseInt(savedAvatar, 10));
    }
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center font-body text-on-surface">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant/80 mt-4">Loading Investments...</p>
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

  const avatars = [
    { bg: 'bg-[#6d5ef9]', text: 'RV' },
    { bg: 'bg-[#4b6a4f]', text: 'RV' },
    { bg: 'bg-[#ba1a1a]', text: 'RV' },
    { bg: 'bg-[#007fac]', text: 'RV' }
  ];

  // SVG Spline coordinates representing portfolio growth over 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = [45000, 48000, 52000, 50000, 58000, 64200];
  const maxVal = Math.max(...values);
  const points = values.map((v, i) => ({
    x: 20 + i * (360 / 5),
    y: 85 - (v / maxVal) * 70
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }
  const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

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
              <linearGradient id="logoGradSidebarInvest" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#b4a9ff" />
                <stop offset="100%" stopColor="#7c66ff" />
              </linearGradient>
            </defs>
            <circle cx="19" cy="15" r="7.5" fill="url(#logoGradSidebarInvest)" opacity="0.85" />
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
          <Link href="/investments" className="flex items-center h-12 w-full rounded-xl bg-primary-container text-primary font-semibold transition-all">
            <div className="w-14 flex justify-center shrink-0">
              <span className="material-symbols-outlined font-fill">show_chart</span>
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
            <h2 className="font-display font-bold text-2xl text-on-surface">Investments Dashboard</h2>
            <p className="text-xs text-on-surface-variant/80 mt-1">Track mutual funds, assets, and fixed deposits.</p>
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

        {/* Investment Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Portfolio Growth */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="glass-card p-6 rounded-3xl flex flex-col min-h-[340px] shadow-sm bg-white">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-semibold text-base text-on-surface">Portfolio Value</h3>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60 mt-0.5">Asset Growth (6 Months)</p>
                </div>
                <span className="text-xs font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +14.8% (CAGR)
                </span>
              </div>

              <div className="flex-1 relative flex flex-col justify-between mt-4">
                <div className="w-full h-40 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="greenGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4b6a4f" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4b6a4f" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(75, 106, 79, 0.05)" strokeDasharray="3" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(75, 106, 79, 0.05)" strokeDasharray="3" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(75, 106, 79, 0.05)" strokeDasharray="3" />

                    <path d={areaD} fill="url(#greenGradient)" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#4b6a4f"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />

                    {points.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#4b6a4f"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="chart-dot cursor-pointer"
                      />
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between px-1 text-[10px] text-on-surface-variant font-bold mt-6 border-t border-outline-variant/20 pt-3">
                  {months.map((month, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 text-center">
                      <span className="text-on-surface">{month}</span>
                      <span className="text-[9px] text-on-surface-variant/60 font-medium">₹{values[idx].toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col gap-4 bg-white">
              <h3 className="font-display font-semibold text-base text-on-surface">Active Portfolio Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant/70 uppercase text-[9px] font-bold tracking-wider">
                      <th className="pb-3">Asset Description</th>
                      <th className="pb-3">Invested Value</th>
                      <th className="pb-3">Current Value</th>
                      <th className="pb-3 text-right">Returns</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface font-medium">
                    <tr>
                      <td className="py-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                        SBI Nifty 50 Index Fund
                      </td>
                      <td className="py-3">₹20,000</td>
                      <td className="py-3">₹24,500</td>
                      <td className="py-3 text-right text-secondary">+22.5%</td>
                    </tr>
                    <tr>
                      <td className="py-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
                        Parag Parikh Flexi Cap Fund
                      </td>
                      <td className="py-3">₹15,000</td>
                      <td className="py-3">₹18,200</td>
                      <td className="py-3 text-right text-secondary">+21.3%</td>
                    </tr>
                    <tr>
                      <td className="py-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">savings</span>
                        HDFC Tax Saver ELSS
                      </td>
                      <td className="py-3">₹10,000</td>
                      <td className="py-3">₹11,500</td>
                      <td className="py-3 text-right text-secondary">+15.0%</td>
                    </tr>
                    <tr>
                      <td className="py-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                        Axis Fixed Deposit
                      </td>
                      <td className="py-3">₹10,000</td>
                      <td className="py-3">₹10,000</td>
                      <td className="py-3 text-right text-on-surface-variant/80">0.0% (Matured)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right sidebar stats panel */}
          <div className="flex flex-col gap-6">
            
            <div className="glass-card p-6 rounded-3xl shadow-sm flex items-center justify-between border border-outline-variant/10 bg-white">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">Portfolio Valuation</p>
                <h4 className="font-display font-bold text-lg mt-1 text-on-surface">₹64,200.00</h4>
              </div>
              <span className="material-symbols-outlined text-[#47664b] text-[24px]">account_balance_wallet</span>
            </div>

            <div className="glass-card p-6 rounded-3xl shadow-sm flex items-center justify-between border border-outline-variant/10 bg-white">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">SIP Active Commitments</p>
                <h4 className="font-display font-bold text-lg mt-1 text-on-surface">₹5,000.00 <span className="text-[10px] text-on-surface-variant/60 font-semibold">/ month</span></h4>
              </div>
              <span className="material-symbols-outlined text-primary text-[24px]">published_with_changes</span>
            </div>

            {/* Asset Allocation Donut mockup */}
            <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col gap-4 bg-white">
              <h3 className="font-display font-semibold text-xs text-on-surface">Asset Allocation</h3>
              <div className="flex items-center gap-6 py-2">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" fill="transparent" stroke="#eef1f6" strokeWidth="8" />
                    <circle cx="48" cy="48" r="38" fill="transparent" stroke="#6d5ef9" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="80" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">66%</div>
                </div>
                <div className="flex-1 flex flex-col gap-2 text-[10px] font-semibold text-on-surface-variant/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Mutual Funds (66%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#4b6a4f]" />
                    <span>Fixed Deposits (18%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ffb4ab]" />
                    <span>Gold & Stocks (16%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
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
