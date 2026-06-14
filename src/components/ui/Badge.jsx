import { IconCircleCheck, IconClock, IconX, IconAlertTriangle } from "@tabler/icons-react"

const VARIANTS = {
  verified:  { classes: "bg-success-light text-success", icon: IconCircleCheck, label: "Verificada" },
  approved:  { classes: "bg-success-light text-success", icon: IconCircleCheck, label: "Aprovada" },
  completed: { classes: "bg-success-light text-success", icon: IconCircleCheck, label: "Atendida" },
  pending:   { classes: "bg-warning-light text-warning", icon: IconClock, label: "Pendente" },
  rejected:  { classes: "bg-accent-light text-accent", icon: IconX, label: "Rejeitada" },
  urgent:    { classes: "bg-accent-light text-accent border border-accent/30", icon: IconAlertTriangle, label: "Urgente" },
}

export default function Badge({ variant, label, icon = true, className = "" }) {
  const v = VARIANTS[variant] ?? VARIANTS.pending
  const Icon = v.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.classes} ${className}`}>
      {icon && <Icon size={13} stroke={2.5} />}
      {label ?? v.label}
    </span>
  )
}
