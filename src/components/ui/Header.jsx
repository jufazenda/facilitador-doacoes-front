export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a
          href="#home"
          className="flex items-center gap-3 text-2xl font-extrabold text-purple-800"
        >
          <span className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-2xl border-2 border-purple-700 text-xl text-[#FF5C5C]">
            ♡
          </span>
          Elo Solidário
        </a>

        <nav className="hidden items-center gap-10 font-semibold text-purple-950 md:flex">
          <a href="#campaigns" className="transition hover:text-purple-600">
            Campanhas
          </a>
          <a href="#institutions" className="transition hover:text-purple-600">
            Instituições
          </a>
          <a href="#how-it-works" className="transition hover:text-purple-600">
            Como funciona?
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="#login"
            className="hidden font-semibold text-purple-950 sm:block"
          >
            Login
          </a>

          <a
            href="#campaigns"
            className="rounded-2xl bg-[#FF5C5C] px-5 py-3 font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5"
          >
            Doe agora ♡
          </a>
        </div>
      </div>
    </header>
  );
}
