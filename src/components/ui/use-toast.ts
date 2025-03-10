// src/components/ui/use-toast.ts
// Vereinfachte Version ohne Abhängigkeit von toast.tsx
import { useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props])
    // In einer echten Implementierung würden Sie hier einen Timer setzen, um den Toast zu entfernen
    console.log("Toast:", props)
  }

  return { toast, toasts }
}
