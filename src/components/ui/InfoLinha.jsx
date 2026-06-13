export default function InfoLinha({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm text-ink font-semibold">{value}</p>
    </div>
  )
}
