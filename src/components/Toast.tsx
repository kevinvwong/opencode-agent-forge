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
    success: { bg: "rgba(22,163,74,0.15)", border: "#16a34a", icon: "✓" },
    error: { bg: "rgba(220,38,38,0.15)", border: "#dc2626", icon: "✕" },
    info: { bg: "rgba(212,168,67,0.15)", border: "#d4a843", icon: "ℹ" },
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
                background: "#1a1a2e",
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: "0.5rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${c.border}30`,
                pointerEvents: "auto",
                animation: "slideIn 0.2s ease-out",
                fontSize: "0.85rem",
                color: "#e2dcc8",
                minWidth: 200,
                maxWidth: 360,
              }}
            >
              <span style={{ color: c.border, fontWeight: 700, fontSize: "0.8rem" }}>{c.icon}</span>
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
