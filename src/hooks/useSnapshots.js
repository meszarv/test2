import { useState } from "react";
import { labelFor } from "../utils.js";

export default function useSnapshots({ assets, setAssets, liabilities, setLiabilities, assetTypes, liabilityTypes }) {
  const [snapshots, setSnapshots] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  function snapshotFromAssets(nextAssets = assets, nextLiabilities = liabilities, date = new Date()) {
    setSnapshots((prev) => {
      const iso = date.toISOString();
      const month = iso.slice(0, 7);
      const snap = {
        asOf: iso,
        assets: (nextAssets || []).map((a) => ({ ...a })),
        liabilities: (nextLiabilities || []).map((l) => ({ ...l })),
      };
      const existing = prev.findIndex((p) => p.asOf.slice(0, 7) === month);
      let s;
      if (existing >= 0) {
        s = prev.map((p, i) => (i === existing ? snap : p));
        setCurrentIndex(existing);
      } else {
        s = [...prev, snap].sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
        setCurrentIndex(s.indexOf(snap));
      }
      return s;
    });
  }

  function setAssetsAndUpdateSnapshot(nextAssets, nextLiabilities = liabilities) {
    setAssets(nextAssets);
    setLiabilities(nextLiabilities);
    setSnapshots((prev) =>
      prev.map((s, i) =>
        i === currentIndex
          ? {
              ...s,
              assets: (nextAssets || []).map((a) => ({ ...a })),
              liabilities: (nextLiabilities || []).map((l) => ({ ...l })),
            }
          : s
      )
    );
  }

  function handleSelectSnapshot(i) {
    const snap = snapshots[i];
    if (!snap) return;
    setCurrentIndex(i);
    setAssets((snap.assets || []).map((a) => ({ ...a, name: a.name || labelFor(a.type, assetTypes) })));
    setLiabilities(
      (snap.liabilities || []).map((l) => ({
        ...l,
        name: l.name || labelFor(l.type, liabilityTypes),
        priority: !!l.priority,
      }))
    );
  }

  function handleAddSnapshot() {
    snapshotFromAssets(assets, liabilities);
  }

  function handleChangeSnapshotDate(i, date) {
    setSnapshots((prev) => {
      const iso = date.toISOString();
      const month = iso.slice(0, 7);
      if (prev.some((s, idx) => idx !== i && s.asOf.slice(0, 7) === month)) {
        return prev;
      }
      const next = prev
        .map((s, idx) => (idx === i ? { ...s, asOf: iso } : s))
        .sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setCurrentIndex(next.findIndex((s) => s.asOf === iso));
      return next;
    });
  }

  function handleDeleteSnapshot(i) {
    setSnapshots((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      setCurrentIndex(Math.max(0, i - 1));
      return next;
    });
  }

  return {
    snapshots,
    setSnapshots,
    currentIndex,
    setCurrentIndex,
    snapshotFromAssets,
    setAssetsAndUpdateSnapshot,
    handleSelectSnapshot,
    handleAddSnapshot,
    handleChangeSnapshotDate,
    handleDeleteSnapshot,
  };
}
