'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-on-surface-variant/80">Last Updated: July 2, 2026</p>

        <div className="glass-card p-8 rounded-3xl border border-outline-variant/30 flex flex-col gap-6 shadow-sm bg-white">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">1. Local Host Environment</h2>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              ExpenseLens is engineered as a privacy-first utility. Your uploaded bank statement CSV files are parsed entirely in your local host environment. Your financial credentials and transaction logs are stored inside an isolated SQL database and are never dispatched to external third-party analysis services.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">2. Data Security & Storage</h2>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Account authorization is protected using BCrypt password hashing and HTTP-only JWT cookies. Session states are isolated strictly by user account contexts in our sandbox server to prevent unauthorized database cross-reads.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">3. Automated Parser Logic</h2>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Our bank parser logic reads lines matching statements from supported banks (HDFC, ICICI, SBI, Axis). The data extraction operates completely within memory and deletes file streams immediately upon completing serialization.
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
