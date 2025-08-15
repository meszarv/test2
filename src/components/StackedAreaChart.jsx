import { useEffect, useRef, useMemo } from "react";
import { pieColors, formatCurrency, labelFor } from "../utils.js";

export default function StackedAreaChart({ data, assetTypes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      const padding = 32 * dpr;
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      if (!data.length) {
        ctx.fillStyle = "#9aa0a6";
        ctx.font = `${14 * dpr}px ui-sans-serif`;
        ctx.fillText("No data", 12 * dpr, 20 * dpr);
        return;
      }

      const categories = Object.keys(data[0]).filter(
        (k) => k !== "label" && k !== "value"
      );
      const xs = data.map((_, i) => i);
      const totals = data.map((d) => d.value || 0);
      const maxY = Math.max(...totals, 0);
      const xToPx = (x) =>
        padding + (x / Math.max(1, xs.length - 1)) * (width - 2 * padding);
      const yToPx = (y) =>
        height - padding - (y / Math.max(1, maxY)) * (height - 2 * padding);

      const yTickCount = 5;
      for (let i = 0; i <= yTickCount; i++) {
        const val = (maxY / yTickCount) * i;
        const py = yToPx(val);
        ctx.strokeStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(width - padding, py);
        ctx.stroke();
      }

      ctx.strokeStyle = "#2a2a2a";
      ctx.font = `${10 * dpr}px ui-sans-serif`;
      ctx.fillStyle = "#e8eaed";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= yTickCount; i++) {
        const val = (maxY / yTickCount) * i;
        const py = yToPx(val);
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - 4 * dpr, py);
        ctx.stroke();
        ctx.fillText(formatCurrency(val), padding - 8 * dpr, py);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const maxXTicks = Math.min(xs.length, 6);
      for (let i = 0; i < maxXTicks; i++) {
        const idx = Math.round(
          (i / Math.max(1, maxXTicks - 1)) * (xs.length - 1)
        );
        const px = xToPx(xs[idx]);
        ctx.beginPath();
        ctx.moveTo(px, height - padding);
        ctx.lineTo(px, height - padding + 4 * dpr);
        ctx.stroke();
        const dateLabel = new Date(data[idx].label).toLocaleDateString();
        ctx.fillText(dateLabel, px, height - padding + 6 * dpr);
      }

      const accum = new Array(xs.length).fill(0);
      categories.forEach((cat, ci) => {
        const vals = data.map((d) => Number(d[cat]) || 0);
        const base = accum.slice();
        ctx.beginPath();
        ctx.moveTo(xToPx(xs[0]), yToPx(base[0] + vals[0]));
        for (let i = 1; i < xs.length; i++) {
          ctx.lineTo(xToPx(xs[i]), yToPx(base[i] + vals[i]));
        }
        for (let i = xs.length - 1; i >= 0; i--) {
          ctx.lineTo(xToPx(xs[i]), yToPx(base[i]));
        }
        ctx.closePath();
        ctx.fillStyle = pieColors[ci % pieColors.length];
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        for (let i = 0; i < xs.length; i++) {
          accum[i] = base[i] + vals[i];
        }
      });
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data]);

  const categories = useMemo(
    () =>
      data.length
        ? Object.keys(data[0]).filter((k) => k !== "label" && k !== "value")
        : [],
    [data]
  );

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded border border-zinc-800 bg-zinc-900"
      />
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {categories.map((c, i) => (
          <div key={c} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded"
              style={{ backgroundColor: pieColors[i % pieColors.length] }}
            />
            <span>{labelFor(c, assetTypes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

