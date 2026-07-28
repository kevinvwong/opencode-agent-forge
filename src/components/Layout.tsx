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
          background: "linear-gradient(180deg, #1a1a2e 0%, #0c0a1a 100%)",
          borderRight: "1px solid #2a2a4e",
          padding: "1.25rem 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 1rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>⚔</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#d4a843", fontWeight: 600 }}>
            Agent Forge
          </div>
          <div style={{ fontSize: "0.7rem", color: "#6a6a8e", textTransform: "uppercase", letterSpacing: 1 }}>
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
              padding: "0.6rem 1rem",
              color: isActive ? "#d4a843" : "#8a8aae",
              textDecoration: "none",
              fontSize: "0.9rem",
              borderLeft: isActive ? "3px solid #d4a843" : "3px solid transparent",
              background: isActive ? "rgba(212, 168, 67, 0.08)" : "transparent",
              transition: "all 0.15s",
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", padding: "1rem", fontSize: "0.7rem", color: "#4a4a6e", textAlign: "center" }}>
          opencode Agent Forge
        </div>
      </nav>

      <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}
