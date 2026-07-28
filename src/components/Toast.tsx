import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type ToastType = "success" | "error" | "info"

interface ToastMessage {
  id: number
  text: string
  type: ToastType
}

interface ToastContextType {
  toast: (text: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((text: string, type: ToastType = "info") => {
    const id = nextId++
    setMessages((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 3500)
  }, [])

  const colorMap: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: "rgba(85,204,136,0.1)", border: "var(--color-success)", icon: "✓" },
    error: { bg: "rgba(255,85,85,0.1)", border: "var(--color-danger)", icon: "✕" },
    info: { bg: "rgba(85,153,255,0.1)", border: "var(--color-accent)", icon: "ℹ" },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none" }}>
        {messages.map((msg) => {
          const c = colorMap[msg.type]
          return (
            <div
              key={msg.id}
              style={{
                background: "var(--color-bg-elevated)",
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                padding: "0.45rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 4px 24px rgba(0,0,0,0.5)`,
                pointerEvents: "auto",
                animation: "slideIn 0.15s ease-out",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                color: "var(--color-text)",
                minWidth: 200,
                maxWidth: 360,
              }}
            >
              <span style={{ color: c.border, fontWeight: 700, fontSize: "0.7rem" }}>{c.icon}</span>
              <span>{msg.text}</span>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
