import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-page">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
