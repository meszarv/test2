import { useEffect, useRef } from "react";
import { formatCurrency } from "../utils.js";

export default function LineChart({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

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

      const xs = data.map((_, i) => i);
      const ys = data.map((d) => d.value);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const xToPx = (x) => padding + (x / Math.max(1, xs.length - 1)) * (width - 2 * padding);
      const yToPx = (y) => height - padding - ((y - minY) / Math.max(1, maxY - minY)) * (height - 2 * padding);

      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        const x = xToPx(xs[i]);
        const y = yToPx(ys[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "#8ab4f8";
      ctx.stroke();

      // axis ticks
      const tickLen = 4 * dpr;
      ctx.strokeStyle = "#2a2a2a";
      ctx.font = `${10 * dpr}px ui-sans-serif`;
      ctx.fillStyle = "#e8eaed";

      // y-axis ticks and labels
      const yTickCount = 5;
      const yRange = maxY - minY;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const yValues = [];
      if (yRange === 0) yValues.push(minY);
      else {
        for (let i = 0; i <= yTickCount; i++) {
          yValues.push(minY + (i / yTickCount) * yRange);
        }
      }
      for (const val of yValues) {
        const py = yToPx(val);
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - tickLen, py);
        ctx.stroke();
        ctx.fillText(formatCurrency(val), padding - 2 * tickLen, py);
      }

      // x-axis ticks and labels
      const maxXTicks = Math.min(xs.length, 6);
      const xTickIdx = new Set();
      for (let i = 0; i < maxXTicks; i++) {
        const idx = Math.round((i / Math.max(1, maxXTicks - 1)) * (xs.length - 1));
        xTickIdx.add(idx);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const idx of xTickIdx) {
        const px = xToPx(xs[idx]);
        ctx.beginPath();
        ctx.moveTo(px, height - padding);
        ctx.lineTo(px, height - padding + tickLen);
        ctx.stroke();
        const dateLabel = new Date(data[idx].label).toLocaleDateString();
        ctx.fillText(dateLabel, px, height - padding + tickLen + 2 * dpr);
      }

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      const last = data[data.length - 1];
      const lx = xToPx(xs[xs.length - 1]);
      const ly = yToPx(ys[ys.length - 1]);
      ctx.fillStyle = "#e8eaed";
      ctx.font = `${12 * dpr}px ui-sans-serif`;
      ctx.fillText(`${last.label}: ${formatCurrency(last.value)}`, lx - 100 * dpr, ly - 8 * dpr);
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data]);
  return <canvas ref={ref} className="w-full h-64 rounded border border-zinc-800 bg-zinc-900" />;
}
