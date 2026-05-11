import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getCampaignById } from "../services/campaigns"
import { getInstitutionById } from "../services/institutions"
import { categoryImages } from "../utils/categoryImages"
import Loading from "../components/ui/Loading"

export default function CampaignDetail() {
  const { id } = useParams()
  const [campanha, setCampanha] = useState(null)
  const [instituicao, setInstituicao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    getCampaignById(id)
      .then((c) => {
        setCampanha(c)
        return getInstitutionById(c.institution_id).catch(() => null)
      })
      .then((inst) => setInstituicao(inst))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading full />

  if (notFound || !campanha) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Campanha não encontrada.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar para campanhas</Link>
      </div>
    )
  }

  const raised     = (campanha.total_raised ?? 0) / 100
  const goal       = (campanha.goal_amount  ?? 0) / 100
  const percentual = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0
  const falta      = Math.max(goal - raised, 0)
  const bgImage    = categoryImages[campanha.keywords?.[0]]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-6">
        ← Voltar para campanhas
      </Link>

      <div className="relative h-56 overflow-hidden rounded-2xl sm:h-72 sm:rounded-3xl">
        {bgImage ? (
          <img src={bgImage} alt={campanha.category} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary-light" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
            {campanha.category}
          </span>
          {campanha.is_urgent && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-white">Urgente</span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <h1 className="text-2xl md:text-3xl font-bold text-ink leading-snug">{campanha.title}</h1>

          <p className="text-sm text-muted">
            por{" "}
            {instituicao ? (
              <Link to={`/instituicao/${campanha.institution_id}`} className="text-primary hover:underline font-semibold">
                {instituicao.name}
              </Link>
            ) : (
              <span className="font-semibold">Instituição</span>
            )}
          </p>

          <hr className="border-line" />

          <div>
            <h2 className="text-base font-bold text-ink mb-3">Sobre esta campanha</h2>
            <p className="text-muted leading-relaxed">{campanha.description}</p>
          </div>

          <div className="md:hidden">
            <CardDoacao id={id} raised={raised} goal={goal} falta={falta} percentual={percentual} />
          </div>
        </div>

        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24">
            <CardDoacao id={id} raised={raised} goal={goal} falta={falta} percentual={percentual} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardDoacao({ id, raised, goal, falta, percentual }) {
  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5">
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xl font-bold text-ink">
            {raised.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          <span className="text-sm font-bold text-primary">{percentual}%</span>
        </div>
        <div className="w-full bg-soft rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${percentual}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted mt-1.5">
          <span>arrecadados</span>
          <span>Meta: {goal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
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

      <p className="text-xs text-center text-muted">Pagamento seguro via Pix ou cartão</p>
    </div>
  )
}
