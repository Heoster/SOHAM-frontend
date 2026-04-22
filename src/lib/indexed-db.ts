/**
 * IndexedDB — SOHAM Chat Store
 *
 * Schema (v2):
 *   DB: soham-store  v2
 *   ├── kv          — generic key-value (settings, user prefs)
 *   ├── chats       — Chat objects, keyed by id, indexed by userId + updatedAt
 *   ├── messages    — Message objects, keyed by id, indexed by chatId + createdAt
 *   └── user_data   — User profile / preferences, keyed by userId
 *
 * Why proper object stores instead of one big blob:
 *  - Partial reads: load only the messages for the active chat
 *  - Indexed queries: get all chats for a user sorted by date
 *  - Atomic writes: adding one message doesn't rewrite the whole history
 *  - No 5 MB localStorage cap — IndexedDB handles hundreds of MB
 */

const DB_NAME    = 'soham-store';
const DB_VERSION = 2;

// ─── Store names ──────────────────────────────────────────────────────────────
export const STORE_KV       = 'kv';
export const STORE_CHATS    = 'chats';
export const STORE_MESSAGES = 'messages';
export const STORE_USER     = 'user_data';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBChat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBMessage {
  id: string;
  chatId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  modelUsed?: string;
  autoRouted?: boolean;
  imageUrl?: string;
  imageProvider?: string;
}

export interface DBUserData {
  userId: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  preferences?: Record<string, unknown>;
  updatedAt: string;
}

// ─── DB connection ────────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // ── kv store (generic, backwards-compatible) ──────────────────────────
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV);
      }

      // ── chats store ───────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains(STORE_CHATS)) {
        const chatStore = db.createObjectStore(STORE_CHATS, { keyPath: 'id' });
        chatStore.createIndex('by_user',    'userId',    { unique: false });
        chatStore.createIndex('by_updated', 'updatedAt', { unique: false });
        chatStore.createIndex('by_user_updated', ['userId', 'updatedAt'], { unique: false });
      }

      // ── messages store ────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        const msgStore = db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
        msgStore.createIndex('by_chat',         'chatId',    { unique: false });
        msgStore.createIndex('by_chat_created', ['chatId', 'createdAt'], { unique: false });
      }

      // ── user_data store ───────────────────────────────────────────────────
      if (!db.objectStoreNames.contains(STORE_USER)) {
        db.createObjectStore(STORE_USER, { keyPath: 'userId' });
      }
    };

    request.onsuccess = () => {
      _db = request.result;
      _db.onclose = () => { _db = null; };
      resolve(_db);
    };

    request.onerror   = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });
}

// ─── Generic KV helpers (backwards-compatible) ───────────────────────────────

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const db = await openDB();
    return new Promise<T | undefined>((resolve, reject) => {
      const tx  = db.transaction(STORE_KV, 'readonly');
      const req = tx.objectStore(STORE_KV).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[idb] get("${key}") failed:`, err);
    return undefined;
  }
}

export async function idbSet<T = unknown>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_KV, 'readwrite');
      const req = tx.objectStore(STORE_KV).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[idb] set("${key}") failed:`, err);
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_KV, 'readwrite');
      const req = tx.objectStore(STORE_KV).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[idb] remove("${key}") failed:`, err);
  }
}

// ─── Chat helpers ─────────────────────────────────────────────────────────────

/** Get all chats for a user, sorted newest-first */
export async function idbGetChats(userId: string): Promise<DBChat[]> {
  try {
    const db = await openDB();
    return new Promise<DBChat[]>((resolve, reject) => {
      const tx    = db.transaction(STORE_CHATS, 'readonly');
      const index = tx.objectStore(STORE_CHATS).index('by_user');
      const req   = index.getAll(IDBKeyRange.only(userId));
      req.onsuccess = () => {
        const chats = (req.result as DBChat[]).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(chats);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] getChats failed:', err);
    return [];
  }
}

/** Upsert a single chat */
export async function idbPutChat(chat: DBChat): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_CHATS, 'readwrite');
      const req = tx.objectStore(STORE_CHATS).put(chat);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] putChat failed:', err);
  }
}

/** Delete a chat and all its messages */
export async function idbDeleteChat(chatId: string): Promise<void> {
  try {
    const db = await openDB();
    // Delete the chat record
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_CHATS, 'readwrite');
      const req = tx.objectStore(STORE_CHATS).delete(chatId);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
    // Delete all messages for this chat
    await idbDeleteMessagesByChat(chatId);
  } catch (err) {
    console.warn('[idb] deleteChat failed:', err);
  }
}

// ─── Message helpers ──────────────────────────────────────────────────────────

/** Get all messages for a chat, sorted oldest-first */
export async function idbGetMessages(chatId: string): Promise<DBMessage[]> {
  try {
    const db = await openDB();
    return new Promise<DBMessage[]>((resolve, reject) => {
      const tx    = db.transaction(STORE_MESSAGES, 'readonly');
      const index = tx.objectStore(STORE_MESSAGES).index('by_chat');
      const req   = index.getAll(IDBKeyRange.only(chatId));
      req.onsuccess = () => {
        const msgs = (req.result as DBMessage[]).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        resolve(msgs);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] getMessages failed:', err);
    return [];
  }
}

/** Add a single message */
export async function idbAddMessage(message: DBMessage): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_MESSAGES, 'readwrite');
      const req = tx.objectStore(STORE_MESSAGES).put(message);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] addMessage failed:', err);
  }
}

/** Delete all messages for a chat */
export async function idbDeleteMessagesByChat(chatId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx    = db.transaction(STORE_MESSAGES, 'readwrite');
      const index = tx.objectStore(STORE_MESSAGES).index('by_chat');
      const req   = index.openCursor(IDBKeyRange.only(chatId));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] deleteMessagesByChat failed:', err);
  }
}

// ─── User data helpers ────────────────────────────────────────────────────────

export async function idbGetUserData(userId: string): Promise<DBUserData | undefined> {
  try {
    const db = await openDB();
    return new Promise<DBUserData | undefined>((resolve, reject) => {
      const tx  = db.transaction(STORE_USER, 'readonly');
      const req = tx.objectStore(STORE_USER).get(userId);
      req.onsuccess = () => resolve(req.result as DBUserData | undefined);
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] getUserData failed:', err);
    return undefined;
  }
}

export async function idbPutUserData(data: DBUserData): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_USER, 'readwrite');
      const req = tx.objectStore(STORE_USER).put(data);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] putUserData failed:', err);
  }
}

/** Delete all data for a user (chats, messages, user record) */
export async function idbDeleteAllUserData(userId: string): Promise<void> {
  try {
    const chats = await idbGetChats(userId);
    for (const chat of chats) {
      await idbDeleteChat(chat.id);
    }
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_USER, 'readwrite');
      const req = tx.objectStore(STORE_USER).delete(userId);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[idb] deleteAllUserData failed:', err);
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function isIDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

/** Get storage usage estimate */
export async function idbGetStorageEstimate(): Promise<{ usedMB: number; quotaMB: number } | null> {
  if (!navigator?.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usedMB:  Math.round(usage  / 1024 / 1024 * 10) / 10,
      quotaMB: Math.round(quota  / 1024 / 1024),
    };
  } catch {
    return null;
  }
}

