import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { getInstitutions } from "../services/institutions"
import { getCampaigns } from "../services/campaigns"
import Loading from "../components/ui/Loading"
import Input from "../components/ui/Input"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import { getInitials } from "../utils/strings"
import { IconHeart, IconHeartFilled, IconMapPin } from "@tabler/icons-react"

export default function InstitutionList() {
  const { user } = useAuth()
  const [institutions, setInstitutions] = useState([])
  const [campaignCount, setCampaignCount] = useState({})
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    Promise.all([getInstitutions(), getCampaigns()])
      .then(([insts, camps]) => {
        setInstitutions((insts ?? []).filter((i) => i.status === "approved"))
        const counts = {}
        for (const c of camps ?? []) {
          counts[c.institution_id] = (counts[c.institution_id] ?? 0) + 1
        }
        setCampaignCount(counts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const result = institutions.filter((i) => {
    const q = search.toLowerCase()
    return (
      i.name.toLowerCase().includes(q) ||
      (i.description ?? "").toLowerCase().includes(q) ||
      (i.address ?? "").toLowerCase().includes(q) ||
      (i.category ?? "").toLowerCase().includes(q)
    )
  })

  function toggleFavorite(id) {
    if (user?.type !== "doador") return
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black text-purple-950">Instituições</h1>
        <p className="text-muted mt-1">Conheça as organizações verificadas que fazem a diferença</p>
      </div>

      <Input
          type="search"
          className="w-full max-w-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, endereço ou causa…"
        />

      {loading ? (
        <Loading />
      ) : result.length === 0 ? (
        <EmptyState message="Nenhuma instituição encontrada." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {result.map((inst) => (
            <InstitutionCard
              key={inst.id}
              institution={inst}
              campaigns={campaignCount[inst.id] ?? 0}
              favorite={!!favorites[inst.id]}
              onToggle={() => toggleFavorite(inst.id)}
              isDonor={user?.type === "doador"}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InstitutionCard({ institution, campaigns, favorite, onToggle, isDonor }) {
  const initials = getInitials(institution.name)

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {isDonor && (
        <button onClick={onToggle}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-colors ${
            favorite
              ? "border-accent bg-accent-light text-accent"
              : "border-line text-muted hover:border-accent hover:text-accent"
          }`}
          aria-label={favorite ? "Remover dos favoritos" : "Favoritar instituição"}>
          {favorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
        </button>
      )}

      <div className={`flex items-start gap-3 ${isDonor ? "pr-10" : ""}`}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-light shadow">
          {institution.logo_url ? (
            <img src={institution.logo_url} alt={institution.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-black text-primary">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold leading-snug text-purple-950">{institution.name}</h3>
          {institution.address && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <IconMapPin size={13} /> {institution.address}
            </p>
          )}
          <Badge variant="verified" className="mt-1" />
        </div>
      </div>

      {institution.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{institution.description}</p>
      )}

      <div className=" mt-auto grid grid-cols-2 gap-2 border-t border-line pt-4 text-center">
        <div>
          <p className="text-base font-black text-primary">{campaigns}</p>
          <p className="text-xs text-muted">campanhas</p>
        </div>
        <div>
          <p className="text-base font-black text-primary">{institution.category ?? "—"}</p>
          <p className="text-xs text-muted">área</p>
        </div>
      </div>

      <Link to={`/instituicao/${institution.id}`}
        className="flex w-full items-center justify-center rounded-2xl bg-purple-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-purple-800">
        Ver instituição →
      </Link>
    </article>
  )
}
