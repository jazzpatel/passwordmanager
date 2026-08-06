import { DB_NAME, STORE_NAME } from "../constants/index.js";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME))
        db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e);
  });
}

export async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(key);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e);
  });
}

export async function dbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME)
      .put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

export async function dbPutMultiple(entries) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const { key, value } of entries) store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e);
    tx.onabort = (e) => reject(e);
  });
}

export async function dbGetAllEntries() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).openCursor();
    const entries = [];
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (!cursor) {
        resolve(entries);
        return;
      }
      entries.push({ key: cursor.key, value: cursor.value });
      cursor.continue();
    };
    req.onerror = () => resolve([]);
  });
}
