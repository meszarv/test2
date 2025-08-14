import { useEffect, useRef } from "react";
import { formatCurrency } from "../utils.js";

export default function LineChart({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
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

    const last = data[data.length - 1];
    const lx = xToPx(xs[xs.length - 1]);
    const ly = yToPx(ys[ys.length - 1]);
    ctx.fillStyle = "#e8eaed";
    ctx.font = `${12 * dpr}px ui-sans-serif`;
    ctx.fillText(`${last.label}: ${formatCurrency(last.value)}`, lx - 100 * dpr, ly - 8 * dpr);
  }, [data]);
  return <canvas ref={ref} className="w-full h-64 rounded border border-zinc-800 bg-zinc-900" />;
}
