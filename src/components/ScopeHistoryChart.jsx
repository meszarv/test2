import { useEffect, useRef } from "react";
import { formatCurrency } from "../utils.js";

const lines = [
  { key: "totalAssets", label: "Total Assets", color: "#8ab4f8" },
  { key: "investableAssets", label: "Investable Assets", color: "#34a853" },
  { key: "financialPortfolio", label: "Financial Portfolio", color: "#fbbc04" },
];

export default function ScopeHistoryChart({ data, currency = "EUR" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const padding = 38 * dpr;

      if (!data.length) {
        context.fillStyle = "#9aa0a6";
        context.font = `${14 * dpr}px ui-sans-serif`;
        context.fillText("No data", 12 * dpr, 20 * dpr);
        return;
      }

      const maxValue = Math.max(1, ...data.flatMap((point) => lines.map((line) => Number(point[line.key]) || 0)));
      const x = (index) => padding + (index / Math.max(1, data.length - 1)) * (width - 2 * padding);
      const y = (value) => height - padding - ((Number(value) || 0) / maxValue) * (height - 2 * padding);

      context.strokeStyle = "#3a3a3a";
      context.fillStyle = "#e8eaed";
      context.font = `${10 * dpr}px ui-sans-serif`;
      context.textAlign = "right";
      context.textBaseline = "middle";
      for (let index = 0; index <= 5; index += 1) {
        const value = (maxValue / 5) * index;
        const py = y(value);
        context.beginPath();
        context.moveTo(padding, py);
        context.lineTo(width - padding, py);
        context.stroke();
        context.fillText(formatCurrency(value, currency), padding - 8 * dpr, py);
      }

      const tickCount = Math.min(data.length, 6);
      context.textAlign = "center";
      context.textBaseline = "top";
      for (let index = 0; index < tickCount; index += 1) {
        const pointIndex = Math.round((index / Math.max(1, tickCount - 1)) * (data.length - 1));
        context.fillText(new Date(data[pointIndex].label).toLocaleDateString(), x(pointIndex), height - padding + 7 * dpr);
      }

      for (const line of lines) {
        context.beginPath();
        data.forEach((point, index) => {
          const px = x(index);
          const py = y(point[line.key]);
          if (index === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.strokeStyle = line.color;
        context.lineWidth = 2 * dpr;
        context.stroke();
      }
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, currency]);

  return (
    <div>
      <canvas ref={canvasRef} className="w-full h-64 rounded border border-zinc-800 bg-zinc-900" />
      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: line.color }} />
            <span>{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
