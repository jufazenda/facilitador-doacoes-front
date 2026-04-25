import { Link } from "react-router-dom";
import kaoImage from "../../assets/kao.jpg";

export default function CardCampanha({ campaign: campanha }) {
  const urgente = campanha.badgeType === "urgent";

  return (
    <article className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl shadow-purple-950/5 sm:rounded-3xl">
      <div className="relative h-40 overflow-hidden sm:h-48">
        <img
          src={kaoImage}
          alt={campanha.title}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-extrabold sm:left-4 sm:top-4 sm:px-3 sm:py-1 ${
            urgente ? "bg-accent text-white" : "bg-green-100 text-green-700"
          }`}
        >
          {campanha.badge}
        </span>

        <button
          type="button"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-lg text-white backdrop-blur-md sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-xl"
          aria-label={`Save campaign ${campanha.title}`}
        >
          ♡
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-extrabold text-purple-950 sm:text-xl">
          <Link to={`/campanha/${campanha.id}`} className="transition-colors hover:text-purple-700">
            {campanha.title}
          </Link>
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {campanha.institution}
          <span
            className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-xs text-white"
            aria-label="Verified institution"
          >
            ✓
          </span>
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-100">
          <div
            className="h-full rounded-full bg-purple-700"
            style={{ width: `${campanha.percentage}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between gap-2 text-sm font-bold text-purple-950">
          <span>{campanha.raised} arrecadado</span>
          <span className="text-slate-500">{campanha.goal} - meta</span>
        </div>

        <div className="mt-1 flex justify-between gap-2 text-sm">
          <span className="font-extrabold text-green-600">
            {campanha.percentage}% alcançado
          </span>
          <span className="text-slate-500">{campanha.daysLeft}</span>
        </div>

        <Link
          to={`/doacao/${campanha.id}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-700 px-4 py-2.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-purple-800 sm:mt-5 sm:py-3"
        >
          ♡ Doe
        </Link>
      </div>
    </article>
  );
}
