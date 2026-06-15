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

export const steps = [
  {
    iconName: "Search",
    title: "1. Explore",
    text: "Descubra campanhas e instituições verificadas.",
  },
  {
    iconName: "Heart",
    title: "2. Doe com segurança",
    text: "Sua doação é protegida e o impacto é garantido.",
  },
  {
    iconName: "BarChart2",
    title: "3. Acompanhe",
    text: "Veja como sua doação está transformando vidas.",
  },
  {
    iconName: "Megaphone",
    title: "4. Compartilhe",
    text: "Convide outras pessoas para multiplicar o impacto.",
  },
]
