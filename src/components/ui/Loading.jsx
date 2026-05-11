export default function Loading({ text = "Carregando...", full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? "min-h-[70vh]" : "py-16"}`}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
        <div className="absolute inset-2 rounded-full bg-primary/10" />
      </div>
      <p className="text-sm font-semibold text-muted">{text}</p>
    </div>
  )
}
