import { useEffect, useRef, useState } from "react";
import {
  openExistingFile,
  createNewFile,
  getSavedFile,
  readPortfolioFile,
  writePortfolioFile,
  clearSavedFile,
} from "../file.js";
import { defaultAssetTypes } from "../data.js";
import { mkAsset, mkId, labelFor } from "../utils.js";

export default function usePortfolioFile({
  assets,
  setAssets,
  assetTypes,
  setAssetTypes,
  allocation,
  setAllocation,
  snapshots,
  setSnapshots,
  snapshotFromAssets,
  setCurrentIndex,
}) {
  const [password, setPassword] = useState("");
  const [fileHandle, setFileHandle] = useState(null);
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
  }, [assetTypes, allocation, snapshots]);

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

  async function handleLoad() {
    if (!fileHandle || !password) return setError("Pick a file and enter password first.");
    setLoading(true);
    setError(null);
    try {
      const file = await fileHandle.getFile();
      const isEmpty = file.size === 0;
      const data = await readPortfolioFile(fileHandle, password);
      if (isEmpty) {
        await writePortfolioFile(fileHandle, password, data);
      }
      const snaps = (data.snapshots || []).slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setSnapshots(snaps);
      const latest = snaps[snaps.length - 1];
      if (latest) {
        setAssets((latest.assets || []).map((a) => ({ ...a, id: mkId(), name: a.name || labelFor(a.type, assetTypes) })));
        setCurrentIndex(snaps.length - 1);
      } else {
        snapshotFromAssets(assets);
      }
      setAllocation(data.allocation || {});
      setAssetTypes(data.assetTypes || defaultAssetTypes);
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

  async function handleSave() {
    if (!fileHandle || !password) return setError("Pick a file and enter password first.");
    setLoading(true);
    setError(null);
    try {
      const data = { version: 1, assetTypes, allocation, snapshots };
      await writePortfolioFile(fileHandle, password, data);
      setDirty(false);
      skipDirty.current = true;
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseFile() {
    if (!fileHandle) return;
    setLoading(true);
    setError(null);
    try {
      const data = { version: 1, assetTypes, allocation, snapshots };
      await writePortfolioFile(fileHandle, password, data);
      setDirty(false);
      skipDirty.current = true;
      await clearSavedFile();
      setFileHandle(null);
      setPassword("");
      setSnapshots([]);
      setCurrentIndex(0);
      const initialAssets = [
        mkAsset("cash", defaultAssetTypes, "Cash"),
        mkAsset("real_estate", defaultAssetTypes, "Real estate"),
        mkAsset("stock", defaultAssetTypes, "Stock"),
      ];
      setAssets(initialAssets);
      snapshotFromAssets(initialAssets);
      setAllocation({ cash: 20, real_estate: 50, stock: 30 });
      setStep("pick");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
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
    handleLoad,
    handleSave,
    handleCloseFile,
  };
}
