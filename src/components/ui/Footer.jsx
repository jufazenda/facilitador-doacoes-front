export default function Footer() {
  return (
    <footer className="border-t border-purple-100 bg-white py-10 sm:py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 sm:gap-10 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-black text-purple-800 sm:text-2xl">Elo Solidário</h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Conectamos doadores com instituições que transformam o mundo.
          </p>
        </div>

        <div>
          <h3 className="font-black text-purple-950">Navegue</h3>

          <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-500">
            <a href="#campaigns">Campanhas</a>
            <a href="#institutions">Instituições</a>
            <a href="#how-it-works">Como funciona?</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>

        <div>
          <h3 className="font-black text-purple-950">Institucional</h3>

          <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-500">
            <a href="#about">Sobre nós</a>
            <a href="#transparency">Transparência</a>
            <a href="#terms">Termos de uso</a>
            <a href="#privacy">Política de privacidade</a>
          </div>
        </div>

        <div>
          <h3 className="font-black text-purple-950">Contato</h3>

          <div className="mt-4 space-y-2 text-sm font-semibold text-slate-500">
            <p>contato@elosolidario.org</p>
            <p>+55 11 4002-8922</p>
            <p>Seg a Sex, 9h às 18h</p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#EEE4FF] p-4 sm:col-span-2 sm:rounded-3xl sm:p-6 lg:col-span-1">
          <h3 className="font-black text-purple-950">Inscreva-se</h3>

          <p className="mt-2 text-sm text-slate-600">
            Inscreva-se no nosso blog e acompanhe histórias!
          </p>

          <form className="mt-4 space-y-2 sm:space-y-3">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="w-full rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-600"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white"
            >
              Inscreva-se
            </button>
          </form>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-400 sm:mt-10">
        © 2024 Elo Solidário. Todos os direitos reservados.
      </p>
    </footer>
  );
}
