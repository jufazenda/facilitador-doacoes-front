import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useApiClient } from "../hooks/useApiClient"
import { getMe } from "../services/users"
import { getDonations } from "../services/donations"
import { getCampaigns } from "../services/campaigns"
import { getInstitutions } from "../services/institutions"
import { doadorMock, rankingMock } from "../utils/mockData"

const ABAS = ["Perfil", "Histórico", "Ranking"]

const NIVEIS = [
  { label: "Bronze",   min: 0,    max: 299,     color: "text-amber-700", bg: "bg-amber-100" },
  { label: "Prata",    min: 300,  max: 999,     color: "text-muted",     bg: "bg-soft" },
  { label: "Ouro",     min: 1000, max: 2999,    color: "text-warning",   bg: "bg-warning-light" },
  { label: "Diamante", min: 3000, max: Infinity, color: "text-primary",  bg: "bg-primary-light" },
]

const STATUS = {
  pendente:   { label: "Pendente",   classes: "bg-warning-light text-warning" },
  processado: { label: "Processado", classes: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", classes: "bg-secondary/10 text-secondary" },
  aplicado:   { label: "Aplicado",   classes: "bg-success-light text-success" },
}

function formatCpf(cpf) {
  if (!cpf) return "-"
  return cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function initials(name) {
  return (name || "?").split(" ").slice(0, 2).map((w) => w[0]).join("")
}

export default function DonorArea() {
  const [aba, setAba] = useState("Perfil")
  const [user, setUser] = useState(null)
  const [donations, setDonations] = useState([])
  const [campaigns, setCampaigns] = useState({})
  const [institutions, setInstitutions] = useState({})
  const [loading, setLoading] = useState(true)
  const client = useApiClient()

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe(client)
        setUser(me)
        const [allDonations, allCampaigns, allInstitutions] = await Promise.all([
          getDonations().catch(() => []),
          getCampaigns().catch(() => []),
          getInstitutions().catch(() => []),
        ])
        setDonations(allDonations.filter((d) => d.user_id === me.id))
        setCampaigns(Object.fromEntries(allCampaigns.map((c) => [c.id, c])))
        setInstitutions(Object.fromEntries(allInstitutions.map((i) => [i.id, i])))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [client])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted text-sm">Carregando...</p>
      </div>
    )
  }

  const nome = user?.name ?? "Doador"
  const desde = user?.created_at ?? new Date().toISOString()
  const totalDoado = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0) / 100
  const totalDoacoes = donations.length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">{initials(nome)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{nome}</h1>
          <p className="text-sm text-muted">
            Doador desde {new Date(desde).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-line gap-1">
        {ABAS.map((t) => (
          <button key={t} onClick={() => setAba(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              aba === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {aba === "Perfil" && (
        <AbaPerfil user={user} totalDoado={totalDoado} totalDoacoes={totalDoacoes} />
      )}
      {aba === "Histórico" && (
        <AbaHistorico donations={donations} campaigns={campaigns} institutions={institutions} />
      )}
      {aba === "Ranking" && (
        <AbaRanking nome={nome} />
      )}
    </div>
  )
}

function AbaPerfil({ user, totalDoado, totalDoacoes }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <CardStatus
          value={totalDoado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          label="Total doado"
        />
        <CardStatus value={totalDoacoes} label="Doações realizadas" />
      </div>
      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink">Dados pessoais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoLinha label="Nome" value={user?.name ?? "-"} />
          <InfoLinha label="E-mail" value={user?.email ?? "-"} />
          <InfoLinha label="CPF" value={formatCpf(user?.cpf)} />
          <InfoLinha
            label="Membro desde"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}
          />
        </div>
        <button className="self-start mt-2 text-sm text-primary hover:underline font-semibold">Editar dados</button>
      </div>
    </div>
  )
}

function AbaHistorico({ donations, campaigns, institutions }) {
  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-line p-8 text-center flex flex-col items-center gap-3">
        <p className="text-muted text-sm">Você ainda não fez nenhuma doação.</p>
        <Link to="/campanhas" className="text-sm text-primary hover:underline font-semibold">
          Ver campanhas disponíveis
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {donations.map((d) => {
        const status = STATUS[d.status] ?? { label: d.status, classes: "bg-soft text-muted" }
        const campaign = d.campaign_id ? campaigns[d.campaign_id] : null
        const institution = d.institution_id ? institutions[d.institution_id] : null

        return (
          <div key={d.id} className="bg-white rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {campaign ? (
                <Link to={`/campanha/${d.campaign_id}`}
                  className="text-sm font-bold text-ink hover:text-primary transition-colors truncate">
                  {campaign.name}
                </Link>
              ) : (
                <span className="text-sm font-bold text-ink">Doação avulsa</span>
              )}
              {institution && <p className="text-xs text-muted">{institution.name}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.classes}`}>
                  {status.label}
                </span>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
              <span className="text-base font-bold text-ink">
                {((d.amount ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="text-xs text-muted">{new Date(d.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        )
      })}
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.values(STATUS).map((s) => (
          <span key={s.label} className={`text-xs px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
        ))}
      </div>
      <p className="text-xs text-muted">Fluxo: Pendente → Processado → Confirmado → Aplicado</p>
    </div>
  )
}

function AbaRanking({ nome }) {
  const d = doadorMock
  const nivel = NIVEIS.find((t) => d.pontos >= t.min && d.pontos <= t.max)
  const proxNivel = NIVEIS[NIVEIS.indexOf(nivel) + 1]
  const progresso = proxNivel
    ? Math.round(((d.pontos - nivel.min) / (proxNivel.min - nivel.min)) * 100)
    : 100

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted mb-1">Seu nível</p>
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${nivel.bg} ${nivel.color}`}>{nivel.label}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Pontos</p>
            <p className="text-2xl font-bold text-primary">{d.pontos.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        {proxNivel && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>{nivel.label}</span>
              <span>{proxNivel.label} em {(proxNivel.min - d.pontos).toLocaleString("pt-BR")} pts</span>
            </div>
            <div className="w-full bg-soft rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        )}
        <p className="text-xs text-muted">Posição global: <span className="font-bold text-ink">#{d.ranking}</span></p>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {d.badges.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-line p-4 flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{b.icon}</span>
              <p className="text-sm font-bold text-ink">{b.label}</p>
              <p className="text-xs text-muted">{b.descricao}</p>
            </div>
          ))}
          <div className="bg-soft rounded-xl border border-dashed border-line p-4 flex flex-col items-center gap-2 text-center opacity-50">
            <span className="text-3xl">🔒</span>
            <p className="text-sm font-bold text-muted">10 Doações</p>
            <p className="text-xs text-muted">Complete 10 doações</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Top doadores</h2>
        <div className="bg-white rounded-xl border border-line divide-y divide-line">
          {rankingMock.map((r) => (
            <div key={r.posicao} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted w-5">#{r.posicao}</span>
                <span className="text-sm text-ink">{r.nome}</span>
              </div>
              <span className="text-sm font-bold text-primary">{r.pontos.toLocaleString("pt-BR")} pts</span>
            </div>
          ))}
          <div className="px-4 py-1 text-center text-xs text-muted">• • •</div>
          <div className="flex items-center justify-between px-4 py-3 bg-primary-light">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary w-5">#{d.ranking}</span>
              <span className="text-sm font-bold text-primary">{nome} (você)</span>
            </div>
            <span className="text-sm font-bold text-primary">{d.pontos.toLocaleString("pt-BR")} pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardStatus({ value, label }) {
  return (
    <div className="bg-white rounded-xl border border-line p-4 text-center">
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  )
}

function InfoLinha({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm text-ink font-semibold">{value}</p>
    </div>
  )
}
