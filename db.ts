import { Character } from "./types";

const DB_NAME = 'PromptMarketDB';
const STORE_NAME = 'generated_images';
const CHAR_STORE_NAME = 'custom_characters';
const DB_VERSION = 2; // Incremented version for new store

/**
 * Opens the IndexedDB database.
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      
      if (!db.objectStoreNames.contains(CHAR_STORE_NAME)) {
        // Create store for characters with 'id' as keyPath
        db.createObjectStore(CHAR_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Saves a base64 image string to the database associated with a specific ID.
 */
export const saveImageToDB = async (id: string, base64Data: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(base64Data, id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Retrieves all saved images from the database.
 * Returns a map of { [id]: base64String }
 */
export const getAllImagesFromDB = async (): Promise<Record<string, string>> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
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

    request.onerror = () => reject(request.error);
  });
};

/**
 * Clears all images from the database.
 */
export const clearAllImagesFromDB = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Saves a Custom Character to DB
 */
export const saveCharacterToDB = async (character: Character): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(CHAR_STORE_NAME);
    const request = store.put(character);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Gets all custom characters
 */
export const getCharactersFromDB = async (): Promise<Character[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAR_STORE_NAME], 'readonly');
    const store = transaction.objectStore(CHAR_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Deletes a character
 */
export const deleteCharacterFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(CHAR_STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};