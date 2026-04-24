/**
 * Tiny IndexedDB-backed storage that mirrors the Web Storage API surface
 * (getItem/setItem/removeItem) that Zustand's `persist` middleware needs.
 *
 * Why: localStorage has a hard ~5MB-per-origin quota. Once a user saves a
 * couple of CVs with profile photos, even lightly compressed, the store
 * starts throwing QuotaExceededError on every write. IndexedDB typically
 * allows tens of MB with no prompt, which is a safer home for a CV builder.
 *
 * Implementation notes:
 *  - Pure browser IndexedDB, no extra deps.
 *  - All writes are awaited so zustand sees a real persistence completion.
 *  - On the server (Next.js SSR) we return a no-op storage so the import
 *    never throws.
 */

const DB_NAME = 'cv-gen-ai';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not available'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
  });

  return dbPromise;
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Zustand persist "StateStorage" adapter backed by IndexedDB.
 * Returns an object matching `{ getItem, setItem, removeItem }`.
 *
 * We also do a one-time migration: if a value exists in localStorage under
 * the same key, we copy it into IDB and remove it from localStorage. This
 * preserves accounts/CVs that existed before the migration.
 */
export function createIdbStorage() {
  return {
    getItem: async (name: string): Promise<string | null> => {
      // On the server (Next.js SSR) IndexedDB simply does not exist — behave
      // as a no-op storage so Zustand's `persist` middleware finishes init.
      if (typeof window === 'undefined') return null;
      try {
        // One-time migration from localStorage if present.
        const legacy = window.localStorage.getItem(name);
        if (legacy !== null) {
          try {
            await idbSet(name, legacy);
            window.localStorage.removeItem(name);
          } catch {
            // If IDB write fails, leave legacy in place rather than losing data.
          }
          return legacy;
        }
        return await idbGet(name);
      } catch (err) {
        console.warn('[idbStorage] getItem failed, returning null', err);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      if (typeof window === 'undefined') return;
      try {
        await idbSet(name, value);
      } catch (err) {
        console.error('[idbStorage] setItem failed', err);
        throw err;
      }
    },
    removeItem: async (name: string): Promise<void> => {
      if (typeof window === 'undefined') return;
      try {
        await idbDelete(name);
      } catch (err) {
        console.warn('[idbStorage] removeItem failed', err);
      }
    },
  };
}
