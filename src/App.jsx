import { BrowserRouter, Routes, Route } from "react-router-dom"
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/campanha/:id" element={<MainLayout><CampaignDetail /></MainLayout>} />
        <Route path="/instituicao/:id" element={<MainLayout><InstitutionDetail /></MainLayout>} />
        <Route path="/doacao/:campanhaId" element={<MainLayout><Donation /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/cadastro/doador" element={<MainLayout><DonorRegistration /></MainLayout>} />
        <Route path="/cadastro/instituicao" element={<MainLayout><InstitutionRegistration /></MainLayout>} />
        <Route path="/area/doador" element={<MainLayout><DonorArea /></MainLayout>} />
        <Route path="/area/instituicao" element={<MainLayout><InstitutionArea /></MainLayout>} />
        <Route path="/area/admin" element={<MainLayout><AdminArea /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
