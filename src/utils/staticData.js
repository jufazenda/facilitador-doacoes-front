import { IconSearch, IconHeartFilled, IconChartBar, IconSpeakerphone } from "@tabler/icons-react"

export function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

export const categories = [
  "Higiene & Cuidados Pessoais",
  "Alimentação",
  "Educação & Escolar",
  "Roupas & Calçados",
  "Brinquedos & Lazer",
  "Financeira",
  "Saúde & Medicamentos",
  "Pets",
  "Moradia & Utensílios",
]

export const DONATION_STATUS = {
  PENDING:  { label: "Pendente",    classes: "bg-warning-light text-warning" },
  PAID:     { label: "Pago",        classes: "bg-success-light text-success" },
  OVERDUE:  { label: "Vencido",     classes: "bg-accent-light text-accent" },
  REFUNDED: { label: "Reembolsado", classes: "bg-soft text-muted" },
}

export const steps = [
  {
    icon: IconSearch,
    title: "1. Explore",
    text: "Descubra campanhas e instituições verificadas.",
  },
  {
    icon: IconHeartFilled,
    title: "2. Doe com segurança",
    text: "Sua doação é protegida e o impacto é garantido.",
  },
  {
    icon: IconChartBar,
    title: "3. Acompanhe",
    text: "Veja como sua doação está transformando vidas.",
  },
  {
    icon: IconSpeakerphone,
    title: "4. Compartilhe",
    text: "Convide outras pessoas para multiplicar o impacto.",
  },
]
