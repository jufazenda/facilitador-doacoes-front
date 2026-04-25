import Header from "../components/ui/Header";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#1E1538]">
      <Header />
      <main>{children}</main>
    </div>
  );
}
