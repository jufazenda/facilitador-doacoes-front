import { Link } from "react-router-dom"
import { categoryImages } from "../../utils/categoryImages"

function daysLeft(endsAt) {
  if (!endsAt) return null
  const days = Math.ceil((new Date(endsAt) - new Date()) / 86400000)
  if (days <= 0) return "Encerrada"
  return `${days} dia${days === 1 ? "" : "s"} restante${days === 1 ? "" : "s"}`
}

export default function CampaignCard({ campaign: c, institutionName = "" }) {
  const bgImage = categoryImages[c.keywords?.[0]]
  const raised  = (c.total_raised ?? 0) / 100
  const goal    = (c.goal_amount  ?? 0) / 100
  const pct     = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0
  const initials = institutionName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const remaining = daysLeft(c.ends_at)

  return (
    <article className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl shadow-purple-950/5 sm:rounded-3xl">
      <div className="relative h-40 overflow-visible sm:h-48">
        <div className="h-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
          {bgImage ? (
            <img src={bgImage} alt={c.category} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-primary-light" />
          )}
        </div>

        {c.is_urgent && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-white sm:left-4 sm:top-4 sm:px-3 sm:py-1">
            Urgente
          </span>
        )}

        <div className="absolute -bottom-5 left-4 h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-purple-700 shadow-md sm:h-11 sm:w-11">
          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
            {initials || "?"}
          </span>
        </div>
      </div>

      <div className="p-4 pt-8 sm:p-5 sm:pt-9">
        <h3 className="text-lg font-extrabold text-purple-950 sm:text-xl">{c.title}</h3>

        {institutionName && (
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {institutionName}
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-xs text-white" aria-label="Instituição verificada">
              ✓
            </span>
          </p>
        )}

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-100">
          <div className="h-full rounded-full bg-purple-700" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-3 flex justify-between gap-2 text-sm font-bold text-purple-950">
          <span>{raised.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} arrecadado</span>
          <span className="text-slate-500">{goal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} meta</span>
        </div>

        <div className="mt-1 flex justify-between gap-2 text-sm">
          <span className="font-extrabold text-green-600">{pct}% alcançado</span>
          {remaining && <span className="text-slate-500">{remaining}</span>}
        </div>

        <div className="relative z-10 mt-4 sm:mt-5">
          <Link
            to={`/doacao/${c.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-700 px-4 py-2.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-purple-800 sm:py-3"
          >
            ♡ Doe
          </Link>
        </div>
      </div>

      <Link to={`/campanha/${c.id}`} className="absolute inset-0" aria-label={c.title} />
    </article>
  )
}
