import { useState, useEffect } from "react"
import CampaignCard from "../components/ui/CampaignCard"
import Select from "../components/ui/Select"
import Input from "../components/ui/Input"
import Loading from "../components/ui/Loading"
import { getCampaigns } from "../services/campaigns"
import { getInstitutions } from "../services/institutions"
import { categorias, slugify } from "../utils/staticData"

const FILTROS = ["Todos", "Urgentes", ...categorias]

export default function Campaigns() {
  const [campanhas, setCampanhas] = useState([])
  const [instMap, setInstMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filtro, setFiltro] = useState("Todos")
  const [filtroInst, setFiltroInst] = useState("")

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    Promise.all([getCampaigns(), getInstitutions()])
      .then(([camps, insts]) => {
        setCampanhas(camps ?? [])
        setInstMap(Object.fromEntries((insts ?? []).map((i) => [i.id, i.name])))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const instOptions = Object.entries(instMap).filter(([id]) =>
    campanhas.some((c) => c.institution_id === id)
  )

  const visiveis = campanhas.filter((c) => {
    const matchesSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase())
    const matchesFiltro =
      filtro === "Todos" ? true :
      filtro === "Urgentes" ? c.is_urgent :
      c.keywords?.[0] === slugify(filtro)
    const matchesInst = !filtroInst || c.institution_id === filtroInst
    return matchesSearch && matchesFiltro && matchesInst
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-black text-purple-950 sm:text-3xl">Campanhas</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          className="flex-1"
          placeholder="Buscar campanhas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={filtroInst}
          onChange={(e) => setFiltroInst(e.target.value)}
          className="sm:w-1/3"
          options={[
            { value: "", label: "Todas as instituições" },
            ...instOptions.map(([id, name]) => ({ value: id, label: name })),
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition sm:px-5 sm:py-2.5 sm:text-sm ${
              filtro === f
                ? "border-purple-700 bg-purple-700 text-white"
                : "border-purple-100 bg-[#F8F3FF] text-purple-950 hover:bg-purple-100"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <Loading />
        ) : visiveis.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">Nenhuma campanha encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {visiveis.map((c) => (
              <CampaignCard key={c.id} campaign={c} institutionName={instMap[c.institution_id] ?? ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
