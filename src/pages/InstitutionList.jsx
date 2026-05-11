import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getInstitutions } from "../services/institutions"
import { getCampaigns } from "../services/campaigns"
import Loading from "../components/ui/Loading"
import Input from "../components/ui/Input"

export default function InstitutionList() {
  const { user } = useAuth()
  const [instituicoes, setInstituicoes] = useState([])
  const [campCount, setCampCount] = useState({})
  const [busca, setBusca] = useState("")
  const [favoritas, setFavoritas] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    Promise.all([getInstitutions(), getCampaigns()])
      .then(([insts, camps]) => {
        setInstituicoes((insts ?? []).filter((i) => i.status === "approved"))
        const counts = {}
        for (const c of camps ?? []) {
          counts[c.institution_id] = (counts[c.institution_id] ?? 0) + 1
        }
        setCampCount(counts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const resultado = instituicoes.filter((i) => {
    const q = busca.toLowerCase()
    return (
      i.name.toLowerCase().includes(q) ||
      (i.description ?? "").toLowerCase().includes(q) ||
      (i.address ?? "").toLowerCase().includes(q) ||
      (i.category ?? "").toLowerCase().includes(q)
    )
  })

  function toggleFavorita(id) {
    if (user?.tipo !== "doador") return
    setFavoritas((prev) => ({ ...prev, [id]: !prev[id] }))
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
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, endereço ou causa…"
        />

      {loading ? (
        <Loading />
      ) : resultado.length === 0 ? (
        <p className="py-16 text-center text-muted">Nenhuma instituição encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resultado.map((inst) => (
            <CardInstituicao
              key={inst.id}
              inst={inst}
              campanhas={campCount[inst.id] ?? 0}
              favorita={!!favoritas[inst.id]}
              onToggle={() => toggleFavorita(inst.id)}
              isDoador={user?.tipo === "doador"}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CardInstituicao({ inst, campanhas, favorita, onToggle, isDoador }) {
  const iniciais = inst.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {isDoador && (
        <button onClick={onToggle}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-colors ${
            favorita
              ? "border-accent bg-accent-light text-accent"
              : "border-line text-muted hover:border-accent hover:text-accent"
          }`}
          aria-label={favorita ? "Remover dos favoritos" : "Favoritar instituição"}>
          {favorita ? "♥" : "♡"}
        </button>
      )}

      <div className={`flex items-start gap-3 ${isDoador ? "pr-10" : ""}`}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-light shadow">
          {inst.logo_url ? (
            <img src={inst.logo_url} alt={inst.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-black text-primary">{iniciais}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold leading-snug text-purple-950">{inst.name}</h3>
          {inst.address && <p className="mt-0.5 text-xs text-muted">📍 {inst.address}</p>}
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success">
            ✓ Verificada
          </span>
        </div>
      </div>

      {inst.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{inst.description}</p>
      )}

      <div className=" mt-auto grid grid-cols-2 gap-2 border-t border-line pt-4 text-center">
        <div>
          <p className="text-base font-black text-primary">{campanhas}</p>
          <p className="text-xs text-muted">campanhas</p>
        </div>
        <div>
          <p className="text-base font-black text-primary">{inst.category ?? "—"}</p>
          <p className="text-xs text-muted">área</p>
        </div>
      </div>

      <Link to={`/instituicao/${inst.id}`}
        className="flex w-full items-center justify-center rounded-2xl bg-purple-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-purple-800">
        Ver instituição →
      </Link>
    </article>
  )
}
