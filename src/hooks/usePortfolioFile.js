import { useEffect, useRef, useState } from "react";
import {
  openExistingFile,
  createNewFile,
  getSavedFile,
  readPortfolioFile,
  writePortfolioFile,
  clearSavedFile,
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
  incomeRecords,
  setIncomeRecords,
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
  }, [assetTypes, liabilityTypes, currency, dimensions, strategy, incomeRecords, snapshots]);

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
        ["cash", "Main checking account", 25000],
        ["stock", "Global equity ETF", 60000],
        ["bond", "Government bond ETF", 20000],
        ["real_estate", "Rental property", 100000],
        ["commodity", "Gold ETC", 10000],
      ];
      const sampleAssets = examples.map(([t, name, value]) => {
        const a = mkAsset(t, defaultAssetTypes, name);
        a.value = value;
        a.costBasis = t === "cash" ? value : Math.round(value * 0.8);
        a.eligibleForInvestment = t !== "cash" && t !== "real_estate";
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
      setIncomeRecords([]);
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
      const snaps = (data.snapshots || []).slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setSnapshots(snaps);
      const latest = snaps[snaps.length - 1];
      const at = data.assetTypes || defaultAssetTypes;
      const lt = data.liabilityTypes || defaultLiabilityTypes;
      if (latest) {
        setAssets((latest.assets || []).map((a) => normalizeStoredAsset({ ...a, id: a.id || mkId(), name: a.name || labelFor(a.type, at) }, at)));
        setLiabilities(
          (latest.liabilities || []).map((l) => ({
            ...l,
            id: l.id || mkId(),
            name: l.name || labelFor(l.type, lt),
            priority: !!l.priority,
          }))
        );
        setCurrentIndex(snaps.length - 1);
      } else {
        snapshotFromAssets(assets, liabilities);
      }
      setCurrency(data.currency || "EUR");
      setDimensions(data.dimensions || cloneDefaults(defaultDimensions));
      setStrategy(data.strategy || cloneDefaults(defaultStrategy));
      setIncomeRecords(data.incomeRecords || []);
      setAssetTypes(at);
      setLiabilityTypes(lt);
      setStep("main");
      setDirty(false);
      setLastSavedAt(null);
      skipDirty.current = true;
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
      incomeRecords,
      snapshots,
      liabilities,
    };
  }

  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
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
      skipDirty.current = true;
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
      setIncomeRecords([]);
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setStep("pick");
    });
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
    setDirty,
    skipDirty,
    handleOpenExisting,
    handleCreateNew,
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleCloseFile,
  };
}
