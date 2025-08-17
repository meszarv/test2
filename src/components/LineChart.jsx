import { useEffect, useRef } from "react";
import { formatCurrency } from "../utils.js";

export default function LineChart({
  data,
  showGridlines = true,
  showVerticalGridlines = false,
  showMarkers = true,
}) {
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const pointsRef = useRef([]);
  const dimsRef = useRef({ dpr: 1, width: 0, height: 0, padding: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const HIT_RADIUS = 20; // pixels on canvas coordinate system
    function draw(hoverIdx = null) {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const padding = 32 * dpr;
      dimsRef.current = { dpr, width, height, padding };
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
      const ys = data.map((d) => d.value || 0);
      const minVal = Math.min(...ys);
      const maxVal = Math.max(...ys);
      const minIdx = ys.indexOf(minVal);
      const maxIdx = ys.indexOf(maxVal);
      const minY = Math.min(minVal, 0);
      const maxY = Math.max(maxVal, 0);
      const xToPx = (x) =>
        padding + (x / Math.max(1, xs.length - 1)) * (width - 2 * padding);
      const yToPx = (y) =>
        height -
        padding -
        ((y - minY) / Math.max(1, maxY - minY)) * (height - 2 * padding);

      // precompute tick positions
      const yTickCount = 5;
      const yRange = maxY - minY;
      const yValues = [];
      if (yRange === 0) yValues.push(minY);
      else {
        for (let i = 0; i <= yTickCount; i++) {
          yValues.push(minY + (i / yTickCount) * yRange);
        }
      }
      const maxXTicks = Math.min(xs.length, 6);
      const xTickIdx = new Set();
      for (let i = 0; i < maxXTicks; i++) {
        const idx = Math.round((i / Math.max(1, maxXTicks - 1)) * (xs.length - 1));
        xTickIdx.add(idx);
      }

      // gridlines
      if (showGridlines) {
        ctx.strokeStyle = "#3a3a3a";
        for (const val of yValues) {
          const py = yToPx(val);
          ctx.beginPath();
          ctx.moveTo(padding, py);
          ctx.lineTo(width - padding, py);
          ctx.stroke();
        }
        if (showVerticalGridlines) {
          for (const idx of xTickIdx) {
            const px = xToPx(xs[idx]);
            ctx.beginPath();
            ctx.moveTo(px, padding);
            ctx.lineTo(px, height - padding);
            ctx.stroke();
          }
        }
      }

      const points = [];
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        const x = xToPx(xs[i]);
        const y = yToPx(ys[i]);
        points.push({ x, y, label: data[i].label, value: data[i].value });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      pointsRef.current = points;
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "#8ab4f8";
      ctx.stroke();

      // axis ticks
      const tickLen = 4 * dpr;
      ctx.strokeStyle = "#2a2a2a";
      ctx.font = `${10 * dpr}px ui-sans-serif`;
      ctx.fillStyle = "#e8eaed";

      // y-axis ticks and labels
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (const val of yValues) {
        const py = yToPx(val);
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - tickLen, py);
        ctx.stroke();
        ctx.fillText(formatCurrency(val), padding - 2 * tickLen, py);
      }

      // x-axis ticks and labels
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

      // markers for high/low
      if (showMarkers) {
        ctx.font = `${10 * dpr}px ui-sans-serif`;
        if (maxIdx !== -1 && points[maxIdx]) {
          const high = points[maxIdx];
          ctx.fillStyle = "#16a34a";
          ctx.beginPath();
          ctx.arc(high.x, high.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("High", high.x + 4 * dpr, high.y - 6 * dpr);
        }

        if (minIdx !== -1 && points[minIdx]) {
          const low = points[minIdx];
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(low.x, low.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("Low", low.x + 4 * dpr, low.y + 12 * dpr);
        }
      }

      const last = data[data.length - 1];
      const lx = xToPx(xs[xs.length - 1]);
      const ly = yToPx(ys[ys.length - 1]);
      ctx.fillStyle = "#e8eaed";
      ctx.font = `${12 * dpr}px ui-sans-serif`;
      ctx.fillText(`${last.label}: ${formatCurrency(last.value)}`, lx - 100 * dpr, ly - 8 * dpr);

      if (hoverIdx != null && points[hoverIdx]) {
        const p = points[hoverIdx];
        ctx.beginPath();
        ctx.fillStyle = "#8ab4f8";
        ctx.arc(p.x, p.y, 3 * dpr, 0, Math.PI * 2);
        ctx.fill();

        if (tooltipRef.current) {
          tooltipRef.current.textContent = `${p.label}: ${formatCurrency(p.value)}`;
          tooltipRef.current.style.display = "block";
          tooltipRef.current.style.left = `${p.x / dpr + 8}px`;
          tooltipRef.current.style.top = `${p.y / dpr - 24}px`;
        }
      } else if (tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }
    }

    function handleMove(e) {
      const { dpr, width, height, padding } = dimsRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      const points = pointsRef.current;
      if (!points.length) return draw();

      const ratio = (x - padding) / Math.max(1, width - 2 * padding);
      const approx = Math.round(ratio * (points.length - 1));
      let nearest = -1;
      let minDist = Infinity;
      for (let i = Math.max(0, approx - 2); i <= Math.min(points.length - 1, approx + 2); i++) {
        const p = points[i];
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      if (minDist <= HIT_RADIUS * dpr) draw(nearest);
      else draw();
    }

    function handleOut() {
      draw();
    }

    draw();
    window.addEventListener("resize", draw);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseout", handleOut);
    return () => {
      window.removeEventListener("resize", draw);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseout", handleOut);
    };
  }, [data, showGridlines, showVerticalGridlines, showMarkers]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded border border-zinc-800 bg-zinc-900"
      />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute hidden rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
      />
    </div>
  );
}
