import LiabilityFormModal from "./LiabilityFormModal.jsx";

export default function AddLiabilityModal(props) {
  return <LiabilityFormModal {...props} liability={null} onSave={props.onAdd} />;
}
