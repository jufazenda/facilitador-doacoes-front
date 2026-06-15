import { useRef, useState } from "react"
import { Camera, Pencil } from "lucide-react"
import { useImagePosition } from "../../hooks/useCoverPosition"
import PhotoCropModal from "./PhotoCropModal"

/**
 * Photo frame with:
 * - Camera badge on hover (or edit overlay when editMode=true)
 * - On file select: opens PhotoCropModal so user drags+zooms inside the frame
 * - Persists confirmed position to localStorage via storageKey
 *
 * Props:
 *   imageUrl     {string|null}
 *   fallback     {ReactNode}
 *   shape        {string}   Tailwind border-radius class, e.g. "rounded-full" or "rounded-2xl"
 *   size         {string}   Tailwind size classes, e.g. "w-14 h-14"
 *   aspectRatio  {number}   width/height for crop modal frame — default 1 (square)
 *   storageKey   {string}   localStorage key for position
 *   uploading    {boolean}
 *   onFileChange {(file: File, position: string) => void}
 *   accept       {string}
 *   editMode     {boolean}  when true shows a persistent "Editar foto" overlay
 *   className    {string}
 */
export default function DraggablePhoto({
  imageUrl,
  fallback,
  shape = "rounded-full",
  size = "w-14 h-14",
  aspectRatio = 1,
  storageKey,
  uploading = false,
  onFileChange,
  accept = "image/*",
  editMode = false,
  className = "",
}) {
  const inputRef = useRef(null)
  const { position, save } = useImagePosition(storageKey)
  const [pendingFile, setPendingFile] = useState(null)

  function handleInputChange(e) {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ""
  }

  function handleCropConfirm({ file, position: pos }) {
    save(pos)
    setPendingFile(null)
    onFileChange(file, pos)
  }

  return (
    <>
      <div className={`group relative shrink-0 ${size} ${className}`}>
        {/* frame */}
        <div
          className={`w-full h-full overflow-hidden ${shape} ${!uploading ? "cursor-pointer" : ""}`}
          onClick={() => { if (!uploading) inputRef.current?.click() }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="w-full h-full object-cover select-none"
              style={{ objectPosition: position }}
            />
          ) : (
            <div className={`w-full h-full ${shape} flex items-center justify-center`}>
              {fallback}
            </div>
          )}
        </div>

        {/* edit overlay — shown when editMode=true */}
        {editMode && !uploading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-[inherit] bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Pencil size={13} className="text-white" />
            <span className="text-white text-[10px] font-semibold leading-tight">Editar foto</span>
          </div>
        )}

        {/* camera badge — shown when editMode=false */}
        {!editMode && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary shadow-sm transition-opacity ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            tabIndex={-1}
          >
            {uploading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={11} className="text-white" />
            )}
          </button>
        )}

        {/* uploading spinner when editMode */}
        {editMode && uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-ink/40">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {pendingFile && (
        <PhotoCropModal
          file={pendingFile}
          frameShape={shape}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </>
  )
}
