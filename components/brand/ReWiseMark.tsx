'use client';

import React, { useState, useId, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type ReWiseMarkSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ReWiseMarkProps {
  size?: ReWiseMarkSize;
  animated?: boolean;
  interactive?: boolean;
  className?: string;
  glow?: boolean;
  isLoading?: boolean;
  priority?: boolean;
}

const sizeMap: Record<'sm' | 'md' | 'lg' | 'xl', { px: number; containerClass: string }> = {
  sm: { px: 24, containerClass: 'w-6 h-6' },
  md: { px: 32, containerClass: 'w-8 h-8' },
  lg: { px: 48, containerClass: 'w-12 h-12' },
  xl: { px: 80, containerClass: 'w-20 h-20' },
};

/**
 * ReWiseMark — The Signature 3D Monogram
 *
 * Geometric architectural letter 'R' constructed from interlocking, layered planes:
 * 1. Deep isometric extrusion side (depth plane)
 * 2. Primary vertical pillar (chrome spine)
 * 3. Sweeping upper loop (folded page arch)
 * 4. Forward-reaching diagonal leg (dynamic learning kick)
 *
 * Features:
 * - True CSS 3D perspective tilt on pointer movement
 * - Restrained idle floating and metallic reflection cycle
 * - Zero external color tints (100% pure monochromatic chrome & platinum)
 * - Accessible and WCAG compliant with reduced-motion support
 */
export const ReWiseMark: React.FC<ReWiseMarkProps> = ({
  size = 'md',
  animated = true,
  interactive = true,
  className = '',
  glow = false,
  isLoading = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCoarsePointer(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const pixelSize = typeof size === 'number' ? size : sizeMap[size]?.px || 32;

  // Pointer movement tracking for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !interactive || isCoarsePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Restrained, realistic physical tilt angles (max ~10 degrees)
    setTilt({ x: -y * 12, y: x * 12 });
  };

  const handleMouseEnter = () => {
    if (!shouldReduceMotion && interactive) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Unique gradient identifiers
  const gradVertical = `rewise-grad-vert-${uid}`;
  const gradLoop = `rewise-grad-loop-${uid}`;
  const gradLeg = `rewise-grad-leg-${uid}`;
  const gradDepthSide = `rewise-grad-depth-side-${uid}`;
  const gradDepthFoot = `rewise-grad-depth-foot-${uid}`;
  const filterShadow = `rewise-shadow-${uid}`;
  const gradSheen = `rewise-sheen-${uid}`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center select-none perspective-800 ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        perspective: '800px',
      }}
      aria-label="ReWise 3D Monogram"
      role="img"
    >
      {/* Subtle ambient chrome back-glow if enabled or on hover */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
            opacity: isHovered || isLoading ? 1 : 0.6,
            transform: 'scale(1.4)',
          }}
        />
      )}

      {/* 3D Motion Canvas */}
      <motion.div
        animate={{
          rotateX: shouldReduceMotion ? 0 : tilt.x,
          rotateY: shouldReduceMotion ? 0 : tilt.y,
          scale: isHovered ? 1.04 : 1,
          y: isLoading && !shouldReduceMotion ? [0, -3, 0] : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 28,
          ...(isLoading && !shouldReduceMotion
            ? { y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }
            : {}),
        }}
        className="w-full h-full transform-style-3d relative flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        >
          <defs>
            {/* Pure Monochromatic Platinum & Chrome Gradients */}
            <linearGradient id={gradVertical} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#F5F5F5" />
              <stop offset="65%" stopColor="#A3A3A3" />
              <stop offset="100%" stopColor="#737373" />
            </linearGradient>

            <linearGradient id={gradLoop} x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F5F5F5" />
              <stop offset="70%" stopColor="#D4D4D4" />
              <stop offset="100%" stopColor="#858585" />
            </linearGradient>

            <linearGradient id={gradLeg} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#E5E5E5" />
              <stop offset="65%" stopColor="#A3A3A3" />
              <stop offset="100%" stopColor="#525252" />
            </linearGradient>

            <linearGradient id={gradDepthSide} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#525252" />
              <stop offset="45%" stopColor="#262626" />
              <stop offset="100%" stopColor="#141414" />
            </linearGradient>

            <linearGradient id={gradDepthFoot} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#404040" />
              <stop offset="100%" stopColor="#171717" />
            </linearGradient>

            <linearGradient id={gradSheen} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Depth Drop Shadow for Overlapping Architectural Planes */}
            <filter id={filterShadow} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="-1.5" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* LAYER 1: Isometric Depth Plane (Extruded Thickness of Spine) */}
          <path
            d="M 17 23 L 26 15 L 26 83 L 17 76 Z"
            fill={`url(#${gradDepthSide})`}
          />

          {/* LAYER 2: Primary Vertical Spine (Front Face) */}
          <path
            d="M 26 15 L 41 15 L 41 85 L 26 85 Z"
            fill={`url(#${gradVertical})`}
          />

          {/* Beveled Top Rim of Vertical Spine */}
          <path
            d="M 17 23 L 26 15 L 41 15 L 34 23 Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />

          {/* Architectural Cast Shadows onto Spine */}
          <path
            d="M 41 40 L 41 55 L 35 52 L 35 42 Z"
            fill="#000000"
            fillOpacity="0.4"
          />
          <path
            d="M 41 54 L 41 72 L 34 68 L 34 50 Z"
            fill="#000000"
            fillOpacity="0.45"
          />

          {/* LAYER 3: Upper Loop (Front & Arch) with Geometric Counter */}
          <path
            d="M 41 15 L 63 15 C 76 15 84 24 84 36 C 84 48 74 55 60 55 L 41 55 Z M 41 27 L 58 27 C 65 27 69 30 69 35 C 69 40 65 43 58 43 L 41 43 Z"
            fill={`url(#${gradLoop})`}
            fillRule="evenodd"
            filter={`url(#${filterShadow})`}
          />

          {/* Upper Loop Specular Highlight Edge */}
          <path
            d="M 41 15 L 63 15 C 76 15 84 24 84 36 L 80 36 C 80 26 73 18 63 18 L 41 18 Z"
            fill="#FFFFFF"
            fillOpacity="0.88"
          />

          {/* LAYER 4: Dynamic Diagonal Kick (Forward Learning Leg) */}
          <path
            d="M 45 47 L 59 47 L 83 85 L 68 85 Z"
            fill={`url(#${gradLeg})`}
            filter={`url(#${filterShadow})`}
          />

          {/* Diagonal Leg Top Bevel Highlight */}
          <path
            d="M 45 47 L 59 47 L 61 45 L 47 45 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* Diagonal Leg Extruded Foot Facet */}
          <path
            d="M 68 85 L 83 85 L 77 89 L 62 89 Z"
            fill={`url(#${gradDepthFoot})`}
          />

          {/* Subtle Dynamic Metallic Light Shimmer */}
          {animated && !shouldReduceMotion && (
            <motion.rect
              x="-50"
              y="0"
              width="40"
              height="100"
              fill={`url(#${gradSheen})`}
              transform="rotate(25 50 50)"
              animate={{
                x: [-100, 160],
              }}
              transition={{
                duration: isLoading ? 1.8 : 6,
                repeat: Infinity,
                repeatDelay: isLoading ? 0.4 : 4,
                ease: 'easeInOut',
              }}
              style={{
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
              }}
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
};
