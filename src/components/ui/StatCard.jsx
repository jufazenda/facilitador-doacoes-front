export default function StatCard({ value, label, color = "text-primary", size = "text-xl" }) {
  return (
    <div className="bg-white rounded-xl border border-line p-4 text-center">
      <p className={`${size} font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  )
}
