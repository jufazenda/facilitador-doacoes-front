import { useRef, useState, useCallback, useEffect } from "react"
import { X, Check, ZoomIn, ZoomOut } from "lucide-react"

/**
 * Modal that lets the user drag and zoom a photo inside a fixed frame,
 * then confirms the cropped result.
 *
 * Props:
 *   file         {File}         the image file selected
 *   frameShape   {"circle"|"rounded-2xl"|string}
 *   aspectRatio  {number}       width/height — e.g. 1 for square, 2/3 for cover
 *   onConfirm    ({file, position: "x% y%", scale}) => void
 *   onCancel     () => void
 */
export default function PhotoCropModal({ file, frameShape = "rounded-2xl", aspectRatio = 1, onConfirm, onCancel }) {
  const [objectUrl, setObjectUrl] = useState(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })   // % within the image
  const [scale, setScale] = useState(1)
  const frameRef = useRef(null)
  const dragStart = useRef(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    setDragging(true)
    frameRef.current?.setPointerCapture(e.pointerId)
  }, [pos])

  const onPointerMove = useCallback((e) => {
    if (!dragging || !dragStart.current || !frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    // movement as % of frame size, divided by scale so faster drag = wider range at lower zoom
    const dx = (e.clientX - dragStart.current.mx) / rect.width  * 100 / scale
    const dy = (e.clientY - dragStart.current.my) / rect.height * 100 / scale
    setPos({
      x: Math.min(100, Math.max(0, dragStart.current.px - dx)),
      y: Math.min(100, Math.max(0, dragStart.current.py - dy)),
    })
  }, [dragging, scale])

  const onPointerUp = useCallback(() => {
    setDragging(false)
    dragStart.current = null
  }, [])

  function handleWheel(e) {
    e.preventDefault()
    setScale((s) => Math.min(3, Math.max(0.5, s - e.deltaY * 0.001)))
  }

  function handleConfirm() {
    onConfirm({ file, position: `${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`, scale })
  }

  // frame dimensions: base 320px wide
  const frameW = 320
  const frameH = Math.round(frameW / aspectRatio)

  const isCircle = frameShape === "rounded-full" || frameShape === "circle"
  const clipClass = isCircle ? "rounded-full" : frameShape

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="flex flex-col gap-4 rounded-2xl bg-white shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Ajustar foto</p>
          <button type="button" onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink transition-colors">
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-muted -mt-2">Arraste para reposicionar · Role para zoom</p>

        {/* frame */}
        <div className="flex items-center justify-center">
          <div
            className={`relative overflow-hidden bg-soft ${clipClass} ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ width: frameW, height: frameH }}
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={handleWheel}
          >
            {objectUrl && (
              <img
                src={objectUrl}
                alt=""
                draggable={false}
                className="absolute inset-0 select-none pointer-events-none"
                style={{
                  width: `${100 * scale}%`,
                  height: `${100 * scale}%`,
                  left: `${-(pos.x / 100) * (scale - 1) * 100}%`,
                  top: `${-(pos.y / 100) * (scale - 1) * 100}%`,
                  objectFit: "cover",
                  objectPosition: `${pos.x}% ${pos.y}%`,
                  maxWidth: "none",
                }}
              />
            )}
          </div>
        </div>

        {/* zoom slider */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))} className="text-muted hover:text-ink">
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min={50} max={300} step={1}
            value={Math.round(scale * 100)}
            onChange={(e) => setScale(Number(e.target.value) / 100)}
            className="flex-1 accent-primary"
          />
          <button type="button" onClick={() => setScale((s) => Math.min(3, s + 0.1))} className="text-muted hover:text-ink">
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:border-ink hover:text-ink transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
          >
            <Check size={14} /> Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
