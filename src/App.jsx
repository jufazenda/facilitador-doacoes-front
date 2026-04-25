import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import MainLayout from "./layouts/MainLayout"

import Home from "./pages/Home"
import DetalhesCampanha from "./pages/DetalhesCampanha"
import InstituicaoDetalhe from "./pages/InstituicaoDetalhe"
import Doacao from "./pages/Doacao"
import Login from "./pages/Login"
import RegistroDoador from "./pages/RegistroDoador"
import InstituicaoCadastro from "./pages/InstituicaoCadastro"
import AreaDoador from "./pages/AreaDoador"
import AreaInstituicao from "./pages/AreaInstituicao"
import AreaAdmin from "./pages/AreaAdmin"

function ProtectedRoute({ children, tipo }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (tipo && user.tipo !== tipo) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/campanha/:id" element={<MainLayout><DetalhesCampanha /></MainLayout>} />
          <Route path="/instituicao/:id" element={<MainLayout><InstituicaoDetalhe /></MainLayout>} />
          <Route path="/doacao/:campanhaId" element={<MainLayout><Doacao /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/cadastro/doador" element={<MainLayout><RegistroDoador /></MainLayout>} />
          <Route path="/cadastro/instituicao" element={<MainLayout><InstituicaoCadastro /></MainLayout>} />
          <Route path="/area/doador" element={<MainLayout><ProtectedRoute tipo="doador"><AreaDoador /></ProtectedRoute></MainLayout>} />
          <Route path="/area/instituicao" element={<MainLayout><ProtectedRoute tipo="instituicao"><AreaInstituicao /></ProtectedRoute></MainLayout>} />
          <Route path="/area/admin" element={<MainLayout><ProtectedRoute tipo="admin"><AreaAdmin /></ProtectedRoute></MainLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}