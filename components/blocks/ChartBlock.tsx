'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Info, Table } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ChartBlock as ChartBlockType } from '@/types/study';

export interface ChartBlockProps {
  block: ChartBlockType;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ block }) => {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  const data = block.data;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card id="chart-block" className="space-y-6 animate-fade-in border-[#1C2824] bg-[#101614] p-6 sm:p-8 md:p-10 rounded-3xl scroll-mt-24 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C2824] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1C2623] border border-[#283832] text-[#A8CDBB]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#7C9E8E] uppercase">
              Quantitative Analysis
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#E8F2EC]">
              {block.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm" className="capitalize bg-[#1A2320] text-[#A8CDBB] border-[#283832]">
            {block.chartType} Comparison
          </Badge>
          <button
            type="button"
            onClick={() => setShowDataTable((prev) => !prev)}
            className="p-1.5 rounded-lg text-xs text-[#7C9E8E] hover:text-[#E8F2EC] bg-[#1A2320] hover:bg-[#202C28] border border-[#283832] transition-colors"
            title="Toggle data table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accessible Summary Callout */}
      {block.summary && (
        <div className="p-4 rounded-xl bg-[#0E1312] border border-[#1F2926] text-xs text-[#A6C2B4] leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#A8CDBB] shrink-0 mt-0.5" />
          <p className="flex-1">
            <strong className="text-[#E8F2EC] font-medium">Key Insight: </strong>
            {block.summary}
          </p>
        </div>
      )}

      {/* Responsive Bar Visualization */}
      {!showDataTable ? (
        <div className="space-y-3.5 pt-1">
          {block.yAxisLabel && (
            <div className="text-[11px] font-mono text-[#7C9E8E] uppercase tracking-wider">
              Metric: {block.yAxisLabel}
            </div>
          )}

          <div className="space-y-3">
            {data.map((item, idx) => {
              const percentage = Math.round((item.value / maxValue) * 100);
              const isActive = activeItem === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveItem(idx)}
                  onMouseLeave={() => setActiveItem(null)}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#18211E] border-[#364942]'
                      : 'bg-[#101514] border-[#1D2623] hover:border-[#2C3B36]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#E8F2EC] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A8CDBB]" />
                      {item.label}
                    </span>
                    <span className="font-mono text-[#A8CDBB] font-semibold">
                      {item.value} {item.unit || ''}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="h-2.5 w-full bg-[#0B0E0D] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isActive ? 'bg-white' : 'bg-[#A8CDBB]'
                      }`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>

                  {/* Optional Description / Context */}
                  {item.description && (
                    <p className="text-[11px] text-[#7C9E8E] mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {block.xAxisLabel && (
            <div className="text-right text-[11px] font-mono text-[#52635B]">
              {block.xAxisLabel}
            </div>
          )}
        </div>
      ) : (
        /* Accessible Raw Data Table */
        <div className="overflow-x-auto rounded-xl border border-[#1F2926]">
          <table className="w-full text-left text-xs text-[#D4E2DA]">
            <thead className="bg-[#0E1312] border-b border-[#1F2926] text-[#7C9E8E] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Variable / Category</th>
                <th className="p-3 font-mono">Value</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] bg-[#0A0A0A]">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3 font-medium text-white">{item.label}</td>
                  <td className="p-3 font-mono text-[#F5F5F5]">{item.value}</td>
                  <td className="p-3 text-[#737373]">{item.unit || '—'}</td>
                  <td className="p-3 text-[#A3A3A3] text-xs">{item.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
