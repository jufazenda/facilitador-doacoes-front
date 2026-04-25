import Header from "../components/ui/Header"

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-page">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
