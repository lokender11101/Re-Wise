'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Database, Layers, HelpCircle, FileText } from 'lucide-react';
import { Button } from './Button';
import { ReWiseMark } from '@/components/brand/ReWiseMark';
import type { StreamProgressState, GenerationStage } from '@/hooks/useGeneration';

export interface StreamingProgressIndicatorProps {
  progress: StreamProgressState;
  onCancel?: () => void;
}

export const StreamingProgressIndicator: React.FC<StreamingProgressIndicatorProps> = ({
  progress,
  onCancel,
}) => {
  const stages: { id: GenerationStage; label: string; icon: React.ReactNode }[] = [
    { id: 'analyzing', label: 'Analyzing material', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'structuring', label: 'Structuring concept summary', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'flashcards', label: 'Crafting 3D recall flashcards', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'quiz', label: 'Formulating quiz questions', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'validating', label: 'Zod schema validation', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'finalizing', label: 'Session ready', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === progress.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 md:p-8 rounded-2xl bg-[#0D0D0D] border border-[#252525] space-y-6 shadow-2xl max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative p-1.5 rounded-xl bg-[#141414] border border-[#252525] text-white flex items-center justify-center">
            <ReWiseMark size={22} isLoading animated glow />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
                DeepSeek Flash • Streaming Engine
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F5F5]">
              Streaming Structured Study Blocks
            </h3>
          </div>
        </div>

        {onCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            leftIcon={<X className="w-3.5 h-3.5" />}
            className="text-xs text-[#737373] hover:text-[#FCA5A5]"
          >
            Cancel Stream
          </Button>
        )}
      </div>

      {/* Current Stage Message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A3A3A3] font-medium flex items-center gap-2">
            <ReWiseMark size={14} animated interactive={false} />
            {progress.stageMessage || 'Synthesizing learning modules...'}
          </span>
          <span className="text-[11px] font-mono text-[#737373]">
            {progress.bytesReceived > 0
              ? `${(progress.bytesReceived / 1024).toFixed(1)} KB received`
              : 'Streaming...'}
          </span>
        </div>

        {/* Progress Track */}
        <div className="h-1.5 w-full bg-[#181818] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: '8%' }}
            animate={{
              width: `${Math.max(
                ((currentStageIndex + 1) / stages.length) * 100,
                15
              )}%`,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stage Steps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {stages.map((stage, idx) => {
          const isComplete = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                isCurrent
                  ? 'bg-[#181818] border-[#444444] text-white font-medium shadow-md'
                  : isComplete
                  ? 'bg-[#101010] border-[#1F1F1F] text-[#A3A3A3]'
                  : 'bg-[#090909] border-[#181818] text-[#525252] opacity-60'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs ${
                  isCurrent
                    ? 'bg-white text-black font-semibold'
                    : isComplete
                    ? 'bg-[#222222] text-[#E5E5E5]'
                    : 'bg-[#141414] text-[#555555]'
                }`}
              >
                {isComplete ? <CheckCircle2 className="w-3 h-3 text-[#A3A3A3]" /> : stage.icon}
              </div>
              <span className="truncate">{stage.label}</span>
            </div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <p className="text-[11px] text-[#525252] text-center pt-1 border-t border-[#1C1C1C]">
        Partial tokens are buffered securely in memory and validated against strict Zod contracts prior to session commit.
      </p>
    </motion.div>
  );
};
