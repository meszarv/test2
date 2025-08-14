export default function Section({ title, children, right }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-zinc-200 font-medium">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
