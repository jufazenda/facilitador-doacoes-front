import { useParams, Link } from "react-router-dom"
import { campanhas } from "../utils/mockData"

export default function CampaignDetail() {
  const { id } = useParams()
  const campanha = campanhas.find((c) => c.id === Number(id))

  if (!campanha) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Campanha não encontrada.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar para campanhas</Link>
      </div>
    )
  }

  const { titulo, instituicao, instituicaoId, categoria, descricao, meta, arrecadado, urgente } = campanha
  const percentual = Math.min(Math.round((arrecadado / meta) * 100), 100)
  const falta = meta - arrecadado

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-6">
        ← Voltar para campanhas
      </Link>

      <div className="grid grid-cols-1 gap-6 mt-2 md:grid-cols-3 md:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-light text-primary">{categoria}</span>
            {urgente && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-light text-accent">Urgente</span>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-ink leading-snug">{titulo}</h1>

          <p className="text-sm text-muted">
            por{" "}
            <Link to={`/instituicao/${instituicaoId}`} className="text-primary hover:underline font-semibold">
              {instituicao}
            </Link>
          </p>

          <hr className="border-line" />

          <div>
            <h2 className="text-base font-bold text-ink mb-3">Sobre esta campanha</h2>
            <p className="text-muted leading-relaxed">{descricao}</p>
          </div>

          <div className="md:hidden">
            <CardDoacao id={id} arrecadado={arrecadado} meta={meta} falta={falta} percentual={percentual} />
          </div>
        </div>

        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24">
            <CardDoacao id={id} arrecadado={arrecadado} meta={meta} falta={falta} percentual={percentual} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardDoacao({ id, arrecadado, meta, falta, percentual }) {
  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5">
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xl font-bold text-ink">
            {arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          <span className="text-sm font-bold text-primary">{percentual}%</span>
        </div>
        <div className="w-full bg-soft rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${percentual}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted mt-1.5">
          <span>arrecadados</span>
          <span>Meta: {meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </div>

      <p className="text-sm text-muted">
        Faltam{" "}
        <span className="font-bold text-ink">
          {falta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>{" "}
        para atingir a meta.
      </p>

      <Link to={`/doacao/${id}`}
        className="w-full text-center bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
        Fazer uma doação
      </Link>
      <Link to={`/doacao/${id}?tipo=recorrente`}
        className="w-full text-center border border-primary text-primary hover:bg-soft font-semibold rounded-lg py-3 transition-colors text-sm">
        Doação recorrente
      </Link>

      <p className="text-xs text-center text-muted">Pagamento seguro via Pix ou cartão</p>
    </div>
  )
}
