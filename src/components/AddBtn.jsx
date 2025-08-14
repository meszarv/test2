export default function AddBtn({ onClick, children }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">
      {children}
    </button>
  );
}
