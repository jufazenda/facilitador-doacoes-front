import { useState } from "react"
import { Link } from "react-router-dom"
import { doadorMock, historicoMock, rankingMock } from "../utils/mockData"

const TABS = ["Perfil", "Histórico", "Ranking"]

const TIERS = [
  { label: "Bronze",   min: 0,    max: 299,      color: "text-amber-700",  bg: "bg-amber-100" },
  { label: "Prata",    min: 300,  max: 999,       color: "text-muted",      bg: "bg-soft" },
  { label: "Ouro",     min: 1000, max: 2999,      color: "text-warning",    bg: "bg-warning-light" },
  { label: "Diamante", min: 3000, max: Infinity,  color: "text-primary",    bg: "bg-primary-light" },
]

const STATUS_STYLES = {
  pendente:   { label: "Pendente",   classes: "bg-warning-light text-warning" },
  processado: { label: "Processado", classes: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", classes: "bg-secondary/10 text-secondary" },
  aplicado:   { label: "Aplicado",   classes: "bg-success-light text-success" },
}

export default function DonorArea() {
  const [tab, setTab] = useState("Perfil")
  const d = doadorMock

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">
            {d.nome.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{d.nome}</h1>
          <p className="text-sm text-muted">
            Doador desde {new Date(d.desde).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-line gap-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Perfil"    && <TabPerfil d={d} />}
      {tab === "Histórico" && <TabHistorico />}
      {tab === "Ranking"   && <TabRanking d={d} />}
    </div>
  )
}

function TabPerfil({ d }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard value={d.totalDoado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} label="Total doado" />
        <StatCard value={d.totalDoacoes} label="Doações realizadas" />
        <StatCard value={d.doacoesRecorrentes} label="Doações recorrentes" />
      </div>
      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink">Dados pessoais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Nome" value={d.nome} />
          <InfoRow label="E-mail" value={d.email} />
          <InfoRow label="CPF" value={d.cpf} />
          <InfoRow label="Membro desde" value={new Date(d.desde).toLocaleDateString("pt-BR")} />
        </div>
        <button className="self-start mt-2 text-sm text-primary hover:underline font-semibold">Editar dados</button>
      </div>
    </div>
  )
}

function TabHistorico() {
  return (
    <div className="flex flex-col gap-3">
      {historicoMock.map((d) => {
        const status = STATUS_STYLES[d.status]
        return (
          <div key={d.id} className="bg-white rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <Link to={`/campanha/${d.campanhaId}`}
                className="text-sm font-bold text-ink hover:text-primary transition-colors truncate">
                {d.campanha}
              </Link>
              <p className="text-xs text-muted">{d.instituicao}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.classes}`}>{status.label}</span>
                <span className="text-xs text-muted">{d.tipo === "recorrente" ? `Recorrente ${d.intervalo}` : "Única"}</span>
                <span className="text-xs text-muted">{d.metodo === "pix" ? "Pix" : "Cartão"}</span>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
              <span className="text-base font-bold text-ink">
                {d.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="text-xs text-muted">{new Date(d.data).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        )
      })}
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.values(STATUS_STYLES).map((s) => (
          <span key={s.label} className={`text-xs px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
        ))}
      </div>
      <p className="text-xs text-muted">Fluxo: Pendente → Processado → Confirmado → Aplicado</p>
    </div>
  )
}

function TabRanking({ d }) {
  const tier = TIERS.find((t) => d.pontos >= t.min && d.pontos <= t.max)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const progress = nextTier ? Math.round(((d.pontos - tier.min) / (nextTier.min - tier.min)) * 100) : 100

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted mb-1">Seu nível</p>
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${tier.bg} ${tier.color}`}>{tier.label}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Pontos</p>
            <p className="text-2xl font-bold text-primary">{d.pontos.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>{tier.label}</span>
              <span>{nextTier.label} em {(nextTier.min - d.pontos).toLocaleString("pt-BR")} pts</span>
            </div>
            <div className="w-full bg-soft rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
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
              <span className="text-sm font-bold text-primary">{d.nome} (você)</span>
            </div>
            <span className="text-sm font-bold text-primary">{d.pontos.toLocaleString("pt-BR")} pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl border border-line p-4 text-center">
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm text-ink font-semibold">{value}</p>
    </div>
  )
}
