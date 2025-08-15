import { useEffect, useRef } from "react";
import { pieColors, formatCurrency } from "../utils.js";

export default function PieChart({ data, showLabels = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
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

      const entries = Object.entries(data || {});
      const total = entries.reduce((a, [, v]) => a + (Number(v) || 0), 0) || 1;
      let start = -Math.PI / 2;
      const radius = Math.min(width, height) / 2 - 8 * dpr;
      const cx = width / 2;
      const cy = height / 2;
      const percentFmt = new Intl.NumberFormat(undefined, {
        style: "percent",
        maximumFractionDigits: 0,
      });
      entries.forEach(([label, value], i) => {
        const val = Number(value) || 0;
        const angle = (val / total) * Math.PI * 2;
        const color = pieColors[i % pieColors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.fillStyle = color;
        ctx.arc(cx, cy, radius, start, start + angle);
        ctx.closePath();
        ctx.fill();
        if (showLabels && val > 0) {
          const mid = start + angle / 2;
          const labelRadius = radius * 0.6;
          const percentLabel = percentFmt.format(val / total);
          const text = `${formatCurrency(val)} – ${percentLabel}`;
          ctx.font = `${12 * dpr}px sans-serif`;
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#fff";
          if (angle > 0.3) {
            const tx = cx + Math.cos(mid) * labelRadius;
            const ty = cy + Math.sin(mid) * labelRadius;
            ctx.textAlign = "center";
            ctx.fillText(text, tx, ty);
          } else {
            const lineStartX = cx + Math.cos(mid) * radius;
            const lineStartY = cy + Math.sin(mid) * radius;
            const lineEndX = cx + Math.cos(mid) * (radius + 16 * dpr);
            const lineEndY = cy + Math.sin(mid) * (radius + 16 * dpr);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();
            const tx = cx + Math.cos(mid) * (radius + 20 * dpr);
            const ty = cy + Math.sin(mid) * (radius + 20 * dpr);
            ctx.textAlign =
              mid > Math.PI / 2 || mid < -Math.PI / 2 ? "right" : "left";
            ctx.fillText(text, tx, ty);
          }
        }
        start += angle;
      });
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, showLabels]);
  return <canvas ref={ref} className="w-full h-40 rounded border border-zinc-800 bg-zinc-900" />;
}
