import { IconInbox } from "@tabler/icons-react"

export default function EmptyState({ message, icon: Icon = IconInbox, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-2 py-12 text-center text-muted ${className}`}>
      <Icon size={28} stroke={1.5} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
