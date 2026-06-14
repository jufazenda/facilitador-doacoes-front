export default function TabBar({ tabs, active, onChange, renderBadge }) {
  return (
    <div className="flex overflow-x-auto overflow-y-hidden border-b border-line gap-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            active === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {t}
          {renderBadge?.(t)}
        </button>
      ))}
    </div>
  )
}
