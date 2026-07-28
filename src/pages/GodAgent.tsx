import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAgents, saveAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import { plan, type GodPlan } from "../utils/god.ts"
import { computeCapabilities, CAPABILITY_KEYS, CAPABILITY_COLORS } from "../types/agent.ts"

type Phase = "input" | "planning" | "dispatched"

export default function GodAgent() {
  const { agents, refresh } = useAgents()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [task, setTask] = useState("")
  const [phase, setPhase] = useState<Phase>("input")
  const [planResult, setPlanResult] = useState<GodPlan | null>(null)
  const [qualityCheck, setQualityCheck] = useState<Record<string, boolean>>({})
  const customAgents = useMemo(() => agents.filter((a) => !a.isTemplate && !a.disabled), [agents])

  const handlePlan = () => {
    if (!task.trim()) { toast("Enter a task first", "error"); return }
    const p = plan(task, customAgents)
    setPlanResult(p)
    setPhase("planning")
    setQualityCheck({})
  }

  const handleDispatch = async () => {
    if (!planResult) return
    const agent = planResult.agent
    try {
      if (planResult.isNewlyCreated) {
        await saveAgent(agent)
        toast(`Created new agent: "${agent.name}"`, "success")
      }
      await saveAgent({
        ...agent,
        sessionCount: agent.sessionCount + 1,
        lastUsed: new Date().toISOString(),
        temperature: planResult.optimizations.temperature,
        steps: planResult.optimizations.steps,
      })
      setPhase("dispatched")
      toast(`Dispatched to "${agent.name}"`, "success")
      refresh()
    } catch (err) {
      toast(`Dispatch failed: ${err}`, "error")
    }
  }

  const handleCreateAndEdit = () => {
    if (!planResult) return
    const agent = planResult.agent
    saveAgent(agent).then(() => {
      toast(`Created "${agent.name}" — opening editor`, "success")
      refresh()
      navigate(`/editor/${agent.id}`)
    })
  }

  const qualityItems = [
    { key: "task", label: "Task is fully addressed" },
    { key: "complete", label: "Output is complete and not truncated" },
    { key: "accurate", label: "Technical accuracy is verified" },
    { key: "examples", label: "Examples are correct and tested" },
    { key: "style", label: "Follows project conventions and style" },
  ]

  const allPassed = qualityItems.every((q) => qualityCheck[q.key])

  if (!planResult && phase === "input") {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
            God Agent
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>
            Orchestrator — selects, optimizes, or creates the ideal agent for any task.
          </p>
        </div>

        <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
            What needs to be done?
          </label>
          <textarea
            className="field"
            rows={4}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Review the auth module for security vulnerabilities, write tests for the new API endpoint, or design the user settings page..."
            style={{ marginBottom: 8, fontFamily: "var(--font-sans)", minHeight: 80 }}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="btn-primary" onClick={handlePlan} disabled={!task.trim()}>
              Analyze &amp; Plan
            </button>
            <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
              {customAgents.length} custom agents available
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: "0.75rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.35rem" }}>Available Agents</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {customAgents.length === 0 ? (
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No custom agents yet. Duplicate a template or create one.</span>
            ) : (
              customAgents.map((a) => (
                <span key={a.id} className="tag" style={{ cursor: "pointer", padding: "2px 6px" }}
                  onClick={() => navigate(`/editor/${a.id}`)}>
                  {a.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!planResult) return null

  const caps = computeCapabilities(planResult.agent)

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
          God Agent
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>
          {phase === "planning" ? "Orchestration Plan" : phase === "dispatched" ? "Dispatch Complete" : ""}
        </p>
      </div>

      <div className="card" style={{ padding: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 4,
            background: "linear-gradient(135deg, #3366cc, #5599ff)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0,
          }}>G</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Task Analysis
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text)" }}>{planResult.task}</div>
          </div>
          <span className="tag" style={{ fontSize: "0.6rem", background: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
            {planResult.taskType}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
            <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 2 }}>Selected Agent</div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)" }}>
              {planResult.agent.name || "Unnamed"}
              {planResult.isNewlyCreated && (
                <span className="tag" style={{ marginLeft: 6, background: "rgba(51,204,100,0.1)", color: "var(--color-success)" }}>New</span>
              )}
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
              {planResult.agent.description.slice(0, 80)}
            </div>
          </div>
          <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
            <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 2 }}>Expected Quality</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)",
              color: planResult.expectedQuality === "high" ? "var(--color-success)" : planResult.expectedQuality === "medium" ? "var(--color-warning)" : "var(--color-danger)" }}>
              {planResult.expectedQuality.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
              {planResult.agent.model.split("/").pop()} · {planResult.optimizations.steps} steps · temp {planResult.optimizations.temperature}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "0.5rem 0.65rem", marginBottom: 8 }}>
          <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Optimizations Applied</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: "0.7rem" }}>
            <div>
              <span style={{ color: "var(--color-text-muted)" }}>Temperature </span>
              <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{planResult.optimizations.temperature}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.6rem", display: "block" }}>
                {planResult.optimizations.temperature < 0.2 ? "Focused/deterministic" : planResult.optimizations.temperature > 0.4 ? "Creative" : "Balanced"}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--color-text-muted)" }}>Max Steps </span>
              <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{planResult.optimizations.steps}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.6rem", display: "block" }}>
                {planResult.optimizations.steps >= 12 ? "Complex/long task" : "Standard"}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--color-text-muted)" }}>Model </span>
              <span style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>{planResult.optimizations.model.split("/").pop()}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.6rem", display: "block" }}>
                {planResult.optimizations.model.includes("sonnet") ? "Best balance" : "Fast/light"}
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "0.5rem 0.65rem", marginBottom: 8 }}>
          <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Capability Profile</div>
          <div style={{ display: "flex", gap: 4 }}>
            {CAPABILITY_KEYS.map((k) => {
              const val = caps[k]
              const pct = Math.round((val / 18) * 100)
              return (
                <div key={k} style={{ flex: 1, textAlign: "center" }}
                  title={`${k}: ${val}/18`}>
                  <div style={{ fontSize: "0.5rem", color: CAPABILITY_COLORS[k], fontFamily: "var(--font-mono)", marginBottom: 2 }}>
                    {k.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="progress-track" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", padding: "0.35rem 0", borderTop: "1px solid var(--color-border)", marginBottom: 8 }}>
          <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>// </span>
          {planResult.reasoning}
        </div>

        {phase === "planning" && (
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary" onClick={handleDispatch}>
              {planResult.isNewlyCreated ? "Create & Dispatch" : "Dispatch"}
            </button>
            {planResult.isNewlyCreated && (
              <button className="btn-secondary" onClick={handleCreateAndEdit}>
                Create & Edit
              </button>
            )}
            <button className="btn-ghost" onClick={() => setPhase("input")}>Cancel</button>
          </div>
        )}
      </div>

      {phase === "dispatched" && (
        <div className="card" style={{ padding: "0.75rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
            Output Quality Checklist
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: "0.75rem" }}>
            {qualityItems.map((q) => (
              <label key={q.key} style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "0.25rem 0", fontSize: "0.75rem", color: "var(--color-text-secondary)",
              }}>
                <input
                  type="checkbox"
                  checked={qualityCheck[q.key] ?? false}
                  onChange={(e) => setQualityCheck((prev) => ({ ...prev, [q.key]: e.target.checked }))}
                  style={{ accentColor: "var(--color-accent)" }}
                />
                {q.label}
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {allPassed ? (
              <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontFamily: "var(--font-mono)", padding: "0.35rem 0" }}>
                ✓ All checks passed
              </span>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", padding: "0.35rem 0" }}>
                Complete checks to confirm quality
              </span>
            )}
            <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={() => { setPhase("input"); setTask(""); setPlanResult(null) }}>
              New Task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
