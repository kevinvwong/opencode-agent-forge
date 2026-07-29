import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAgents, saveAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import { plan, type GodPlan } from "../utils/god.ts"
import { reviewAllAgents } from "../utils/review.ts"
import { computeCapabilities, CAPABILITY_KEYS, CAPABILITY_COLORS } from "../types/agent.ts"

type Phase = "input" | "planning" | "dispatched"
type Tab = "orchestrate" | "audit"

const STATUS_COLOR = (s: string) => s === "pass" ? "var(--color-success)" : s === "warn" ? "var(--color-warning)" : "var(--color-danger)"
const STATUS_ICON = (s: string) => s === "pass" ? "✓" : s === "warn" ? "!" : "✕"

const QUALITY_ITEMS = [
  { key: "task", label: "Task is fully addressed" },
  { key: "complete", label: "Output is complete and not truncated" },
  { key: "accurate", label: "Technical accuracy is verified" },
  { key: "examples", label: "Examples are correct and tested" },
  { key: "style", label: "Follows project conventions and style" },
]

export default function GodAgent() {
  const { agents, refresh } = useAgents()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>("orchestrate")
  const [task, setTask] = useState("")
  const [phase, setPhase] = useState<Phase>("input")
  const [planResult, setPlanResult] = useState<GodPlan | null>(null)
  const [qualityCheck, setQualityCheck] = useState<Record<string, boolean>>({})
  const [expandedReview, setExpandedReview] = useState<string | null>(null)

  const customAgents = useMemo(() => agents.filter((a) => !a.isTemplate && !a.disabled), [agents])
  const reviews = useMemo(() => reviewAllAgents(agents), [agents])

  const avgScore = reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.score, 0) / reviews.length) : 0
  const totalIssues = reviews.reduce((s, r) => s + r.issues, 0)

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

  const handleCreateAndEdit = async () => {
    if (!planResult) return
    try {
      await saveAgent(planResult.agent)
      toast(`Created "${planResult.agent.name}" — opening editor`, "success")
      refresh()
      navigate(`/editor/${planResult.agent.id}`)
    } catch (err) {
      toast(`Failed to create agent: ${err}`, "error")
    }
  }

  const planCaps = planResult ? computeCapabilities(planResult.agent) : null
  const allPassed = QUALITY_ITEMS.every((q) => qualityCheck[q.key])



  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
            God Agent
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>
            Orchestrate · Optimize · Audit
          </p>
        </div>
        <div style={{ display: "flex", gap: 2, background: "var(--color-bg-hover)", borderRadius: 4, padding: 2 }}>
          <button className={`tab${tab === "orchestrate" ? " active" : ""}`}
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.7rem", borderBottom: "none", borderRadius: 3 }}
            onClick={() => setTab("orchestrate")}>Orchestrate</button>
          <button className={`tab${tab === "audit" ? " active" : ""}`}
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.7rem", borderBottom: "none", borderRadius: 3 }}
            onClick={() => setTab("audit")}>Audit{totalIssues > 0 ? ` (${totalIssues})` : ""}</button>
        </div>
      </div>

      {tab === "orchestrate" && (
        <>
          {phase === "input" && (
            <>
              <div className="card" style={{ padding: "0.75rem", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
                  What needs to be done?
                </label>
                <textarea className="field" rows={3} value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g. Review the auth module for security vulnerabilities..."
                  style={{ marginBottom: 6, fontFamily: "var(--font-sans)", minHeight: 60 }} />
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button className="btn-primary" onClick={handlePlan} disabled={!task.trim()}>Analyze &amp; Plan</button>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{customAgents.length} agents available</span>
                </div>
              </div>
              <div className="card" style={{ padding: "0.6rem 0.75rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Available Agents</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {customAgents.length === 0 ? (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>No custom agents yet.</span>
                  ) : customAgents.map((a) => (
                    <span key={a.id} className="tag" style={{ cursor: "pointer", padding: "2px 6px", fontSize: "0.65rem" }}
                      onClick={() => navigate(`/editor/${a.id}`)}>{a.name}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {planResult && phase === "planning" && (
            <div className="card" style={{ padding: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, background: "linear-gradient(135deg, #3366cc, #5599ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0 }}>G</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 0.5 }}>Task Analysis</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text)" }}>{planResult.task}</div>
                </div>
                <span className="tag" style={{ fontSize: "0.55rem", background: "var(--color-accent-dim)", color: "var(--color-accent)" }}>{planResult.taskType}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                <div className="card" style={{ padding: "0.45rem 0.6rem" }}>
                  <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Agent</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)" }}>
                    {planResult.agent.name || "Unnamed"}
                    {planResult.isNewlyCreated && <span className="tag" style={{ marginLeft: 4, background: "rgba(51,204,100,0.1)", color: "var(--color-success)", fontSize: "0.5rem" }}>NEW</span>}
                  </div>
                </div>
                <div className="card" style={{ padding: "0.45rem 0.6rem" }}>
                  <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Quality</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-mono)",
                    color: planResult.expectedQuality === "high" ? "var(--color-success)" : planResult.expectedQuality === "medium" ? "var(--color-warning)" : "var(--color-danger)" }}>
                    {planResult.expectedQuality.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: "0.45rem 0.6rem", marginBottom: 6 }}>
                <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 3 }}>Optimizations</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, fontSize: "0.65rem" }}>
                  <div><span style={{ color: "var(--color-text-muted)" }}>temp </span><span style={{ fontFamily: "var(--font-mono)" }}>{planResult.optimizations.temperature}</span></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>steps </span><span style={{ fontFamily: "var(--font-mono)" }}>{planResult.optimizations.steps}</span></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>model </span><span style={{ fontFamily: "var(--font-mono)" }}>{planResult.optimizations.model.split("/").pop()}</span></div>
                </div>
              </div>

              <div className="card" style={{ padding: "0.45rem 0.6rem", marginBottom: 6 }}>
                <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 3 }}>Capabilities</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {CAPABILITY_KEYS.map((k) => {
                    const val = planCaps![k]
                    const pct = Math.round((val / 18) * 100)
                    return (
                      <div key={k} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: "0.45rem", color: CAPABILITY_COLORS[k], fontFamily: "var(--font-mono)" }}>{k.slice(0, 3).toUpperCase()}</div>
                        <div className="progress-track" style={{ height: 3 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)", padding: "0.3rem 0", borderTop: "1px solid var(--color-border)", marginBottom: 6 }}>
                {planResult.reasoning}
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-primary" onClick={handleDispatch}>
                  {planResult.isNewlyCreated ? "Create & Dispatch" : "Dispatch"}
                </button>
                {planResult.isNewlyCreated && (
                  <button className="btn-secondary" onClick={handleCreateAndEdit}>Create & Edit</button>
                )}
                <button className="btn-ghost" onClick={() => setPhase("input")}>Back</button>
              </div>
            </div>
          )}

          {phase === "dispatched" && (
            <div className="card" style={{ padding: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Output Quality Checklist</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: "0.75rem" }}>
                {QUALITY_ITEMS.map((q) => (
                  <label key={q.key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "0.2rem 0", fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                    <input type="checkbox" checked={qualityCheck[q.key] ?? false}
                      onChange={(e) => setQualityCheck((p) => ({ ...p, [q.key]: e.target.checked }))}
                      style={{ accentColor: "var(--color-accent)" }} />
                    {q.label}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {allPassed ? <span style={{ fontSize: "0.7rem", color: "var(--color-success)", fontFamily: "var(--font-mono)" }}>✓ All checks passed</span>
                  : <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Complete checks to confirm quality</span>}
                <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={() => { setPhase("input"); setTask(""); setPlanResult(null); setQualityCheck({}) }}>New Task</button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "audit" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: "0.75rem" }}>
            <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Average Score</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: avgScore >= 70 ? "var(--color-success)" : avgScore >= 40 ? "var(--color-warning)" : "var(--color-danger)" }}>
                {avgScore}%
              </div>
            </div>
            <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Agents Audited</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>{reviews.length}</div>
            </div>
            <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Total Issues</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: totalIssues > 0 ? "var(--color-danger)" : "var(--color-success)" }}>{totalIssues}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {reviews.length === 0 ? (
              <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.75rem" }}>No agents to audit. Create or import agents first.</p>
              </div>
            ) : reviews.map((review) => {
              const isExpanded = expandedReview === review.agentId
              return (
                <div key={review.agentId} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "0.45rem 0.65rem", gap: 8, cursor: "pointer" }}
                    onClick={() => setExpandedReview(isExpanded ? null : review.agentId)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)" }}>{review.agentName}</div>
                      <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                        F:{review.overview.factual}% Qn:{review.overview.quantifiable}% Ql:{review.overview.qualifiable}%
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-mono)",
                        color: review.score >= 70 ? "var(--color-success)" : review.score >= 40 ? "var(--color-warning)" : "var(--color-danger)" }}>
                        {review.score}%
                      </div>
                      <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)" }}>
                        {review.issues > 0 ? `${review.issues} issue${review.issues > 1 ? "s" : ""}` : "clean"}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--color-border)", padding: "0.5rem 0.65rem", background: "var(--color-bg-base)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {review.checks.map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: "0.7rem" }}>
                            <span style={{ color: STATUS_COLOR(c.status), fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
                              {STATUS_ICON(c.status)}
                            </span>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: "var(--color-text-secondary)" }}>{c.label}</span>
                              <span style={{ color: "var(--color-text-muted)", marginLeft: 4, fontSize: "0.6rem" }}>{c.detail}</span>
                            </div>
                            <span style={{ fontSize: "0.5rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", flexShrink: 0 }}>
                              {c.category.slice(0, 4)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                        <button className="btn-secondary" style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem" }}
                          onClick={() => navigate(`/editor/${review.agentId}`)}>Edit</button>
                      </div>
            </div>
          )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
