import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";

export default function LiabilityTypeManager({ liabilityTypes, setLiabilityTypes, liabilities }) {
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

  return (
    <div className="space-y-4">
      {Object.entries(liabilityTypes).map(([k, def]) => (
        <div key={k} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2">
          <div className="flex items-end gap-2">
            <TextInput label="Name" value={def.name} onChange={(v) => updateName(k, v)} className="md:col-span-3" />
            <div className="flex-1 text-right">
              <button onClick={() => removeType(k)} title="Delete" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">🗑️</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addType} title="Add type" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">➕</button>
    </div>
  );
}
