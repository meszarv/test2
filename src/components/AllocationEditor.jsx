import TextInput from "./TextInput.jsx";
import { labelFor } from "../utils.js";

export default function AllocationEditor({ allocation, setAllocation, assetTypes }) {
  const keys = Array.from(new Set([...Object.keys(assetTypes), ...Object.keys(allocation || {})]));
  const total = Object.values(allocation || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  function setKey(k, v) { setAllocation({ ...allocation, [k]: v }); }
  function remove(k) { const { [k]: _discard, ...rest } = allocation; setAllocation(rest); }
  function add() { const name = window.prompt("New category key (slug)", "other"); if (name) setAllocation({ ...allocation, [name]: 0 }); }

  return (
    <div className="space-y-2">
      {keys.map((k) => (
        <div key={k} className="grid grid-cols-12 items-end gap-2">
          <div className="col-span-6 text-zinc-300">{labelFor(k, assetTypes)}</div>
          <div className="col-span-4">
            <TextInput label="Target %" type="number" value={String(allocation[k] ?? 0)} onChange={(v) => setKey(k, Number(v || 0))} />
          </div>
          <div className="col-span-2 flex justify-end">
            <button onClick={() => remove(k)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between mt-2">
        <button onClick={add} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">Add category</button>
        <div className={`text-sm ${total === 100 ? "text-emerald-400" : "text-amber-400"}`}>Total: {total}% {total !== 100 && "(will be normalized)"}</div>
      </div>
    </div>
  );
}
