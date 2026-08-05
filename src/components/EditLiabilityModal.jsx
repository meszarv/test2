import LiabilityFormModal from "./LiabilityFormModal.jsx";

export default function EditLiabilityModal(props) {
  return <LiabilityFormModal {...props} onSave={props.onSave} />;
}
