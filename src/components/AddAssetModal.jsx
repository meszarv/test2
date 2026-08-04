import AssetFormModal from "./AssetFormModal.jsx";

export default function AddAssetModal(props) {
  return <AssetFormModal {...props} asset={null} onSave={props.onAdd} />;
}
