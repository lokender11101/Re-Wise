import { SavedSessionSchema, SavedSessionsListSchema } from './schemas';
import type { StudySession, SessionProgress } from '@/types/study';

const SESSIONS_STORAGE_KEY = 'rewise_saved_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'rewise_active_session_id_v1';

/**
 * Safely loads all saved study sessions from localStorage.
 * Defensive against invalid JSON, schema mismatches, or corrupted entries.
 */
export function getSavedSessions(): StudySession[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawData = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!rawData) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      console.warn('localStorage corrupted: failed to parse saved sessions JSON. Resetting.');
      window.localStorage.removeItem(SESSIONS_STORAGE_KEY);
      return [];
    }

    if (!Array.isArray(parsed)) {
      console.warn('localStorage data is not an array. Resetting.');
      return [];
    }

    // Validate sessions individually to preserve valid sessions even if one is corrupted
    const validSessions: StudySession[] = [];
    for (const item of parsed) {
      const result = SavedSessionSchema.safeParse(item);
      if (result.success) {
        validSessions.push(result.data as StudySession);
      } else {
        console.warn('Skipping corrupted session entry:', item, result.error.message);
      }
    }

    // Sort descending by updatedAt
    return validSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Unexpected error reading from localStorage:', error);
    return [];
  }
}

/**
 * Persists an updated list of sessions to localStorage.
 */
function persistSessions(sessions: StudySession[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const validated = SavedSessionsListSchema.safeParse(sessions);
    if (!validated.success) {
      console.error('Attempted to persist invalid session list:', validated.error);
      return false;
    }

    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(validated.data));
    return true;
  } catch (error) {
    console.error('Failed to write sessions to localStorage:', error);
    return false;
  }
}

/**
 * Saves or updates a study session.
 */
export function saveSession(session: StudySession): StudySession {
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
  persistSessions(trimmed);

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

  target.title = trimmedTitle;
  target.updatedAt = Date.now();
  persistSessions(sessions);
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
