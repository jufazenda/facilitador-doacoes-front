import heroImage from "../../assets/hero.png";

export default function CampaignCard({ campaign }) {
  const isUrgent = campaign.badgeType === "urgent";

  return (
    <article className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-950/5">
      <div className="relative h-48 overflow-hidden">
        <img
          src={heroImage}
          alt={campaign.title}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold ${
            isUrgent ? "bg-[#FF5C5C] text-white" : "bg-green-100 text-green-700"
          }`}
        >
          {campaign.badge}
        </span>

        <button
          type="button"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-xl text-white backdrop-blur-md"
          aria-label={`Save campaign ${campaign.title}`}
        >
          ♡
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-extrabold text-purple-950">
          {campaign.title}
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {campaign.institution}
          <span
            className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-xs text-white"
            aria-label="Verified institution"
          >
            ✓
          </span>
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-purple-100">
          <div
            className="h-full rounded-full bg-purple-700"
            style={{ width: `${campaign.percentage}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between gap-4 text-sm font-bold text-purple-950">
          <span>{campaign.raised} raised</span>
          <span className="text-slate-500">{campaign.goal} goal</span>
        </div>

        <div className="mt-1 flex justify-between gap-4 text-sm">
          <span className="font-extrabold text-green-600">
            {campaign.percentage}% funded
          </span>
          <span className="text-slate-500">{campaign.daysLeft}</span>
        </div>

        <a
          href={`#campaign-${campaign.id}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-700 px-4 py-3 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-purple-800"
        >
          ♡ Donate
        </a>
      </div>
    </article>
  );
}
