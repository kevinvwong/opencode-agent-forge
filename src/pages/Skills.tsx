import { useNavigate } from "react-router-dom"
import { useAgents } from "../db/hooks.ts"
import { getAvailableSkills } from "../utils/skills.ts"

export default function Skills() {
  const { agents } = useAgents()
  const navigate = useNavigate()
  const skills = getAvailableSkills()

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Skills</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>
          {skills.length} skills available · Agents can be assigned multiple skills
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {skills.map((skill) => {
          const assigned = agents.filter((a) => a.skills?.includes(skill.name))
          return (
            <div key={skill.name} className="card" style={{ padding: "0.65rem 0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
                  ◆ {skill.name}
                </span>
                <span className="tag">{assigned.length} agent{assigned.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: 6 }}>
                {skill.description}
              </div>
              <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                {skill.path}
              </div>
              {assigned.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {assigned.map((a) => (
                    <span key={a.id} className="tag" style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/editor/${a.id}`)}>
                      {a.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
