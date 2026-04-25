import { Link } from "react-router-dom"

export default function CampaignCard({ campanha }) {
  const { id, titulo, instituicao, categoria, descricao, meta, arrecadado, urgente } = campanha
  const percentual = Math.min(Math.round((arrecadado / meta) * 100), 100)

  return (
    <Link to={`/campanha/${id}`} className="block group">
      <div className="bg-white rounded-xl border border-line p-5 flex flex-col gap-3 h-full group-hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-light text-primary">
            {categoria}
          </span>
          {urgente && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-light text-accent">
              Urgente
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-ink leading-snug line-clamp-2">{titulo}</h3>

        <p className="text-sm text-muted">{instituicao}</p>

        <p className="text-sm text-muted line-clamp-2 flex-1">{descricao}</p>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="w-full bg-soft rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentual}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>
              <span className="font-bold text-ink">
                {arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>{" "}
              arrecadados
            </span>
            <span className="font-semibold text-primary">{percentual}%</span>
          </div>
          <p className="text-xs text-muted">
            Meta: {meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        <button className="mt-1 w-full bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg py-2.5 transition-colors">
          Doar agora
        </button>
      </div>
    </Link>
  )
}
