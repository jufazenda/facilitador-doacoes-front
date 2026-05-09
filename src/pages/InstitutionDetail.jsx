import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getInstitutionById } from "../services/institutions"
import { getCampaignsByInstitution } from "../services/campaigns"
import { getNecessitiesByInstitution } from "../services/necessities"
import { categoryImages } from "../utils/categoryImages"
import kaoImage from "../assets/kao.jpg"

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted text-sm">Carregando...</p>
      </div>
    )
  }

  if (notFound || !inst) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Instituição não encontrada.</p>
        <Link to="/instituicoes" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar para instituições</Link>
      </div>
    )
  }

  const iniciais  = inst.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const isDoador  = user?.tipo === "doador"
  const campanhasAtivas = campanhas.filter((c) => c.status === "active")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-10">

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col gap-5 p-7 sm:p-9">
            <nav className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <span>›</span>
              <Link to="/instituicoes" className="hover:text-primary transition-colors">Instituições</Link>
              <span>›</span>
              <span className="text-ink">{inst.name}</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light shadow">
                {inst.logo_url ? (
                  <img src={inst.logo_url} alt={inst.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-primary">{iniciais}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-purple-950 sm:text-3xl">{inst.name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {inst.address && <span className="text-sm text-muted">📍 {inst.address}</span>}
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success">
                    ✓ Instituição verificada
                  </span>
                </div>
              </div>
            </div>

            {inst.description && (
              <p className="leading-relaxed text-muted">{inst.description}</p>
            )}

            <div className="flex flex-wrap gap-3">
              {isDoador && (
                <button onClick={() => setApoiando((v) => !v)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 font-bold transition-colors ${
                    apoiando
                      ? "border border-success/30 bg-success-light text-success"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`}>
                  {apoiando ? "♥ Apoiando" : "♡ Apoiar instituição"}
                </button>
              )}
              <a href="#campanhas"
                className="rounded-2xl border border-purple-700 px-5 py-2.5 font-bold text-purple-700 transition-colors hover:bg-purple-50">
                Ver campanhas
              </a>
            </div>
          </div>

          <div className="h-64 lg:h-auto">
            <img src={inst.cover_image_url || kaoImage} alt={inst.name} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">🏛️ Sobre a instituição</h2>
          <p className="text-sm leading-relaxed text-muted">{inst.description ?? "Sem descrição disponível."}</p>
        </div>

        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-line bg-soft">
          <img src={kaoImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 text-2xl text-white backdrop-blur-sm">▶</div>
            <p className="text-sm font-bold text-white drop-shadow">Vídeo institucional</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-purple-100 bg-white p-5">
          {inst.email    && <StatRow icon="✉️" label="E-mail"          value={inst.email} />}
          {inst.phone    && <StatRow icon="📞" label="Telefone"        value={inst.phone} />}
          {inst.category && <StatRow icon="🏷️" label="Área de atuação" value={inst.category} />}
          {inst.cnpj     && <StatRow icon="📋" label="CNPJ"            value={inst.cnpj} />}
          <StatRow icon="📅" label="Membro desde" value={new Date(inst.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} />
          <StatRow icon="🚩" label="Campanhas ativas" value={campanhasAtivas.length} />
        </div>
      </section>

      {/* Necessidades */}
      {necessidades.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">❤️ Necessidades atuais</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {necessidades.map((n) => <CartaoNecessidade key={n.id} necessidade={n} />)}
          </div>
        </section>
      )}

      {/* Campanhas */}
      <section id="campanhas" className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">🚩 Campanhas ativas</h2>
        {campanhasAtivas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma campanha ativa no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {campanhasAtivas.map((c) => <CartaoCampanhaH key={c.id} campanha={c} />)}
          </div>
        )}
      </section>

      {/* Certificações */}
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">🛡️ Certificações e transparência</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2 rounded-2xl bg-primary-light p-4 min-w-40">
            <span className="text-2xl">🛡️</span>
            <p className="text-sm font-bold text-purple-950">Instituição verificada</p>
            <p className="text-xs text-muted">Passou por verificação e validação pelo nosso time.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-muted"><span>{icon}</span>{label}</span>
      <span className="text-sm font-bold text-ink text-right truncate max-w-[60%]">{value}</span>
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
  const bgImage = categoryImages[c.category]
  const raised  = (c.total_raised ?? 0) / 100
  const goal    = (c.goal_amount  ?? 0) / 100
  const pct     = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0

  return (
    <div className="flex overflow-hidden rounded-2xl border border-purple-100 bg-white">
      <div className="w-24 shrink-0 sm:w-28">
        {bgImage ? (
          <img src={bgImage} alt={c.category} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary-light" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 min-w-0">
        <h3 className="text-sm font-extrabold leading-snug text-purple-950">
          <Link to={`/campanha/${c.id}`} className="transition-colors hover:text-purple-700">
            {c.title}
          </Link>
        </h3>
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
            <span className="text-muted">
              {goal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} meta
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
