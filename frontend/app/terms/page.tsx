'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8f9fc] font-body text-on-surface p-6">
      {/* Header */}
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-6 h-6 text-white shrink-0">
              <circle cx="19" cy="15" r="7.5" fill="#ffffff" opacity="0.85" />
              <path d="M10 6V22H26" stroke="#7c66ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-on-surface tracking-tight">ExpenseLens</span>
        </Link>
        <Link href="/" className="text-xs font-bold text-primary hover:underline">
          Back to App
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-6 py-6">
        <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Terms of Service</h1>
        <p className="text-xs text-on-surface-variant/80">Last Updated: July 2, 2026</p>

        <div className="glass-card p-8 rounded-3xl border border-outline-variant/30 flex flex-col gap-6 shadow-sm bg-white">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">1. License & Usage</h2>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              ExpenseLens grants you a personal, non-transferable license to run this financial management app in your development or production sandbox. The tool is provided for individual categorization intelligence.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">2. Account Responsibility</h2>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              You are responsible for keeping your login credentials confidential. ExpenseLens does not offer account recovery tools since user databases run inside local sandbox hosts.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">3. Limitations of Liability</h2>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              All financial analytics, heuristics, spending DNA indicators, and audit warnings are computed for simulation and organizational utility. They do not constitute certified financial advisory. ExpenseLens is provided "as is" without warranty.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full border-t border-outline-variant/20 pt-6 mt-8 flex justify-between items-center text-[10px] font-semibold text-on-surface-variant/60">
        <span>© 2026 ExpenseLens Financial. All rights reserved.</span>
        <span>Built for local privacy.</span>
      </footer>
    </div>
  );
}
