import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
