import { useState } from "react"
import Toast from "../components/ui/Toast"

export function useToast() {
  const [toast, setToast] = useState(null)

  function showToast(type, msg) {
    setToast({ type, msg, key: Date.now() })
  }

  function ToastContainer() {
    if (!toast) return null
    return <Toast key={toast.key} type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />
  }

  return { showToast, ToastContainer }
}
