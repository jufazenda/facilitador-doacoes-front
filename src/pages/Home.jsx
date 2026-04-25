import { Link } from "react-router-dom";
import kaoImage from "../assets/kao.jpg";
import CardCampanha from "../components/ui/CardCampanha";
import {
  campaigns,
  campaignFilters,
  platformMetrics,
  steps,
} from "../utils/mockData";

export default function Home() {
  return (
    <>
      <section
        id="home"
        className="overflow-hidden bg-gradient-to-r from-[#FCFAFF] via-[#F5F0FF] to-white"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EEE4FF] px-3 py-1.5 text-xs font-extrabold text-purple-950 sm:px-4 sm:py-2 sm:text-sm">
              🛡️ Instituições verificadas, impacto real
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-purple-950 sm:text-4xl md:text-5xl lg:text-6xl">
              Doe com transparência.
              <br />
              Acompanhe o impacto.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Conectamos doadores com instituições que transformam o mundo.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
              <a
                href="#campaigns"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 py-3.5 font-extrabold text-white shadow-xl shadow-purple-300 transition hover:-translate-y-0.5 hover:bg-purple-800 sm:px-7 sm:py-4"
              >
                Ver campanhas
              </a>

              <Link
                to="/cadastro/instituicao"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-700 bg-white px-6 py-3.5 font-extrabold text-purple-800 transition hover:-translate-y-0.5 hover:bg-purple-50 sm:px-7 sm:py-4"
              >
                Cadastre instituições
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-4 z-10 text-5xl text-purple-300/60 sm:left-8 sm:top-6 sm:text-7xl">
              ♡
            </div>

            <div className="absolute bottom-8 left-0 z-10 h-16 w-16 bg-[radial-gradient(#6F3DD9_2px,transparent_2px)] bg-size-[14px_14px] opacity-30 sm:bottom-12 sm:h-24 sm:w-24 sm:bg-size-[16px_16px]" />

            <img
              src={kaoImage}
              alt="Children smiling in an inclusive care environment"
              className="h-56 w-full rounded-2xl object-cover shadow-2xl shadow-purple-950/10 sm:h-72 sm:rounded-4xl lg:h-115"
            />

            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-page/70 via-transparent to-transparent sm:rounded-4xl" />
          </div>
        </div>
      </section>

      <section
        id="campaigns"
        className="relative z-10 -mt-4 rounded-t-2xl bg-white py-12 sm:-mt-8 sm:rounded-t-4xl sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xl text-purple-600 sm:text-2xl">✦</span>
              <h2 className="text-2xl font-black text-purple-950 sm:text-3xl">
                Campanhas
              </h2>
            </div>

            <a
              href="#all-campaigns"
              className="text-sm font-extrabold text-purple-700 sm:text-base"
            >
              Ver todas as campanhas →
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {campaigns.map((campaign) => (
              <CardCampanha key={campaign.id} campaign={campaign} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3">
            {campaignFilters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-extrabold transition sm:px-5 sm:py-2.5 sm:text-sm ${
                  index === 0
                    ? "border-purple-700 bg-purple-700 text-white"
                    : "border-purple-100 bg-[#F8F3FF] text-purple-950 hover:bg-purple-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-950 p-5 text-white shadow-2xl shadow-purple-950/20 sm:gap-6 sm:rounded-3xl sm:p-8 md:grid-cols-3">
            {platformMetrics.map((metrica) => (
              <div key={metrica.label} className="flex items-center gap-4 sm:gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                  {metrica.icon}
                </span>

                <div>
                  <strong className="block text-2xl font-black sm:text-3xl">
                    {metrica.value}
                  </strong>
                  <span className="block font-extrabold">{metrica.label}</span>
                  <small className="text-white/70">{metrica.description}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-black text-purple-950 sm:text-3xl">
            Como funciona
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl bg-white p-4 sm:rounded-3xl sm:p-6"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEE4FF] text-2xl text-purple-700 sm:h-16 sm:w-16 sm:text-3xl">
                  {step.icon}
                </span>

                <h3 className="mt-4 font-black text-purple-950 sm:mt-5">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
