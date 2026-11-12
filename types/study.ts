/**
 * ReWise Core Domain Types
 * Strict TypeScript types for active learning blocks, study sessions, and progress.
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ContentBlockType = 'summary' | 'flashcards' | 'quiz' | 'checklist' | 'chart';

// 1. Summary Block
export interface SummaryBlock {
  type: 'summary';
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
}

// 2. Flashcard Block
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardBlock {
  type: 'flashcards';
  id: string;
  cards: Flashcard[];
}

// 3. Quiz Block
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizBlock {
  type: 'quiz';
  id: string;
  questions: QuizQuestion[];
}

// 4. Checklist Block
export interface ChecklistItem {
  id: string;
  text: string;
}

export interface ChecklistBlock {
  type: 'checklist';
  id: string;
  title: string;
  items: ChecklistItem[];
}

// 5. Chart Block (Quantitative & Comparative Analysis)
export interface ChartDataPoint {
  label: string;
  value: number;
  unit?: string;
  description?: string;
}

export interface ChartBlock {
  type: 'chart';
  id: string;
  title: string;
  chartType: 'bar' | 'comparison' | 'distribution';
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: ChartDataPoint[];
  summary: string;
}

// Discriminated Union of all supported learning blocks
export type StudyBlock = SummaryBlock | FlashcardBlock | QuizBlock | ChecklistBlock | ChartBlock;

// Overall AI Structured Generation Output
export interface GenerationResponse {
  title: string;
  topic?: string;
  summary?: string;
  blocks: StudyBlock[];
}

// Study Session Progress Tracking State
export interface SessionProgress {
  flashcards: {
    [cardId: string]: 'known' | 'learning';
  };
  quiz: {
    answers: { [questionId: string]: number }; // questionId -> selectedOptionIndex
    submitted: boolean;
    score?: number;
    total?: number;
    incorrectQuestionIds?: string[];
    attempts?: number;
    history?: {
      timestamp: number;
      score: number;
      total: number;
      mode: 'full' | 'retest';
    }[];
  };
  checklist: {
    [itemId: string]: boolean;
  };
}

// Full Persisted Study Session
export interface StudySession {
  id: string;
  title: string;
  topicOrNotes: string;
  difficulty: DifficultyLevel;
  selectedBlockTypes: ContentBlockType[];
  createdAt: number;
  updatedAt: number;
  blocks: StudyBlock[];
  progress: SessionProgress;
}

// Generation & Refinement Request Payloads
export interface GenerateRequestPayload {
  notes: string;
  difficulty: DifficultyLevel;
  selectedTypes: ContentBlockType[];
}

export interface RefineRequestPayload {
  session: {
    title: string;
    topicOrNotes: string;
    difficulty: DifficultyLevel;
    blocks: StudyBlock[];
  };
  instruction: string;
}

// API Error Response Structure
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    retryable: boolean;
  };
}
