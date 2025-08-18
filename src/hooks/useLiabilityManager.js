import { useState } from "react";
import { mkAsset } from "../utils.js";

export default function useLiabilityManager({ assets, liabilities, liabilityTypes, setAssetsAndUpdateSnapshot, setEditLiability }) {
  const [liabilityToDelete, setLiabilityToDelete] = useState(null);

  function addLiability({ name, type, description, value }) {
    const liability = mkAsset(type, liabilityTypes, name);
    liability.description = description;
    liability.value = value;
    liability.priority = false;
    setAssetsAndUpdateSnapshot(assets, [...liabilities, liability]);
  }

  function updateLiability(updated) {
    setAssetsAndUpdateSnapshot(
      assets,
      liabilities.map((l) => (l.id === updated.id ? updated : l))
    );
  }

  function requestDeleteLiability(liability) {
    if (!liability) return;
    if (setEditLiability) setEditLiability(null);
    setLiabilityToDelete(liability);
  }

  function confirmDeleteLiability() {
    if (liabilityToDelete) {
      setAssetsAndUpdateSnapshot(
        assets,
        liabilities.filter((x) => x.id !== liabilityToDelete.id)
      );
      setLiabilityToDelete(null);
    }
  }

  function cancelDeleteLiability() {
    setLiabilityToDelete(null);
  }

  return {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability,
  };
}
