import {
  cloneDefaults,
  defaultAssetTypes,
  defaultDimensions,
  defaultLiabilityTypes,
  defaultStrategy,
  mergeDimensions,
  mergeStrategy,
  normalizeAsset,
  normalizeStoredAsset,
  validPortfolioScope,
} from "./data.js";

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

export async function encryptPortfolio(data, password) {
  return await encryptJson(data, password);
}

export async function decryptPortfolio(buf, password) {
  return await decryptJson(buf, password);
}

export const DEFAULT_PORTFOLIO = {
  version: 7,
  currency: "EUR",
  assetTypes: cloneDefaults(defaultAssetTypes),
  liabilityTypes: cloneDefaults(defaultLiabilityTypes),
  dimensions: cloneDefaults(defaultDimensions),
  strategy: cloneDefaults(defaultStrategy),
  incomeRecords: [],
  liabilities: [],
  snapshots: [],
};

function stableRecordIds(snapshots, kind) {
  const known = new Map();
  const canonicalById = new Map();
  let counter = 0;
  return (snapshots || []).map((snapshot) => {
    const occurrences = new Map();
    const records = (snapshot[kind] || []).map((record) => {
      const fingerprint = `${record.type || ""}\u0000${record.name || ""}\u0000${record.description || ""}`;
      const occurrence = occurrences.get(fingerprint) || 0;
      occurrences.set(fingerprint, occurrence + 1);
      const lookup = `${fingerprint}\u0000${occurrence}`;
      let id = (record.id && canonicalById.get(record.id)) || known.get(lookup) || record.id;
      if (!id) {
        counter += 1;
        id = `${kind === "assets" ? "asset" : "liability"}-${counter}`;
      }
      if (record.id) canonicalById.set(record.id, id);
      known.set(lookup, id);
      return { ...record, id };
    });
    return { ...snapshot, [kind]: records };
  });
}

export function convertV5ToV6(data) {
  const assetTypes = Object.fromEntries(
    Object.entries(data.assetTypes || defaultAssetTypes).map(([key, definition]) => [
      key,
      { ...definition, dimensionRules: definition.dimensionRules || {} },
    ])
  );
  let snapshots = stableRecordIds(data.snapshots || [], "assets");
  snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => ({
    ...snapshot,
    assets: (snapshot.assets || []).map((asset) => normalizeAsset(asset, assetTypes)),
    liabilities: (snapshot.liabilities || []).map((liability) => ({
      ...liability,
      value: Number(liability.value) || 0,
      priority: !!liability.priority,
    })),
    contributions: Number(snapshot.contributions) || 0,
    withdrawals: Number(snapshot.withdrawals) || 0,
  }));
  const latestLiabilities = snapshots[snapshots.length - 1]?.liabilities || data.liabilities || [];
  const { allocation: legacyAllocation, ...rest } = data;
  return {
    ...rest,
    version: 6,
    currency: data.currency || "EUR",
    assetTypes,
    liabilityTypes: data.liabilityTypes || cloneDefaults(defaultLiabilityTypes),
    dimensions: mergeDimensions(data.dimensions),
    strategy: mergeStrategy(data.strategy, legacyAllocation),
    incomeRecords: data.incomeRecords || [],
    liabilities: latestLiabilities.map((liability) => ({ ...liability, priority: !!liability.priority })),
    snapshots,
  };
}

function assetTypesWithScopeRules(assetTypes = {}) {
  return Object.fromEntries(
    Object.entries(assetTypes).map(([key, definition]) => [
      key,
      {
        ...definition,
        scopeRule: definition.scopeRule || cloneDefaults(defaultAssetTypes[key]?.scopeRule || { mode: "user", value: "" }),
        dimensionRules: definition.dimensionRules || {},
      },
    ])
  );
}

function inferLegacyPortfolioScope(asset = {}) {
  if (asset.isCheckingAccount) return { portfolioScope: "investable", scopeNeedsReview: false };
  if (asset.type === "private_equity" || asset.type === "real_estate") {
    return { portfolioScope: "total", scopeNeedsReview: false };
  }
  if (
    asset.eligibleForInvestment !== false &&
    (asset.type === "stock" || asset.type === "bond" || asset.type === "commodity")
  ) {
    return { portfolioScope: "financial", scopeNeedsReview: false };
  }
  return { portfolioScope: "total", scopeNeedsReview: true };
}

export function convertV6ToV7(data) {
  const assetTypes = assetTypesWithScopeRules(data.assetTypes || cloneDefaults(defaultAssetTypes));
  let snapshots = stableRecordIds(data.snapshots || [], "assets");
  snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => ({
    ...snapshot,
    assets: (snapshot.assets || []).map((asset) => normalizeStoredAsset({
      ...asset,
      ...inferLegacyPortfolioScope(asset),
    }, assetTypes)),
    liabilities: (snapshot.liabilities || []).map((liability) => ({ ...liability, priority: !!liability.priority })),
    contributions: Number(snapshot.contributions) || 0,
    withdrawals: Number(snapshot.withdrawals) || 0,
  }));
  const latestLiabilities = snapshots[snapshots.length - 1]?.liabilities || data.liabilities || [];
  return {
    ...data,
    version: 7,
    currency: data.currency || "EUR",
    assetTypes,
    liabilityTypes: data.liabilityTypes || cloneDefaults(defaultLiabilityTypes),
    dimensions: mergeDimensions(data.dimensions),
    strategy: mergeStrategy(data.strategy),
    incomeRecords: data.incomeRecords || [],
    liabilities: latestLiabilities.map((liability) => ({ ...liability, priority: !!liability.priority })),
    snapshots,
  };
}

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
  if (out.version === 3) {
    out = { ...out, liabilities: out.liabilities || [], version: 4 };
  }
  if (out.version === 4) {
    out = {
      ...out,
      liabilities: (out.liabilities || []).map((l) => ({ priority: false, ...l })),
      snapshots: (out.snapshots || []).map((s) => ({
        ...s,
        liabilities: (s.liabilities || []).map((l) => ({ priority: false, ...l })),
      })),
      version: 5,
    };
  }
  if (out.version === 5) {
    out = convertV5ToV6(out);
  }
  if (out.version === 6) {
    out = convertV6ToV7(out);
  }
  if (out.version === 7) {
    const assetTypes = assetTypesWithScopeRules(out.assetTypes || cloneDefaults(defaultAssetTypes));
    let snapshots = stableRecordIds(out.snapshots || [], "assets");
    snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => ({
      ...snapshot,
      assets: (snapshot.assets || []).map((asset) => normalizeStoredAsset({
        ...asset,
        portfolioScope: validPortfolioScope(asset.portfolioScope) ? asset.portfolioScope : "total",
        scopeNeedsReview: !!asset.scopeNeedsReview,
      }, assetTypes)),
      liabilities: (snapshot.liabilities || []).map((liability) => ({ ...liability, priority: !!liability.priority })),
      contributions: Number(snapshot.contributions) || 0,
      withdrawals: Number(snapshot.withdrawals) || 0,
    }));
    out = {
      ...out,
      version: 7,
      currency: out.currency || "EUR",
      assetTypes,
      liabilityTypes: out.liabilityTypes || cloneDefaults(defaultLiabilityTypes),
      dimensions: out.dimensions || cloneDefaults(defaultDimensions),
      strategy: mergeStrategy(out.strategy),
      incomeRecords: out.incomeRecords || [],
      liabilities: out.liabilities || [],
      snapshots,
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
