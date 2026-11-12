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
    <Card className="space-y-6 animate-fade-in border-[#252525] bg-[#101010] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
              Quantitative Analysis
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F5F5]">
              {block.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm" className="capitalize">
            {block.chartType} Comparison
          </Badge>
          <button
            type="button"
            onClick={() => setShowDataTable((prev) => !prev)}
            className="p-1.5 rounded-lg text-xs text-[#737373] hover:text-[#F5F5F5] hover:bg-[#181818] border border-[#252525] transition-colors"
            title="Toggle data table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accessible Summary Callout */}
      {block.summary && (
        <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] text-xs text-[#A3A3A3] leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <p className="flex-1">
            <strong className="text-white font-medium">Key Insight: </strong>
            {block.summary}
          </p>
        </div>
      )}

      {/* Responsive Bar Visualization */}
      {!showDataTable ? (
        <div className="space-y-3.5 pt-1">
          {block.yAxisLabel && (
            <div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
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
                      ? 'bg-[#181818] border-[#444444]'
                      : 'bg-[#121212] border-[#1F1F1F] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#F5F5F5] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {item.label}
                    </span>
                    <span className="font-mono text-[#D4D4D4] font-semibold">
                      {item.value} {item.unit || ''}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="h-2.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isActive ? 'bg-white' : 'bg-[#D4D4D4]'
                      }`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>

                  {/* Optional Description / Context */}
                  {item.description && (
                    <p className="text-[11px] text-[#737373] mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {block.xAxisLabel && (
            <div className="text-right text-[11px] font-mono text-[#525252]">
              {block.xAxisLabel}
            </div>
          )}
        </div>
      ) : (
        /* Accessible Raw Data Table */
        <div className="overflow-x-auto rounded-xl border border-[#222222]">
          <table className="w-full text-left text-xs text-[#D4D4D4]">
            <thead className="bg-[#141414] border-b border-[#222222] text-[#737373] uppercase tracking-wider font-semibold">
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
