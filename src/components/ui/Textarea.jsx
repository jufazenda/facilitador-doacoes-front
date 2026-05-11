export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full resize-none rounded-2xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-ink shadow-sm outline-none transition-all placeholder:font-normal placeholder:text-muted hover:border-primary/40 hover:bg-soft focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 ${className}`}
      {...props}
    />
  )
}
