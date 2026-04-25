import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { instituicoes, campanhas } from "../utils/mockData"
import { categoryImages } from "../utils/categoryImages"
import kaoImage from "../assets/kao.jpg"

const PRIORIDADE = {
  urgente: { label: "Urgente", dot: "bg-accent", badge: "bg-red-50 text-accent border-accent/20", card: "border-accent/30" },
  alta:    { label: "Alta prioridade", dot: "bg-success", badge: "bg-success-light text-success border-success/20", card: "border-success/30" },
  media:   { label: "Média prioridade", dot: "bg-warning", badge: "bg-warning-light text-warning border-warning/20", card: "border-warning/30" },
}

const TIPO_ATUALIZACAO = {
  conquista:   { label: "Nova conquista", color: "bg-success-light text-success" },
  campanha:    { label: "Campanha", color: "bg-primary-light text-primary" },
  atendimento: { label: "Atendimento", color: "bg-soft text-muted" },
}

export default function InstitutionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const inst = instituicoes.find((i) => i.id === Number(id))
  const [apoiando, setApoiando] = useState(false)

  if (!inst) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Instituição não encontrada.</p>
        <Link to="/instituicoes" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar para instituições</Link>
      </div>
    )
  }

  const campanhasAtivas = campanhas.filter((c) => c.instituicaoId === Number(id))
  const iniciais = inst.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const isDoador = user?.tipo === "doador"

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-10">

      {/* ── Hero ── */}
      <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col gap-5 p-7 sm:p-9">
            <nav className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <span>›</span>
              <Link to="/instituicoes" className="hover:text-primary transition-colors">Instituições</Link>
              <span>›</span>
              <span className="text-ink">{inst.nome}</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light shadow">
                {inst.logo ? (
                  <img src={inst.logo} alt={inst.nome} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-primary">{iniciais}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-purple-950 sm:text-3xl">{inst.nome}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted">📍 {inst.cidade}, {inst.estado}</span>
                  {inst.verificada && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success">
                      ✓ Instituição verificada
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="leading-relaxed text-muted">{inst.descricao}</p>

            <div className="flex flex-wrap gap-3">
              {isDoador && (
                <button
                  onClick={() => setApoiando((v) => !v)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 font-bold transition-colors ${
                    apoiando
                      ? "border border-success/30 bg-success-light text-success"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`}
                >
                  {apoiando ? "♥ Apoiando" : "♡ Apoiar instituição"}
                </button>
              )}
              <a
                href="#campanhas"
                className="rounded-2xl border border-purple-700 px-5 py-2.5 font-bold text-purple-700 transition-colors hover:bg-purple-50"
              >
                Ver campanhas
              </a>
            </div>
          </div>

          <div className="h-64 lg:h-auto">
            <img src={inst.foto || kaoImage} alt={inst.nome} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── Sobre ── */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">🏛️ Sobre a instituição</h2>
          <p className="text-sm leading-relaxed text-muted">{inst.sobreDetalhado || inst.descricao}</p>
        </div>

        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-line bg-soft">
          <img src={kaoImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 text-2xl text-white backdrop-blur-sm">▶</div>
            <p className="text-sm font-bold text-white drop-shadow">Assista ao vídeo institucional</p>
          </div>
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs text-white">02:45</span>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-purple-100 bg-white p-5">
          {inst.statsDetalhados ? (
            <>
              <StatRow icon="📅" label="Ano de fundação" value={inst.statsDetalhados.anoFundacao} />
              <StatRow icon="👥" label="Público atendido" value={inst.statsDetalhados.publicoAtendido} />
              <StatRow icon="🏃" label="Atendimentos/ano" value={inst.statsDetalhados.atendimentosPorAno} />
              <StatRow icon="👤" label="Equipe" value={inst.statsDetalhados.equipe} />
            </>
          ) : (
            <>
              <StatRow icon="📅" label="Fundada em" value={inst.fundadoEm} />
              <StatRow icon="👥" label="Famílias beneficiadas" value={inst.balancoSocial.familiasBeneficiadas.toLocaleString("pt-BR")} />
              <StatRow icon="👤" label="Voluntários" value={inst.balancoSocial.voluntarios} />
              <StatRow icon="📋" label="Campanhas realizadas" value={inst.balancoSocial.campanhasRealizadas} />
            </>
          )}
        </div>
      </section>

      {/* ── Necessidades ── */}
      {inst.necessidadesAtuais?.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">❤️ Necessidades atuais</h2>
            <a href="#" className="text-sm font-semibold text-primary hover:underline">Ver todas →</a>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inst.necessidadesAtuais.map((n) => <CartaoNecessidade key={n.id} necessidade={n} />)}
          </div>
        </section>
      )}

      {/* ── Campanhas ── */}
      <section id="campanhas" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">🚩 Campanhas ativas</h2>
          <a href="#" className="text-sm font-semibold text-primary hover:underline">Ver todas →</a>
        </div>
        {campanhasAtivas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma campanha ativa no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {campanhasAtivas.map((c) => <CartaoCampanhaH key={c.id} campanha={c} />)}
          </div>
        )}
      </section>

      {/* ── Certificações ── */}
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">🛡️ Certificações e transparência</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2 rounded-2xl bg-primary-light p-4 min-w-40">
            <span className="text-2xl">🛡️</span>
            <p className="text-sm font-bold text-purple-950">Instituição verificada</p>
            <p className="text-xs text-muted">Passou por verificação e validação pelo nosso time.</p>
          </div>
          {inst.documentos?.map((doc) => <CartaoDoc key={doc.titulo} doc={doc} />)}
          <div className="flex items-end pb-1">
            <a href="#" className="text-sm font-semibold text-primary hover:underline">Ver todos os documentos →</a>
          </div>
        </div>
      </section>

      {/* ── Atualizações ── */}
      {inst.atualizacoes?.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-purple-950">📅 Atualizações recentes</h2>
            <a href="#" className="text-sm font-semibold text-primary hover:underline">Ver todas →</a>
          </div>
          <div className="flex flex-col">
            {inst.atualizacoes.map((a, i) => (
              <ItemAtualizacao key={a.id} item={a} isLast={i === inst.atualizacoes.length - 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-muted">
        <span>{icon}</span>{label}
      </span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  )
}

function CartaoNecessidade({ necessidade }) {
  const { titulo, descricao, prioridade, emoji, arrecadado, meta } = necessidade
  const cfg = PRIORIDADE[prioridade] || PRIORIDADE.media
  const pct = Math.min(Math.round((arrecadado / meta) * 100), 100)

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 ${cfg.card}`}>
      <span className={`self-start flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.badge}`}>
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft text-2xl">{emoji}</span>
        <div>
          <p className="font-bold text-ink">{titulo}</p>
          <p className="mt-0.5 text-xs text-muted">{descricao}</p>
        </div>
      </div>
      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs">
          <span className="font-bold text-primary">{arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} arrecadados</span>
          <span className="text-muted">{meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} meta</span>
        </div>
      </div>
    </div>
  )
}

function CartaoCampanhaH({ campanha }) {
  const bgImage = categoryImages[campanha.categoria]
  const pct = Math.min(Math.round((campanha.arrecadado / campanha.meta) * 100), 100)

  return (
    <div className="flex overflow-hidden rounded-2xl border border-purple-100 bg-white">
      <div className="w-24 shrink-0 sm:w-28">
        {bgImage ? (
          <img src={bgImage} alt={campanha.titulo} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary-light" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 min-w-0">
        <h3 className="text-sm font-extrabold leading-snug text-purple-950">
          <Link to={`/campanha/${campanha.id}`} className="transition-colors hover:text-purple-700">
            {campanha.titulo}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs text-muted">{campanha.descricao}</p>
        <div className="mt-auto">
          <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-purple-100">
            <div className="h-full rounded-full bg-purple-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-purple-700">{campanha.arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            <span className="text-muted">{campanha.meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} meta</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartaoDoc({ doc }) {
  return (
    <div className="flex min-w-35 flex-col gap-2 rounded-2xl border border-line bg-white p-4">
      <span className="text-2xl">📄</span>
      <p className="text-xs font-bold text-ink">{doc.titulo}</p>
      <span className={`self-start rounded-full px-2 py-0.5 text-xs font-semibold ${
        doc.status === "aprovado" ? "bg-success-light text-success" : "bg-warning-light text-warning"
      }`}>
        {doc.status === "aprovado" ? "Aprovado" : "Pendente"}
      </span>
    </div>
  )
}

function ItemAtualizacao({ item, isLast }) {
  const { data, tipo, texto } = item
  const cfg = TIPO_ATUALIZACAO[tipo] || TIPO_ATUALIZACAO.atendimento
  const dataFmt = new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <div className="flex gap-4">
      <div className="flex w-6 shrink-0 flex-col items-center">
        <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-white" />
        {!isLast && <div className="mt-1 w-px flex-1 bg-line" />}
      </div>
      <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">{dataFmt}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <p className="mt-1 text-sm text-ink">{texto}</p>
      </div>
    </div>
  )
}
