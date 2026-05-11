import { useEffect, useRef, useState } from "react"

export default function Select({ value, onChange, name, options = [], placeholder = "Selecionar", className = "" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find((o) => String(o.value) === String(value))

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [open])

  function choose(optValue) {
    onChange?.({ target: { name, value: optValue } })
    setOpen(false)
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value ?? ""} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-line bg-white py-3.5 pl-4 pr-3.5 text-sm font-semibold shadow-sm outline-none transition-all hover:border-primary/40 hover:bg-soft focus:border-primary focus:ring-2 focus:ring-primary/10"
      >
        <span className={`truncate ${selected ? "text-ink" : "text-muted"}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-2xl shadow-ink/10">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => choose(opt.value)}
                className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  String(opt.value) === String(value)
                    ? "bg-primary-light text-primary"
                    : "text-ink hover:bg-soft"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
