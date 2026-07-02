'use client';

import React from 'react';
import { TransactionDto } from '@/services/api';

interface WeeklyFlowChartProps {
  transactions: TransactionDto[];
  range: 'weekly' | 'monthly';
}

export default function WeeklyFlowChart({ transactions, range }: WeeklyFlowChartProps) {
  // Find the latest transaction date to anchor the timeline (or fallback to current date)
  let anchorDate = new Date();
  if (transactions && transactions.length > 0) {
    const timeStamps = transactions.map(t => new Date(t.transactionDate).getTime());
    anchorDate = new Date(Math.max(...timeStamps));
  }

  const numDays = range === 'weekly' ? 7 : 30;
  const dateLabels: string[] = [];
  const dateSubLabels: string[] = [];
  const dailyTotals: number[] = [];

  // Generate range days backwards
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - i);
    
    // Format YYYY-MM-DD key matching backend TransactionDto.transactionDate
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;

    // Compute display labels
    if (range === 'weekly') {
      dateLabels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
      dateSubLabels.push(d.getDate().toString());
    } else {
      // For monthly, show date tags spaced every 5 intervals to prevent overlap
      if (i % 6 === 0) {
        dateLabels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
      } else {
        dateLabels.push('');
      }
      dateSubLabels.push('');
    }

    // Sum active debits
    let sum = 0;
    if (transactions) {
      transactions.forEach(t => {
        if (t.transactionDate === dateKey && t.transactionType === 'DEBIT' && !t.isInternalTransfer) {
          sum += t.amount;
        }
      });
    }
    dailyTotals.push(sum);
  }

  const maxSpend = Math.max(...dailyTotals, 1000);

  // Compute SVG coordinates (width=400, height=100)
  const paddingX = 20;
  const chartWidth = 360;
  const points = dailyTotals.map((val, idx) => {
    const x = paddingX + (idx * (chartWidth / (numDays - 1)));
    const y = 80 - (val / maxSpend) * 60; // range 20-80 to avoid clips
    return { x, y, value: val };
  });

  // Curved spline bezier line calculation
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  const areaD = pathD ? `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z` : '';

  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col min-h-[340px] shadow-sm select-none">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display font-bold text-base text-on-surface">
            {range === 'weekly' ? 'Weekly Activity' : 'Monthly Activity'}
          </h3>
          <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60 mt-0.5">
            {range === 'weekly' ? 'Daily Spend Flow (Last 7 Days)' : 'Spend Velocity Spline (Last 30 Days)'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant/80">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Spends</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-outline-variant" />
            <span>Outflow limit</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col justify-between mt-4">
        {/* SVG Plot */}
        <div className="w-full h-40 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6d5ef9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6d5ef9" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Guidelines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(109, 94, 249, 0.05)" strokeDasharray="3" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(109, 94, 249, 0.05)" strokeDasharray="3" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(109, 94, 249, 0.05)" strokeDasharray="3" />

            {/* Area shadow */}
            {areaD && <path d={areaD} fill="url(#purpleGradient)" />}

            {/* Spline curve */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#6d5ef9"
                strokeLinecap="round"
                strokeWidth="2.5"
                className="spline-path"
                style={{ filter: 'drop-shadow(0px 3px 6px rgba(109, 94, 249, 0.2))' }}
              />
            )}

            {/* Nodes (Draw all points for weekly, and spaced points for monthly to keep clean) */}
            {points.map((pt, idx) => {
              const shouldDrawNode = range === 'weekly' || idx % 2 === 0;
              if (!shouldDrawNode) return null;
              return (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#6d5ef9"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  title={`₹${pt.value}`}
                  className="chart-dot cursor-pointer"
                />
              );
            })}
          </svg>
        </div>

        {/* Labels timeline */}
        <div className="flex justify-between px-1 text-[10px] text-on-surface-variant font-bold mt-6 border-t border-outline-variant/20 pt-3">
          {dateLabels.map((label, idx) => {
            const hasLabel = label !== '';
            return (
              <div key={idx} className="flex flex-col items-center gap-0.5 flex-1 text-center">
                <span className={hasLabel ? 'text-on-surface' : 'text-transparent'}>
                  {hasLabel ? label : '.'}
                </span>
                {range === 'weekly' && (
                  <span className="text-[9px] text-on-surface-variant/60 font-medium">
                    ₹{dailyTotals[idx] > 0 ? dailyTotals[idx].toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
