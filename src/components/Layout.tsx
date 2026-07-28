import { NavLink } from "react-router-dom"

const nav = [
  { to: "/", label: "Dashboard", icon: "◈" },
  { to: "/library", label: "Library", icon: "◉" },
  { to: "/editor/new", label: "New Agent", icon: "✦" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 200,
          background: "linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-surface) 100%)",
          borderRight: "1px solid var(--color-border)",
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 1rem 1.25rem", textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 2,
          }}>
            System
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: 1,
          }}>
            AGENT FORGE
          </div>
          <div style={{
            fontSize: "0.55rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: 2,
          }}>
            v1.0 · <span className="status-dot on" style={{ verticalAlign: "middle" }} /> online
          </div>
        </div>

        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.5rem 1rem",
              color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
              textDecoration: "none",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              borderLeft: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
              background: isActive ? "var(--color-accent-dim)" : "transparent",
              transition: "all 0.1s",
              letterSpacing: 0.5,
            })}
          >
            <span style={{ fontSize: "0.65rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", padding: "1rem", textAlign: "center" }}>
          <div style={{
            fontSize: "0.55rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}>
            [opencode interface]
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}
