import TextInput from "./TextInput.jsx";
import AddBtn from "./AddBtn.jsx";
import { mkAsset } from "../utils.js";

export default function AssetList({ assets, setAssets, assetTypes }) {
  function update(id, patch) {
    setAssets(assets.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  function remove(id) {
    setAssets(assets.filter((a) => a.id !== id));
  }

  function add(type) {
    setAssets([
      ...assets,
      mkAsset(type, assetTypes)
    ]);
  }

  function changeType(id, type) {
    setAssets(assets.map((a) => {
      if (a.id !== id) return a;
      const repl = mkAsset(type, assetTypes);
      return { ...repl, id: a.id, value: a.value };
    }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(assetTypes).map((k) => (
          <AddBtn key={k} onClick={() => add(k)}>Add {k}</AddBtn>
        ))}
      </div>
      <div className="space-y-2">
        {assets.map((a) => {
          const def = assetTypes[a.type] || { fields: [] };
          return (
            <div key={a.id} className="grid md:grid-cols-12 gap-2 items-end bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400">Type</label>
                <select
                  className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
                  value={a.type}
                  onChange={(e) => changeType(a.id, e.target.value)}
                >
                  {!assetTypes[a.type] && <option value={a.type}>{a.type}</option>}
                  {Object.keys(assetTypes).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {def.fields.map((f) => (
                <TextInput
                  key={f.key}
                  className="md:col-span-3"
                  label={f.label}
                  value={a[f.key] || ""}
                  onChange={(v) => update(a.id, { [f.key]: v })}
                />
              ))}

              <TextInput className="md:col-span-3" label="Value" type="number" value={String(a.value)} onChange={(v) => update(a.id, { value: Number(v || 0) })} />

              <div className="md:col-span-1 flex justify-end">
                <button onClick={() => remove(a.id)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
