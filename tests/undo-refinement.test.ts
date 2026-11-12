import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStudySession } from '@/hooks/useStudySession';
import type { SummaryBlock, FlashcardBlock, StudyBlock } from '@/types/study';

// Polyfill localStorage mock
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const mockStorage = createLocalStorageMock();
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

describe('Undo Refinement Architecture Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const initialSummary: SummaryBlock = {
    type: 'summary',
    id: 's-initial',
    title: 'Initial Title',
    content: 'Initial content before refinement',
    keyPoints: ['Initial key point 1'],
  };

  const initialCards: FlashcardBlock = {
    type: 'flashcards',
    id: 'fc-initial',
    cards: [
      { id: 'c-1', question: 'What is A?', answer: 'Answer A' },
      { id: 'c-2', question: 'What is B?', answer: 'Answer B' },
    ],
  };

  it('records a snapshot and enables undoRefinement after block update', () => {
    const { result } = renderHook(() => useStudySession());

    // 1. Initialize session
    act(() => {
      result.current.initNewSession(
        {
          title: 'Initial Session',
          blocks: [initialSummary, initialCards],
        },
        {
          notes: 'Test notes',
          difficulty: 'intermediate',
          selectedTypes: ['summary', 'flashcards'],
        }
      );
    });

    expect(result.current.canUndoRefinement).toBe(false);
    expect(result.current.undoSnapshotCount).toBe(0);

    // 2. Mark card c-1 as known
    act(() => {
      result.current.markFlashcard('c-1', 'known');
    });
    expect(result.current.session?.progress.flashcards['c-1']).toBe('known');

    // 3. Perform a refinement update
    const refinedSummary: SummaryBlock = {
      type: 'summary',
      id: 's-initial',
      title: 'Refined Title 1',
      content: 'Expanded content after iteration 1',
      keyPoints: ['Point 1', 'Point 2'],
    };

    act(() => {
      result.current.updateBlocks([refinedSummary, initialCards], 'Refined Title 1', 'Make summary deeper');
    });

    expect(result.current.session?.title).toBe('Refined Title 1');
    expect(result.current.canUndoRefinement).toBe(true);
    expect(result.current.undoSnapshotCount).toBe(1);

    // 4. Perform second refinement
    const refinedSummary2: SummaryBlock = {
      type: 'summary',
      id: 's-initial',
      title: 'Refined Title 2',
      content: 'Content after iteration 2',
      keyPoints: ['Point A', 'Point B'],
    };

    act(() => {
      result.current.updateBlocks([refinedSummary2, initialCards], 'Refined Title 2', 'Add more nuance');
    });

    expect(result.current.session?.title).toBe('Refined Title 2');
    expect(result.current.undoSnapshotCount).toBe(2);

    // 5. Undo once: should revert to Refined Title 1
    act(() => {
      const undone = result.current.undoRefinement();
      expect(undone).toBe(true);
    });

    expect(result.current.session?.title).toBe('Refined Title 1');
    expect(result.current.undoSnapshotCount).toBe(1);

    // 6. Undo again: should revert to Initial Session
    act(() => {
      const undone = result.current.undoRefinement();
      expect(undone).toBe(true);
    });

    expect(result.current.session?.title).toBe('Initial Session');
    expect(result.current.undoSnapshotCount).toBe(0);
    expect(result.current.canUndoRefinement).toBe(false);

    // 7. Verify user card mastery is still preserved
    expect(result.current.session?.progress.flashcards['c-1']).toBe('known');
  });
});
