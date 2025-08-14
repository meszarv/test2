import Section from "./Section.jsx";
import AssetTypeManager from "./AssetTypeManager.jsx";
import AllocationEditor from "./AllocationEditor.jsx";

export default function ConfigPage({ assetTypes, setAssetTypes, allocation, setAllocation, assets }) {
  return (
    <div className="space-y-6">
      <Section title="Asset Types">
        <AssetTypeManager assetTypes={assetTypes} setAssetTypes={setAssetTypes} assets={assets} />
      </Section>
      <Section title="Allocation">
        <AllocationEditor allocation={allocation} setAllocation={setAllocation} assetTypes={assetTypes} />
      </Section>
    </div>
  );
}
