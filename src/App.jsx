import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import MainLayout from "./layouts/MainLayout"

import Home from "./pages/Home"
import CampaignDetail from "./pages/CampaignDetail"
import InstitutionDetail from "./pages/InstitutionDetail"
import Donation from "./pages/Donation"
import Login from "./pages/Login"
import DonorRegistration from "./pages/DonorRegistration"
import InstitutionRegistration from "./pages/InstitutionRegistration"
import DonorArea from "./pages/DonorArea"
import InstitutionArea from "./pages/InstitutionArea"
import AdminArea from "./pages/AdminArea"

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
          <Route path="/campanha/:id" element={<MainLayout><CampaignDetail /></MainLayout>} />
          <Route path="/instituicao/:id" element={<MainLayout><InstitutionDetail /></MainLayout>} />
          <Route path="/doacao/:campanhaId" element={<MainLayout><Donation /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/cadastro/doador" element={<MainLayout><DonorRegistration /></MainLayout>} />
          <Route path="/cadastro/instituicao" element={<MainLayout><InstitutionRegistration /></MainLayout>} />
          <Route path="/area/doador" element={<MainLayout><ProtectedRoute tipo="doador"><DonorArea /></ProtectedRoute></MainLayout>} />
          <Route path="/area/instituicao" element={<MainLayout><ProtectedRoute tipo="instituicao"><InstitutionArea /></ProtectedRoute></MainLayout>} />
          <Route path="/area/admin" element={<MainLayout><ProtectedRoute tipo="admin"><AdminArea /></ProtectedRoute></MainLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
