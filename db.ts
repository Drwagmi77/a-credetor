import { Character } from "./types";

const DB_NAME = 'PromptMarketDB';
const STORE_NAME = 'generated_images';
const CHAR_STORE_NAME = 'custom_characters';
const DB_VERSION = 2;

export interface StorageItem {
    key: string;
    size: string;
    rawSize: number;
    preview: string;
    source: 'LocalStorage' | 'SessionStorage' | 'IndexedDB';
    dbName?: string;
    storeName?: string;
    error?: string;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => reject(request.error);
    request.onsuccess = (event) => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      if (!db.objectStoreNames.contains(CHAR_STORE_NAME)) db.createObjectStore(CHAR_STORE_NAME, { keyPath: 'id' });
    };
  });
};

export const saveImageToDB = async (id: string, base64Data: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    tx.objectStore(STORE_NAME).put(base64Data, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllImagesFromDB = async (): Promise<Record<string, string>> => {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.openCursor();
        const results: Record<string, string> = {};
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
            if (cursor) {
                results[cursor.key as string] = cursor.value;
                cursor.continue();
            } else {
                resolve(results);
            }
        };
        request.onerror = () => resolve({});
    } catch { resolve({}); }
  });
};

export const clearAllImagesFromDB = async (): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    return new Promise((resolve) => { tx.oncomplete = () => resolve(); });
};

// --- RAW STORAGE INSPECTOR ---

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Returns a raw list of EVERYTHING in storage, no filtering.
 */
export const inspectAllStorage = async (): Promise<StorageItem[]> => {
    const items: StorageItem[] = [];

    // 1. Inspect LocalStorage
    try {
        if (localStorage.length === 0) {
             // Push a dummy item to say it's empty but checked
             // items.push({ key: 'STATUS', size: '0', rawSize: 0, preview: 'LocalStorage is empty', source: 'LocalStorage' });
        }
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const val = localStorage.getItem(key) || '';
                items.push({
                    key: key,
                    size: formatSize(val.length),
                    rawSize: val.length,
                    preview: val.substring(0, 100).replace(/\n/g, ' '),
                    source: 'LocalStorage'
                });
            }
        }
    } catch (e) { 
        items.push({ key: 'ERROR', size: '0', rawSize: 0, preview: `LS Error: ${e}`, source: 'LocalStorage' });
    }

    // 2. Inspect IndexedDBs
    const dbNamesToCheck = new Set<string>([DB_NAME]); 
    
    if (window.indexedDB && window.indexedDB.databases) {
        try {
            const dbs = await window.indexedDB.databases();
            dbs.forEach(db => { if(db.name) dbNamesToCheck.add(db.name); });
        } catch (e) { console.warn("IDB Enum Fail"); }
    }

    // Force check specific databases
    for (const dbName of Array.from(dbNamesToCheck)) {
        try {
            const db = await new Promise<IDBDatabase>((resolve, reject) => {
                const req = window.indexedDB.open(dbName);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(`Open Error ${req.error}`);
                req.onblocked = () => reject('Blocked'); 
            });

            if (db.objectStoreNames.length > 0) {
                 for (const storeName of Array.from(db.objectStoreNames)) {
                    let count = 0;
                    await new Promise<void>((resolve) => {
                        try {
                            const tx = db.transaction([storeName], 'readonly');
                            const store = tx.objectStore(storeName);
                            const req = store.openCursor();
                            
                            req.onsuccess = (e) => {
                                const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
                                if (cursor) {
                                    count++;
                                    let size = 0;
                                    let preview = "";
                                    
                                    try {
                                        const val = cursor.value;
                                        const str = typeof val === 'string' ? val : JSON.stringify(val);
                                        size = str.length;
                                        preview = str.substring(0, 100).replace(/\n/g, ' ');
                                    } catch {
                                        size = 0;
                                        preview = "[Object]";
                                    }

                                    items.push({
                                        key: `${storeName} / ${cursor.key}`,
                                        size: formatSize(size),
                                        rawSize: size,
                                        preview: preview,
                                        source: 'IndexedDB',
                                        dbName: db.name,
                                        storeName: storeName
                                    });
                                    cursor.continue();
                                } else {
                                    resolve();
                                }
                            };
                            req.onerror = () => {
                                items.push({ key: `${storeName} (Access Denied)`, size: '0', rawSize: 0, preview: 'Error reading store', source: 'IndexedDB' });
                                resolve();
                            };
                        } catch (e) { 
                             items.push({ key: `${storeName} (Tx Error)`, size: '0', rawSize: 0, preview: String(e), source: 'IndexedDB' });
                             resolve(); 
                        }
                    });
                    
                    if (count === 0) {
                        items.push({
                            key: `${storeName} (Empty)`,
                            size: '0 B',
                            rawSize: 0,
                            preview: `Store exists but contains 0 items.`,
                            source: 'IndexedDB',
                            dbName: db.name,
                            storeName: storeName
                        });
                    }
                }
            } else {
                 items.push({
                    key: `${dbName} (No Stores)`,
                    size: '0 B',
                    rawSize: 0,
                    preview: 'Database exists but has no object stores.',
                    source: 'IndexedDB',
                    dbName: db.name
                });
            }
            db.close();
        } catch (e) { 
             items.push({
                key: `${dbName} (Connection Failed)`,
                size: '0 B',
                rawSize: 0,
                preview: String(e),
                source: 'IndexedDB'
            });
        }
    }

    return items.sort((a, b) => b.rawSize - a.rawSize);
};

