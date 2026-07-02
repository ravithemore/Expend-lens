'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.register(email, password);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc] font-body text-on-surface px-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-outline-variant/30 flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[22px]">spa</span>
          </div>
          <h2 className="font-display font-semibold text-2xl mt-3 text-on-surface tracking-tight">Create Account</h2>
          <p className="text-xs text-on-surface-variant/70">Join SpendLens to securely build financial clarity</p>
        </div>

        {/* Error notification message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-medium">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant/80">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. dev@spendlens.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 bg-surface-container border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant/80">Password</label>
            <input
              type="password"
              required
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 bg-surface-container border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant/80">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-4 bg-surface-container border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In redirection link */}
        <div className="text-center text-xs text-on-surface-variant/80 border-t border-outline-variant/20 pt-4">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
