import type { Variants, Transition } from 'framer-motion';

/**
 * ReWise Central Motion Design System
 * Reusable, performant motion variants built on Framer Motion.
 * Respects `prefers-reduced-motion` and provides sophisticated,
 * subtle micro-interactions with layered spring transitions.
 */

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
};

export const smoothTransition: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

// Subtle fade-in and vertical rise for page sections
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};

// Container variant with staggered child appearance
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

// Individual child block entrance variant
export const blockEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Interactive card hover and tap variants (restrained, dimensional)
export const interactiveCardVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.5)',
    transition: smoothTransition,
  },
  hover: {
    y: -2,
    boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px #333333',
    transition: smoothTransition,
  },
  tap: {
    y: 0,
    scale: 0.995,
    boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.6)',
    transition: { duration: 0.1 },
  },
};

// Button press feedback
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.01 },
  tap: { scale: 0.98 },
};

// Modal backdrop and dialog variants
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.15 },
  },
};
