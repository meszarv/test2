import { useState } from "react";
import { mkAsset } from "../utils.js";

export default function useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset }) {
  const [assetToDelete, setAssetToDelete] = useState(null);

  function addAsset({ name, type, description, value }) {
    const asset = mkAsset(type, assetTypes, name);
    asset.description = description;
    asset.value = value;
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
      setAssetsAndUpdateSnapshot(assets.filter((x) => x.id !== assetToDelete.id));
      setAssetToDelete(null);
    }
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
  };
}
