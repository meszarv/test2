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
        assets: (nextAssets || []).map((a) => ({ ...a, dimensions: JSON.parse(JSON.stringify(a.dimensions || {})) })),
        liabilities: (nextLiabilities || []).map((l) => ({ ...l })),
        contributions: 0,
        withdrawals: 0,
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
              assets: (nextAssets || []).map((a) => ({ ...a, dimensions: JSON.parse(JSON.stringify(a.dimensions || {})) })),
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
    setAssets((snap.assets || []).map((a) => ({
      ...a,
      dimensions: JSON.parse(JSON.stringify(a.dimensions || {})),
      name: a.name || labelFor(a.type, assetTypes),
    })));
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

  function handleChangeSnapshotCashFlow(i, contributions, withdrawals) {
    setSnapshots((prev) => prev.map((snapshot, index) => index === i
      ? {
          ...snapshot,
          contributions: Number(contributions) || 0,
          withdrawals: Number(withdrawals) || 0,
        }
      : snapshot));
  }

  function handleDeleteSnapshot(i) {
    setSnapshots((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      const nextIndex = Math.max(0, Math.min(i - 1, next.length - 1));
      setCurrentIndex(nextIndex);
      const selected = next[nextIndex];
      setAssets((selected?.assets || []).map((asset) => ({
        ...asset,
        dimensions: JSON.parse(JSON.stringify(asset.dimensions || {})),
      })));
      setLiabilities((selected?.liabilities || []).map((liability) => ({ ...liability })));
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
    handleChangeSnapshotCashFlow,
    handleDeleteSnapshot,
  };
}
