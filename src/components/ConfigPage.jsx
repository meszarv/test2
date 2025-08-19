import Section from "./Section.jsx";
import AssetTypeManager from "./AssetTypeManager.jsx";
import LiabilityTypeManager from "./LiabilityTypeManager.jsx";
import AllocationEditor from "./AllocationEditor.jsx";

export default function ConfigPage({
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  allocation,
  setAllocation,
  assets,
  liabilities,
  onEditJson,
}) {
  return (
    <div className="space-y-6">
      <Section title="Allocation">
        <AllocationEditor allocation={allocation} setAllocation={setAllocation} assetTypes={assetTypes} />
      </Section>
      <Section title="Asset Types">
        <AssetTypeManager assetTypes={assetTypes} setAssetTypes={setAssetTypes} assets={assets} />
      </Section>
      <Section title="Liability Types">
        <LiabilityTypeManager
          liabilityTypes={liabilityTypes}
          setLiabilityTypes={setLiabilityTypes}
          liabilities={liabilities}
        />
      </Section>
      <Section title="Data">
        <button
          onClick={onEditJson}
          className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
          title="Edit JSON"
        >
          Edit JSON
        </button>
      </Section>
    </div>
  );
}
