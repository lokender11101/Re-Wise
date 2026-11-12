import {
  SavedSessionSchema,
  SavedSessionsListSchema,
  StorageEnvelopeSchema,
  CURRENT_SCHEMA_VERSION,
} from './schemas';
import type { StudySession, SessionProgress } from '@/types/study';

export const STORAGE_KEY_V2 = 'rewise_storage_v2';
export const LEGACY_STORAGE_KEY_V1 = 'rewise_saved_sessions_v1';
export const ACTIVE_SESSION_ID_KEY = 'rewise_active_session_id_v1';
export const CURRENT_STORAGE_VERSION = 2;

/**
 * Migrates a legacy or unversioned session object to the current schema version (v2).
 */
export function migrateSession(raw: unknown): StudySession | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = { ...(raw as Record<string, unknown>) };

  // 1. Reject future schema versions that are not supported
  if (
    typeof candidate.schemaVersion === 'number' &&
    candidate.schemaVersion > CURRENT_SCHEMA_VERSION
  ) {
    console.warn(
      `Session ${candidate.id || 'unknown'} has schemaVersion ${candidate.schemaVersion}, which is newer than supported (${CURRENT_SCHEMA_VERSION}). Rejecting migration to prevent data loss or downgrade.`
    );
    return null;
  }

  // 2. Ensure schemaVersion exists
  if (!candidate.schemaVersion || typeof candidate.schemaVersion !== 'number') {
    candidate.schemaVersion = CURRENT_SCHEMA_VERSION;
  }

  // 3. Ensure refinementSnapshots exists and each snapshot has a valid progress object
  if (!Array.isArray(candidate.refinementSnapshots)) {
    candidate.refinementSnapshots = [];
  } else {
    candidate.refinementSnapshots = candidate.refinementSnapshots.map((snap) => {
      if (snap && typeof snap === 'object' && !('progress' in snap)) {
        return {
          ...snap,
          progress: candidate.progress || {
            flashcards: {},
            quiz: { answers: {}, submitted: false },
            checklist: {},
          },
        };
      }
      return snap;
    });
  }

  // 3. Ensure selectedBlockTypes exists or derive from blocks
  if (!Array.isArray(candidate.selectedBlockTypes) && Array.isArray(candidate.blocks)) {
    const inferredTypes = new Set<string>();
    for (const b of candidate.blocks) {
      if (b && typeof b === 'object' && 'type' in b && typeof b.type === 'string') {
        inferredTypes.add(b.type);
      }
    }
    candidate.selectedBlockTypes = Array.from(inferredTypes);
  }

  // 4. Validate through Zod schema
  const result = SavedSessionSchema.safeParse(candidate);
  if (result.success) {
    return result.data as StudySession;
  }

  console.warn('Migration failed for session:', candidate.id, result.error.message);
  return null;
}

/**
 * Safely loads all saved study sessions from localStorage.
 * Defensive against invalid JSON, schema mismatches, or corrupted entries.
 * Automatically migrates from raw array (v1) into a versioned envelope (v2).
 */
export function getSavedSessions(): StudySession[] {
  if (typeof window === 'undefined') return [];

  try {
    // 1. Check for versioned envelope in STORAGE_KEY_V2
    const v2Raw = window.localStorage.getItem(STORAGE_KEY_V2);
    if (v2Raw) {
      let parsedEnvelope: unknown;
      try {
        parsedEnvelope = JSON.parse(v2Raw);
      } catch {
        console.warn('STORAGE_KEY_V2 contains invalid JSON. Removing corrupted entry.');
        window.localStorage.removeItem(STORAGE_KEY_V2);
      }

      if (parsedEnvelope && typeof parsedEnvelope === 'object' && 'schemaVersion' in parsedEnvelope) {
        const env = parsedEnvelope as { schemaVersion: number; sessions?: unknown[] };

        // Handle unsupported future schema versions safely (prevent interpretation and overwrite)
        if (env.schemaVersion > CURRENT_STORAGE_VERSION) {
          console.warn(
            `Storage schema version ${env.schemaVersion} is newer than supported (${CURRENT_STORAGE_VERSION}). Preventing unsupported storage data from being interpreted or overwritten.`
          );
          return [];
        }

        if (Array.isArray(env.sessions)) {
          const validSessions: StudySession[] = [];
          for (const item of env.sessions) {
            const migrated = migrateSession(item);
            if (migrated) {
              validSessions.push(migrated);
            } else {
              console.warn('Skipping corrupted session entry in v2 envelope:', item);
            }
          }
          return validSessions.sort((a, b) => b.updatedAt - a.updatedAt);
        }
      }
    }

    // 2. Fallback / Migration: Check legacy raw array in LEGACY_STORAGE_KEY_V1
    const v1Raw = window.localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (!v1Raw) return [];

    let parsedV1: unknown;
    try {
      parsedV1 = JSON.parse(v1Raw);
    } catch {
      console.warn('Legacy localStorage corrupted: failed to parse saved sessions JSON. Resetting.');
      window.localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      return [];
    }

    if (!Array.isArray(parsedV1)) {
      console.warn('Legacy localStorage data is not an array.');
      return [];
    }

    // Migrate valid legacy sessions
    const validMigratedSessions: StudySession[] = [];
    for (const item of parsedV1) {
      const migrated = migrateSession(item);
      if (migrated) {
        validMigratedSessions.push(migrated);
      } else {
        console.warn('Skipping corrupted session entry during v1 migration:', item);
      }
    }

    // Persist into versioned envelope (without deleting v1 to prevent data loss)
    if (validMigratedSessions.length > 0) {
      persistSessions(validMigratedSessions);
    }

    return validMigratedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Unexpected error reading from localStorage:', error);
    return [];
  }
}

