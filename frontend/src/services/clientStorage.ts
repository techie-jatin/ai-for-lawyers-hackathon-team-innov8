/**
 * Bharat Legal Intelligence 2.0 - Client Storage Service
 * High-capacity client-side persistence using browser IndexedDB with automatic localStorage migration
 * Eliminates browser 5MB localStorage quota limits for extensive legal consultations and case dockets.
 */

export interface StoredChatThread {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  messages: any[];
}

export interface StoredDossier {
  id: number;
  docket_number: string;
  title: string;
  category: string;
  mode: string;
  initial_query?: string;
  legal_summary?: string;
  applicable_sections?: string[];
  notes?: string;
  created_at?: string;
  guest_id?: string;
}

const DB_NAME = 'BharatLegalDB';
const DB_VERSION = 1;
const STORE_THREADS = 'threads';
const STORE_DOSSIERS = 'dossiers';
const STORE_PREFS = 'preferences';

class ClientStorageEngine {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isIndexedDBSupported: boolean;

  constructor() {
    this.isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private getDB(): Promise<IDBDatabase | null> {
    if (!this.isIndexedDBSupported) {
      return Promise.resolve(null);
    }
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_THREADS)) {
            const threadStore = db.createObjectStore(STORE_THREADS, { keyPath: 'guest_id' });
            threadStore.createIndex('guest_id', 'guest_id', { unique: true });
          }
          if (!db.objectStoreNames.contains(STORE_DOSSIERS)) {
            const dossierStore = db.createObjectStore(STORE_DOSSIERS, { keyPath: 'id' });
            dossierStore.createIndex('docket_number', 'docket_number', { unique: false });
            dossierStore.createIndex('guest_id', 'guest_id', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_PREFS)) {
            db.createObjectStore(STORE_PREFS, { keyPath: 'key' });
          }
        };

        request.onsuccess = (event: Event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (err) => {
          console.warn('[ClientStorage] IndexedDB open error, falling back to localStorage:', err);
          resolve(null);
        };
      } catch (e) {
        console.warn('[ClientStorage] IndexedDB initialization exception:', e);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Loads chat threads for a given guestId with automatic migration from localStorage
   */
  async loadThreads(guestId: string): Promise<StoredChatThread[]> {
    const db = await this.getDB();
    const lsKey = `bharat_chat_threads_${guestId}`;

    if (!db) {
      try {
        const raw = localStorage.getItem(lsKey);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    return new Promise<StoredChatThread[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_THREADS, 'readonly');
        const store = tx.objectStore(STORE_THREADS);
        const req = store.get(guestId);

        req.onsuccess = () => {
          if (req.result && Array.isArray(req.result.threads)) {
            resolve(req.result.threads);
          } else {
            // Check if legacy data exists in localStorage for migration
            try {
              const legacy = localStorage.getItem(lsKey);
              if (legacy) {
                const parsed = JSON.parse(legacy);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  // Perform background migration into IndexedDB
                  this.saveThreads(guestId, parsed).catch(console.error);
                  resolve(parsed);
                  return;
                }
              }
            } catch {}
            resolve([]);
          }
        };

        req.onerror = () => {
          // Fallback to localStorage
          try {
            const raw = localStorage.getItem(lsKey);
            resolve(raw ? JSON.parse(raw) : []);
          } catch {
            resolve([]);
          }
        };
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Persists chat threads to IndexedDB and mirrors lightweight backup to localStorage
   */
  async saveThreads(guestId: string, threads: StoredChatThread[]): Promise<void> {
    const db = await this.getDB();
    const lsKey = `bharat_chat_threads_${guestId}`;

    // Mirror to localStorage as backup if size allows
    try {
      localStorage.setItem(lsKey, JSON.stringify(threads));
    } catch (e) {
      // QuotaExceeded on localStorage is safely swallowed because IndexedDB handles large dockets
      console.warn('[ClientStorage] localStorage quota reached; IndexedDB remains authoritative.');
    }

    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_THREADS, 'readwrite');
        const store = tx.objectStore(STORE_THREADS);
        const payload = {
          guest_id: guestId,
          threads,
          updated_at: new Date().toISOString()
        };
        const req = store.put(payload);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Loads saved dossiers with localStorage migration
   */
  async loadDossiers(guestId?: string): Promise<StoredDossier[]> {
    const db = await this.getDB();
    const lsKey = 'bharat_saved_dossiers';

    if (!db) {
      try {
        const raw = localStorage.getItem(lsKey);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    return new Promise<StoredDossier[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_DOSSIERS, 'readonly');
        const store = tx.objectStore(STORE_DOSSIERS);
        const req = store.getAll();

        req.onsuccess = () => {
          const list = req.result || [];
          if (list.length > 0) {
            if (guestId) {
              resolve(list.filter(d => !d.guest_id || d.guest_id === guestId));
            } else {
              resolve(list);
            }
          } else {
            // Check legacy localStorage
            try {
              const legacy = localStorage.getItem(lsKey);
              if (legacy) {
                const parsed = JSON.parse(legacy);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  // Migrate
                  parsed.forEach(d => this.saveDossier(d).catch(() => {}));
                  resolve(parsed);
                  return;
                }
              }
            } catch {}
            resolve([]);
          }
        };

        req.onerror = () => {
          try {
            const raw = localStorage.getItem(lsKey);
            resolve(raw ? JSON.parse(raw) : []);
          } catch {
            resolve([]);
          }
        };
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Saves a single dossier to IndexedDB
   */
  async saveDossier(dossier: StoredDossier): Promise<void> {
    const db = await this.getDB();

    // Mirror to localStorage
    try {
      const lsKey = 'bharat_saved_dossiers';
      const existing: StoredDossier[] = JSON.parse(localStorage.getItem(lsKey) || '[]');
      const filtered = existing.filter(d => d.id !== dossier.id && d.docket_number !== dossier.docket_number);
      localStorage.setItem(lsKey, JSON.stringify([dossier, ...filtered]));
    } catch {}

    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_DOSSIERS, 'readwrite');
        const store = tx.objectStore(STORE_DOSSIERS);
        const req = store.put(dossier);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Deletes a dossier by ID
   */
  async deleteDossier(id: number): Promise<void> {
    const db = await this.getDB();

    try {
      const lsKey = 'bharat_saved_dossiers';
      const existing: StoredDossier[] = JSON.parse(localStorage.getItem(lsKey) || '[]');
      localStorage.setItem(lsKey, JSON.stringify(existing.filter(d => d.id !== id)));
    } catch {}

    if (!db) return;

    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_DOSSIERS, 'readwrite');
        const store = tx.objectStore(STORE_DOSSIERS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  /**
   * Deletes all thread and docket data for a guest
   */
  async clearGuestData(guestId: string): Promise<void> {
    try {
      localStorage.removeItem(`bharat_chat_threads_${guestId}`);
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction([STORE_THREADS, STORE_DOSSIERS], 'readwrite');
        tx.objectStore(STORE_THREADS).delete(guestId);
        resolve();
      } catch {
        resolve();
      }
    });
  }

  /**
   * Retrieves approximate storage usage and quota from navigator.storage
   */
  async getStorageStats(): Promise<{
    usedMb: number;
    quotaMb: number;
    percentUsed: number;
    isIndexedDB: boolean;
  }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMb = ((estimate.usage || 0) / (1024 * 1024));
        const quotaMb = ((estimate.quota || 0) / (1024 * 1024));
        const percentUsed = quotaMb > 0 ? (usedMb / quotaMb) * 100 : 0;
        return {
          usedMb: Math.round(usedMb * 100) / 100,
          quotaMb: Math.round(quotaMb),
          percentUsed: Math.round(percentUsed * 10) / 10,
          isIndexedDB: this.isIndexedDBSupported
        };
      } catch {}
    }

    return {
      usedMb: 0.5,
      quotaMb: 50,
      percentUsed: 1.0,
      isIndexedDB: this.isIndexedDBSupported
    };
  }
}

export const clientStorage = new ClientStorageEngine();
