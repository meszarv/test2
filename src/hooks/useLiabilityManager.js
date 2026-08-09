import { useState } from "react";
import { mkId } from "../utils.js";

export default function useLiabilityManager({ assets, liabilities, liabilityTypes, setAssetsAndUpdateSnapshot, setEditLiability }) {
  const [liabilityToDelete, setLiabilityToDelete] = useState(null);
  const [deletedLiability, setDeletedLiability] = useState(null);

  function addLiability({ name, type, description, value }) {
    const liability = { id: mkId(), name, type, description, value };
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
      setDeletedLiability({ liability: liabilityToDelete, index: liabilities.findIndex((liability) => liability.id === liabilityToDelete.id) });
      setAssetsAndUpdateSnapshot(
        assets,
        liabilities.filter((x) => x.id !== liabilityToDelete.id)
      );
      setLiabilityToDelete(null);
    }
  }

  function undoDeleteLiability() {
    if (!deletedLiability) return;
    const next = [...liabilities];
    next.splice(Math.max(0, Math.min(deletedLiability.index, next.length)), 0, deletedLiability.liability);
    setAssetsAndUpdateSnapshot(assets, next);
    setDeletedLiability(null);
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
    deletedLiability,
    undoDeleteLiability,
    clearDeletedLiability: () => setDeletedLiability(null),
  };
}
