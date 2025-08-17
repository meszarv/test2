export default function AddBtn({ onClick, title, className = "" }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-lg ${className}`}
    >
      +
    </button>
  );
}
