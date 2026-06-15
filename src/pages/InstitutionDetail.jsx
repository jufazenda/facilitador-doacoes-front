import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getInstitutionById } from "../services/institutions"
import { getCampaignsByInstitution } from "../services/campaigns"
import { getNecessitiesByInstitution } from "../services/necessities"
import { categoryImages } from "../utils/categoryImages"
import Loading from "../components/ui/Loading"

export default function InstitutionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [inst, setInst] = useState(null)
  const [campanhas, setCampanhas] = useState([])
  const [necessidades, setNecessidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [apoiando, setApoiando] = useState(false)

  useEffect(() => {
    getInstitutionById(id)
      .then((institution) => {
        setInst(institution)
        return Promise.all([
          getCampaignsByInstitution(institution.id).catch(() => []),
          getNecessitiesByInstitution(institution.id).catch(() => []),
        ])
      })
      .then(([camps, necess]) => {
        setCampanhas(camps ?? [])
        setNecessidades((necess ?? []).filter((n) => n.status === "open"))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading full />

  if (notFound || !inst) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Instituição não encontrada.</p>
        <Link to="/instituicoes" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar para instituições</Link>
      </div>
    )
  }

  const iniciais         = inst.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const isDoador         = user?.tipo === "doador"
  const campanhasAtivas  = campanhas.filter((c) => c.status === "active")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-8">

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-5">

          <div className="flex flex-col gap-5 p-7 sm:p-9 lg:col-span-3">
            <nav className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <span>›</span>
              <Link to="/instituicoes" className="hover:text-primary transition-colors">Instituições</Link>
              <span>›</span>
              <span className="text-ink">{inst.name}</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light">
                {inst.logo_url ? (
                  <img src={inst.logo_url} alt={inst.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-xl font-black text-primary">{iniciais}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight text-purple-950 sm:text-3xl">{inst.name}</h1>
                {inst.legal_name && (
                  <p className="mt-0.5 text-xs text-muted">{inst.legal_name}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {inst.address && <span className="text-sm text-muted">📍 {inst.address}</span>}
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success">
                    ✓ Verificada
                  </span>
                </div>
              </div>
            </div>

            {inst.description && (
              <p className="text-sm leading-relaxed text-muted">{inst.description}</p>
            )}

            <div className="flex flex-wrap gap-3">
              {isDoador && (
                <button
                  onClick={() => setApoiando((v) => !v)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors ${
                    apoiando
                      ? "border border-success/30 bg-success-light text-success"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`}
                >
                  {apoiando ? "♥ Apoiando" : "♡ Apoiar instituição"}
                </button>
              )}
              {campanhasAtivas.length > 0 && (
                <a href="#campanhas"
                  className="rounded-2xl border border-purple-200 px-5 py-2.5 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-50">
                  Ver {campanhasAtivas.length} campanha{campanhasAtivas.length !== 1 ? "s" : ""}
                </a>
              )}
            </div>
          </div>

          <div className="h-48 lg:col-span-2 lg:h-auto">
            <IllustracaoHero iniciais={iniciais} />
          </div>
        </div>
      </section>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {inst.email    && <InfoCard icon="✉️" label="E-mail"        value={inst.email} />}
        {inst.phone    && <InfoCard icon="📞" label="Telefone"      value={inst.phone} />}
        {inst.cnpj     && <InfoCard icon="📋" label="CNPJ"          value={inst.cnpj} />}
        <InfoCard icon="📅" label="Membro desde"
          value={new Date(inst.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} />
      </div>

      {/* Necessidades */}
      {necessidades.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-black text-purple-950">❤️ Necessidades atuais</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {necessidades.map((n) => <CartaoNecessidade key={n.id} necessidade={n} />)}
          </div>
        </section>
      )}

      {/* Campanhas */}
      <section id="campanhas" className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-purple-950">🚩 Campanhas ativas</h2>
        {campanhasAtivas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma campanha ativa no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {campanhasAtivas.map((c) => <CartaoCampanhaH key={c.id} campanha={c} />)}
          </div>
        )}
      </section>

    </div>
  )
}

function IllustracaoHero({ iniciais }) {
  return (
    <div className="relative h-full overflow-hidden bg-linear-to-br from-purple-50 via-primary-light to-soft">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-200/50" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary/10" />
      <div className="absolute bottom-16 right-10 h-28 w-28 rounded-full bg-purple-300/30" />
      <div className="absolute inset-0 bg-[radial-gradient(#4b1fa6_2px,transparent_2px)] bg-size-[22px_22px] opacity-[0.07]" />
      <span className="absolute left-6 top-8 select-none text-4xl text-purple-300/50">♡</span>
      <span className="absolute right-10 top-10 select-none text-2xl text-purple-400/40">♡</span>
      <span className="absolute bottom-8 left-14 select-none text-3xl text-purple-300/50">♡</span>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl shadow-purple-950/10 ring-8 ring-white/60">
          <span className="text-3xl font-black text-primary">{iniciais}</span>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-purple-100 bg-white p-4">
      <span className="text-xs text-muted">{icon} {label}</span>
      <span className="truncate text-sm font-bold text-ink">{value}</span>
    </div>
  )
}

function CartaoNecessidade({ necessidade: n }) {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 ${n.is_urgent ? "border-accent/30" : "border-line"}`}>
      {n.is_urgent && (
        <span className="self-start flex items-center gap-1.5 rounded-full border border-accent/20 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-accent">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Urgente
        </span>
      )}
      <div>
        <p className="font-bold text-ink">{n.description}</p>
        <p className="mt-0.5 text-xs text-muted">{n.category}</p>
      </div>
    </div>
  )
}

function CartaoCampanhaH({ campanha: c }) {
  const bgImage = categoryImages[c.keywords?.[0]]
  const raised  = (c.total_raised ?? 0) / 100
  const goal    = (c.goal_amount  ?? 0) / 100
  const pct     = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0

  return (
    <Link to={`/campanha/${c.id}`} className="group flex overflow-hidden rounded-2xl border border-purple-100 bg-white transition-shadow hover:shadow-md">
      <div className="w-24 shrink-0 sm:w-28">
        {bgImage ? (
          <img src={bgImage} alt={c.category} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-primary-light" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 text-sm font-extrabold leading-snug text-purple-950 group-hover:text-purple-700 transition-colors">
            {c.title}
          </h3>
          {c.is_urgent && (
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">Urgente</span>
          )}
        </div>
        {c.description && (
          <p className="line-clamp-2 text-xs text-muted">{c.description}</p>
        )}
        <div className="mt-auto">
          <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-purple-100">
            <div className="h-full rounded-full bg-purple-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-purple-700">
              {raised.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <span className="text-muted">{pct}% da meta</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
