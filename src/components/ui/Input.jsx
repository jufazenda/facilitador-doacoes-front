import { useState } from "react"

const BASE =
  "w-full rounded-2xl border border-line bg-white py-3.5 text-sm font-semibold text-ink shadow-sm outline-none transition-all placeholder:font-normal placeholder:text-muted hover:border-primary/40 hover:bg-soft focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"

function parseCentavos(value) {
  const n = parseFloat(value)
  return isNaN(n) || n <= 0 ? 0 : Math.round(n * 100)
}

function MoneyInput({ className = "", name, value, onChange, required, autoFocus }) {
  const [centavos, setCentavos] = useState(() => parseCentavos(value))
  const [prevValue, setPrevValue] = useState(value)

  if (value !== prevValue) {
    setPrevValue(value)
    setCentavos(parseCentavos(value))
  }

  const displayValue = centavos === 0
    ? ""
    : (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  function handleKeyDown(e) {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault()
      const next = Math.min(centavos * 10 + parseInt(e.key, 10), 9999999999)
      setCentavos(next)
      onChange?.({ target: { name, value: next === 0 ? "" : String(next / 100) } })
    } else if (e.key === "Backspace") {
      e.preventDefault()
      const next = Math.floor(centavos / 10)
      setCentavos(next)
      onChange?.({ target: { name, value: next === 0 ? "" : String(next / 100) } })
    }
  }

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, "")
    const next = Math.min(parseInt(digits || "0", 10), 9999999999)
    setCentavos(next)
    onChange?.({ target: { name, value: next === 0 ? "" : String(next / 100) } })
  }

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-sm font-bold text-muted">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        className={`${BASE} pl-10 pr-4`}
        value={displayValue}
        placeholder="0,00"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        name={name}
        required={required}
        autoFocus={autoFocus}
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function Input({ type = "text", className = "", ...props }) {
  const [showPwd, setShowPwd] = useState(false)

  if (type === "search") {
    return (
      <div className={`relative ${className}`}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <SearchIcon />
        </span>
        <input type="search" className={`${BASE} pl-10 pr-4`} {...props} />
      </div>
    )
  }

  if (type === "money") return <MoneyInput className={className} {...props} />

  if (type === "password") {
    return (
      <div className={`relative ${className}`}>
        <input type={showPwd ? "text" : "password"} className={`${BASE} pl-4 pr-11`} {...props} />
        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
        >
          {showPwd ? <EyeOff /> : <EyeOn />}
        </button>
      </div>
    )
  }

  return <input type={type} className={`${BASE} px-4 flex justify-center ${className}`} {...props} />
}
