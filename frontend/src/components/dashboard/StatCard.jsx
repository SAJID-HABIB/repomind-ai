function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default StatCard;
