import { j as jsxRuntimeExports, r as reactExports, R as ReactDOM, a as React } from "./vendor-B1sYnIZH.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function Section({ title, children, right }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-zinc-200 font-medium", children: title }),
      right
    ] }),
    children
  ] });
}
function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  inputClassName = "",
  disabled = false,
  autoFocus = false,
  onKeyDown
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `block text-sm ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        placeholder,
        onChange: (e) => onChange(e.target.value),
        disabled,
        autoFocus,
        onKeyDown,
        className: `mt-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName || "w-full"}`
      }
    )
  ] });
}
function mkId() {
  return crypto.randomUUID();
}
const pieColors = [
  "#8ab4f8",
  "#f28b82",
  "#fbbc04",
  "#34a853",
  "#ff6d01",
  "#a142f4",
  "#00acc1",
  "#ffab40"
];
function labelFor(key, registry = {}) {
  return registry[key]?.name || key;
}
function mkAsset(type, registry, name = "") {
  const def = registry[type] || {};
  return {
    id: mkId(),
    type,
    name: name || def.name || type,
    description: "",
    value: 0
  };
}
function formatCurrency(n) {
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `${Math.round(n).toLocaleString()} €`;
  }
}
function LineChart({
  data,
  showGridlines = true,
  showVerticalGridlines = false,
  showMarkers = true
}) {
  const canvasRef = reactExports.useRef(null);
  const tooltipRef = reactExports.useRef(null);
  const pointsRef = reactExports.useRef([]);
  const dimsRef = reactExports.useRef({ dpr: 1, width: 0, height: 0, padding: 0 });
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const HIT_RADIUS = 20;
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
      const xToPx = (x) => padding + x / Math.max(1, xs.length - 1) * (width - 2 * padding);
      const yToPx = (y) => height - padding - (y - minY) / Math.max(1, maxY - minY) * (height - 2 * padding);
      const yTickCount = 5;
      const yRange = maxY - minY;
      const yValues = [];
      if (yRange === 0) yValues.push(minY);
      else {
        for (let i = 0; i <= yTickCount; i++) {
          yValues.push(minY + i / yTickCount * yRange);
        }
      }
      const maxXTicks = Math.min(xs.length, 6);
      const xTickIdx = /* @__PURE__ */ new Set();
      for (let i = 0; i < maxXTicks; i++) {
        const idx = Math.round(i / Math.max(1, maxXTicks - 1) * (xs.length - 1));
        xTickIdx.add(idx);
      }
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
      const tickLen = 4 * dpr;
      ctx.strokeStyle = "#2a2a2a";
      ctx.font = `${10 * dpr}px ui-sans-serif`;
      ctx.fillStyle = "#e8eaed";
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "w-full h-64 rounded border border-zinc-800 bg-zinc-900"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: tooltipRef,
        className: "pointer-events-none absolute hidden rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
      }
    )
  ] });
}
function StackedAreaChart({ data, assetTypes }) {
  const canvasRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
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
      const categories2 = Array.from(
        new Set(
          data.flatMap(
            (d) => Object.keys(d).filter(
              (k) => k !== "label" && k !== "value" && (Number(d[k]) || 0) > 0
            )
          )
        )
      );
      const xs = data.map((_, i) => i);
      const totals = data.map((d) => d.value || 0);
      const maxY = Math.max(...totals, 0);
      const xToPx = (x) => padding + x / Math.max(1, xs.length - 1) * (width - 2 * padding);
      const yToPx = (y) => height - padding - y / Math.max(1, maxY) * (height - 2 * padding);
      const yTickCount = 5;
      for (let i = 0; i <= yTickCount; i++) {
        const val = maxY / yTickCount * i;
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
        const val = maxY / yTickCount * i;
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
          i / Math.max(1, maxXTicks - 1) * (xs.length - 1)
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
      categories2.forEach((cat, ci) => {
        const vals = data.map((d) => Math.max(0, Number(d[cat]) || 0));
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
  const categories = reactExports.useMemo(
    () => Array.from(
      new Set(
        data.flatMap(
          (d) => Object.keys(d).filter(
            (k) => k !== "label" && k !== "value" && (Number(d[k]) || 0) > 0
          )
        )
      )
    ),
    [data]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "w-full h-64 rounded border border-zinc-800 bg-zinc-900"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2 text-xs", children: categories.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "inline-block h-3 w-3 rounded",
          style: { backgroundColor: pieColors[i % pieColors.length] }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: labelFor(c, assetTypes) })
    ] }, c)) })
  ] });
}
function PieChart({ data, targetData, showTarget = false, assetTypes = {} }) {
  const ref = reactExports.useRef(null);
  const arcsRef = reactExports.useRef([]);
  const metricsRef = reactExports.useRef({ cx: 0, cy: 0, radius: 0 });
  const totalRef = reactExports.useRef(1);
  const percentFmtRef = reactExports.useRef(
    new Intl.NumberFormat(void 0, {
      style: "percent",
      maximumFractionDigits: 0
    })
  );
  const [hover, setHover] = reactExports.useState(null);
  reactExports.useEffect(() => {
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
        /* @__PURE__ */ new Set([
          ...Object.keys(data || {}),
          ...Object.keys(targetData || {})
        ])
      );
      const source = showTarget ? targetData : data;
      const rawEntries = labels.map((l) => [l, source?.[l] || 0]);
      const total = rawEntries.reduce((a, [, v]) => a + (Number(v) || 0), 0);
      if (total <= 0) return;
      totalRef.current = total;
      const entries = rawEntries.filter(([, v]) => (Number(v) || 0) > 0);
      let start = -Math.PI / 2;
      const radius = Math.min(width, height) / 2 - 8 * dpr;
      const cx = width / 2;
      const cy = height / 2;
      metricsRef.current = { cx, cy, radius };
      arcsRef.current = [];
      const percentFmt2 = percentFmtRef.current;
      entries.forEach(([label, value], i) => {
        const val = Number(value) || 0;
        const angle = val / total * Math.PI * 2;
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
          const percentLabel = percentFmt2.format(val / total);
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
            ctx.textAlign = mid > Math.PI / 2 || mid < -Math.PI / 2 ? "right" : "left";
            ctx.fillText(text, tx, ty);
          }
        }
        arcsRef.current.push({ start, end: start + angle, label, value: val });
        start += angle;
      });
    }
    function handleMove(e) {
      const canvas2 = ref.current;
      if (!canvas2) return;
      const rect = canvas2.getBoundingClientRect();
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
            y: e.clientY - rect.top
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref,
        className: "w-full h-40 rounded border border-zinc-800 bg-zinc-900"
      }
    ),
    hover && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "absolute pointer-events-none bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs",
        style: { left: hover.x, top: hover.y },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: assetTypes[hover.label]?.name || hover.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: percentFmt.format(hover.percent) })
        ]
      }
    )
  ] });
}
function AssetTable({ assets, prevAssets, setAssets, assetTypes, readOnly = false, onEdit }) {
  const [sort, setSort] = reactExports.useState({ key: null, asc: true });
  const prevMap = new Map((prevAssets || []).map((a) => [a.id, Number(a.value) || 0]));
  function updateValue(id, value) {
    const val = Number(value || 0);
    setAssets(assets.map((a) => a.id === id ? { ...a, value: val } : a));
  }
  const sortedAssets = [...assets];
  if (sort.key) {
    sortedAssets.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === "value") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (sort.key === "type") {
        av = assetTypes[av]?.name || av;
        bv = assetTypes[bv]?.name || bv;
      } else {
        av = (av || "").toString();
        bv = (bv || "").toString();
      }
      if (typeof av === "string") {
        return sort.asc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.asc ? av - bv : bv - av;
    });
  }
  const handleSort = (key) => {
    setSort((s) => s.key === key ? { key, asc: !s.asc } : { key, asc: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left p-2 cursor-pointer", onClick: () => handleSort("name"), children: [
        "Name ",
        sort.key === "name" ? sort.asc ? "▲" : "▼" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left p-2 cursor-pointer", onClick: () => handleSort("type"), children: [
        "Type ",
        sort.key === "type" ? sort.asc ? "▲" : "▼" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left p-2 cursor-pointer", onClick: () => handleSort("description"), children: [
        "Description ",
        sort.key === "description" ? sort.asc ? "▲" : "▼" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right p-2 cursor-pointer", onClick: () => handleSort("value"), children: [
        "Value ",
        sort.key === "value" ? sort.asc ? "▲" : "▼" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedAssets.map((a) => {
      const prev = prevMap.get(a.id) || 0;
      const delta = (Number(a.value) || 0) - prev;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          className: "border-t border-zinc-800",
          onDoubleClick: () => !readOnly && onEdit && onEdit(a),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: a.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: assetTypes[a.type]?.name || a.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-xs whitespace-pre-line", children: a.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-32", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    value: a.value,
                    onChange: (e) => updateValue(a.id, e.target.value),
                    onFocus: (e) => e.target.select(),
                    className: "peer bg-transparent border border-transparent text-right px-1 py-1 rounded focus:bg-zinc-800 focus:border-blue-500 focus:outline-none w-full text-transparent focus:text-inherit",
                    readOnly
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `pointer-events-none absolute inset-0 flex items-center justify-end px-1 ${readOnly ? "" : "peer-focus:hidden"}`,
                    children: formatCurrency(a.value)
                  }
                )
              ] }),
              delta ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`, children: [
                "(",
                formatCurrency(delta),
                ")"
              ] }) : null
            ] }) })
          ]
        },
        a.id
      );
    }) })
  ] }) });
}
function LiabilityTable({ liabilities, prevLiabilities, setLiabilities, liabilityTypes, readOnly = false, onEdit }) {
  const [sort, setSort] = reactExports.useState({ key: null, asc: true });
  const prevMap = new Map((prevLiabilities || []).map((l) => [l.id, Number(l.value) || 0]));
  function updateValue(id, value) {
    const val = Number(value || 0);
    setLiabilities(liabilities.map((l) => l.id === id ? { ...l, value: val } : l));
  }
  function updatePriority(id, priority) {
    setLiabilities(liabilities.map((l) => l.id === id ? { ...l, priority } : l));
  }
  const sortedLiabilities = [...liabilities];
  if (sort.key) {
    sortedLiabilities.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === "value") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (sort.key === "type") {
        av = liabilityTypes[av]?.name || av;
        bv = liabilityTypes[bv]?.name || bv;
      } else {
        av = (av || "").toString();
        bv = (bv || "").toString();
      }
      if (typeof av === "string") {
        return sort.asc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.asc ? av - bv : bv - av;
    });
  }
  const handleSort = (key) => {
    setSort((s) => s.key === key ? { key, asc: !s.asc } : { key, asc: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Priority" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left p-2 cursor-pointer", onClick: () => handleSort("name"), children: [
        "Name ",
        sort.key === "name" ? sort.asc ? "▲" : "▼" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left p-2 cursor-pointer", onClick: () => handleSort("type"), children: [
        "Type ",
        sort.key === "type" ? sort.asc ? "▲" : "▼" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left p-2 cursor-pointer", onClick: () => handleSort("description"), children: [
        "Description ",
        sort.key === "description" ? sort.asc ? "▲" : "▼" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right p-2 cursor-pointer", onClick: () => handleSort("value"), children: [
        "Value ",
        sort.key === "value" ? sort.asc ? "▲" : "▼" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedLiabilities.map((l) => {
      const prev = prevMap.get(l.id) || 0;
      const delta = (Number(l.value) || 0) - prev;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          className: "border-t border-zinc-800",
          onDoubleClick: () => !readOnly && onEdit && onEdit(l),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: !!l.priority,
                onChange: (e) => updatePriority(l.id, e.target.checked),
                disabled: readOnly
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: l.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: liabilityTypes[l.type]?.name || l.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-xs whitespace-pre-line", children: l.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-32", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    value: l.value,
                    onChange: (e) => updateValue(l.id, e.target.value),
                    onFocus: (e) => e.target.select(),
                    className: "peer bg-transparent border border-transparent text-right px-1 py-1 rounded focus:bg-zinc-800 focus:border-blue-500 focus:outline-none w-full text-transparent focus:text-inherit",
                    readOnly
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `pointer-events-none absolute inset-0 flex items-center justify-end px-1 ${readOnly ? "" : "peer-focus:hidden"}`,
                    children: formatCurrency(l.value)
                  }
                )
              ] }),
              delta ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`, children: [
                "(",
                formatCurrency(delta),
                ")"
              ] }) : null
            ] }) })
          ]
        },
        l.id
      );
    }) })
  ] }) });
}
function AddAssetModal({ open, onClose, assetTypes, onAdd }) {
  const [name, setName] = reactExports.useState("");
  const [type, setType] = reactExports.useState(Object.keys(assetTypes)[0] || "");
  reactExports.useEffect(() => {
    setType(Object.keys(assetTypes)[0] || "");
  }, [assetTypes]);
  const [description, setDescription] = reactExports.useState("");
  const [value, setValue] = reactExports.useState("");
  function submit(e) {
    if (e) e.preventDefault();
    onAdd({ name, type, description, value: Number(value || 0) });
    setName("");
    setType(Object.keys(assetTypes)[0] || "");
    setDescription("");
    setValue("");
    onClose();
  }
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium", children: "Add asset" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, label: "Name", value: name, onChange: setName }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          value: type,
          onChange: (e) => setType(e.target.value),
          children: Object.keys(assetTypes).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: assetTypes[k]?.name || k }, k))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          rows: "3",
          value: description,
          onChange: (e) => setDescription(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Value", type: "number", value, onChange: setValue, inputClassName: "w-32" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, title: "Close", className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700", children: "✖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", title: "Add", className: "px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500", children: "➕" })
    ] })
  ] }) });
}
function AddLiabilityModal({ open, onClose, liabilityTypes, onAdd }) {
  const [name, setName] = reactExports.useState("");
  const [type, setType] = reactExports.useState(Object.keys(liabilityTypes)[0] || "");
  reactExports.useEffect(() => {
    setType(Object.keys(liabilityTypes)[0] || "");
  }, [liabilityTypes]);
  const [description, setDescription] = reactExports.useState("");
  const [value, setValue] = reactExports.useState("");
  function submit(e) {
    if (e) e.preventDefault();
    onAdd({ name, type, description, value: Number(value || 0) });
    setName("");
    setType(Object.keys(liabilityTypes)[0] || "");
    setDescription("");
    setValue("");
    onClose();
  }
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium", children: "Add liability" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, label: "Name", value: name, onChange: setName }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          value: type,
          onChange: (e) => setType(e.target.value),
          children: Object.keys(liabilityTypes).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: liabilityTypes[k]?.name || k }, k))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          rows: "3",
          value: description,
          onChange: (e) => setDescription(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Value", type: "number", value, onChange: setValue, inputClassName: "w-32" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, title: "Close", className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700", children: "✖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", title: "Add", className: "px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500", children: "➕" })
    ] })
  ] }) });
}
function EditAssetModal({ open, asset, onClose, assetTypes, onSave, onDelete }) {
  const [name, setName] = reactExports.useState("");
  const [type, setType] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [value, setValue] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setType(asset.type || Object.keys(assetTypes)[0] || "");
      setDescription(asset.description || "");
      setValue(asset.value);
    }
  }, [asset, assetTypes]);
  function submit(e) {
    if (e) e.preventDefault();
    if (!asset) return;
    onSave({ ...asset, name, type, description, value: Number(value || 0) });
    onClose();
  }
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium", children: "Edit asset" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, label: "Name", value: name, onChange: setName }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          value: type,
          onChange: (e) => setType(e.target.value),
          children: Object.keys(assetTypes).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: assetTypes[k]?.name || k }, k))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          rows: "3",
          value: description,
          onChange: (e) => setDescription(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Value", type: "number", value, onChange: setValue, inputClassName: "w-32" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onDelete && onDelete(asset),
          title: "Delete",
          className: "px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600",
          children: "🗑️"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            title: "Close",
            className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700",
            children: "✖"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            title: "Save",
            className: "px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500",
            children: "💾"
          }
        )
      ] })
    ] })
  ] }) });
}
function EditLiabilityModal({ open, liability, onClose, liabilityTypes, onSave, onDelete }) {
  const [name, setName] = reactExports.useState("");
  const [type, setType] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [value, setValue] = reactExports.useState("");
  const [priority, setPriority] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (liability) {
      setName(liability.name || "");
      setType(liability.type || Object.keys(liabilityTypes)[0] || "");
      setDescription(liability.description || "");
      setValue(liability.value);
      setPriority(!!liability.priority);
    }
  }, [liability, liabilityTypes]);
  function submit(e) {
    if (e) e.preventDefault();
    if (!liability) return;
    onSave({ ...liability, name, type, description, value: Number(value || 0), priority });
    onClose();
  }
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium", children: "Edit liability" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, label: "Name", value: name, onChange: setName }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          value: type,
          onChange: (e) => setType(e.target.value),
          children: Object.keys(liabilityTypes).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: liabilityTypes[k]?.name || k }, k))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100",
          rows: "3",
          value: description,
          onChange: (e) => setDescription(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Value", type: "number", value, onChange: setValue, inputClassName: "w-32" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: priority, onChange: (e) => setPriority(e.target.checked) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Priority" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onDelete && onDelete(liability),
          title: "Delete",
          className: "px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600",
          children: "🗑️"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            title: "Close",
            className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700",
            children: "✖"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", title: "Save", className: "px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500", children: "💾" })
      ] })
    ] })
  ] }) });
}
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3", children: [
    title && /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium", children: title }),
    message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onConfirm,
          title: "Delete",
          className: "px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500",
          children: "🗑️"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onCancel,
          title: "Close",
          className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700",
          children: "✖"
        }
      ) })
    ] })
  ] }) });
}
function SnapshotTabs({ snapshots, currentIndex, onSelect, onAdd, onChangeDate, onDelete }) {
  const [editIndex, setEditIndex] = reactExports.useState(null);
  const [editValue, setEditValue] = reactExports.useState("");
  const [deleteIndex, setDeleteIndex] = reactExports.useState(null);
  const fmt = (d) => d.toLocaleString("default", { month: "short", year: "numeric" });
  const hasCurrent = snapshots.some((s) => s.asOf.slice(0, 7) === (/* @__PURE__ */ new Date()).toISOString().slice(0, 7));
  function startEdit(idx) {
    const snap = snapshots[idx];
    if (!snap) return;
    const val = new Date(snap.asOf).toISOString().slice(0, 7);
    setEditValue(val);
    setEditIndex(idx);
  }
  function saveDate() {
    const [y, m] = editValue.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    onChangeDate(editIndex, date);
    setEditIndex(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      snapshots.map((s, i) => ({ s, i })).sort((a, b) => new Date(a.s.asOf) - new Date(b.s.asOf)).map(({ s, i }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: (e) => {
            if (e.detail === 3) startEdit(i);
            else onSelect(i);
          },
          className: `px-3 py-1 rounded-t border border-zinc-700 ${i === currentIndex ? "bg-zinc-800 border-b-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`,
          children: fmt(new Date(s.asOf))
        },
        s.asOf
      )),
      !hasCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onAdd,
          className: "px-3 py-1 rounded-t border-2 border-dashed border-zinc-700 bg-zinc-900 hover:bg-zinc-800",
          children: fmt(/* @__PURE__ */ new Date())
        }
      )
    ] }),
    editIndex !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium", children: "Edit snapshot date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextInput,
        {
          label: "Month",
          type: "month",
          value: editValue,
          onChange: setEditValue,
          autoFocus: true,
          onKeyDown: (e) => {
            if (e.key === "Enter") saveDate();
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDeleteIndex(editIndex),
            title: "Delete",
            className: "px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500",
            children: "🗑️"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setEditIndex(null),
              title: "Close",
              className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700",
              children: "✖"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: saveDate,
              title: "Save",
              className: "px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500",
              children: "✔"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmModal,
      {
        open: deleteIndex !== null,
        title: "Delete snapshot?",
        onConfirm: () => {
          if (onDelete) onDelete(deleteIndex);
          setDeleteIndex(null);
          setEditIndex(null);
        },
        onCancel: () => setDeleteIndex(null)
      }
    )
  ] });
}
function getSortValue(category, key, data) {
  const {
    byCat = {},
    idealByCat = {},
    investPlan = {},
    priorityDebt,
    priorityPayoff,
    assetTypes
  } = data;
  const totalPriorityDebt = (priorityDebt || 0) + (priorityPayoff || 0);
  switch (key) {
    case "current":
      return category === "priority_debt" ? -totalPriorityDebt : byCat[category] || 0;
    case "after":
      return category === "priority_debt" ? priorityDebt ? -priorityDebt : 0 : (byCat[category] || 0) + (investPlan[category] || 0);
    case "ideal":
      return category === "priority_debt" ? 0 : idealByCat[category] || 0;
    case "invest":
      return category === "priority_debt" ? priorityPayoff || 0 : investPlan[category] || 0;
    default:
      return category === "priority_debt" ? "Priority debt" : labelFor(category, assetTypes);
  }
}
function RebalancePlan({ data, assetTypes }) {
  const [sort, setSort] = reactExports.useState({ key: "category", asc: true });
  const { cats, totalPriorityDebt } = reactExports.useMemo(() => {
    const totalPriorityDebt2 = (data.priorityDebt || 0) + (data.priorityPayoff || 0);
    const cats2 = Array.from(
      /* @__PURE__ */ new Set([
        ...Object.keys(data.byCat || {}),
        ...Object.keys(data.idealByCat || {}),
        ...Object.keys(data.investPlan || {})
      ])
    );
    if (data.priorityDebt != null || data.priorityPayoff != null)
      cats2.push("priority_debt");
    cats2.sort((a, b) => {
      const av = getSortValue(a, sort.key, { ...data, assetTypes });
      const bv = getSortValue(b, sort.key, { ...data, assetTypes });
      if (typeof av === "string") {
        const cmp = av.localeCompare(bv);
        return sort.asc ? cmp : -cmp;
      }
      return sort.asc ? av - bv : bv - av;
    });
    return { cats: cats2, totalPriorityDebt: totalPriorityDebt2 };
  }, [data, sort, assetTypes]);
  if (cats.length === 0) return null;
  const colorMap = {};
  Object.keys(data.byCat || {}).forEach((c, i) => {
    colorMap[c] = pieColors[i % pieColors.length];
  });
  if (data.priorityDebt != null || data.priorityPayoff != null)
    colorMap["priority_debt"] = "#ef4444";
  const handleSort = (key) => {
    setSort((s) => s.key === key ? { key, asc: !s.asc } : { key, asc: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-zinc-400 mb-2", children: [
      "Now: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-zinc-200", children: formatCurrency(data.totalNow) }),
      " → Target: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-zinc-200", children: formatCurrency(data.targetTotal) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left py-1 cursor-pointer", onClick: () => handleSort("category"), children: [
          "Category ",
          sort.key === "category" ? sort.asc ? "▲" : "▼" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 cursor-pointer", onClick: () => handleSort("current"), children: [
          "Current ",
          sort.key === "current" ? sort.asc ? "▲" : "▼" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 cursor-pointer", onClick: () => handleSort("ideal"), children: [
          "Ideal ",
          sort.key === "ideal" ? sort.asc ? "▲" : "▼" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 cursor-pointer", onClick: () => handleSort("invest"), children: [
          "Invest now ",
          sort.key === "invest" ? sort.asc ? "▲" : "▼" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-right py-1 cursor-pointer", onClick: () => handleSort("after"), children: [
          "After ",
          sort.key === "after" ? sort.asc ? "▲" : "▼" : ""
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: cats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm", style: { backgroundColor: colorMap[c] } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-zinc-200", children: c === "priority_debt" ? "Priority debt" : labelFor(c, assetTypes) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-zinc-300", children: formatCurrency(
          c === "priority_debt" ? -totalPriorityDebt : data.byCat[c] || 0
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-zinc-300", children: formatCurrency(c === "priority_debt" ? 0 : data.idealByCat[c] || 0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right font-medium text-zinc-100", children: formatCurrency(
          c === "priority_debt" ? data.priorityPayoff || 0 : data.investPlan[c] || 0
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-zinc-300", children: formatCurrency(
          c === "priority_debt" ? data.priorityDebt ? -data.priorityDebt : 0 : (data.byCat[c] || 0) + (data.investPlan[c] || 0)
        ) })
      ] }, c)) })
    ] })
  ] });
}
function AssetTypeManager({ assetTypes, setAssetTypes, assets }) {
  function updateName(key, name) {
    const def = assetTypes[key];
    setAssetTypes({ ...assetTypes, [key]: { ...def, name } });
  }
  function addType() {
    const name = window.prompt("New asset type", "New type");
    if (!name) return;
    const key = mkId();
    setAssetTypes({ ...assetTypes, [key]: { name } });
  }
  function removeType(key) {
    if (assets && assets.some((a) => a.type === key)) {
      alert("Cannot remove type with existing assets");
      return;
    }
    const { [key]: _discard, ...rest } = assetTypes;
    setAssetTypes(rest);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    Object.entries(assetTypes).map(([k, def]) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Name", value: def.name, onChange: (v) => updateName(k, v), className: "md:col-span-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeType(k), title: "Delete", className: "h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700", children: "🗑️" }) })
    ] }) }, k)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: addType, title: "Add type", className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm", children: "➕" })
  ] });
}
function LiabilityTypeManager({ liabilityTypes, setLiabilityTypes, liabilities }) {
  function updateName(key, name) {
    const def = liabilityTypes[key];
    setLiabilityTypes({ ...liabilityTypes, [key]: { ...def, name } });
  }
  function addType() {
    const name = window.prompt("New liability type", "New type");
    if (!name) return;
    const key = mkId();
    setLiabilityTypes({ ...liabilityTypes, [key]: { name } });
  }
  function removeType(key) {
    if (liabilities && liabilities.some((l) => l.type === key)) {
      alert("Cannot remove type with existing liabilities");
      return;
    }
    const { [key]: _discard, ...rest } = liabilityTypes;
    setLiabilityTypes(rest);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    Object.entries(liabilityTypes).map(([k, def]) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Name", value: def.name, onChange: (v) => updateName(k, v), className: "md:col-span-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeType(k), title: "Delete", className: "h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700", children: "🗑️" }) })
    ] }) }, k)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: addType, title: "Add type", className: "px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm", children: "➕" })
  ] });
}
function AllocationEditor({ allocation, setAllocation, assetTypes }) {
  const keys = Array.from(/* @__PURE__ */ new Set([...Object.keys(assetTypes), ...Object.keys(allocation || {})]));
  const total = Object.values(allocation || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  function setKey(k, v) {
    setAllocation({ ...allocation, [k]: v });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    keys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-10 items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 text-zinc-300", children: labelFor(k, assetTypes) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextInput,
        {
          label: "Target %",
          type: "number",
          value: String(allocation[k] ?? 0),
          onChange: (v) => setKey(k, Number(v || 0))
        }
      ) })
    ] }, k)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-sm ${total === 100 ? "text-emerald-400" : "text-amber-400"}`, children: [
      "Total: ",
      total,
      "% ",
      total !== 100 && "(will be normalized)"
    ] }) })
  ] });
}
function ConfigPage({
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  allocation,
  setAllocation,
  assets,
  liabilities
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Allocation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AllocationEditor, { allocation, setAllocation, assetTypes }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Asset Types", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AssetTypeManager, { assetTypes, setAssetTypes, assets }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Liability Types", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      LiabilityTypeManager,
      {
        liabilityTypes,
        setLiabilityTypes,
        liabilities
      }
    ) })
  ] });
}
function AddBtn({ onClick, title, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      title,
      className: `h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-lg ${className}`,
      children: "+"
    }
  );
}
const defaultAssetTypes = {
  cash: { name: "Cash" },
  real_estate: { name: "Real estate" },
  stock: { name: "Stock" },
  private_equity: { name: "Private equity" },
  bond: { name: "Bond" },
  commodity: { name: "Commodity" }
};
const defaultLiabilityTypes = {
  credit_card: { name: "Credit card" },
  loan: { name: "Loan" },
  mortgage: { name: "Mortgage" }
};
function netWorth(assets, liabilities) {
  const assetTotal = (assets || []).reduce((acc, a) => acc + (Number(a.value) || 0), 0);
  const liabilityTotal = (liabilities || []).reduce((acc, l) => acc + (Number(l.value) || 0), 0);
  return assetTotal - liabilityTotal;
}
function currentByCategory(assets, liabilities) {
  const assetMap = {};
  for (const a of assets || []) {
    const key = a.type;
    assetMap[key] = (assetMap[key] || 0) + (Number(a.value) || 0);
  }
  const assetTotal = Object.values(assetMap).reduce((a, b) => a + b, 0);
  const liabilityTotal = (liabilities || []).reduce(
    (a, l) => a + (Number(l.value) || 0),
    0
  );
  if (assetTotal === 0) return {};
  const ratio = liabilityTotal / assetTotal;
  const map = {};
  for (const [k, v] of Object.entries(assetMap)) {
    map[k] = v - v * ratio;
  }
  return map;
}
function normalizeAllocation(alloc) {
  const total = Object.values(alloc).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const out = {};
  for (const k of Object.keys(alloc)) out[k] = (Number(alloc[k]) || 0) / total;
  return out;
}
function rebalance(assets, liabilities, allocPct) {
  const adjAssets = (assets || []).map((a) => ({ ...a }));
  const adjLiabilities = (liabilities || []).map((l) => ({ ...l }));
  let cashAvailable = adjAssets.filter((a) => a.type === "cash").reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const initialCash = cashAvailable;
  for (const l of adjLiabilities) {
    if (!l.priority) continue;
    const payoff = Math.min(cashAvailable, Number(l.value) || 0);
    l.value = (Number(l.value) || 0) - payoff;
    cashAvailable -= payoff;
  }
  const priorityPayoff = initialCash - cashAvailable;
  let toDeduct = priorityPayoff;
  for (const a of adjAssets) {
    if (a.type !== "cash" || toDeduct <= 0) continue;
    const avail = Number(a.value) || 0;
    const used = Math.min(avail, toDeduct);
    a.value = avail - used;
    toDeduct -= used;
  }
  const priorityDebt = adjLiabilities.filter((l) => l.priority).reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const nonPriorityLiabilities = adjLiabilities.filter((l) => !l.priority);
  const totalNow = netWorth(adjAssets, adjLiabilities);
  const byCat = currentByCategory(adjAssets, nonPriorityLiabilities);
  const totalByCat = Object.values(byCat).reduce((a, b) => a + b, 0);
  console.assert(
    Math.round(totalByCat - priorityDebt) === Math.round(totalNow),
    "Category totals mismatch net worth"
  );
  let norm = normalizeAllocation(allocPct);
  if (Object.keys(norm).length === 0) {
    const cats2 = Object.keys(byCat);
    const share = 1 / (cats2.length || 1);
    norm = Object.fromEntries(cats2.map((c) => [c, share]));
  }
  const cats = Array.from(/* @__PURE__ */ new Set([...Object.keys(byCat), ...Object.keys(norm)]));
  const idealByCat = {};
  for (const c of cats) idealByCat[c] = (norm[c] || 0) * totalNow;
  const cashSurplus = Math.max(0, (byCat.cash || 0) - (idealByCat.cash || 0));
  const gaps = {};
  for (const c of cats) {
    if (c === "cash") continue;
    gaps[c] = Math.max(0, (idealByCat[c] || 0) - (byCat[c] || 0));
  }
  const sumGaps = Object.values(gaps).reduce((a, b) => a + b, 0) || 1;
  const investPlan = {};
  if (cashSurplus > 0 && sumGaps > 0) {
    investPlan.cash = -cashSurplus;
    for (const c of Object.keys(gaps)) {
      investPlan[c] = gaps[c] / sumGaps * cashSurplus;
    }
  }
  return {
    totalNow,
    targetTotal: totalNow,
    byCat,
    idealByCat,
    investPlan,
    priorityDebt,
    priorityPayoff
  };
}
function groupByPeriod(points, mode) {
  const fmt = (d) => mode === "monthly" ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : `${d.getFullYear()}`;
  const map = /* @__PURE__ */ new Map();
  for (const p of points || []) {
    const key = fmt(p.date);
    const prev = map.get(key);
    const { date, ...rest } = p;
    if (!prev || p.date.getTime() > prev.lastDate)
      map.set(key, { label: key, lastDate: p.date.getTime(), ...rest });
  }
  return Array.from(map.values()).sort((a, b) => a.lastDate - b.lastDate);
}
function buildSeries(snaps, period) {
  const pts = (snaps || []).map((s) => {
    const byCat = currentByCategory(s.assets || [], s.liabilities || []);
    return {
      date: new Date(s.asOf),
      value: netWorth(s.assets || [], s.liabilities || []),
      ...byCat
    };
  });
  const grouped = groupByPeriod(pts, period);
  return grouped.map(({ lastDate, ...rest }) => rest);
}
function useSnapshots({ assets, setAssets, liabilities, setLiabilities, assetTypes, liabilityTypes }) {
  const [snapshots, setSnapshots] = reactExports.useState([]);
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  function snapshotFromAssets(nextAssets = assets, nextLiabilities = liabilities, date = /* @__PURE__ */ new Date()) {
    setSnapshots((prev) => {
      const iso = date.toISOString();
      const month = iso.slice(0, 7);
      const snap = {
        asOf: iso,
        assets: (nextAssets || []).map((a) => ({ ...a })),
        liabilities: (nextLiabilities || []).map((l) => ({ ...l }))
      };
      const existing = prev.findIndex((p) => p.asOf.slice(0, 7) === month);
      let s;
      if (existing >= 0) {
        s = prev.map((p, i) => i === existing ? snap : p);
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
    setSnapshots(
      (prev) => prev.map(
        (s, i) => i === currentIndex ? {
          ...s,
          assets: (nextAssets || []).map((a) => ({ ...a })),
          liabilities: (nextLiabilities || []).map((l) => ({ ...l }))
        } : s
      )
    );
  }
  function handleSelectSnapshot(i) {
    const snap = snapshots[i];
    if (!snap) return;
    setCurrentIndex(i);
    setAssets((snap.assets || []).map((a) => ({ ...a, name: a.name || labelFor(a.type, assetTypes) })));
    setLiabilities(
      (snap.liabilities || []).map((l) => ({
        ...l,
        name: l.name || labelFor(l.type, liabilityTypes),
        priority: !!l.priority
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
      const next = prev.map((s, idx) => idx === i ? { ...s, asOf: iso } : s).sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setCurrentIndex(next.findIndex((s) => s.asOf === iso));
      return next;
    });
  }
  function handleDeleteSnapshot(i) {
    setSnapshots((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      setCurrentIndex(Math.max(0, i - 1));
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
    handleDeleteSnapshot
  };
}
const DB_NAME = "portfolio-tracker-db";
const STORE = "handles";
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value) {
  const db = await idbOpen();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const MAGIC = new TextEncoder().encode("PTv1.enc");
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 15e4, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
function concatBytes(...parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}
async function encryptJson(obj, password) {
  const plaintext = new TextEncoder().encode(JSON.stringify(obj, null, 2));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const payload = concatBytes(new Uint8Array(MAGIC), salt, iv, ciphertext);
  return payload;
}
async function decryptJson(buf, password) {
  const data = new Uint8Array(buf);
  const magic = data.slice(0, 8);
  if (!equalBytes(magic, MAGIC)) throw new Error("Invalid file format");
  const salt = data.slice(8, 24);
  const iv = data.slice(24, 36);
  const ciphertext = data.slice(36);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  const json = new TextDecoder().decode(new Uint8Array(plaintext));
  return JSON.parse(json);
}
function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
async function encryptPortfolio(data, password) {
  return await encryptJson(data, password);
}
async function decryptPortfolio(buf, password) {
  return await decryptJson(buf, password);
}
const DEFAULT_PORTFOLIO = {
  version: 5,
  currency: "USD",
  assetTypes: defaultAssetTypes,
  liabilityTypes: defaultLiabilityTypes,
  allocation: {},
  liabilities: [],
  snapshots: []
};
function upgradePortfolio(data) {
  if (!data || typeof data !== "object") return DEFAULT_PORTFOLIO;
  let out = { ...data };
  if (out.version === 1) {
    out = { currency: "USD", ...out, version: 2 };
  }
  if (out.version === 2) {
    out = {
      ...out,
      liabilityTypes: defaultLiabilityTypes,
      snapshots: (out.snapshots || []).map((s) => ({ ...s, liabilities: s.liabilities || [] })),
      version: 3
    };
  }
  if (out.version === 3) {
    out = { ...out, liabilities: out.liabilities || [], version: 4 };
  }
  if (out.version === 4) {
    out = {
      ...out,
      liabilities: (out.liabilities || []).map((l) => ({ priority: false, ...l })),
      snapshots: (out.snapshots || []).map((s) => ({
        ...s,
        liabilities: (s.liabilities || []).map((l) => ({ priority: false, ...l }))
      })),
      version: 5
    };
  }
  return out;
}
async function openExistingFile() {
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }]
  });
  await idbSet("fileHandle", handle);
  return handle;
}
async function createNewFile() {
  const handle = await window.showSaveFilePicker({
    suggestedName: "portfolio.enc",
    types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }]
  });
  await idbSet("fileHandle", handle);
  const writable = await handle.createWritable();
  await writable.close();
  return handle;
}
async function getSavedFile() {
  const handle = await idbGet("fileHandle");
  return handle;
}
async function clearSavedFile() {
  await idbSet("fileHandle", null);
}
async function readPortfolioFile(handle, password) {
  const file = await handle.getFile();
  if (file.size === 0) return DEFAULT_PORTFOLIO;
  const buf = await file.arrayBuffer();
  const data = await decryptJson(buf, password);
  return upgradePortfolio(data);
}
async function writePortfolioFile(handle, password, data) {
  const payload = await encryptJson(data, password);
  const writable = await handle.createWritable();
  await writable.write(payload);
  await writable.close();
}
let tokenClient;
let driveReady = false;
const DRIVE_FILENAME_KEY = "driveFilename";
function initDrive({ apiKey, clientId }) {
  return new Promise((resolve) => {
    gapi.load("client", async () => {
      try {
        await gapi.client.init({
          apiKey,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
        });
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
        const searchParams = url.searchParams;
        const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
        const code = searchParams.get("code") || hashParams.get("code");
        if (accessToken || code) {
          gapi.client.setToken(
            accessToken ? { access_token: accessToken } : { code }
          );
          url.hash = "";
          url.search = "";
          window.history.replaceState({}, "", url.toString());
        }
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: () => {
          },
          ux_mode: "redirect",
          redirect_uri: window.location.origin
        });
        driveReady = true;
      } catch (err) {
        console.error("Failed to initialize Google Drive", err);
        tokenClient = void 0;
        driveReady = false;
      }
      resolve();
    });
  });
}
function ensureToken() {
  const token = gapi.client.getToken();
  if (token?.access_token) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    tokenClient.callback = () => resolve();
    tokenClient.requestAccessToken({ prompt: "" });
  });
}
async function openDriveFile() {
  if (!driveReady || !gapi?.client?.getToken || !tokenClient) return;
  try {
    await ensureToken();
  } catch (err) {
    throw new Error("Failed to authorize with Google Drive");
  }
  const defaultName = localStorage.getItem(DRIVE_FILENAME_KEY) || "portfolio.enc";
  const name = prompt("Enter Google Drive filename", defaultName);
  if (!name) return;
  localStorage.setItem(DRIVE_FILENAME_KEY, name);
  try {
    const res = await gapi.client.drive.files.list({
      q: `name='${name.replace(/['\\]/g, "\\$&")}' and trashed=false`,
      pageSize: 1,
      fields: "files(id)"
    });
    const file = res?.result?.files?.[0];
    return file?.id;
  } catch (err) {
    throw new Error("Failed to search Google Drive for file");
  }
}
async function readDrivePortfolioFile(fileId, password) {
  if (!driveReady || !tokenClient) return;
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: "Bearer " + token }
  });
  const buf = await res.arrayBuffer();
  if (buf.byteLength === 0) return DEFAULT_PORTFOLIO;
  return await decryptPortfolio(buf, password);
}
async function writeDrivePortfolioFile(fileId, password, data) {
  if (!driveReady || !tokenClient) return;
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const payload = await encryptPortfolio(data, password);
  const metadata = { name: localStorage.getItem(DRIVE_FILENAME_KEY) || "portfolio.enc" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", new Blob([payload], { type: "application/octet-stream" }));
  const method = fileId ? "PATCH" : "POST";
  const url = fileId ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart` : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  const res = await fetch(url, {
    method,
    headers: { Authorization: "Bearer " + token },
    body: form
  });
  const json = await res.json();
  return json.id;
}
function usePortfolioFile({
  assets,
  setAssets,
  liabilities,
  setLiabilities,
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  allocation,
  setAllocation,
  snapshots,
  setSnapshots,
  snapshotFromAssets,
  setCurrentIndex
}) {
  const [password, setPassword] = reactExports.useState("");
  const [fileHandle, setFileHandle] = reactExports.useState(null);
  const [driveFileId, setDriveFileId] = reactExports.useState(null);
  const [step, setStep] = reactExports.useState("pick");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [dirty, setDirty] = reactExports.useState(false);
  const skipDirty = reactExports.useRef(true);
  reactExports.useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedFile();
        if (saved && saved.queryPermission) {
          const perm = await saved.queryPermission({ mode: "readwrite" });
          if (perm === "granted" || perm === "prompt") {
            setFileHandle(saved);
            setStep("password");
          } else {
            await clearSavedFile();
          }
        }
      } catch (e) {
        console.warn("No saved handle", e);
      }
    })();
  }, []);
  reactExports.useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    setDirty(true);
  }, [assetTypes, liabilityTypes, allocation, snapshots]);
  async function handleOpenExisting() {
    try {
      const h = await openExistingFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }
  async function handleCreateNew() {
    try {
      const h = await createNewFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }
  async function handleOpenDrive() {
    try {
      const id = await openDriveFile();
      if (!id) {
        setError("Select a Google Drive file.");
        return;
      }
      setDriveFileId(id);
      setFileHandle(null);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }
  async function handleOpenSample() {
    setLoading(true);
    setError(null);
    try {
      const types = Object.keys(defaultAssetTypes);
      const sampleAssets = Array.from({ length: 5 }, (_, i) => {
        const t = types[Math.floor(Math.random() * types.length)];
        const a = mkAsset(t, defaultAssetTypes, `Sample ${i + 1}`);
        a.value = Math.round(Math.random() * 5e4);
        return a;
      });
      const sampleSnapshots = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const snapAssets = sampleAssets.map((a) => ({
          ...a,
          value: Math.round(a.value * (0.8 + Math.random() * 0.4))
        }));
        sampleSnapshots.push({ asOf: d.toISOString(), assets: snapAssets, liabilities: [] });
      }
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setAllocation({});
      setSnapshots(sampleSnapshots);
      setAssets(sampleSnapshots[sampleSnapshots.length - 1].assets);
      setLiabilities([]);
      setCurrentIndex(sampleSnapshots.length - 1);
      setStep("main");
      setDirty(false);
      skipDirty.current = true;
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  async function handleLoad() {
    if (!fileHandle && !driveFileId) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    setLoading(true);
    setError(null);
    try {
      let data;
      if (driveFileId) {
        data = await readDrivePortfolioFile(driveFileId, password);
      } else {
        const file = await fileHandle.getFile();
        const isEmpty = file.size === 0;
        data = await readPortfolioFile(fileHandle, password);
        if (isEmpty) {
          await writePortfolioFile(fileHandle, password, data);
        }
      }
      const snaps = (data.snapshots || []).slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setSnapshots(snaps);
      const latest = snaps[snaps.length - 1];
      const at = data.assetTypes || defaultAssetTypes;
      const lt = data.liabilityTypes || defaultLiabilityTypes;
      if (latest) {
        setAssets((latest.assets || []).map((a) => ({ ...a, id: mkId(), name: a.name || labelFor(a.type, at) })));
        setLiabilities(
          (latest.liabilities || []).map((l) => ({
            ...l,
            id: mkId(),
            name: l.name || labelFor(l.type, lt),
            priority: !!l.priority
          }))
        );
        setCurrentIndex(snaps.length - 1);
      } else {
        snapshotFromAssets(assets, liabilities);
      }
      setAllocation(data.allocation || {});
      setAssetTypes(at);
      setLiabilityTypes(lt);
      setStep("main");
      setDirty(false);
      skipDirty.current = true;
    } catch (e) {
      if (e && (e.name === "NotAllowedError" || e.name === "NotFoundError")) {
        await clearSavedFile();
        setFileHandle(null);
        setStep("pick");
        setError("Cannot access saved file. Please pick it again.");
      } else {
        setError(e && e.message ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }
  function buildPortfolioData() {
    return { ...DEFAULT_PORTFOLIO, assetTypes, liabilityTypes, allocation, snapshots, liabilities };
  }
  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    if (!fileHandle && !driveFileId) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    await withLoading(async () => {
      const data = buildPortfolioData();
      if (driveFileId) {
        const id = await writeDrivePortfolioFile(driveFileId, password, data);
        setDriveFileId(id);
      } else {
        await writePortfolioFile(fileHandle, password, data);
      }
      setDirty(false);
      skipDirty.current = true;
    });
  }
  async function handleCloseFile() {
    if (!fileHandle && !driveFileId) return;
    await withLoading(async () => {
      const data = buildPortfolioData();
      if (driveFileId) {
        await writeDrivePortfolioFile(driveFileId, password, data);
        setDriveFileId(null);
      } else {
        await writePortfolioFile(fileHandle, password, data);
        await clearSavedFile();
        setFileHandle(null);
      }
      setDirty(false);
      skipDirty.current = true;
      setPassword("");
      setSnapshots([]);
      setCurrentIndex(0);
      setAssets([]);
      setLiabilities([]);
      snapshotFromAssets([], []);
      setAllocation({});
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setStep("pick");
    });
  }
  return {
    password,
    setPassword,
    fileHandle,
    setFileHandle,
    step,
    setStep,
    loading,
    error,
    setError,
    dirty,
    setDirty,
    skipDirty,
    handleOpenExisting,
    handleCreateNew,
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleCloseFile
  };
}
function useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset }) {
  const [assetToDelete, setAssetToDelete] = reactExports.useState(null);
  function addAsset({ name, type, description, value }) {
    const asset = mkAsset(type, assetTypes, name);
    asset.description = description;
    asset.value = value;
    setAssetsAndUpdateSnapshot([...assets, asset]);
  }
  function updateAsset(updated) {
    setAssetsAndUpdateSnapshot(assets.map((a) => a.id === updated.id ? updated : a));
  }
  function requestDeleteAsset(asset) {
    if (!asset) return;
    if (setEditAsset) setEditAsset(null);
    setAssetToDelete(asset);
  }
  function confirmDeleteAsset() {
    if (assetToDelete) {
      setAssetsAndUpdateSnapshot(assets.filter((x) => x.id !== assetToDelete.id));
      setAssetToDelete(null);
    }
  }
  function cancelDeleteAsset() {
    setAssetToDelete(null);
  }
  return {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset
  };
}
function useLiabilityManager({ assets, liabilities, liabilityTypes, setAssetsAndUpdateSnapshot, setEditLiability }) {
  const [liabilityToDelete, setLiabilityToDelete] = reactExports.useState(null);
  function addLiability({ name, type, description, value }) {
    const liability = mkAsset(type, liabilityTypes, name);
    liability.description = description;
    liability.value = value;
    liability.priority = false;
    setAssetsAndUpdateSnapshot(assets, [...liabilities, liability]);
  }
  function updateLiability(updated) {
    setAssetsAndUpdateSnapshot(
      assets,
      liabilities.map((l) => l.id === updated.id ? updated : l)
    );
  }
  function requestDeleteLiability(liability) {
    if (!liability) return;
    if (setEditLiability) setEditLiability(null);
    setLiabilityToDelete(liability);
  }
  function confirmDeleteLiability() {
    if (liabilityToDelete) {
      setAssetsAndUpdateSnapshot(
        assets,
        liabilities.filter((x) => x.id !== liabilityToDelete.id)
      );
      setLiabilityToDelete(null);
    }
  }
  function cancelDeleteLiability() {
    setLiabilityToDelete(null);
  }
  return {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability
  };
}
const version = "1.0.49";
const pkg = {
  version
};
function App() {
  const [assetTypes, setAssetTypes] = reactExports.useState(defaultAssetTypes);
  const [liabilityTypes, setLiabilityTypes] = reactExports.useState(defaultLiabilityTypes);
  const [assets, setAssets] = reactExports.useState([]);
  const [liabilities, setLiabilities] = reactExports.useState([]);
  const [allocation, setAllocation] = reactExports.useState({});
  const [period, setPeriod] = reactExports.useState("monthly");
  const [chartMode, setChartMode] = reactExports.useState("total");
  const [configOpen, setConfigOpen] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [addLiabilityOpen, setAddLiabilityOpen] = reactExports.useState(false);
  const [editAsset, setEditAsset] = reactExports.useState(null);
  const [editLiability, setEditLiability] = reactExports.useState(null);
  const [showTarget, setShowTarget] = reactExports.useState(false);
  const driveApiKey = "AIzaSyD9IhFBHBHEs729edMO7LsoKZFlTfsnv5U";
  const driveClientId = "967365398072-sj6mjo1r3pdg18frmdl5aoafnvbbsfob.apps.googleusercontent.com";
  const driveReady2 = driveClientId;
  const {
    snapshots,
    setSnapshots,
    currentIndex,
    setCurrentIndex,
    snapshotFromAssets,
    setAssetsAndUpdateSnapshot,
    handleSelectSnapshot,
    handleAddSnapshot,
    handleChangeSnapshotDate,
    handleDeleteSnapshot
  } = useSnapshots({ assets, setAssets, liabilities, setLiabilities, assetTypes, liabilityTypes });
  const {
    password,
    setPassword,
    setFileHandle,
    step,
    setStep,
    loading,
    error,
    setError,
    dirty,
    handleOpenExisting,
    handleCreateNew,
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleCloseFile
  } = usePortfolioFile({
    assets,
    setAssets,
    liabilities,
    setLiabilities,
    assetTypes,
    setAssetTypes,
    liabilityTypes,
    setLiabilityTypes,
    allocation,
    setAllocation,
    snapshots,
    setSnapshots,
    snapshotFromAssets,
    setCurrentIndex
  });
  const {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset
  } = useAssetManager({
    assets,
    assetTypes,
    setAssetsAndUpdateSnapshot,
    setEditAsset
  });
  const {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability
  } = useLiabilityManager({
    assets,
    liabilities,
    liabilityTypes,
    setAssetsAndUpdateSnapshot,
    setEditLiability
  });
  reactExports.useEffect(() => {
    snapshotFromAssets(assets, liabilities);
  }, []);
  reactExports.useEffect(() => {
    {
      initDrive({ apiKey: driveApiKey, clientId: driveClientId });
    }
  }, [driveReady2, driveApiKey, driveClientId]);
  const totalNow = reactExports.useMemo(() => netWorth(assets, liabilities), [assets, liabilities]);
  const series = reactExports.useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalancePlanData = reactExports.useMemo(
    () => rebalance(assets, liabilities, allocation),
    [assets, liabilities, allocation]
  );
  const prevAssets = reactExports.useMemo(() => currentIndex > 0 ? snapshots[currentIndex - 1]?.assets || [] : [], [snapshots, currentIndex]);
  const prevLiabilities = reactExports.useMemo(
    () => currentIndex > 0 ? snapshots[currentIndex - 1]?.liabilities || [] : [],
    [snapshots, currentIndex]
  );
  const currentAllocation = reactExports.useMemo(() => currentByCategory(assets, liabilities), [assets, liabilities]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-zinc-100", children: [
    step === "pick" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleOpenExisting, className: "h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500", children: "Open existing file" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCreateNew, className: "h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500", children: "Create new file" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleOpenDrive, className: "h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500", children: "Open from Google Drive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleOpenSample, className: "text-sm text-blue-400 underline", children: "Open sample portfolio" })
    ] }),
    step === "password" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      handleLoad();
    }, className: "max-w-md mx-auto p-6 space-y-4", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-400", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextInput,
        {
          label: "Password",
          type: "password",
          value: password,
          onChange: setPassword,
          className: "w-full",
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setFileHandle(null);
          setPassword("");
          setError(null);
          setStep("pick");
        }, className: "h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700", children: "Open" })
      ] })
    ] }),
    step === "main" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "Local‑First Portfolio Tracker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: "Private by default · Encrypted portfolio file on your disk" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleSave,
                title: "Save",
                className: `h-10 w-10 rounded-lg border flex items-center justify-center text-xl ${dirty ? "bg-blue-600 hover:bg-blue-500 border-blue-500" : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"}`,
                children: "💾"
              }
            ),
            dirty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", title: "Unsaved changes", children: "●" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfigOpen(true), className: "h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl", children: "⚙" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCloseFile, title: "Close", className: "h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl", children: "✖" })
          ] })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200", children: error }),
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-zinc-800 text-zinc-300", children: "Working…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Section,
            {
              title: "Net worth (current)",
              right: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onMouseDown: () => setShowTarget(true),
                  onMouseUp: () => setShowTarget(false),
                  onMouseLeave: () => setShowTarget(false),
                  className: "px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs",
                  title: "Show target while held",
                  children: "Target"
                }
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-semibold", children: formatCurrency(totalNow) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-400 mt-1", children: "Computed from asset list" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PieChart,
                  {
                    data: currentAllocation,
                    targetData: rebalancePlanData.idealByCat,
                    showTarget,
                    assetTypes
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Section,
            {
              title: "History view",
              right: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: period,
                    onChange: (e) => setPeriod(e.target.value),
                    className: "bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monthly", children: "Monthly" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "yearly", children: "Yearly" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg overflow-hidden border border-zinc-700 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setChartMode("total"),
                      className: `px-2 py-1 ${chartMode === "total" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`,
                      children: "Net worth"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setChartMode("category"),
                      className: `px-2 py-1 ${chartMode === "category" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`,
                      children: "By category"
                    }
                  )
                ] })
              ] }),
              children: chartMode === "total" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                LineChart,
                {
                  data: series,
                  showGridlines: series.length > 2,
                  showMarkers: series.length > 2,
                  showVerticalGridlines: period === "monthly"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(StackedAreaChart, { data: series, assetTypes })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Rebalance", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-zinc-400 mb-2", children: "Cash above target allocation is distributed to under-allocated categories." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RebalancePlan, { data: rebalancePlanData, assetTypes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Section,
          {
            title: "Assets",
            right: currentIndex === snapshots.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddBtn, { onClick: () => setAddOpen(true), title: "Add asset" }) : null,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SnapshotTabs,
                {
                  snapshots,
                  currentIndex,
                  onSelect: handleSelectSnapshot,
                  onAdd: handleAddSnapshot,
                  onChangeDate: handleChangeSnapshotDate,
                  onDelete: handleDeleteSnapshot
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AssetTable,
                {
                  assets,
                  prevAssets,
                  setAssets: setAssetsAndUpdateSnapshot,
                  assetTypes,
                  onEdit: (a) => setEditAsset(a)
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Section,
          {
            title: "Liabilities",
            right: currentIndex === snapshots.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddBtn, { onClick: () => setAddLiabilityOpen(true), title: "Add liability" }) : null,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              LiabilityTable,
              {
                liabilities,
                prevLiabilities,
                setLiabilities: (next) => setAssetsAndUpdateSnapshot(assets, next),
                liabilityTypes,
                onEdit: (l) => setEditLiability(l)
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "text-center text-xs text-zinc-500 mt-12", children: [
        "v",
        pkg.version
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddAssetModal, { open: addOpen, onClose: () => setAddOpen(false), assetTypes, onAdd: addAsset }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AddLiabilityModal,
        {
          open: addLiabilityOpen,
          onClose: () => setAddLiabilityOpen(false),
          liabilityTypes,
          onAdd: addLiability
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        EditAssetModal,
        {
          open: !!editAsset,
          asset: editAsset,
          onClose: () => setEditAsset(null),
          assetTypes,
          onSave: updateAsset,
          onDelete: requestDeleteAsset
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        EditLiabilityModal,
        {
          open: !!editLiability,
          liability: editLiability,
          onClose: () => setEditLiability(null),
          liabilityTypes,
          onSave: updateLiability,
          onDelete: requestDeleteLiability
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfirmModal,
        {
          open: !!assetToDelete,
          title: "Remove asset?",
          onConfirm: confirmDeleteAsset,
          onCancel: cancelDeleteAsset
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfirmModal,
        {
          open: !!liabilityToDelete,
          title: "Remove liability?",
          onConfirm: confirmDeleteLiability,
          onCancel: cancelDeleteLiability
        }
      )
    ] }),
    configOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900 rounded-xl p-6 max-w-3xl w-full max-h-full overflow-y-auto space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Configuration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfigOpen(false), title: "Close", className: "h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center", children: "✖" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigPage,
        {
          assetTypes,
          setAssetTypes,
          liabilityTypes,
          setLiabilityTypes,
          allocation,
          setAllocation,
          assets,
          liabilities
        }
      )
    ] }) })
  ] });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
