import { useState } from "react"
import { pendingInstitutionsMock } from "../utils/mockData"
import { getInitials } from "../utils/strings"
import Textarea from "../components/ui/Textarea"
import StatCard from "../components/ui/StatCard"
import TabBar from "../components/ui/TabBar"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import { IconShieldCheck, IconFileText } from "@tabler/icons-react"

const TABS = ["Pendentes", "Aprovadas", "Rejeitadas"]

export default function AdminArea() {
  const [institutions, setInstitutions] = useState(pendingInstitutionsMock)
  const [tab, setTab] = useState("Pendentes")
  const [rejectingId, setRejectingId] = useState(null)
  const [reason, setReason] = useState("")

  const pending  = institutions.filter((i) => i.status === "pendente")
  const approved  = institutions.filter((i) => i.status === "aprovada")
  const rejected = institutions.filter((i) => i.status === "rejeitada")

  const currentList = { Pendentes: pending, Aprovadas: approved, Rejeitadas: rejected }[tab]

  function approve(id) {
    setInstitutions((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "aprovada", resolvedAt: new Date().toISOString().slice(0, 10) }
          : i
      )
    )
  }

  function initiateRejection(id) {
    setRejectingId(id)
    setReason("")
  }

  function confirmRejection(id) {
    if (!reason.trim()) return
    setInstitutions((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "rejeitada",
              rejectionReason: reason.trim(),
              resolvedAt: new Date().toISOString().slice(0, 10),
            }
          : i
      )
    )
    setRejectingId(null)
    setReason("")
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-dark flex items-center justify-center shrink-0">
          <IconShieldCheck className="text-white" size={26} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">Painel Admin</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-soft text-muted">Admin</span>
          </div>
          <p className="text-sm text-muted">Gerenciamento de instituições</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        <StatCard value={pending.length}  label="Pendentes"  color="text-warning" size="text-2xl" />
        <StatCard value={approved.length}  label="Aprovadas"  color="text-success" size="text-2xl" />
        <StatCard value={rejected.length} label="Rejeitadas" color="text-accent"  size="text-2xl" />
      </div>

      <TabBar
        tabs={TABS}
        active={tab}
        onChange={setTab}
        renderBadge={(t) => {
          const count = { Pendentes: pending.length, Aprovadas: approved.length, Rejeitadas: rejected.length }[t]
          if (!count) return null
          const classes = {
            Pendentes: "bg-warning-light text-warning",
            Aprovadas: "bg-success-light text-success",
            Rejeitadas: "bg-accent-light text-accent",
          }[t]
          return (
            <span className={`ml-1.5 ${classes} text-xs font-semibold px-1.5 py-0.5 rounded-full`}>
              {count}
            </span>
          )
        }}
      />

      {currentList.length === 0 ? (
        <EmptyState message="Nenhuma instituição nesta categoria." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentList.map((inst) => (
            <InstitutionCard
              key={inst.id}
              institution={inst}
              isRejecting={rejectingId === inst.id}
              reason={reason}
              onReason={setReason}
              onApprove={() => approve(inst.id)}
              onInitiateRejection={() => initiateRejection(inst.id)}
              onConfirmRejection={() => confirmRejection(inst.id)}
              onCancelRejection={() => setRejectingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InstitutionCard({
  institution, isRejecting, reason, onReason,
  onApprove, onInitiateRejection, onConfirmRejection, onCancelRejection,
}) {
  const [expanded, setExpanded] = useState(false)
  const initials = getInitials(institution.name)

  return (
    <div className="bg-white rounded-xl border border-line overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary font-bold text-base flex items-center justify-center shrink-0">
          {initials}
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-semibold text-ink">{institution.name}</p>
            <StatusBadge status={institution.status} />
          </div>
          <p className="text-xs text-muted">{institution.cnpj} · {institution.city}, {institution.state}</p>
          <p className="text-xs text-muted">{institution.email} · {institution.phone}</p>
          <p className="text-xs text-muted mt-1">
            Submetida em {new Date(institution.submittedAt).toLocaleDateString("pt-BR")}
            {institution.resolvedAt && ` · Resolvida em ${new Date(institution.resolvedAt).toLocaleDateString("pt-BR")}`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0 sm:flex-wrap">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-line text-muted hover:border-primary hover:text-primary transition-colors"
          >
            {expanded ? "Menos" : "Ver detalhes"}
          </button>
          {institution.status === "pendente" && (
            <>
              <button
                onClick={onApprove}
                className="text-xs px-3 py-1.5 rounded-lg bg-success hover:bg-success/80 text-white font-semibold transition-colors"
              >
                Aprovar
              </button>
              <button
                onClick={onInitiateRejection}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent-light hover:bg-accent/20 text-accent border border-accent/30 font-semibold transition-colors"
              >
                Rejeitar
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line px-5 py-4 flex flex-col gap-3 bg-soft">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-sm text-ink leading-relaxed">{institution.description}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Documento</p>
            <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <IconFileText size={16} /> {institution.document}
            </button>
          </div>
          {institution.rejectionReason && (
            <div>
              <p className="text-xs font-bold text-accent uppercase tracking-wide mb-1">Motivo da rejeição</p>
              <p className="text-sm text-accent leading-relaxed">{institution.rejectionReason}</p>
            </div>
          )}
        </div>
      )}

      {isRejecting && (
        <div className="border-t border-accent/20 px-5 py-4 bg-accent-light flex flex-col gap-3">
          <p className="text-sm font-semibold text-accent">Informe o motivo da rejeição</p>
          <Textarea
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            rows={3}
            placeholder="Ex: Documentação incompleta. O estatuto social está desatualizado..."
            className="border-accent/30 focus:border-accent focus:ring-accent/10 bg-white"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelRejection}
              className="text-sm px-4 py-2 rounded-lg border border-line text-muted hover:border-ink transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmRejection}
              disabled={!reason.trim()}
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

const STATUS_VARIANT = { pendente: "pending", aprovada: "approved", rejeitada: "rejected" }
const STATUS_LABEL = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada" }

function StatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANT[status]} label={STATUS_LABEL[status]} icon={false} />
}
