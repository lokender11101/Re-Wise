import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedSessions,
  saveSession,
  deleteSession,
  renameSession,
  updateSessionProgress,
} from '@/lib/storage';
import { MOCK_SAVED_SESSION } from '@/lib/mockData';

// Polyfill localStorage mock for Node 26 / Vitest jsdom test runner
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

describe('Storage & Persistence Resilience Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns empty array when storage is empty', () => {
    expect(getSavedSessions()).toEqual([]);
  });

  it('saves and retrieves a valid study session', () => {
    const saved = saveSession(MOCK_SAVED_SESSION);
    expect(saved.id).toBe(MOCK_SAVED_SESSION.id);

    const loaded = getSavedSessions();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe(MOCK_SAVED_SESSION.id);
    expect(loaded[0].title).toBe(MOCK_SAVED_SESSION.title);
  });

  it('gracefully recovers when localStorage contains corrupted JSON syntax', () => {
    window.localStorage.setItem('rewise_saved_sessions_v1', '{corrupted_not_json:');

    const result = getSavedSessions();
    expect(result).toEqual([]);
    // Corrupted item should be cleanly wiped to prevent crash loops
    expect(window.localStorage.getItem('rewise_saved_sessions_v1')).toBeNull();
  });

  it('filters out corrupted session entries while preserving valid ones', () => {
    const mixedEntries = [
      MOCK_SAVED_SESSION,
      {
        id: 'corrupted-session',
        title: 'Broken',
        // missing required fields: difficulty, createdAt, blocks, progress
      },
    ];

    window.localStorage.setItem('rewise_saved_sessions_v1', JSON.stringify(mixedEntries));

    const sessions = getSavedSessions();
    expect(sessions.length).toBe(1);
    expect(sessions[0].id).toBe(MOCK_SAVED_SESSION.id);
  });

  it('allows renaming an existing session', () => {
    saveSession(MOCK_SAVED_SESSION);
    const renamed = renameSession(MOCK_SAVED_SESSION.id, 'New Master Title');
    expect(renamed?.title).toBe('New Master Title');

    const loaded = getSavedSessions();
    expect(loaded[0].title).toBe('New Master Title');
  });

  it('allows deleting a session', () => {
    saveSession(MOCK_SAVED_SESSION);
    expect(getSavedSessions().length).toBe(1);

    const deleted = deleteSession(MOCK_SAVED_SESSION.id);
    expect(deleted).toBe(true);
    expect(getSavedSessions().length).toBe(0);
  });

  it('updates session progress safely', () => {
    saveSession(MOCK_SAVED_SESSION);
    const newProgress = {
      ...MOCK_SAVED_SESSION.progress,
      flashcards: { 'card-1': 'known' as const, 'card-2': 'known' as const },
    };

    updateSessionProgress(MOCK_SAVED_SESSION.id, newProgress);

    const loaded = getSavedSessions();
    expect(loaded[0].progress.flashcards['card-2']).toBe('known');
  });
});
