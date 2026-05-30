import SearchIcon from "@mui/icons-material/Search"
import FavoriteIcon from "@mui/icons-material/Favorite"
import BarChartIcon from "@mui/icons-material/BarChart"
import CampaignIcon from "@mui/icons-material/Campaign"

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
    Icon: SearchIcon,
    title: "1. Explore",
    text: "Descubra campanhas e instituições verificadas.",
  },
  {
    Icon: FavoriteIcon,
    title: "2. Doe com segurança",
    text: "Sua doação é protegida e o impacto é garantido.",
  },
  {
    Icon: BarChartIcon,
    title: "3. Acompanhe",
    text: "Veja como sua doação está transformando vidas.",
  },
  {
    Icon: CampaignIcon,
    title: "4. Compartilhe",
    text: "Convide outras pessoas para multiplicar o impacto.",
  },
]