/**
 * Persists an updated list of sessions to localStorage inside the versioned envelope.
 */
function persistSessions(sessions: StudySession[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Prevent overwriting unsupported future schema data
    const existingRaw = window.localStorage.getItem(STORAGE_KEY_V2);
    if (existingRaw) {
      try {
        const existingParsed = JSON.parse(existingRaw);
        if (
          existingParsed &&
          typeof existingParsed === 'object' &&
          typeof existingParsed.schemaVersion === 'number' &&
          existingParsed.schemaVersion > CURRENT_STORAGE_VERSION
        ) {
          console.warn(
            `Blocked storage overwrite: existing storage has unsupported future schema version (${existingParsed.schemaVersion} > ${CURRENT_STORAGE_VERSION}).`
          );
          return false;
        }
      } catch {
        // If existing is not JSON, it is safe to overwrite
      }
    }

    const validated = SavedSessionsListSchema.safeParse(sessions);
    if (!validated.success) {
      console.error('Attempted to persist invalid session list:', validated.error);
      return false;
    }

    const envelope = {
      schemaVersion: CURRENT_STORAGE_VERSION,
      sessions: validated.data,
    };

    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(envelope));
    return true;
  } catch (error) {
    console.error('Failed to write sessions to localStorage:', error);
    return false;
  }
}

/**
 * Saves or updates a study session.
 * Propagates persistSessions status, returning null if saving is blocked or fails.
 */
export function saveSession(session: StudySession): StudySession | null {
  const sessions = getSavedSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);

  const updatedSession: StudySession = {
    ...session,
    updatedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    sessions[existingIndex] = updatedSession;
  } else {
    sessions.unshift(updatedSession);
  }

  // Bound storage to 50 most recent sessions to avoid localStorage quota issues
  const trimmed = sessions.slice(0, 50);
  const success = persistSessions(trimmed);
  if (!success) {
    console.warn('Failed to save session to localStorage: storage write failed or blocked.');
    return null;
  }

  return updatedSession;
}

/**
 * Deletes a session by ID.
 */
export function deleteSession(sessionId: string): boolean {
  const sessions = getSavedSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  return persistSessions(filtered);
}

/**
 * Renames a session.
 */
export function renameSession(sessionId: string, newTitle: string): StudySession | null {
  const trimmedTitle = newTitle.trim();
  if (!trimmedTitle) return null;

  const sessions = getSavedSessions();
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return null;

  const originalTitle = target.title;
  target.title = trimmedTitle;
  target.updatedAt = Date.now();
  const success = persistSessions(sessions);
  if (!success) {
    target.title = originalTitle;
    console.warn('Failed to rename session: storage write failed or blocked.');
    return null;
  }
  return target;
}

/**
 * Updates progress for a specific session.
 */
export function updateSessionProgress(sessionId: string, progress: SessionProgress): boolean {
  const sessions = getSavedSessions();
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return false;

  target.progress = progress;
  target.updatedAt = Date.now();
  return persistSessions(sessions);
}

/**
 * Active session tracking.
 */
export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_SESSION_ID_KEY);
}

export function setActiveSessionId(sessionId: string | null): void {
  if (typeof window === 'undefined') return;
  if (sessionId) {
    window.localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
  } else {
    window.localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
  }
}

/**
 * Safely imports and validates a study session from a JSON string or object.
 * Automatically runs schema migration to ensure compatibility with v2.
 * Rejects future schema versions to prevent unsupported structures from being downgraded.
 */
export function importSessionFromJSON(rawJSON: string | unknown): StudySession {
  const parsed = typeof rawJSON === 'string' ? JSON.parse(rawJSON) : rawJSON;

  if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
    const rawVersion = (parsed as { schemaVersion: unknown }).schemaVersion;
    if (typeof rawVersion === 'number' && rawVersion > CURRENT_SCHEMA_VERSION) {
      throw new Error(
        `Import failed: Session requires schemaVersion ${rawVersion}, but this application only supports up to version ${CURRENT_SCHEMA_VERSION}. Please update ReWise.`
      );
    }
  }

  const migrated = migrateSession(parsed);
  if (!migrated) {
    throw new Error('Import failed: JSON data does not conform to the ReWise study session schema.');
  }

  const saved = saveSession(migrated);
  if (!saved) {
    throw new Error('Import failed: Storage envelope is locked or in read-only mode.');
  }

  return saved;
}
