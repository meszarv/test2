import { useEffect, useRef, useState } from "react";
import {
  openExistingFile,
  createNewFile,
  getSavedFile,
  readPortfolioFile,
  writePortfolioFile,
  clearSavedFile,
  createPortfolioBackup,
  readPortfolioBackup,
  DEFAULT_PORTFOLIO,
} from "../file.js";
import { openDriveFile, readDrivePortfolioFile, writeDrivePortfolioFile } from "../drive.js";
import {
  cloneDefaults,
  defaultAssetTypes,
  defaultDimensions,
  defaultLiabilityTypes,
  defaultStrategy,
  mergeStrategy,
  normalizeAsset,
  normalizeStoredAsset,
} from "../data.js";
import { mkId, labelFor, mkAsset } from "../utils.js";

export default function usePortfolioFile({
  assets,
  setAssets,
  liabilities,
  setLiabilities,
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  currency,
  setCurrency,
  dimensions,
  setDimensions,
  strategy,
  setStrategy,
  snapshots,
  setSnapshots,
  snapshotFromAssets,
  setCurrentIndex,
}) {
  const [password, setPassword] = useState("");
  const [fileHandle, setFileHandle] = useState(null);
  const [driveFileId, setDriveFileId] = useState(null);
  const [step, setStep] = useState("pick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const skipDirty = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedFile();
        if (saved && saved.queryPermission) {
          const perm = await saved.queryPermission({ mode: "readwrite" });
          if (perm === "granted" || perm === "prompt") {
            setFileHandle(saved);
            setStep("password");
          } else {
            await clearSavedFile();
          }
        }
      } catch (e) {
        console.warn("No saved handle", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    setDirty(true);
  }, [assetTypes, liabilityTypes, currency, dimensions, strategy, snapshots]);

  useEffect(() => {
    function beforeUnload(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  async function handleOpenExisting() {
    try {
      const h = await openExistingFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }

  async function handleCreateNew() {
    try {
      const h = await createNewFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }

  function handleOpenDrive() {
    setDriveFileId("");
    setFileHandle(null);
    setStep("password");
  }

  async function handleOpenSample() {
    setLoading(true);
    setError(null);
    try {
      const examples = [
        { type: "cash", name: "Main checking account", value: 25000, reserveToKeep: 6000 },
        { type: "cash", name: "Household checking account", value: 5000, reserveToKeep: "" },
        { type: "cash", name: "Investment cash", value: 1000, portfolioScope: "financial", isInvestmentCashAccount: true },
        { type: "stock", name: "Global equity ETF", value: 60000 },
        { type: "bond", name: "Government bond ETF", value: 20000 },
        { type: "real_estate", name: "Rental property", value: 100000 },
        { type: "commodity", name: "Gold ETC", value: 10000 },
      ];
      const sampleAssets = examples.map(({ type, name, value, ...overrides }) => {
        const a = mkAsset(type, defaultAssetTypes, name);
        a.value = value;
        a.eligibleForInvestment = type !== "cash" && type !== "real_estate";
        Object.assign(a, overrides);
        return normalizeAsset(a, defaultAssetTypes);
      });
      const sampleSnapshots = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const snapAssets = sampleAssets.map((a) => ({
          ...a,
          value: Math.round(a.value * (0.8 + Math.random() * 0.4)),
        }));
        sampleSnapshots.push({ asOf: d.toISOString(), assets: snapAssets, liabilities: [] });
      }
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setCurrency("EUR");
      setDimensions(cloneDefaults(defaultDimensions));
      setStrategy(mergeStrategy({
        cashReserveTarget: 10000,
        dimensionPolicies: {
          asset_type: {
            mode: "target",
            tolerance: 2,
            importance: 3,
            categories: {
              stock: { target: 65 },
              bond: { target: 25 },
              commodity: { target: 10 },
            },
          },
        },
      }));
      setSnapshots(sampleSnapshots);
      setAssets(sampleSnapshots[sampleSnapshots.length - 1].assets);
      setLiabilities([]);
      setCurrentIndex(sampleSnapshots.length - 1);
      setStep("main");
      setDirty(false);
      setLastSavedAt(null);
      skipDirty.current = true;
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function applyPortfolioData(data, { markDirty = false } = {}) {
    const snaps = (data.snapshots || []).slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
    const at = data.assetTypes || defaultAssetTypes;
    const lt = data.liabilityTypes || defaultLiabilityTypes;
    setSnapshots(snaps);
    const latest = snaps[snaps.length - 1];
    if (latest) {
      setAssets((latest.assets || []).map((a) => normalizeStoredAsset({ ...a, id: a.id || mkId(), name: a.name || labelFor(a.type, at) }, at)));
      setLiabilities(
        (latest.liabilities || []).map((l) => ({
          ...l,
          id: l.id || mkId(),
          name: l.name || labelFor(l.type, lt),
        }))
      );
      setCurrentIndex(snaps.length - 1);
    } else {
      setAssets([]);
      setLiabilities([]);
      snapshotFromAssets([], []);
    }
    setCurrency(data.currency || "EUR");
    setDimensions(data.dimensions || cloneDefaults(defaultDimensions));
    setStrategy(data.strategy || cloneDefaults(defaultStrategy));
    setAssetTypes(at);
    setLiabilityTypes(lt);
    setStep("main");
    setDirty(markDirty);
    setLastSavedAt(null);
    skipDirty.current = true;
  }

  async function handleLoad() {
    if (!fileHandle && driveFileId === null) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    setLoading(true);
    setError(null);
    try {
      let data;
      if (driveFileId !== null) {
        let id = driveFileId;
        if (!id) {
          id = await openDriveFile(password);
          if (!id) {
            setError("Select or create a Google Drive file.");
            return;
          }
          setDriveFileId(id);
        }
        data = await readDrivePortfolioFile(id, password);
      } else {
        const file = await fileHandle.getFile();
        const isEmpty = file.size === 0;
        data = await readPortfolioFile(fileHandle, password);
        if (isEmpty) {
          await writePortfolioFile(fileHandle, password, data);
        }
      }
      applyPortfolioData(data);
    } catch (e) {
      if (e && (e.name === "NotAllowedError" || e.name === "NotFoundError")) {
        await clearSavedFile();
        setFileHandle(null);
        setStep("pick");
        setError("Cannot access saved file. Please pick it again.");
      } else {
        setError(e && e.message ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  function buildPortfolioData() {
    return {
      ...DEFAULT_PORTFOLIO,
      currency,
      assetTypes,
      liabilityTypes,
      dimensions,
      strategy,
      snapshots,
    };
  }

  async function withLoading(fn, failureHint = "") {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e && e.message ? e.message : String(e);
      setError(failureHint ? `${message} ${failureHint}` : message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!fileHandle && !driveFileId) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    return withLoading(async () => {
      const data = buildPortfolioData();
      if (driveFileId) {
        const id = await writeDrivePortfolioFile(driveFileId, password, data);
        setDriveFileId(id);
      } else {
        await writePortfolioFile(fileHandle, password, data);
      }
      setDirty(false);
      setLastSavedAt(new Date());
    }, "Your changes are still in memory. Export a backup before closing or reloading the page.");
  }

  async function handleExportBackup(format, backupPassword) {
    return withLoading(async () => {
      const backup = await createPortfolioBackup(buildPortfolioData(), format, backupPassword);
      const blob = new Blob([backup.contents], { type: backup.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.${backup.extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      return true;
    });
  }

  async function handleImportBackup(file, backupPassword) {
    return withLoading(async () => {
      const data = await readPortfolioBackup(file, backupPassword);
      applyPortfolioData(data, { markDirty: true });
      return true;
    });
  }

  async function handleCloseFile({ save = false } = {}) {
    return withLoading(async () => {
      if (save) {
        if (!fileHandle && !driveFileId) throw new Error("This portfolio has no file to save to.");
        const data = buildPortfolioData();
        if (driveFileId) await writeDrivePortfolioFile(driveFileId, password, data);
        else await writePortfolioFile(fileHandle, password, data);
      }
      if (driveFileId) setDriveFileId(null);
      if (fileHandle) {
        await clearSavedFile();
        setFileHandle(null);
      }
      setDirty(false);
      setLastSavedAt(null);
      skipDirty.current = true;
      setPassword("");
      setSnapshots([]);
      setCurrentIndex(0);
      setAssets([]);
      setLiabilities([]);
      snapshotFromAssets([], []);
      setCurrency(DEFAULT_PORTFOLIO.currency);
      setDimensions(cloneDefaults(defaultDimensions));
      setStrategy(cloneDefaults(defaultStrategy));
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setStep("pick");
    }, save ? "Your changes are still in memory. Export a backup before closing or reloading the page." : "");
  }

  return {
    password,
    setPassword,
    fileHandle,
    setFileHandle,
    step,
    setStep,
    loading,
    error,
    setError,
    dirty,
    lastSavedAt,
    canSave: Boolean(fileHandle || driveFileId),
    handleOpenExisting,
    handleCreateNew,
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleExportBackup,
    handleImportBackup,
    handleCloseFile,
  };
}
