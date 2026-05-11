import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import MainLayout from "./layouts/MainLayout"

import Home from "./pages/Home"
import CampaignDetail from "./pages/CampaignDetail"
import Campaigns from "./pages/Campaigns"
import InstitutionDetail from "./pages/InstitutionDetail"
import InstitutionList from "./pages/InstitutionList"
import Donation from "./pages/Donation"
import Login from "./pages/Login"
import CompleteRegistration from "./pages/CompleteRegistration"
import DonorArea from "./pages/DonorArea"
import InstitutionArea from "./pages/InstitutionArea"
import AdminArea from "./pages/AdminArea"
import AboutUs from "./pages/AboutUs"

function ProtectedRoute({ children, tipo }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (tipo && user.tipo !== tipo) return <Navigate to="/" replace />
  return children
}

// Redireciona usuários autenticados sem role para completar o cadastro
function NewUserRedirect() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading || !user) return null
  if (user.tipo === null && location.pathname !== "/completar-cadastro") {
    return <Navigate to="/completar-cadastro" replace />
  }
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NewUserRedirect />
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/campanha/:id" element={<MainLayout><CampaignDetail /></MainLayout>} />
          <Route path="/campanhas" element={<MainLayout><Campaigns /></MainLayout>} />
          <Route path="/instituicoes" element={<MainLayout><InstitutionList /></MainLayout>} />
          <Route path="/instituicao/:id" element={<MainLayout><InstitutionDetail /></MainLayout>} />
          <Route path="/doacao/:campanhaId" element={<MainLayout><Donation /></MainLayout>} />
          <Route path="/sobre-nos" element={<MainLayout><AboutUs /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/completar-cadastro" element={<MainLayout><CompleteRegistration /></MainLayout>} />
          <Route path="/area/doador" element={<MainLayout><ProtectedRoute tipo="doador"><DonorArea /></ProtectedRoute></MainLayout>} />
          <Route path="/area/instituicao" element={<MainLayout><ProtectedRoute tipo="instituicao"><InstitutionArea /></ProtectedRoute></MainLayout>} />
          <Route path="/area/admin" element={<MainLayout><ProtectedRoute tipo="admin"><AdminArea /></ProtectedRoute></MainLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
