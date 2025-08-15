import { useEffect, useRef } from "react";
import { pieColors } from "../utils.js";

export default function PieChart({ data }) {
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
      entries.forEach(([label, value], i) => {
        const angle = ((Number(value) || 0) / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.fillStyle = pieColors[i % pieColors.length];
        ctx.arc(cx, cy, radius, start, start + angle);
        ctx.closePath();
        ctx.fill();
        start += angle;
      });
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data]);
  return <canvas ref={ref} className="w-full h-40 rounded border border-zinc-800 bg-zinc-900" />;
}
