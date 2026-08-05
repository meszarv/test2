import { useState } from "react";
import { normalizeAsset } from "../data.js";
import { mkAsset } from "../utils.js";

export default function useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset }) {
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deletedAsset, setDeletedAsset] = useState(null);

  function addAsset(input) {
    const base = mkAsset(input.type, assetTypes, input.name);
    const asset = normalizeAsset({ ...base, ...input, id: base.id }, assetTypes);
    setAssetsAndUpdateSnapshot([...assets, asset]);
  }

  function updateAsset(updated) {
    setAssetsAndUpdateSnapshot(assets.map((a) => (a.id === updated.id ? updated : a)));
  }

  function requestDeleteAsset(asset) {
    if (!asset) return;
    if (setEditAsset) setEditAsset(null);
    setAssetToDelete(asset);
  }

  function confirmDeleteAsset() {
    if (assetToDelete) {
      setDeletedAsset({ asset: assetToDelete, index: assets.findIndex((asset) => asset.id === assetToDelete.id) });
      setAssetsAndUpdateSnapshot(assets.filter((x) => x.id !== assetToDelete.id));
      setAssetToDelete(null);
    }
  }

  function undoDeleteAsset() {
    if (!deletedAsset) return;
    const next = [...assets];
    next.splice(Math.max(0, Math.min(deletedAsset.index, next.length)), 0, deletedAsset.asset);
    setAssetsAndUpdateSnapshot(next);
    setDeletedAsset(null);
  }

  function cancelDeleteAsset() {
    setAssetToDelete(null);
  }

  return {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset,
    deletedAsset,
    undoDeleteAsset,
    clearDeletedAsset: () => setDeletedAsset(null),
  };
}
