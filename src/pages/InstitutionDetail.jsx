import { Link, useParams } from "react-router-dom"
import { instituicoes, campanhas } from "../utils/mockData"
import CampaignCard from "../components/ui/CampaignCard"

export default function InstitutionDetail() {
  const { id } = useParams()
  const instituicao = instituicoes.find((i) => i.id === Number(id))

  if (!instituicao) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Instituição não encontrada.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar para campanhas</Link>
      </div>
    )
  }

  const { nome, descricao, cidade, estado, fundadoEm, cnpj, email, telefone, verificada, certificacoes, balancoSocial, redesSociais } = instituicao
  const campanhasAtivas = campanhas.filter((c) => c.instituicaoId === Number(id))
  const iniciais = nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

  return (
    <div className="py-8 px-4 flex flex-col gap-10">
      <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
        ← Voltar para campanhas
      </Link>

      {/* Hero */}
      <section className="flex flex-col sm:flex-row items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-2xl font-bold">{iniciais}</span>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-ink">{nome}</h1>
            {verificada && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light text-success">
                ✓ Verificada
              </span>
            )}
          </div>
          <p className="text-sm text-muted">{cidade}, {estado} · Fundada em {fundadoEm}</p>
          <p className="text-muted leading-relaxed mt-1">{descricao}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted">
            <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
            <span>{telefone}</span>
            <span className="text-line">|</span>
            <span className="text-xs text-muted/70">CNPJ {cnpj}</span>
          </div>
          <div className="flex gap-3 mt-1">
            {redesSociais.instagram && <a href={redesSociais.instagram} className="text-xs text-muted hover:text-primary transition-colors">Instagram</a>}
            {redesSociais.facebook && <a href={redesSociais.facebook} className="text-xs text-muted hover:text-primary transition-colors">Facebook</a>}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={balancoSocial.familiasBeneficiadas.toLocaleString("pt-BR")} label="Famílias beneficiadas" />
        <StatCard value={balancoSocial.voluntarios.toLocaleString("pt-BR")} label="Voluntários ativos" />
        <StatCard value={balancoSocial.arrecadadoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} label="Total arrecadado" />
        <StatCard value={balancoSocial.campanhasRealizadas} label="Campanhas realizadas" />
      </section>

      {/* Video */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Conheça nosso trabalho</h2>
        <div className="w-full aspect-video bg-soft rounded-xl border border-line flex flex-col items-center justify-center gap-3 text-muted">
          <div className="w-14 h-14 rounded-full bg-line flex items-center justify-center">
            <span className="text-2xl">▶</span>
          </div>
          <p className="text-sm">Vídeo institucional em breve</p>
        </div>
      </section>

      {/* Social balance */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink">Balanço social</h2>
        <div className="bg-white rounded-xl border border-line p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <BalancoItem titulo="Impacto direto" descricao={`${balancoSocial.familiasBeneficiadas.toLocaleString("pt-BR")} famílias beneficiadas desde a fundação por meio de programas contínuos de assistência.`} />
          <BalancoItem titulo="Transparência financeira" descricao={`${balancoSocial.arrecadadoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} arrecadados ao longo de ${balancoSocial.campanhasRealizadas} campanhas, com prestação de contas pública.`} />
          <BalancoItem titulo="Comunidade de voluntários" descricao={`${balancoSocial.voluntarios} voluntários dedicam parte do seu tempo regularmente para apoiar as ações da instituição.`} />
          <BalancoItem titulo="Rastreabilidade das doações" descricao="Cada doação é registrada e aplicada diretamente na campanha escolhida pelo doador, com relatório de uso enviado por e-mail." />
        </div>
      </section>

      {/* Certifications */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">Certificações</h2>
        <div className="flex flex-wrap gap-2">
          {certificacoes.map((cert) => (
            <span key={cert} className="text-sm px-3 py-1.5 rounded-full border border-line text-muted bg-white font-medium">
              {cert}
            </span>
          ))}
        </div>
      </section>

      {/* Active campaigns */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink">Campanhas ativas</h2>
        {campanhasAtivas.length === 0 ? (
          <p className="text-muted text-sm">Nenhuma campanha ativa no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campanhasAtivas.map((c) => <CampaignCard key={c.id} campanha={c} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl border border-line p-5 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  )
}

function BalancoItem({ titulo, descricao }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-bold text-ink">{titulo}</p>
      <p className="text-sm text-muted leading-relaxed">{descricao}</p>
    </div>
  )
}
