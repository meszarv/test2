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
    </div>
  );
}
