'use client';

import React from 'react';
import { CategoryBreakdown } from '@/services/api';

interface SpendChartProps {
  data: CategoryBreakdown[];
}

export default function SpendChart({ data }: SpendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-outline font-medium">
        No expense category allocations recorded yet.
      </div>
    );
  }

  const activeData = data.filter(item => item.amount > 0);
  const total = activeData.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-outline font-medium">
        No expense category allocations recorded yet.
      </div>
    );
  }

  // Dynamic icon selector based on parsed category name
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('food') || n.includes('dining') || n.includes('zomato') || n.includes('swiggy') || n.includes('restaurant')) return 'restaurant';
    if (n.includes('shopping') || n.includes('amazon') || n.includes('flipkart') || n.includes('store') || n.includes('mall')) return 'shopping_bag';
    if (n.includes('travel') || n.includes('flight') || n.includes('cab') || n.includes('fuel') || n.includes('petrol') || n.includes('hp')) return 'flight';
    if (n.includes('health') || n.includes('medical') || n.includes('pharmacy') || n.includes('fitness')) return 'fitness_center';
    if (n.includes('transfer') || n.includes('own') || n.includes('self')) return 'swap_horiz';
    return 'local_mall';
  };

  return (
    <div className="flex flex-col gap-4">
      {activeData.map((item, idx) => {
        const pct = (item.amount / total) * 100;
        const icon = getIcon(item.categoryName);
        
        return (
          <div key={idx} className="glass-card p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-3 bg-white shadow-sm hover:translate-y-[-2px] transition-all duration-200">
            
            {/* Header info row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {/* Styled icon bullet container matching the category color */}
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-outline-variant/10 shadow-sm"
                  style={{ backgroundColor: `${item.color || '#6d5ef9'}15`, color: item.color || '#6d5ef9' }}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide">{item.categoryName}</h4>
                  <p className="text-sm font-extrabold text-on-surface mt-0.5">₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              
              {/* Soft purple indicator chip */}
              <span className="text-[10px] font-bold text-primary bg-[#ece9ff] px-2.5 py-0.5 rounded-full select-none">
                {pct.toFixed(0)}%
              </span>
            </div>
            
            {/* Progress line scale container */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="w-full bg-[#eef1f6] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    backgroundColor: item.color || '#6d5ef9',
                    width: `${pct}%`
                  }} 
                />
              </div>
              <div className="flex justify-between text-[9px] text-on-surface-variant/70 font-semibold mt-0.5">
                <span>{pct.toFixed(0)}% of total spends</span>
                <span className="text-on-surface-variant/50">Limit: ₹50,000</span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
