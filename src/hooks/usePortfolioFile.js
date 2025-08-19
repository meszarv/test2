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
import { defaultAssetTypes, defaultLiabilityTypes } from "../data.js";
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
  allocation,
  setAllocation,
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
  }, [assetTypes, liabilityTypes, allocation, snapshots]);

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
      const types = Object.keys(defaultAssetTypes);
      const sampleAssets = Array.from({ length: 5 }, (_, i) => {
        const t = types[Math.floor(Math.random() * types.length)];
        const a = mkAsset(t, defaultAssetTypes, `Sample ${i + 1}`);
        a.value = Math.round(Math.random() * 50000);
        return a;
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
      setAllocation({});
      setSnapshots(sampleSnapshots);
      setAssets(sampleSnapshots[sampleSnapshots.length - 1].assets);
      setLiabilities([]);
      setCurrentIndex(sampleSnapshots.length - 1);
      setStep("main");
      setDirty(false);
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
        setAssets((latest.assets || []).map((a) => ({ ...a, id: mkId(), name: a.name || labelFor(a.type, at) })));
        setLiabilities(
          (latest.liabilities || []).map((l) => ({
            ...l,
            id: mkId(),
            name: l.name || labelFor(l.type, lt),
            priority: !!l.priority,
          }))
        );
        setCurrentIndex(snaps.length - 1);
      } else {
        snapshotFromAssets(assets, liabilities);
      }
      setAllocation(data.allocation || {});
      setAssetTypes(at);
      setLiabilityTypes(lt);
      setStep("main");
      setDirty(false);
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
    return { ...DEFAULT_PORTFOLIO, assetTypes, liabilityTypes, allocation, snapshots, liabilities };
  }

  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!fileHandle && !driveFileId) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    await withLoading(async () => {
      const data = buildPortfolioData();
      if (driveFileId) {
        const id = await writeDrivePortfolioFile(driveFileId, password, data);
        setDriveFileId(id);
      } else {
        await writePortfolioFile(fileHandle, password, data);
      }
      setDirty(false);
      skipDirty.current = true;
    });
  }

  async function handleCloseFile() {
    if (!fileHandle && !driveFileId) return;
    await withLoading(async () => {
      const data = buildPortfolioData();
      if (driveFileId) {
        await writeDrivePortfolioFile(driveFileId, password, data);
        setDriveFileId(null);
      } else {
        await writePortfolioFile(fileHandle, password, data);
        await clearSavedFile();
        setFileHandle(null);
      }
      setDirty(false);
      skipDirty.current = true;
      setPassword("");
      setSnapshots([]);
      setCurrentIndex(0);
      setAssets([]);
      setLiabilities([]);
      snapshotFromAssets([], []);
      setAllocation({});
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
