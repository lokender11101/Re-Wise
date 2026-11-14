'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Brain, Sparkles, Layers, Target, CheckCircle2, RotateCw } from 'lucide-react';
import { ReWiseMark } from '@/components/brand/ReWiseMark';

export const Hero3DComposition: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] flex items-center justify-center select-none perspective-1200 overflow-visible"
      aria-hidden="true"
    >
      {/* Background Ambient Aura */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-neutral-800/20 via-neutral-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Orbital Ring Geometry */}
      <svg
        className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] text-neutral-800/40 pointer-events-none"
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 6"
          className="opacity-40"
        />
      </svg>

      {/* Master 3D Tilted Scene */}
      <motion.div
        animate={{
          rotateY: shouldReduceMotion ? 0 : mousePos.x * 20,
          rotateX: shouldReduceMotion ? 0 : -mousePos.y * 20,
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="relative w-[300px] sm:w-[350px] h-[320px] transform-style-3d"
      >
        {/* Layer 1: Backing Stacked Architectural Page */}
        <div
          className="absolute inset-x-4 top-2 h-[220px] rounded-2xl bg-[#0A0A0A] border border-[#222222] shadow-2xl opacity-60"
          style={{
            transform: 'translateZ(-40px) rotate(-6deg)',
          }}
        >
          <div className="p-4 space-y-2 opacity-40">
            <div className="w-16 h-2 rounded bg-neutral-700" />
            <div className="w-full h-1.5 rounded bg-neutral-800" />
            <div className="w-4/5 h-1.5 rounded bg-neutral-800" />
          </div>
        </div>

        {/* Layer 2: Main Floating 3D Flashcard */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#181818] via-[#101010] to-[#0A0A0A] border border-[#333333] p-5 sm:p-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9)] flex flex-col justify-between"
          style={{
            transform: 'translateZ(20px) rotate(2deg)',
          }}
        >
          {/* Card Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C8ADD9]" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A3A3A3]">
                Active Recall • Card 01
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F1F1F] text-[#D4D4D4] border border-[#2E2E2E]">
              Advanced
            </span>
          </div>

          {/* Central Question */}
          <div className="space-y-2 py-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1A1A] text-[9px] uppercase tracking-widest text-[#9E80B0] font-medium border border-[#2B2333]">
              <Sparkles className="w-2.5 h-2.5" /> Concept Mastery
            </div>
            <p className="text-sm sm:text-base font-medium text-[#F5F5F5] leading-snug">
              How does active retrieval practice consolidate synaptic connections over passive review?
            </p>
          </div>

          {/* Bottom Flip Bar */}
          <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[11px] text-[#737373]">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-[#A3A3A3]" /> Press Space to flip
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-medium">94% Retention</span>
          </div>
        </motion.div>

        {/* Layer 3: Floating Sub-Card 1 (Quiz Rationale Badge) */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0], x: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-6 -left-8 sm:-left-12 p-3.5 rounded-xl bg-[#120E0E] border border-[#331C1C] shadow-2xl flex items-center gap-3 w-56 sm:w-64"
          style={{
            transform: 'translateZ(50px)',
          }}
        >
          <div className="p-2 rounded-lg bg-[#2A1515] border border-[#482020] text-[#E0AAAA] shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase font-semibold text-[#B07B7B]">Quiz Feedback</div>
            <div className="text-[11px] font-medium text-[#F5F5F5] truncate">
              Option B confirmed correct (+100%)
            </div>
          </div>
        </motion.div>

        {/* Layer 4: Floating Sub-Card 2 (Concept Intelligence Badge) */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -top-6 -right-6 sm:-right-10 p-3 rounded-xl bg-[#0F1412] border border-[#1E3328] shadow-2xl flex items-center gap-2.5"
          style={{
            transform: 'translateZ(60px)',
          }}
        >
          <div className="p-1.5 rounded-lg bg-[#182920] border border-[#2B4B3A] text-[#A7D8B5]">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[9px] uppercase font-semibold text-[#7DAA8E]">Concept Analytics</div>
            <div className="text-[11px] font-medium text-[#F5F5F5] font-mono">FCFS vs RR: Mastered</div>
          </div>
        </motion.div>

        {/* Layer 5: Floating ReWise Emblem Orb */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 p-2 rounded-2xl bg-[#050505] border border-[#2E2E2E] shadow-2xl"
          style={{
            transform: 'translateZ(70px)',
          }}
        >
          <ReWiseMark size={28} interactive glow animated />
        </div>
      </motion.div>
    </div>
  );
};
