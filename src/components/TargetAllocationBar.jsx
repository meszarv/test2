import { useRef } from "react";
import { colorForCategory } from "../utils.js";

export const TARGET_TOTAL_UNITS = 100;
export const MIN_TARGET_UNITS = 1;

function toUnits(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function toPercent(units) {
  return Math.round(units);
}

function fromUnits(entries) {
  return Object.fromEntries(entries.map(([key, units]) => [key, toPercent(units)]));
}

function normalizedUnitEntries(targets = {}) {
  const entries = Object.entries(targets).filter(([, value]) => Number(value) > 0);
  if (entries.length === 0) return [];
  const total = entries.reduce((sum, [, value]) => sum + Number(value), 0);
  const scaled = entries.map(([key, value], index) => {
    const exact = (Number(value) / total) * TARGET_TOTAL_UNITS;
    return { key, index, exact, units: Math.max(MIN_TARGET_UNITS, Math.floor(exact)) };
  });
  let difference = TARGET_TOTAL_UNITS - scaled.reduce((sum, entry) => sum + entry.units, 0);
  if (difference > 0) {
    const recipients = [...scaled].sort((a, b) => (b.exact - b.units) - (a.exact - a.units) || a.index - b.index);
    for (let index = 0; difference > 0; index = (index + 1) % recipients.length) {
      recipients[index].units += 1;
      difference -= 1;
    }
  } else if (difference < 0) {
    const donors = [...scaled].sort((a, b) => b.units - a.units || a.index - b.index);
    for (const donor of donors) {
      const available = donor.units - MIN_TARGET_UNITS;
      const transfer = Math.min(available, -difference);
      donor.units -= transfer;
      difference += transfer;
      if (difference === 0) break;
    }
  }
  return scaled.sort((a, b) => a.index - b.index).map(({ key, units }) => [key, units]);
}

export function normalizeTargetAllocations(targets = {}) {
  return fromUnits(normalizedUnitEntries(targets));
}

export function addTargetAllocation(targets = {}, category, initialPercent = 5) {
  if (!category) return normalizeTargetAllocations(targets);
  const entries = normalizedUnitEntries(targets).filter(([key]) => key !== category);
  if (entries.length === 0) return { [category]: 100 };
  const donor = [...entries].sort((a, b) => b[1] - a[1])[0];
  const requested = Math.max(MIN_TARGET_UNITS, toUnits(initialPercent));
  const newUnits = Math.max(MIN_TARGET_UNITS, Math.min(requested, donor[1] - MIN_TARGET_UNITS, Math.floor(donor[1] / 2)));
  donor[1] -= newUnits;
  entries.push([category, newUnits]);
  return fromUnits(entries);
}

export function removeTargetAllocation(targets = {}, category) {
  const entries = normalizedUnitEntries(targets);
  if (entries.length <= 1 || !entries.some(([key]) => key === category)) return fromUnits(entries);
  const removed = entries.find(([key]) => key === category)[1];
  const remaining = entries.filter(([key]) => key !== category);
  const recipient = [...remaining].sort((a, b) => b[1] - a[1])[0];
  recipient[1] += removed;
  return fromUnits(remaining);
}

export function setTargetAllocation(targets = {}, category, value) {
  const entries = normalizedUnitEntries(targets);
  const current = entries.find(([key]) => key === category);
  if (!current) return fromUnits(entries);
  if (entries.length === 1) return { [category]: 100 };
  const maximum = TARGET_TOTAL_UNITS - MIN_TARGET_UNITS * (entries.length - 1);
  const desired = Math.max(MIN_TARGET_UNITS, Math.min(maximum, toUnits(value)));
  let difference = desired - current[1];
  current[1] = desired;
  const others = entries.filter(([key]) => key !== category).sort((a, b) => b[1] - a[1]);
  if (difference > 0) {
    for (const donor of others) {
      const transfer = Math.min(donor[1] - MIN_TARGET_UNITS, difference);
      donor[1] -= transfer;
      difference -= transfer;
      if (difference === 0) break;
    }
  } else if (difference < 0) {
    others[0][1] += -difference;
  }
  return fromUnits(entries);
}

export function adjustAdjacentTargets(targets = {}, leftCategory, rightCategory, desiredLeftPercent) {
  const entries = normalizedUnitEntries(targets);
  const left = entries.find(([key]) => key === leftCategory);
  const right = entries.find(([key]) => key === rightCategory);
  if (!left || !right) return fromUnits(entries);
  const combined = left[1] + right[1];
  const desiredLeft = Math.max(MIN_TARGET_UNITS, Math.min(combined - MIN_TARGET_UNITS, toUnits(desiredLeftPercent)));
  left[1] = desiredLeft;
  right[1] = combined - desiredLeft;
  return fromUnits(entries);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export default function TargetAllocationBar({ allocations, labels = {}, onChange, ariaLabel = "Target allocation" }) {
  const barRef = useRef(null);
  const draggingRef = useRef(null);
  const normalized = normalizeTargetAllocations(allocations);
  const entries = Object.entries(normalized);
  let cumulativeUnits = 0;
  const boundaries = entries.slice(0, -1).map(([key, value], index) => {
    cumulativeUnits += toUnits(value);
    return {
      index,
      leftCategory: key,
      rightCategory: entries[index + 1][0],
      cumulativeUnits,
      prefixUnits: cumulativeUnits - toUnits(value),
    };
  });

  function labelFor(category) {
    return labels[category]?.name || labels[category] || category;
  }

  function applyBoundaryClientX(boundary, clientX) {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const pointerUnits = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * TARGET_TOTAL_UNITS);
    const desiredLeftUnits = pointerUnits - boundary.prefixUnits;
    onChange(adjustAdjacentTargets(normalized, boundary.leftCategory, boundary.rightCategory, toPercent(desiredLeftUnits)));
  }

  function adjustBoundary(boundary, deltaUnits) {
    const currentLeftUnits = toUnits(normalized[boundary.leftCategory]);
    onChange(adjustAdjacentTargets(
      normalized,
      boundary.leftCategory,
      boundary.rightCategory,
      toPercent(currentLeftUnits + deltaUnits),
    ));
  }

  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3" data-target-allocation-bar>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h5 className="text-sm font-medium text-zinc-200">Visual allocation</h5>
          <p className="mt-0.5 text-xs text-zinc-500">Drag a divider to adjust its two neighbouring categories. Arrow keys move 1%.</p>
        </div>
        <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-medium text-emerald-300">100%</span>
      </div>
      <div ref={barRef} role="group" aria-label={ariaLabel} className="relative touch-none select-none">
        <div className="flex h-14 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
          {entries.map(([category, value]) => (
            <div
              key={category}
              className="flex min-w-0 items-center justify-center overflow-hidden px-1 text-center text-xs font-semibold text-zinc-950"
              style={{ width: `${value}%`, backgroundColor: colorForCategory(category) }}
              title={`${labelFor(category)} ${formatPercent(value)}`}
            >
              {value >= 12
                ? <span className="truncate drop-shadow-sm">{labelFor(category)} {formatPercent(value)}</span>
                : value >= 7
                ? <span className="truncate drop-shadow-sm">{formatPercent(value)}</span>
                : null}
            </div>
          ))}
        </div>
        {boundaries.map((boundary) => {
          const leftValue = normalized[boundary.leftCategory];
          const rightValue = normalized[boundary.rightCategory];
          const combinedUnits = toUnits(leftValue) + toUnits(rightValue);
          return (
            <button
              key={`${boundary.leftCategory}:${boundary.rightCategory}`}
              type="button"
              role="slider"
              aria-label={`Adjust ${labelFor(boundary.leftCategory)} and ${labelFor(boundary.rightCategory)}`}
              aria-valuemin={toPercent(boundary.prefixUnits + MIN_TARGET_UNITS)}
              aria-valuemax={toPercent(boundary.prefixUnits + combinedUnits - MIN_TARGET_UNITS)}
              aria-valuenow={toPercent(boundary.cumulativeUnits)}
              aria-valuetext={`${labelFor(boundary.leftCategory)} ${formatPercent(leftValue)}, ${labelFor(boundary.rightCategory)} ${formatPercent(rightValue)}`}
              title={`Drag to adjust ${labelFor(boundary.leftCategory)} and ${labelFor(boundary.rightCategory)}`}
              onPointerDown={(event) => {
                event.currentTarget.focus();
                event.preventDefault();
                draggingRef.current = event.pointerId;
                event.currentTarget.setPointerCapture?.(event.pointerId);
                applyBoundaryClientX(boundary, event.clientX);
              }}
              onPointerMove={(event) => {
                if (draggingRef.current !== event.pointerId) return;
                applyBoundaryClientX(boundary, event.clientX);
              }}
              onPointerUp={(event) => {
                if (draggingRef.current === event.pointerId) draggingRef.current = null;
                event.currentTarget.releasePointerCapture?.(event.pointerId);
              }}
              onPointerCancel={() => { draggingRef.current = null; }}
              onKeyDown={(event) => {
                let delta = 1;
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta *= -1;
                else if (event.key !== "ArrowRight" && event.key !== "ArrowUp") return;
                event.preventDefault();
                adjustBoundary(boundary, delta);
              }}
              className="absolute top-1/2 z-10 h-16 w-5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ left: `${toPercent(boundary.cumulativeUnits)}%` }}
            >
              <span aria-hidden="true" className="mx-auto block h-12 w-1 rounded-full border border-zinc-950 bg-white shadow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
