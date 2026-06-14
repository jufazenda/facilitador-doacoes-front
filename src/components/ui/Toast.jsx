import { useEffect, useRef, useState } from "react"

const VARIANTS = {
  success: {
    bar:  "bg-success",
    icon: "bg-success-light text-success",
    border: "border-success/20",
    symbol: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    bar:  "bg-accent",
    icon: "bg-red-100 text-accent",
    border: "border-red-200",
    symbol: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    bar:  "bg-primary",
    icon: "bg-primary-light text-primary",
    border: "border-primary/20",
    symbol: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 6.5v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    bar:  "bg-warning",
    icon: "bg-warning-light text-warning",
    border: "border-warning/30",
    symbol: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5L13 12.5H1L7 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 5.5v3M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
}

const DURATION = 4000

export default function Toast({ type = "success", msg, onClose }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const v = VARIANTS[type] ?? VARIANTS.info

  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true))

    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100))
    }, 16)

    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onCloseRef.current(), 300)
    }, DURATION)

    return () => {
      cancelAnimationFrame(showTimer)
      clearInterval(tick)
      clearTimeout(hide)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] w-80 overflow-hidden rounded-xl border bg-white shadow-2xl
        transition-all duration-300 ease-out
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      style={{ borderColor: "var(--color-line)" }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${v.icon}`}>
          {v.symbol}
        </span>
        <p className="flex-1 text-sm font-semibold text-ink leading-snug pt-0.5">{msg}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
          className="mt-0.5 shrink-0 text-muted transition-colors hover:text-ink"
          aria-label="Fechar"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="h-1 w-full bg-soft">
        <div
          className={`h-full ${v.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
