import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAgents } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import { teach, type TeacherPlan } from "../utils/teacher.ts"

export default function Teacher() {
  const { agents } = useAgents()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [plan, setPlan] = useState<TeacherPlan | null>(null)

  const customAgents = useMemo(() => agents.filter((a) => !a.isTemplate), [agents])

  const handleTeach = (id: string) => {
    const agent = customAgents.find((a) => a.id === id)
    if (!agent) { toast("Agent not found", "error"); return }
    setPlan(teach(agent))
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Teacher</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>
          Find skills, optimize config, improve prompts — for any agent
        </p>
      </div>

      {!plan && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {customAgents.length === 0 ? (
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.75rem" }}>No agents to teach. Create agents first.</p>
            </div>
          ) : customAgents.map((a) => (
            <div key={a.id} className="card" style={{ padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              onClick={() => handleTeach(a.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)" }}>{a.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{a.description}</div>
              </div>
              <button className="btn-primary" style={{ fontSize: "0.7rem" }}>Teach</button>
            </div>
          ))}
        </div>
      )}

      {plan && (
        <div>
          <div className="card" style={{ padding: "0.65rem 0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-mono)" }}>Teacher Report</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>{plan.agentName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>Score</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                  {plan.baselineScore}% → {plan.projectedScore}%
                  <span style={{ color: "var(--color-success)", fontSize: "0.75rem" }}> (+{plan.projectedScore - plan.baselineScore})</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
              Lane: {plan.lane}
            </div>
          </div>

          {plan.recommendedSkills.length > 0 && (
            <div className="card" style={{ padding: "0.65rem 0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Skills to Install</div>
              {plan.recommendedSkills.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: "0.75rem" }}>
                  <span style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>◆ {s.name}</span>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.65rem" }}>{s.description}</span>
                </div>
              ))}
            </div>
          )}

          {plan.configChanges.length > 0 && (
            <div className="card" style={{ padding: "0.65rem 0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Config Optimizations</div>
              {plan.configChanges.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--color-text-secondary)", minWidth: 80 }}>{c.field}</span>
                  <span style={{ color: "var(--color-text-muted)" }}>{c.oldValue}</span>
                  <span style={{ color: "var(--color-text-muted)" }}>→</span>
                  <span style={{ color: "var(--color-success)" }}>{c.newValue}</span>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.6rem", marginLeft: "auto" }}>{c.reason}</span>
                </div>
              ))}
            </div>
          )}

          {plan.promptImprovements.length > 0 && (
            <div className="card" style={{ padding: "0.65rem 0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Prompt Improvements</div>
              {plan.promptImprovements.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "2px 0", fontSize: "0.7rem" }}>
                  <span style={{ color: "var(--color-warning)" }}>→</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-secondary" onClick={() => navigate(`/editor/${plan.agentId}`)}>Edit Agent</button>
            <button className="btn-ghost" onClick={() => setPlan(null)}>Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
