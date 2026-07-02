'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';

export default function WrappedPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api.getSummary(),
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategoryBreakdowns(),
  });

  const { data: insights } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.getInsights(),
  });

  const activeInsights = insights?.filter(i => i.insightType === 'SPENDING_DNA') || [];
  const dnaMessage = activeInsights.length > 0 
    ? activeInsights[0].title 
    : 'Balanced Builder';
  const dnaDescription = activeInsights.length > 0
    ? activeInsights[0].message
    : 'You maintain healthy allocations, balancing current requirements with future goals.';

  const totalSlides = 4;
  const slideDuration = 6000; // 6 seconds per slide

  // Stories automatic timeline progress ticker
  useEffect(() => {
    setProgress(0);
    const interval = 50; 
    const step = (interval / slideDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleClose = () => {
    router.push('/');
  };

  if (isSummaryLoading || isCategoriesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-white text-[24px]">spa</span>
          </div>
          <p className="text-sm font-semibold tracking-wider text-white/40 animate-pulse">COMPILING YOUR WRAPPED...</p>
        </div>
      </div>
    );
  }

  const inflow = summary?.totalIncome || 0;
  const outflow = summary?.totalExpenses || 0;
  const rate = summary?.savingsRate || 0;
  const topCategory = categories && categories.length > 0 ? categories[0] : null;

  // Slide Animation Transitions
  const slideVariants = {
    initial: { opacity: 0, scale: 0.95, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.98, y: -15, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0c] text-white font-body select-none relative overflow-hidden px-4">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Stories progress bars header */}
      <div className="w-full max-w-md mx-auto pt-6 flex flex-col gap-4 z-50">
        <div className="flex gap-1.5 w-full">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ 
                  width: idx === currentSlide ? `${progress}%` : idx < currentSlide ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">spa</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">SpendLens Wrapped</span>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {/* Main Slide view card content */}
      <div className="flex-1 flex items-center justify-center z-40 max-w-md w-full mx-auto relative">
        
        {/* Left & Right navigation tap zones */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 cursor-w-resize z-50" onClick={handlePrev} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 cursor-e-resize z-50" onClick={handleNext} />

        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <motion.div 
              key="slide0"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center gap-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-bounce">
                <span className="material-symbols-outlined text-white text-[42px]">spa</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-4xl leading-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent pb-2">
                  Your Month<br />In Focus
                </h1>
                <p className="text-sm text-white/60 mt-2">Let's look back at your spending behaviors and cash velocity for this month.</p>
              </div>
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div 
              key="slide1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-primary">Monthly Cash Summary</span>
                <h2 className="font-display font-semibold text-3xl">The Cash Pipeline</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">Total Inflow</p>
                    <p className="text-lg font-semibold mt-1">₹{inflow.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#47664b] text-[28px]">trending_up</span>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">Total Outflow</p>
                    <p className="text-lg font-semibold mt-1">₹{outflow.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="material-symbols-outlined text-error text-[28px]">trending_down</span>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">Net Savings Rate</p>
                    <p className="text-xl font-bold mt-1 text-secondary">{rate}%</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[28px] font-fill">savings</span>
                </div>
              </div>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div 
              key="slide2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-secondary">Expense Allocation</span>
                <h2 className="font-display font-semibold text-3xl">Top Spending Category</h2>
              </div>
              {topCategory ? (
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-semibold shadow-lg" style={{ backgroundColor: `${topCategory.color}25`, color: topCategory.color }}>
                    <span className="material-symbols-outlined text-[32px]">{topCategory.icon}</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-display font-bold text-2xl">{topCategory.categoryName}</h3>
                    <p className="text-white/60 text-sm mt-1">You spent a total of <span className="font-semibold text-white">₹{topCategory.amount.toLocaleString('en-IN')}</span> here.</p>
                  </div>
                  <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs">
                    This single category represents <span className="font-bold text-secondary text-sm">{topCategory.percentage.toFixed(0)}%</span> of your entire month's outflow budget.
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-sm text-white/40">
                  No category records. Ingest statement logs first.
                </div>
              )}
            </motion.div>
          )}

          {currentSlide === 3 && (
            <motion.div 
              key="slide3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-accent">AI Heuristics Profiler</span>
                <h2 className="font-display font-semibold text-3xl">Your Spending DNA</h2>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-white/15 flex flex-col gap-4 text-center items-center">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[26px]">psychology</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-secondary uppercase tracking-wide">{dnaMessage}</h3>
                  <p className="text-xs text-white/80 mt-2 leading-relaxed">{dnaDescription}</p>
                </div>
              </div>
              <div className="flex justify-center mt-2">
                <button onClick={handleClose} className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md">
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Navigation footer layout */}
      <div className="pb-8 text-center text-[10px] font-bold text-white/40 tracking-widest z-50">
        TAP LEFT / RIGHT TO NAVIGATE • SLIDE {currentSlide + 1} OF {totalSlides}
      </div>

    </div>
  );
}
