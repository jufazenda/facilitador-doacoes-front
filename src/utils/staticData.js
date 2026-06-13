export function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

export const categorias = [
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

export const STATUS_DOACAO = {
  pendente:   { label: "Pendente",   classes: "bg-warning-light text-warning" },
  processado: { label: "Processado", classes: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", classes: "bg-secondary/10 text-secondary" },
  aplicado:   { label: "Aplicado",   classes: "bg-success-light text-success" },
}

export const steps = [
  {
    icon: "🔍",
    title: "1. Explore",
    text: "Descubra campanhas e instituições verificadas.",
  },
  {
    icon: "💜",
    title: "2. Doe com segurança",
    text: "Sua doação é protegida e o impacto é garantido.",
  },
  {
    icon: "📊",
    title: "3. Acompanhe",
    text: "Veja como sua doação está transformando vidas.",
  },
  {
    icon: "📣",
    title: "4. Compartilhe",
    text: "Convide outras pessoas para multiplicar o impacto.",
  },
]
