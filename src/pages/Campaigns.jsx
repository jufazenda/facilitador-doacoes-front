import { useState, useEffect } from "react"
import CampaignCard from "../components/ui/CampaignCard"
import Select from "../components/ui/Select"
import Input from "../components/ui/Input"
import Loading from "../components/ui/Loading"
import EmptyState from "../components/ui/EmptyState"
import { getCampaigns } from "../services/campaigns"
import { getInstitutions } from "../services/institutions"
import { categories, slugify } from "../utils/staticData"

const FILTERS = ["Todos", "Urgentes", ...categories]

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [institutionMap, setInstitutionMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Todos")
  const [filterInstitution, setFilterInstitution] = useState("")

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    Promise.all([getCampaigns(), getInstitutions()])
      .then(([camps, insts]) => {
        setCampaigns(camps ?? [])
        setInstitutionMap(Object.fromEntries((insts ?? []).map((i) => [i.id, i.name])))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const institutionOptions = Object.entries(institutionMap).filter(([id]) =>
    campaigns.some((c) => c.institution_id === id)
  )

  const visible = campaigns.filter((c) => {
    const matchesSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "Todos" ? true :
      filter === "Urgentes" ? c.is_urgent :
      c.keywords?.[0] === slugify(filter)
    const matchesInstitution = !filterInstitution || c.institution_id === filterInstitution
    return matchesSearch && matchesFilter && matchesInstitution
  })

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-12">
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
          value={filterInstitution}
          onChange={(e) => setFilterInstitution(e.target.value)}
          className="sm:w-1/3"
          options={[
            { value: "", label: "Todas as instituições" },
            ...institutionOptions.map(([id, name]) => ({ value: id, label: name })),
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition sm:px-5 sm:py-2.5 sm:text-sm ${
              filter === f
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
        ) : visible.length === 0 ? (
          <EmptyState message="Nenhuma campanha encontrada." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-7">
            {visible.map((c) => (
              <CampaignCard key={c.id} campaign={c} institutionName={institutionMap[c.institution_id] ?? ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
