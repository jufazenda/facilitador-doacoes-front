import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useApiClient } from "../hooks/useApiClient"
import { getMe, updateUser } from "../services/users"
import { getDonations } from "../services/donations"
import { getCampaigns } from "../services/campaigns"
import { getInstitutions } from "../services/institutions"
import { getRanking } from "../services/ranking"
import { mascararCpf, formatarCpf } from "../utils/masks"
import { getInitials } from "../utils/strings"
import { STATUS_DOACAO } from "../utils/staticData"
import Loading from "../components/ui/Loading"
import FormField from "../components/ui/FormField"
import StatCard from "../components/ui/StatCard"
import TabBar from "../components/ui/TabBar"
import InfoLinha from "../components/ui/InfoLinha"
import { useToast } from "../components/ui/Toast"

const ABAS = ["Perfil", "Histórico", "Ranking"]

const NIVEIS = [
  { label: "Bronze",   min: 0,    max: 299,     color: "text-amber-700", bg: "bg-amber-100" },
  { label: "Prata",    min: 300,  max: 999,     color: "text-muted",     bg: "bg-soft" },
  { label: "Ouro",     min: 1000, max: 2999,    color: "text-warning",   bg: "bg-warning-light" },
  { label: "Diamante", min: 3000, max: Infinity, color: "text-primary",  bg: "bg-primary-light" },
]

export default function DonorArea() {
  const [aba, setAba] = useState("Perfil")
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

  const nome = user?.name ?? "Doador"
  const desde = user?.created_at ?? new Date().toISOString()
  const totalDoado = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0) / 100
  const totalDoacoes = donations.length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">{getInitials(nome)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{nome}</h1>
          <p className="text-sm text-muted">
            Doador desde {new Date(desde).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <TabBar tabs={ABAS} active={aba} onChange={setAba} />

      {aba === "Perfil" && (
        <AbaPerfil user={user} setUser={setUser} client={client} showToast={showToast} totalDoado={totalDoado} totalDoacoes={totalDoacoes} />
      )}
      {aba === "Histórico" && (
        <AbaHistorico donations={donations} campaigns={campaigns} institutions={institutions} />
      )}
      {aba === "Ranking" && (
        <AbaRanking nome={nome} donations={donations} userId={user?.id} />
      )}
      <ToastContainer />
    </div>
  )
}

