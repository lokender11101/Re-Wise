import { describe, it, expect, beforeEach } from 'vitest';
import { migrateSession, importSessionFromJSON, getSavedSessions, saveSession } from '@/lib/storage';
import { CURRENT_SCHEMA_VERSION } from '@/lib/schemas';
import type { StudySession } from '@/types/study';

// Polyfill localStorage mock for Node / jsdom environment
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

describe('Storage Versioning & Session Migration Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const validV1LegacySession = {
    id: 'legacy-v1-session',
    title: 'Legacy Computer Networks',
    topicOrNotes: 'TCP three-way handshake and congestion control',
    difficulty: 'intermediate',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    blocks: [
      {
        type: 'summary',
        id: 's-1',
        title: 'TCP Handshake',
        content: 'SYN, SYN-ACK, ACK establish connection reliably.',
        keyPoints: ['Connection oriented', 'Full duplex', 'Reliable sequence numbers'],
      },
      {
        type: 'flashcards',
        id: 'fc-1',
        cards: [
          {
            id: 'c-1',
            question: 'What is SYN?',
            answer: 'Synchronize Sequence Number packet.',
          },
        ],
      },
    ],
    progress: {
      flashcards: {},
      quiz: { answers: {}, submitted: false },
      checklist: {},
    },
  };

  it('migrates unversioned legacy v1 session to CURRENT_SCHEMA_VERSION (v2)', () => {
    const migrated = migrateSession(validV1LegacySession);
    expect(migrated).not.toBeNull();
    expect(migrated?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated?.refinementSnapshots).toEqual([]);
    // Verifies selectedBlockTypes was inferred from blocks
    expect(migrated?.selectedBlockTypes).toContain('summary');
    expect(migrated?.selectedBlockTypes).toContain('flashcards');
  });

  it('preserves existing schemaVersion if already version 2', () => {
    const v2Session = {
      ...validV1LegacySession,
      schemaVersion: 2,
      selectedBlockTypes: ['summary', 'flashcards'],
      refinementSnapshots: [
        {
          id: 'snap-1',
          title: 'Initial',
          blocks: validV1LegacySession.blocks,
          progress: validV1LegacySession.progress,
          timestamp: 1700000000000,
        },
      ],
    };

    const migrated = migrateSession(v2Session);
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.refinementSnapshots).toHaveLength(1);
    expect(migrated?.refinementSnapshots?.[0].id).toBe('snap-1');
  });

  it('returns null when given corrupt or completely non-conforming data', () => {
    expect(migrateSession(null)).toBeNull();
    expect(migrateSession(undefined)).toBeNull();
    expect(migrateSession('random string')).toBeNull();
    expect(migrateSession({ id: 'broken-session', title: 123 })).toBeNull();
  });

  it('successfully imports session from a valid JSON string and persists to storage', () => {
    const jsonString = JSON.stringify(validV1LegacySession);
    const imported = importSessionFromJSON(jsonString);

    expect(imported.id).toBe('legacy-v1-session');
    expect(imported.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

    const saved = getSavedSessions();
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('legacy-v1-session');
  });

  it('throws descriptive error when importSessionFromJSON receives invalid JSON structure', () => {
    const invalidJson = JSON.stringify({ garbage: true });
    expect(() => importSessionFromJSON(invalidJson)).toThrow(
      'Import failed: JSON data does not conform to the ReWise study session schema.'
    );
  });

  it('migrates legacy raw-array v1 format into versioned storage envelope without erasing v1', () => {
    // Populate legacy storage with raw array
    window.localStorage.setItem(
      'rewise_saved_sessions_v1',
      JSON.stringify([validV1LegacySession])
    );

    const sessions = getSavedSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe('legacy-v1-session');

    // Verify versioned envelope was created in v2 key
    const v2Raw = window.localStorage.getItem('rewise_storage_v2');
    expect(v2Raw).not.toBeNull();
    const v2Envelope = JSON.parse(v2Raw!);
    expect(v2Envelope.schemaVersion).toBe(2);
    expect(v2Envelope.sessions).toHaveLength(1);

    // Verify v1 legacy storage was NOT deleted
    expect(window.localStorage.getItem('rewise_saved_sessions_v1')).not.toBeNull();
  });

  it('prevents unsupported future schema versions from being interpreted or overwritten', () => {
    const futureEnvelope = {
      schemaVersion: 99,
      futureMetadata: { experimentalFeature: true },
      sessions: [validV1LegacySession],
    };
    window.localStorage.setItem('rewise_storage_v2', JSON.stringify(futureEnvelope));

    // 1. Prevent interpretation
    const sessions = getSavedSessions();
    expect(sessions).toHaveLength(0);

    // 2. Prevent overwrite: saving a new session should not overwrite future envelope
    const newSession = {
      ...validV1LegacySession,
      id: 'session-to-save',
      schemaVersion: 2,
    } as StudySession;
    saveSession(newSession);

    const storedRaw = window.localStorage.getItem('rewise_storage_v2');
    expect(storedRaw).not.toBeNull();
    const storedParsed = JSON.parse(storedRaw!);
    expect(storedParsed.schemaVersion).toBe(99);
    expect(storedParsed.futureMetadata).toEqual({ experimentalFeature: true });
  });
});
