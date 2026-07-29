import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAgents, saveAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import { plan, type GodPlan } from "../utils/god.ts"
import { reviewAllAgents } from "../utils/review.ts"
import { computeCapabilities, CAPABILITY_KEYS, CAPABILITY_COLORS } from "../types/agent.ts"

type Phase = "input" | "planning" | "dispatched"
type Tab = "orchestrate" | "audit"
type AuditSort = "score" | "name" | "issues"

const STATUS_COLOR = (s: string) => s === "pass" ? "var(--color-success)" : s === "warn" ? "var(--color-warning)" : "var(--color-danger)"
const STATUS_ICON = (s: string) => s === "pass" ? "✓" : s === "warn" ? "!" : "✕"

const QUALITY_ITEMS = [
  { key: "task", label: "Task is fully addressed" },
  { key: "complete", label: "Output is complete" },
  { key: "accurate", label: "Technical accuracy verified" },
  { key: "examples", label: "Examples are tested" },
  { key: "style", label: "Follows project conventions" },
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
  const [auditSearch, setAuditSearch] = useState("")
  const [auditSort, setAuditSort] = useState<AuditSort>("score")

  const customAgents = useMemo(() => agents.filter((a) => !a.isTemplate && !a.disabled), [agents])
  const reviews = useMemo(() => {
    const all = reviewAllAgents(agents)
    const q = auditSearch.toLowerCase()
    const filtered = q ? all.filter((r) => r.agentName.toLowerCase().includes(q)) : all
    return filtered.sort((a, b) => {
      if (auditSort === "name") return a.agentName.localeCompare(b.agentName)
      if (auditSort === "issues") return b.issues - a.issues
      return a.score - b.score
    })
  }, [agents, auditSearch, auditSort])

  const avgScore = reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.score, 0) / reviews.length) : 0
  const totalIssues = reviews.reduce((s, r) => s + r.issues, 0)

  const handlePlan = () => {
    if (!task.trim()) { toast("Enter a task first", "error"); return }
    setPlanResult(plan(task, customAgents))
    setPhase("planning")
    setQualityCheck({})
  }

  const handleDispatch = async () => {
    if (!planResult) return
    const a = planResult.agent
    try {
      if (planResult.isNewlyCreated) {
        await saveAgent(a)
        toast(`Created: "${a.name}"`, "success")
      }
      await saveAgent({ ...a, sessionCount: a.sessionCount + 1, lastUsed: new Date().toISOString(), temperature: planResult.optimizations.temperature, steps: planResult.optimizations.steps })
      setPhase("dispatched")
      toast(`Dispatched to "${a.name}"`, "success")
      refresh()
    } catch (err) { toast(`Dispatch failed: ${err}`, "error") }
  }

  const handleCreateAndEdit = async () => {
    if (!planResult) return
    try {
      await saveAgent(planResult.agent)
      toast(`Created "${planResult.agent.name}" — opening editor`, "success")
      refresh()
      navigate(`/editor/${planResult.agent.id}`)
    } catch (err) { toast(`Failed: ${err}`, "error") }
  }

  const planCaps = planResult ? computeCapabilities(planResult.agent) : null
  const allPassed = QUALITY_ITEMS.every((q) => qualityCheck[q.key])

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>God Agent</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>Orchestrate · Optimize · Audit</p>
        </div>
        <div style={{ display: "flex", gap: 2, background: "var(--color-bg-hover)", borderRadius: 4, padding: 2 }}>
          {(["orchestrate", "audit"] as const).map((t) => (
            <button key={t} className={`tab${tab === t ? " active" : ""}`}
              style={{ padding: "0.3rem 0.75rem", fontSize: "0.7rem", borderBottom: "none", borderRadius: 3 }}
              onClick={() => setTab(t)}>
              {t === "audit" && totalIssues > 0 ? `Audit (${totalIssues})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === "orchestrate" && (
        <>
          {phase === "input" && (
            <>
              <div className="card" style={{ padding: "0.75rem", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Task Description</label>
                <textarea className="field" rows={3} value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g. Review the auth module for security vulnerabilities..."
                  style={{ marginBottom: 6, minHeight: 60 }} />
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button className="btn-primary" onClick={handlePlan} disabled={!task.trim()}>Analyze</button>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{customAgents.length} agents available</span>
                </div>
              </div>
              {customAgents.length > 0 && (
                <div className="card" style={{ padding: "0.5rem 0.75rem" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Roster</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {customAgents.map((a) => (
                      <span key={a.id} className="tag" style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/editor/${a.id}`)}>{a.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {planResult && phase === "planning" && (
            <div className="card" style={{ padding: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, background: "linear-gradient(135deg, #3366cc, #5599ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>G</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-mono)" }}>Plan · {planResult.taskType}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text)" }}>{planResult.task}</div>
                </div>
              </div>

              <div className="card" style={{ padding: "0.45rem 0.6rem", marginBottom: 6, background: "var(--color-bg-base)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)", flex: 1 }}>
                    {planResult.agent.name || "Unnamed"}
                    {planResult.isNewlyCreated && <span className="tag" style={{ marginLeft: 4, fontSize: "0.5rem", background: "rgba(51,204,100,0.15)", color: "var(--color-success)" }}>New</span>}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
                    {planResult.optimizations.model.split("/").pop()} · t{planResult.optimizations.temperature} · s{planResult.optimizations.steps}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, color: planResult.expectedQuality === "high" ? "var(--color-success)" : planResult.expectedQuality === "medium" ? "var(--color-warning)" : "var(--color-danger)" }}>
                    {planResult.expectedQuality.toUpperCase()}
                  </span>
                </div>
              </div>

              {planCaps && (
                <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                  {CAPABILITY_KEYS.map((k) => {
                    const val = planCaps[k]
                    return (
                      <div key={k} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: "0.45rem", color: CAPABILITY_COLORS[k], fontFamily: "var(--font-mono)" }}>{k.slice(0, 3).toUpperCase()}</div>
                        <div className="progress-track" style={{ height: 3 }}>
                          <div className="progress-fill" style={{ width: `${Math.round((val / 18) * 100)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)", padding: "0.3rem 0", borderTop: "1px solid var(--color-border)", marginBottom: 6 }}>{planResult.reasoning}</div>

              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-primary" onClick={handleDispatch}>{planResult.isNewlyCreated ? "Create & Dispatch" : "Dispatch"}</button>
                {planResult.isNewlyCreated && <button className="btn-secondary" onClick={handleCreateAndEdit}>Create & Edit</button>}
                <button className="btn-ghost" onClick={() => setPhase("input")}>Back</button>
              </div>
            </div>
          )}

          {phase === "dispatched" && planResult && (
            <>
            <div className="card" style={{ padding: "0.65rem 0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Route Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Task: </span>{planResult.task}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Agent: </span>@{planResult.agent.name || "Unnamed"}
                  <span style={{ color: "var(--color-text-muted)", marginLeft: 8 }}>→</span>
                  <span style={{ marginLeft: 8 }}>"{planResult.taskType} task"</span>
                  <span style={{ color: "var(--color-success)", marginLeft: 8 }}>✓ dispatched</span>
                </div>
                {planResult.isNewlyCreated && (
                  <div style={{ fontSize: "0.65rem", color: "var(--color-success)", fontFamily: "var(--font-mono)" }}>
                    + Created new agent: {planResult.agent.name}
                  </div>
                )}
              </div>
            </div>
            <div className="card" style={{ padding: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Quality Checklist</div>
              {QUALITY_ITEMS.map((q) => (
                <label key={q.key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "0.2rem 0", fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                  <input type="checkbox" checked={qualityCheck[q.key] ?? false}
                    onChange={(e) => setQualityCheck((p) => ({ ...p, [q.key]: e.target.checked }))}
                    style={{ accentColor: "var(--color-accent)" }} />
                  {q.label}
                </label>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: "0.7rem", color: allPassed ? "var(--color-success)" : "var(--color-text-muted)", fontFamily: allPassed ? "var(--font-mono)" : undefined }}>
                  {allPassed ? "✓ All checks passed" : "Check items to confirm quality"}
                </span>
                <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={() => { setPhase("input"); setTask(""); setPlanResult(null); setQualityCheck({}) }}>New Task</button>
              </div>
            </div>
            </>
          )}
        </>
      )}

      {tab === "audit" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: "0.75rem" }}>
            <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Average Score</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: avgScore >= 70 ? "var(--color-success)" : avgScore >= 40 ? "var(--color-warning)" : "var(--color-danger)" }}>{avgScore}%</div>
            </div>
            <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Audited</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>{reviews.length}</div>
            </div>
            <div className="card" style={{ padding: "0.5rem 0.65rem" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", marginBottom: 1 }}>Issues</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: totalIssues > 0 ? "var(--color-danger)" : "var(--color-success)" }}>{totalIssues}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: "0.5rem" }}>
            <input className="field" placeholder="Filter agents..." value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)} style={{ flex: 1, fontSize: "0.7rem" }} />
            <select className="field" value={auditSort} onChange={(e) => setAuditSort(e.target.value as AuditSort)}
              style={{ width: 120, fontSize: "0.7rem" }}>
              <option value="score">Score ↑</option>
              <option value="issues">Issues ↓</option>
              <option value="name">Name</option>
            </select>
          </div>

          {reviews.length === 0 ? (
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.75rem" }}>
                {auditSearch ? "No agents match filter" : "No agents to audit"}
              </p>
            </div>
          ) : reviews.map((review) => {
            const isExpanded = expandedReview === review.agentId
            return (
              <div key={review.agentId} className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", padding: "0.4rem 0.65rem", gap: 6, cursor: "pointer" }}
                  onClick={() => setExpandedReview(isExpanded ? null : review.agentId)}>
                  <div style={{ width: 4, height: 28, borderRadius: 2, flexShrink: 0,
                    background: review.score >= 70 ? "var(--color-success)" : review.score >= 40 ? "var(--color-warning)" : "var(--color-danger)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)" }}>{review.agentName}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
                      F:{review.overview.factual}% Qn:{review.overview.quantifiable}% Ql:{review.overview.qualifiable}%
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: review.score >= 70 ? "var(--color-success)" : review.score >= 40 ? "var(--color-warning)" : "var(--color-danger)" }}>
                      {review.score}%
                    </div>
                    <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)" }}>
                      {review.issues > 0 ? `${review.issues} issue${review.issues > 1 ? "s" : ""}` : "clean"}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--color-border)", padding: "0.45rem 0.65rem", background: "var(--color-bg-base)" }}>
                    {review.checks.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, padding: "2px 0", fontSize: "0.65rem" }}>
                        <span style={{ color: STATUS_COLOR(c.status), fontFamily: "var(--font-mono)", fontSize: "0.6rem", flexShrink: 0 }}>{STATUS_ICON(c.status)}</span>
                        <span style={{ color: "var(--color-text-secondary)" }}>{c.label}</span>
                        <span style={{ color: "var(--color-text-muted)", marginLeft: "auto", fontSize: "0.6rem", flexShrink: 0 }}>{c.detail}</span>
                      </div>
                    ))}
                    <button className="btn-secondary" style={{ fontSize: "0.6rem", padding: "0.2rem 0.5rem", marginTop: 4 }}
                      onClick={() => navigate(`/editor/${review.agentId}`)}>Edit</button>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
