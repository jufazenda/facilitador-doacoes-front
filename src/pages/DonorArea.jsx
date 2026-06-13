import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useApiClient } from "../hooks/useApiClient"
import { getMe, updateUser } from "../services/users"
import { getDonations } from "../services/donations"
import { getCampaigns } from "../services/campaigns"
import { getInstitutions } from "../services/institutions"
import { getRanking } from "../services/ranking"
import { maskCpf, formatCpf } from "../utils/masks"
import { getInitials } from "../utils/strings"
import { DONATION_STATUS } from "../utils/staticData"
import Loading from "../components/ui/Loading"
import FormField from "../components/ui/FormField"
import StatCard from "../components/ui/StatCard"
import TabBar from "../components/ui/TabBar"
import InfoLinha from "../components/ui/InfoLinha"
import EmptyState from "../components/ui/EmptyState"
import { useToast } from "../hooks/useToast"
import { IconHeartFilled, IconFlame, IconStar, IconTrophy, IconDiamond, IconLock } from "@tabler/icons-react"

const TABS = ["Perfil", "Histórico", "Ranking"]

const LEVELS = [
  { label: "Bronze",   min: 0,    max: 299,     color: "text-amber-700", bg: "bg-amber-100" },
  { label: "Prata",    min: 300,  max: 999,     color: "text-muted",     bg: "bg-soft" },
  { label: "Ouro",     min: 1000, max: 2999,    color: "text-warning",   bg: "bg-warning-light" },
  { label: "Diamante", min: 3000, max: Infinity, color: "text-primary",  bg: "bg-primary-light" },
]

export default function DonorArea() {
  const [tab, setTab] = useState("Perfil")
  const [user, setUser] = useState(null)
  const [donations, setDonations] = useState([])
  const [campaigns, setCampaigns] = useState({})
  const [institutions, setInstitutions] = useState({})
  const [loading, setLoading] = useState(true)
  const client = useApiClient()
  const { showToast, ToastContainer } = useToast()

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

  if (loading) return <Loading full />

  const name = user?.name ?? "Doador"
  const since = user?.created_at ?? new Date().toISOString()
  const totalDonated = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0) / 100
  const totalDonations = donations.length

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">{getInitials(name)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{name}</h1>
          <p className="text-sm text-muted">
            Doador desde {new Date(since).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Perfil" && (
        <ProfileTab user={user} setUser={setUser} client={client} showToast={showToast} totalDonated={totalDonated} totalDonations={totalDonations} />
      )}
      {tab === "Histórico" && (
        <HistoryTab donations={donations} campaigns={campaigns} institutions={institutions} />
      )}
      {tab === "Ranking" && (
        <RankingTab name={name} donations={donations} userId={user?.id} />
      )}
      <ToastContainer />
    </div>
  )
}

