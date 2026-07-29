import { NavLink } from "react-router-dom"

const nav = [
  { to: "/", label: "Dashboard", icon: "◈" },
  { to: "/god", label: "God Agent", icon: "▣" },
  { to: "/teacher", label: "Teacher", icon: "◆" },
  { to: "/router", label: "Router", icon: "⇶" },
  { to: "/skills", label: "Skills", icon: "◈" },
  { to: "/library", label: "Library", icon: "◉" },
  { to: "/editor/new", label: "New Agent", icon: "✦" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 180,
          background: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "0.75rem 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 0.85rem 1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.25rem", marginBottom: 1, opacity: 0.45 }}>⚙</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)" }}>
            Agent Forge
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
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
              padding: "0.35rem 0.85rem",
              color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
              textDecoration: "none",
              fontSize: "0.75rem",
              borderLeft: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
              background: isActive ? "var(--color-accent-dim)" : "transparent",
              transition: "all 0.1s",
            })}
          >
            <span style={{ fontSize: "0.65rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", padding: "0.75rem", fontSize: "0.6rem", color: "var(--color-text-muted)", textAlign: "center" }}>
          Agent Forge v1
        </div>
      </nav>

      <main style={{ flex: 1, padding: "1rem 1.5rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}
