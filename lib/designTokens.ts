/**
 * ReWise Design System Tokens
 * Unified tokens for muted surface identities, accents, borders, typography, and elevations.
 */

export const THEME = {
  canvas: '#050505',
  surfaces: {
    base: '#0A0A0A',
    subtle: '#0E0E0E',
    panel: '#121212',
    elevated: '#161616',
    hover: '#1B1B1B',
  },
  borders: {
    subtle: '#1C1C1C',
    standard: '#282828',
    strong: '#383838',
    active: '#555555',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#B0B0B0',
    muted: '#777777',
    disabled: '#505050',
  },
  sections: {
    progress: {
      name: 'Mastery Progress',
      accent: '#A7D8B5', // soft sage green
      surface: '#0F1713',
      surfaceAlt: '#14201A',
      border: '#1A2C21',
      text: '#E5F4EC',
      muted: '#7DAA8E',
    },
    analytics: {
      name: 'Learning Intelligence',
      accent: '#B7B9E2', // muted indigo / slate lavender
      surface: '#12131C',
      surfaceAlt: '#181A26',
      border: '#202336',
      text: '#EAEBFA',
      muted: '#8B8FB8',
    },
    summary: {
      name: 'Executive Summary',
      accent: '#D9C69D', // warm champagne
      surface: '#15130F',
      surfaceAlt: '#1A1713',
      border: '#282218',
      text: '#FAF6ED',
      muted: '#A89775',
    },
    flashcards: {
      name: '3D Flashcards',
      accent: '#C8ADD9', // soft amethyst / lavender
      surface: '#130F17',
      surfaceAlt: '#18131D',
      border: '#261B2B',
      text: '#F7EDFA',
      muted: '#9E80B0',
    },
    quiz: {
      name: 'Comprehension Quiz',
      accent: '#E0AAAA', // muted blush rose / burgundy
      surface: '#170E0E',
      surfaceAlt: '#1C1212',
      border: '#2C1A1A',
      text: '#FAF0F0',
      muted: '#B07B7B',
    },
    checklist: {
      name: 'Mastery Checklist',
      accent: '#A5C7CC', // deep subtle teal
      surface: '#0E1517',
      surfaceAlt: '#12191C',
      border: '#18262A',
      text: '#EEF7F8',
      muted: '#72989E',
    },
    chart: {
      name: 'Quantitative Analysis',
      accent: '#A8CDBB', // mint graphite
      surface: '#101614',
      surfaceAlt: '#151C1A',
      border: '#1C2824',
      text: '#EDF7F2',
      muted: '#7B9E8D',
    },
    refine: {
      name: 'AI Refinement Loop',
      accent: '#D8BD91', // warm champagne amber
      surface: '#14110C',
      surfaceAlt: '#191610',
      border: '#282015',
      text: '#FAF5ED',
      muted: '#A68F68',
    },
  },
} as const;

export type SectionIdentityKey = keyof typeof THEME.sections;