function AbaPerfil({ user, setUser, client, showToast, totalDoado, totalDoacoes }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", cpf: formatarCpf(user?.cpf) })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === "cpf" ? mascararCpf(value) : value }))
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      const updated = await updateUser(client, user.id, {
        name: form.name,
        phone: form.phone,
        cpf: form.cpf.replace(/\D/g, ""),
      })
      setUser(updated)
      setEditando(false)
      showToast("success", "Dados atualizados com sucesso!")
    } catch (err) {
      setErro(err?.response?.data?.error ?? "Erro ao salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          value={totalDoado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          label="Total doado"
        />
        <StatCard value={totalDoacoes} label="Doações realizadas" />
      </div>

      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Dados pessoais</h2>
          {!editando && (
            <button onClick={() => { setEditando(true) }}
              className="text-sm text-primary hover:underline font-semibold">
              Editar dados
            </button>
          )}
        </div>

        {!editando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoLinha label="Nome" value={user?.name ?? "-"} />
            <InfoLinha label="E-mail" value={user?.email ?? "-"} />
            <InfoLinha label="CPF" value={formatarCpf(user?.cpf)} />
            <InfoLinha label="Telefone" value={user?.phone || "-"} />
            <InfoLinha
              label="Membro desde"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}
            />
          </div>
        ) : (
          <form onSubmit={handleSalvar} className="flex flex-col gap-4">
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                {erro}
              </div>
            )}
            <FormField compact label="Nome completo" name="name" value={form.name} onChange={handleChange} />
            <FormField compact required={false} label="CPF" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" inputMode="numeric" />
            <FormField compact required={false} label="Telefone" name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
            <InfoLinha label="E-mail" value={user?.email ?? "-"} />
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setEditando(false); setErro(null) }}
                className="flex-1 border border-line text-muted hover:border-ink rounded-lg py-2.5 text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={salvando}
                className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold rounded-lg py-2.5 text-sm transition-colors">
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
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
        const status = STATUS_DOACAO[d.status] ?? { label: d.status, classes: "bg-soft text-muted" }
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
        {Object.values(STATUS_DOACAO).map((s) => (
          <span key={s.label} className={`text-xs px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
        ))}
      </div>
      <p className="text-xs text-muted">Fluxo: Pendente → Processado → Confirmado → Aplicado</p>
    </div>
  )
}

function AbaRanking({ nome, donations, userId }) {
  const [ranking, setRanking] = useState([])
  const [loadingRanking, setLoadingRanking] = useState(true)

  useEffect(() => {
    getRanking(10)
      .then((data) => setRanking(data || []))
      .catch(() => setRanking([]))
      .finally(() => setLoadingRanking(false))
  }, [])

  const paidDonations = (donations || []).filter((d) => d.status === "PAID")
  const totalDoadoCents = paidDonations.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const pontos = Math.floor(totalDoadoCents / 100)
  const totalDoacoes = paidDonations.length

  const posicaoFromRanking = ranking.findIndex((r) => r.user_id === userId)
  const posicao = posicaoFromRanking >= 0 ? posicaoFromRanking + 1 : ranking.length + 1

  const nivel = NIVEIS.find((t) => pontos >= t.min && pontos <= t.max)
  const proxNivel = NIVEIS[NIVEIS.indexOf(nivel) + 1]
  const progresso = proxNivel
    ? Math.round(((pontos - nivel.min) / (proxNivel.min - nivel.min)) * 100)
    : 100

  const badges = []
  if (totalDoacoes >= 1) badges.push({ id: 1, icon: "\u{1F49C}", label: "Primeiro passo", descricao: "Realizou a primeira doação" })
  if (totalDoacoes >= 3) badges.push({ id: 2, icon: "\u{1F525}", label: "Doador constante", descricao: "3 doações confirmadas" })
  if (totalDoacoes >= 5) badges.push({ id: 3, icon: "\u{2B50}", label: "Impacto real", descricao: "5 doações confirmadas" })
  if (totalDoacoes >= 10) badges.push({ id: 4, icon: "\u{1F3C6}", label: "Top 10", descricao: "10 doações confirmadas" })
  if (pontos >= 1000) badges.push({ id: 5, icon: "\u{1F48E}", label: "Generoso", descricao: "Mais de R$ 1.000 doados" })

  if (loadingRanking) return <Loading />

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
            <p className="text-2xl font-bold text-primary">{pontos.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        {proxNivel && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>{nivel.label}</span>
              <span>{proxNivel.label} em {(proxNivel.min - pontos).toLocaleString("pt-BR")} pts</span>
            </div>
            <div className="w-full bg-soft rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        )}
        <p className="text-xs text-muted">Posição global: <span className="font-bold text-ink">#{posicao}</span></p>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-line p-4 flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{b.icon}</span>
              <p className="text-sm font-bold text-ink">{b.label}</p>
              <p className="text-xs text-muted">{b.descricao}</p>
            </div>
          ))}
          {totalDoacoes < 10 && (
            <div className="bg-soft rounded-xl border border-dashed border-line p-4 flex flex-col items-center gap-2 text-center opacity-50">
              <span className="text-3xl">{"\u{1F512}"}</span>
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
          {posicaoFromRanking < 0 && pontos > 0 && (
            <>
              <div className="px-4 py-1 text-center text-xs text-muted">• • •</div>
              <div className="flex items-center justify-between px-4 py-3 bg-primary-light">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-5">#{posicao}</span>
                  <span className="text-sm font-bold text-primary">{nome} (você)</span>
                </div>
                <span className="text-sm font-bold text-primary">{pontos.toLocaleString("pt-BR")} pts</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

