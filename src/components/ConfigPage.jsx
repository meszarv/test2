import Section from "./Section.jsx";
import AssetTypeManager from "./AssetTypeManager.jsx";
import LiabilityTypeManager from "./LiabilityTypeManager.jsx";
import DimensionManager from "./DimensionManager.jsx";
import StrategyEditor from "./StrategyEditor.jsx";
import TextInput from "./TextInput.jsx";

export default function ConfigPage({
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  currency,
  setCurrency,
  dimensions,
  setDimensions,
  strategy,
  setStrategy,
  assets,
  liabilities,
  onEditJson,
}) {
  return (
    <div className="space-y-6">
      <Section title="Portfolio">
        <TextInput label="Base currency" value={currency} onChange={(value) => setCurrency(value.toUpperCase())} />
      </Section>
      <Section title="Strategy">
        <StrategyEditor
          strategy={strategy}
          setStrategy={setStrategy}
          assetTypes={assetTypes}
          dimensions={dimensions}
          currency={currency}
        />
      </Section>
      <Section title="Asset Types">
        <AssetTypeManager assetTypes={assetTypes} setAssetTypes={setAssetTypes} assets={assets} dimensions={dimensions} />
      </Section>
      <Section title="Dimensions">
        <DimensionManager
          dimensions={dimensions}
          setDimensions={setDimensions}
          assetTypes={assetTypes}
          assets={assets}
          strategy={strategy}
        />
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
