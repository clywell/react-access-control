import { StorageAdapter } from '../core/types';

// AsyncStorage interface for React Native
interface AsyncStorageInterface {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

/**
 * Async storage adapter for React Native
 * Works with @react-native-async-storage/async-storage
 */
export class AsyncStorageAdapter implements StorageAdapter {
    private asyncStorage: AsyncStorageInterface;
    private prefix: string;

    constructor(asyncStorage: AsyncStorageInterface, prefix = 'access-control') {
        this.asyncStorage = asyncStorage;
        this.prefix = prefix;
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`;
    }

    async getItem(key: string): Promise<string | null> {
        try {
            return await this.asyncStorage.getItem(this.getKey(key));
        } catch {
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            await this.asyncStorage.setItem(this.getKey(key), value);
        } catch {
            // Silently fail if AsyncStorage is not available
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            await this.asyncStorage.removeItem(this.getKey(key));
        } catch {
            // Silently fail if AsyncStorage is not available
        }
    }
}

/**
 * IndexedDB storage adapter for modern browsers
 * Provides more storage capacity than localStorage
 */
export class IndexedDBStorageAdapter implements StorageAdapter {
    private dbName: string;
    private storeName: string;
    private version: number;

    constructor(dbName = 'access-control-db', storeName = 'access-control-store', version = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
    }

    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    async getItem(key: string): Promise<string | null> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);

            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result || null);
            });
        } catch {
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            return new Promise((resolve, reject) => {
                const request = store.put(value, key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        } catch {
            // Silently fail if IndexedDB is not available
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            return new Promise((resolve, reject) => {
                const request = store.delete(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        } catch {
            // Silently fail if IndexedDB is not available
        }
    }
}

/**
 * Encrypted storage adapter
 * Encrypts data before storing using a simple encryption algorithm
 */
export class EncryptedStorageAdapter implements StorageAdapter {
    private baseAdapter: StorageAdapter;
    private secretKey: string;

    constructor(baseAdapter: StorageAdapter, secretKey: string) {
        this.baseAdapter = baseAdapter;
        this.secretKey = secretKey;
    }

    private encrypt(text: string): string {
        // Simple XOR encryption - in production, use a proper encryption library
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result); // Base64 encode
    }

    private decrypt(encryptedText: string): string {
        try {
            const text = atob(encryptedText); // Base64 decode
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch {
            return '';
        }
    }

    async getItem(key: string): Promise<string | null> {
        const encryptedValue = await this.baseAdapter.getItem(key);
        if (!encryptedValue) return null;

        try {
            return this.decrypt(encryptedValue);
        } catch {
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        const encryptedValue = this.encrypt(value);
        await this.baseAdapter.setItem(key, encryptedValue);
    }

    async removeItem(key: string): Promise<void> {
        await this.baseAdapter.removeItem(key);
    }
}

/**
 * Multi-tier storage adapter
 * Tries multiple storage methods in order of preference
 */
export class MultiTierStorageAdapter implements StorageAdapter {
    private adapters: StorageAdapter[];

    constructor(adapters: StorageAdapter[]) {
        this.adapters = adapters;
    }

    async getItem(key: string): Promise<string | null> {
        for (const adapter of this.adapters) {
            try {
                const result = await adapter.getItem(key);
                if (result !== null) return result;
            } catch {
                // Try next adapter
                continue;
            }
        }
        return null;
    }

    async setItem(key: string, value: string): Promise<void> {
        // Try to store in all adapters, but don't fail if some fail
        const promises = this.adapters.map(async (adapter) => {
            try {
                await adapter.setItem(key, value);
            } catch {
                // Ignore errors from individual adapters
            }
        });

        await Promise.allSettled(promises);
    }

    async removeItem(key: string): Promise<void> {
        const promises = this.adapters.map(async (adapter) => {
            try {
                await adapter.removeItem(key);
            } catch {
                // Ignore errors from individual adapters
            }
        });

        await Promise.allSettled(promises);
    }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { AsyncStorageAdapter } from '@clywell/react-access-control/adapters/storage';
 * 
 * const storageAdapter = new AsyncStorageAdapter(AsyncStorage);
 * ```
 * 
 * ```typescript
 * import { 
 *   IndexedDBStorageAdapter, 
 *   LocalStorageAdapter,
 *   MultiTierStorageAdapter 
 * } from '@clywell/react-access-control/adapters/storage';
 * 
 * const storageAdapter = new MultiTierStorageAdapter([
 *   new IndexedDBStorageAdapter(),
 *   new LocalStorageAdapter()
 * ]);
 * ```
 */