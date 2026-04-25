import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"

import Home from "./pages/Home"
import CampanhaDetalhe from "./pages/CampanhaDetalhe"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/campanha/:id" element={<MainLayout><CampanhaDetalhe /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  )
}