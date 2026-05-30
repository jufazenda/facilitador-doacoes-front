import { useEffect, useRef, useState } from "react"

export default function Select({ value, onChange, name, options = [], placeholder = "Selecionar", className = "", searchable = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find((o) => String(o.value) === String(value))

  const filtered = searchable && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") { setOpen(false); setQuery("") }
    }
    if (open) document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [open])

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus()
  }, [open, searchable])

  function choose(optValue) {
    onChange?.({ target: { name, value: optValue } })
    setOpen(false)
    setQuery("")
  }

  function handleToggle() {
    setOpen((v) => !v)
    if (!open) setQuery("")
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value ?? ""} />

      <button
        type="button"
        onClick={handleToggle}
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
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-line bg-white shadow-2xl shadow-ink/10 overflow-hidden">
          {searchable && (
            <div className="px-3 pt-2.5 pb-1.5 border-b border-line">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-soft px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-muted shrink-0">
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-muted hover:text-ink transition-colors">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
          <ul className="max-h-52 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted text-center">Nenhum resultado</li>
            ) : filtered.map((opt) => (
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
        </div>
      )}
    </div>
  )
}
