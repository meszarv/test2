import { defaultAssetTypes, defaultLiabilityTypes } from "./data.js";

const DB_NAME = "portfolio-tracker-db";
const STORE = "handles";

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const MAGIC = new TextEncoder().encode("PTv1.enc"); // 8 bytes

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function concatBytes(...parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

async function encryptJson(obj, password) {
  const plaintext = new TextEncoder().encode(JSON.stringify(obj, null, 2));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const payload = concatBytes(new Uint8Array(MAGIC), salt, iv, ciphertext);
  return payload;
}

async function decryptJson(buf, password) {
  const data = new Uint8Array(buf);
  const magic = data.slice(0, 8);
  if (!equalBytes(magic, MAGIC)) throw new Error("Invalid file format");
  const salt = data.slice(8, 24);
  const iv = data.slice(24, 36);
  const ciphertext = data.slice(36);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  const json = new TextDecoder().decode(new Uint8Array(plaintext));
  return JSON.parse(json);
}

function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export const DEFAULT_PORTFOLIO = {
  version: 3,
  currency: "USD",
  assetTypes: defaultAssetTypes,
  liabilityTypes: defaultLiabilityTypes,
  allocation: {},
  snapshots: [],
};

export function upgradePortfolio(data) {
  if (!data || typeof data !== "object") return DEFAULT_PORTFOLIO;
  let out = { ...data };
  if (out.version === 1) {
    out = { currency: "USD", ...out, version: 2 };
  }
  if (out.version === 2) {
    out = {
      ...out,
      liabilityTypes: defaultLiabilityTypes,
      snapshots: (out.snapshots || []).map((s) => ({ ...s, liabilities: s.liabilities || [] })),
      version: 3,
    };
  }
  return out;
}

export async function openExistingFile() {
  // @ts-ignore
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }],
  });
  await idbSet("fileHandle", handle);
  return handle;
}

export async function createNewFile() {
  // @ts-ignore
  const handle = await window.showSaveFilePicker({
    suggestedName: "portfolio.enc",
    types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }],
  });
  await idbSet("fileHandle", handle);
  const writable = await handle.createWritable();
  await writable.close();
  return handle;
}

export async function getSavedFile() {
  const handle = await idbGet("fileHandle");
  return handle;
}

export async function clearSavedFile() {
  await idbSet("fileHandle", null);
}

export async function readPortfolioFile(handle, password) {
  const file = await handle.getFile();
  if (file.size === 0) return DEFAULT_PORTFOLIO;
  const buf = await file.arrayBuffer();
  const data = await decryptJson(buf, password);
  return upgradePortfolio(data);
}

export async function writePortfolioFile(handle, password, data) {
  const payload = await encryptJson(data, password);
  const writable = await handle.createWritable();
  await writable.write(payload);
  await writable.close();
}