function ProfileTab({ user, setUser, client, showToast, totalDonated, totalDonations }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", cpf: formatCpf(user?.cpf) })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === "cpf" ? maskCpf(value) : value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updated = await updateUser(client, user.id, {
        name: form.name,
        phone: form.phone,
        cpf: form.cpf.replace(/\D/g, ""),
      })
      setUser(updated)
      setEditing(false)
      showToast("success", "Dados atualizados com sucesso!")
    } catch (err) {
      setError(err?.response?.data?.error ?? "Erro ao salvar. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          value={totalDonated.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          label="Total doado"
        />
        <StatCard value={totalDonations} label="Doações realizadas" />
      </div>

      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Dados pessoais</h2>
          {!editing && (
            <button onClick={() => { setEditing(true) }}
              className="text-sm text-primary hover:underline font-semibold">
              Editar dados
            </button>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoLinha label="Nome" value={user?.name ?? "-"} />
            <InfoLinha label="E-mail" value={user?.email ?? "-"} />
            <InfoLinha label="CPF" value={formatCpf(user?.cpf)} />
            <InfoLinha label="Telefone" value={user?.phone || "-"} />
            <InfoLinha
              label="Membro desde"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}
            />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField compact label="Nome completo" name="name" value={form.name} onChange={handleChange} />
              <InfoLinha label="E-mail" value={user?.email ?? "-"} />
              <FormField compact required={false} label="CPF" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" inputMode="numeric" />
              <FormField compact required={false} label="Telefone" name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setEditing(false); setError(null) }}
                className="flex-1 border border-line text-muted hover:border-ink rounded-lg py-2.5 text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold rounded-lg py-2.5 text-sm transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function HistoryTab({ donations, campaigns, institutions }) {
  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-line p-8">
        <EmptyState message="Você ainda não fez nenhuma doação." />
        <Link to="/campanhas" className="block text-center text-sm text-primary hover:underline font-semibold">
          Ver campanhas disponíveis
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {donations.map((d) => {
        const status = DONATION_STATUS[d.status] ?? { label: d.status, classes: "bg-soft text-muted" }
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
        {Object.values(DONATION_STATUS).map((s) => (
          <span key={s.label} className={`text-xs px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
        ))}
      </div>
      <p className="text-xs text-muted">Fluxo: Pendente → Processado → Confirmado → Aplicado</p>
    </div>
  )
}

function RankingTab({ name, donations, userId }) {
  const [ranking, setRanking] = useState([])
  const [rankingLoading, setRankingLoading] = useState(true)

  useEffect(() => {
    getRanking(10)
      .then((data) => setRanking(data || []))
      .catch(() => setRanking([]))
      .finally(() => setRankingLoading(false))
  }, [])

  const paidDonations = (donations || []).filter((d) => d.status === "PAID")
  const totalDonatedCents = paidDonations.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const points = Math.floor(totalDonatedCents / 100)
  const totalDonations = paidDonations.length

  const positionFromRanking = ranking.findIndex((r) => r.user_id === userId)
  const position = positionFromRanking >= 0 ? positionFromRanking + 1 : ranking.length + 1

  const level = LEVELS.find((t) => points >= t.min && points <= t.max)
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1]
  const progress = nextLevel
    ? Math.round(((points - level.min) / (nextLevel.min - level.min)) * 100)
    : 100

  const badges = []
  if (totalDonations >= 1) badges.push({ id: 1, icon: IconHeartFilled, label: "Primeiro passo", description: "Realizou a primeira doação" })
  if (totalDonations >= 3) badges.push({ id: 2, icon: IconFlame, label: "Doador constante", description: "3 doações confirmadas" })
  if (totalDonations >= 5) badges.push({ id: 3, icon: IconStar, label: "Impacto real", description: "5 doações confirmadas" })
  if (totalDonations >= 10) badges.push({ id: 4, icon: IconTrophy, label: "Top 10", description: "10 doações confirmadas" })
  if (points >= 1000) badges.push({ id: 5, icon: IconDiamond, label: "Generoso", description: "Mais de R$ 1.000 doados" })

  if (rankingLoading) return <Loading />

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted mb-1">Seu nível</p>
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${level.bg} ${level.color}`}>{level.label}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Pontos</p>
            <p className="text-2xl font-bold text-primary">{points.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        {nextLevel && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>{level.label}</span>
              <span>{nextLevel.label} em {(nextLevel.min - points).toLocaleString("pt-BR")} pts</span>
            </div>
            <div className="w-full bg-soft rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <p className="text-xs text-muted">Posição global: <span className="font-bold text-ink">#{position}</span></p>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {badges.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-line p-4 flex flex-col items-center gap-2 text-center">
              <b.icon size={28} className="text-primary" stroke={1.5} />
              <p className="text-sm font-bold text-ink">{b.label}</p>
              <p className="text-xs text-muted">{b.description}</p>
            </div>
          ))}
          {totalDonations < 10 && (
            <div className="bg-soft rounded-xl border border-dashed border-line p-4 flex flex-col items-center gap-2 text-center opacity-50">
              <IconLock size={28} className="text-muted" stroke={1.5} />
              <p className="text-sm font-bold text-muted">10 Doações</p>
              <p className="text-xs text-muted">Complete 10 doações</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Top doadores</h2>
        <div className="bg-white rounded-xl border border-line divide-y divide-line">
          {ranking.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">Nenhuma doação confirmada ainda.</div>
          )}
          {ranking.map((r) => (
            <div key={r.user_id} className={`flex items-center justify-between px-4 py-3 ${r.user_id === userId ? "bg-primary-light" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-5 ${r.user_id === userId ? "text-primary" : "text-muted"}`}>#{r.position}</span>
                <span className={`text-sm ${r.user_id === userId ? "font-bold text-primary" : "text-ink"}`}>
                  {r.user_name}{r.user_id === userId ? " (você)" : ""}
                </span>
              </div>
              <span className={`text-sm font-bold ${r.user_id === userId ? "text-primary" : "text-primary"}`}>{Math.floor(r.total_donated / 100).toLocaleString("pt-BR")} pts</span>
            </div>
          ))}
          {positionFromRanking < 0 && points > 0 && (
            <>
              <div className="px-4 py-1 text-center text-xs text-muted">• • •</div>
              <div className="flex items-center justify-between px-4 py-3 bg-primary-light">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-5">#{position}</span>
                  <span className="text-sm font-bold text-primary">{name} (você)</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.toLocaleString("pt-BR")} pts</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