const getItemContent = async (item: StorageItem): Promise<any> => {
     if (item.source === 'LocalStorage') {
            return localStorage.getItem(item.key);
    } else if (item.source === 'IndexedDB' && item.dbName && item.storeName) {
        // Handle "Empty" or status items
        if (item.key.includes('(Empty)') || item.key.includes('(No Stores)')) return null;

        const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = window.indexedDB.open(item.dbName!);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject("Open failed");
        });
        return new Promise((resolve, reject) => {
            const tx = db.transaction([item.storeName!], 'readonly');
            const store = tx.objectStore(item.storeName!);
            
            // Parse actual key from composite string "storeName / actualKey"
            const actualKeyStr = item.key.split(' / ')[1];
            if (!actualKeyStr) { resolve(null); return; }

            // Try to guess key type
            let key: any = actualKeyStr;
            // If it looks like a number, try number
            if (!isNaN(Number(actualKeyStr))) {
                 // But wait, our IDs are usually strings.
                 // Just try string first.
            }
            
            const getReq = store.get(key);
            getReq.onsuccess = () => {
                if (getReq.result) resolve(getReq.result);
                else {
                    // Retry as number
                     const getReqNum = store.get(Number(key));
                     getReqNum.onsuccess = () => resolve(getReqNum.result);
                     getReqNum.onerror = () => resolve(null);
                }
            };
            getReq.onerror = () => reject("Get failed");
        });
    }
    return null;
}

export const getRawItemContent = async (item: StorageItem): Promise<string | null> => {
    try {
        const content = await getItemContent(item);
        if (!content) return null;
        if (typeof content === 'string') return content;
        return JSON.stringify(content, null, 2);
    } catch (e) {
        return `Error reading item: ${e}`;
    }
};

export const manualImport = async (jsonString: string): Promise<{success: boolean, count: number}> => {
     try {
        let data: any;
        try { data = JSON.parse(jsonString); } catch { return { success: false, count: 0 }; }

        const db = await initDB();
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        let count = 0;
        
        const process = (obj: any) => {
             if (typeof obj === 'string' && obj.startsWith('data:image')) {
                 store.put(obj, `restored_${Date.now()}_${count}`);
                 count++;
             } else if (typeof obj === 'object' && obj !== null) {
                 Object.values(obj).forEach(v => process(v));
             }
        };
        
        process(data);
        
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve({ success: true, count });
            tx.onerror = () => resolve({ success: false, count: 0 });
        });
     } catch {
         return { success: false, count: 0 };
     }
}

export const forceImportItem = async (item: StorageItem): Promise<boolean> => {
    try {
        let content: any = await getItemContent(item);
        if (!content) return false;

        const targetDB = await initDB();
        const tx = targetDB.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        let foundGlobal = false;

        const findAndSave = (obj: any) => {
            let found = false;
            if (typeof obj === 'string') {
                 const cleaned = obj.replace(/\s/g, '');
                 if (cleaned.length > 500 && /[A-Za-z0-9+/]/.test(cleaned.substring(0, 50))) {
                     let finalStr = cleaned;
                     if (!cleaned.startsWith('data:image')) {
                         finalStr = `data:image/png;base64,${cleaned}`;
                     }
                     store.put(finalStr, `forced_${Date.now()}_${Math.random().toString().substring(2,5)}`);
                     found = true;
                 }
            } else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(v => {
                    if (findAndSave(v)) found = true;
                });
            }
            return found;
        };
        
        if (typeof content === 'string') {
             if(findAndSave(content)) foundGlobal = true;
             if (!foundGlobal && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
                try { 
                    const parsed = JSON.parse(content); 
                    if (findAndSave(parsed)) foundGlobal = true;
                } catch {}
             }
        } else {
            if (findAndSave(content)) foundGlobal = true;
        }

        return foundGlobal;
    } catch (e) {
        console.error("Force Import Error", e);
        return false;
    }
};

// ... (Character logic unchanged)
export const saveCharacterToDB = async (character: Character): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([CHAR_STORE_NAME], 'readwrite');
  tx.objectStore(CHAR_STORE_NAME).put(character);
};
export const getCharactersFromDB = async (): Promise<Character[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
      const tx = db.transaction([CHAR_STORE_NAME], 'readonly');
      tx.objectStore(CHAR_STORE_NAME).getAll().onsuccess = (e) => resolve((e.target as IDBRequest).result || []);
  });
};
export const deleteCharacterFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([CHAR_STORE_NAME], 'readwrite');
  tx.objectStore(CHAR_STORE_NAME).delete(id);
};