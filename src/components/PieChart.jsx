import { useEffect, useRef, useState } from "react";
import { pieColors } from "../utils.js";

export default function PieChart({ data, targetData, showTarget = false, assetTypes = {} }) {
  const ref = useRef(null);
  const arcsRef = useRef([]);
  const metricsRef = useRef({ cx: 0, cy: 0, radius: 0 });
  const totalRef = useRef(1);
  const percentFmtRef = useRef(
    new Intl.NumberFormat(undefined, {
      style: "percent",
      maximumFractionDigits: 0,
    })
  );
  const [hover, setHover] = useState(null);

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
      const labels = Array.from(
        new Set([
          ...Object.keys(data || {}),
          ...Object.keys(targetData || {}),
        ])
      );
      const source = showTarget ? targetData : data;
      const entries = labels.map((l) => [l, source?.[l] || 0]);
      const total = entries.reduce((a, [, v]) => a + (Number(v) || 0), 0) || 1;
      totalRef.current = total;
      let start = -Math.PI / 2;
      const radius = Math.min(width, height) / 2 - 8 * dpr;
      const cx = width / 2;
      const cy = height / 2;
      metricsRef.current = { cx, cy, radius };
      arcsRef.current = [];
      const percentFmt = percentFmtRef.current;
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
        if (val > 0) {
          const mid = start + angle / 2;
          const labelRadius = radius * 0.6;
          const percentLabel = percentFmt.format(val / total);
          const text = `${percentLabel}`;
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
        arcsRef.current.push({ start, end: start + angle, label, value: val });
        start += angle;
      });
    }

    function handleMove(e) {
      const canvas = ref.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const { cx, cy, radius } = metricsRef.current;
      const total = totalRef.current;
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        setHover(null);
        return;
      }
      let ang = Math.atan2(dy, dx);
      if (ang < -Math.PI / 2) ang += 2 * Math.PI;
      for (const arc of arcsRef.current) {
        if (ang >= arc.start && ang < arc.end) {
          setHover({
            label: arc.label,
            percent: arc.value / total,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          return;
        }
      }
      setHover(null);
    }

    function handleLeave() {
      setHover(null);
    }

    draw();
    window.addEventListener("resize", draw);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("resize", draw);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [data, targetData, showTarget]);

  const percentFmt = percentFmtRef.current;

  return (
    <div className="relative">
      <canvas
        ref={ref}
        className="w-full h-40 rounded border border-zinc-800 bg-zinc-900"
      />
      {hover && (
        <div
          className="absolute pointer-events-none bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
          style={{ left: hover.x, top: hover.y }}
        >
          <div>{assetTypes[hover.label]?.name || hover.label}</div>
          <div>{percentFmt.format(hover.percent)}</div>
        </div>
      )}
    </div>
  );
}

