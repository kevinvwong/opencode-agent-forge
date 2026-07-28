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
          background: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 1rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 2, opacity: 0.5 }}>⚙</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)" }}>
            Agent Forge
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
            opencode Manager
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
              padding: "0.45rem 1rem",
              color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
              textDecoration: "none",
              fontSize: "0.8125rem",
              borderLeft: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
              background: isActive ? "var(--color-accent-dim)" : "transparent",
              transition: "all 0.1s",
            })}
          >
            <span style={{ fontSize: "0.7rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", padding: "1rem", fontSize: "0.65rem", color: "var(--color-text-muted)", textAlign: "center" }}>
          Agent Forge v1
        </div>
      </nav>

      <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}
