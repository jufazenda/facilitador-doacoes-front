import { useState } from "react"
import { instituicoesPendentesMock } from "../utils/mockData"

const TABS = ["Pendentes", "Aprovadas", "Rejeitadas"]

export default function AdminArea() {
  const [instituicoes, setInstituicoes] = useState(instituicoesPendentesMock)
  const [tab, setTab] = useState("Pendentes")
  const [rejeitandoId, setRejeitandoId] = useState(null)
  const [motivo, setMotivo] = useState("")

  const pendentes  = instituicoes.filter((i) => i.status === "pendente")
  const aprovadas  = instituicoes.filter((i) => i.status === "aprovada")
  const rejeitadas = instituicoes.filter((i) => i.status === "rejeitada")

  const listaAtual = { Pendentes: pendentes, Aprovadas: aprovadas, Rejeitadas: rejeitadas }[tab]

  function aprovar(id) {
    setInstituicoes((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "aprovada", resolvidaEm: new Date().toISOString().slice(0, 10) }
          : i
      )
    )
  }

  function iniciarRejeicao(id) {
    setRejeitandoId(id)
    setMotivo("")
  }

  function confirmarRejeicao(id) {
    if (!motivo.trim()) return
    setInstituicoes((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "rejeitada",
              motivoRejeicao: motivo.trim(),
              resolvidaEm: new Date().toISOString().slice(0, 10),
            }
          : i
      )
    )
    setRejeitandoId(null)
    setMotivo("")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-dark flex items-center justify-center shrink-0">
          <span className="text-white text-xl">🛡️</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">Painel Admin</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-soft text-muted">Admin</span>
          </div>
          <p className="text-sm text-muted">Gerenciamento de instituições</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard value={pendentes.length}  label="Pendentes"  color="text-warning" />
        <StatCard value={aprovadas.length}  label="Aprovadas"  color="text-success" />
        <StatCard value={rejeitadas.length} label="Rejeitadas" color="text-accent"  />
      </div>

      <div className="flex overflow-x-auto border-b border-line gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
            {t === "Pendentes" && pendentes.length > 0 && (
              <span className="ml-1.5 bg-warning-light text-warning text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {pendentes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {listaAtual.length === 0 ? (
        <p className="text-center text-muted py-12">Nenhuma instituição nesta categoria.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {listaAtual.map((inst) => (
            <InstituicaoCard
              key={inst.id}
              inst={inst}
              isRejeitando={rejeitandoId === inst.id}
              motivo={motivo}
              onMotivo={setMotivo}
              onAprovar={() => aprovar(inst.id)}
              onIniciarRejeicao={() => iniciarRejeicao(inst.id)}
              onConfirmarRejeicao={() => confirmarRejeicao(inst.id)}
              onCancelarRejeicao={() => setRejeitandoId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InstituicaoCard({
  inst, isRejeitando, motivo, onMotivo,
  onAprovar, onIniciarRejeicao, onConfirmarRejeicao, onCancelarRejeicao,
}) {
  const [expandido, setExpandido] = useState(false)
  const iniciais = inst.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

  return (
    <div className="bg-white rounded-xl border border-line overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary font-bold text-base flex items-center justify-center shrink-0">
          {iniciais}
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-semibold text-ink">{inst.nome}</p>
            <StatusBadge status={inst.status} />
          </div>
          <p className="text-xs text-muted">{inst.cnpj} · {inst.cidade}, {inst.estado}</p>
          <p className="text-xs text-muted">{inst.email} · {inst.telefone}</p>
          <p className="text-xs text-muted mt-1">
            Submetida em {new Date(inst.submetidaEm).toLocaleDateString("pt-BR")}
            {inst.resolvidaEm && ` · Resolvida em ${new Date(inst.resolvidaEm).toLocaleDateString("pt-BR")}`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0 sm:flex-wrap">
          <button
            onClick={() => setExpandido((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-line text-muted hover:border-primary hover:text-primary transition-colors"
          >
            {expandido ? "Menos" : "Ver detalhes"}
          </button>
          {inst.status === "pendente" && (
            <>
              <button
                onClick={onAprovar}
                className="text-xs px-3 py-1.5 rounded-lg bg-success hover:bg-success/80 text-white font-semibold transition-colors"
              >
                Aprovar
              </button>
              <button
                onClick={onIniciarRejeicao}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent-light hover:bg-accent/20 text-accent border border-accent/30 font-semibold transition-colors"
              >
                Rejeitar
              </button>
            </>
          )}
        </div>
      </div>

      {expandido && (
        <div className="border-t border-line px-5 py-4 flex flex-col gap-3 bg-soft">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-sm text-ink leading-relaxed">{inst.descricao}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Documento</p>
            <button className="text-sm text-primary hover:underline">
              📄 {inst.documento}
            </button>
          </div>
          {inst.motivoRejeicao && (
            <div>
              <p className="text-xs font-bold text-accent uppercase tracking-wide mb-1">Motivo da rejeição</p>
              <p className="text-sm text-accent leading-relaxed">{inst.motivoRejeicao}</p>
            </div>
          )}
        </div>
      )}

      {isRejeitando && (
        <div className="border-t border-accent/20 px-5 py-4 bg-accent-light flex flex-col gap-3">
          <p className="text-sm font-semibold text-accent">Informe o motivo da rejeição</p>
          <textarea
            value={motivo}
            onChange={(e) => onMotivo(e.target.value)}
            rows={3}
            placeholder="Ex: Documentação incompleta. O estatuto social está desatualizado..."
            className="w-full rounded-lg border border-accent/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent transition resize-none bg-white"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelarRejeicao}
              className="text-sm px-4 py-2 rounded-lg border border-line text-muted hover:border-ink transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmarRejeicao}
              disabled={!motivo.trim()}
              className="text-sm px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              Confirmar rejeição
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pendente:  "bg-warning-light text-warning",
    aprovada:  "bg-success-light text-success",
    rejeitada: "bg-accent-light text-accent",
  }
  const labels = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada" }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function StatCard({ value, label, color }) {
  return (
    <div className="bg-white rounded-xl border border-line p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  )
}
