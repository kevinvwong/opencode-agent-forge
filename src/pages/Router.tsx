import { useState, useMemo } from "react"
import { useAgents, saveAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import { rankAgents, type RoutingScore } from "../utils/router.ts"
import { MODE_COLORS, CAPABILITY_COLORS, computeCapabilities, CAPABILITY_KEYS, capModifier } from "../types/agent.ts"

export default function Router() {
  const { agents, refresh } = useAgents()
  const { toast } = useToast()
  const [task, setTask] = useState("")
  const [results, setResults] = useState<RoutingScore[]>([])
  const [ran, setRan] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeAgents = useMemo(() => agents.filter((a) => !a.disabled), [agents])

  const handleRoute = async () => {
    if (!task.trim()) {
      toast("Enter a task description first", "error")
      return
    }
    const scored = rankAgents(task, activeAgents)
    setResults(scored)
    setRan(true)
    setExpanded(null)
    if (scored.length > 0) {
      setSelectedId(scored[0]?.agent.id ?? null)
    }
  }

  const handleDispatch = async () => {
    if (!selectedId) {
      toast("Select an agent to dispatch", "error")
      return
    }
    const agent = activeAgents.find((a) => a.id === selectedId)
    if (!agent) return
    await saveAgent({ ...agent, sessionCount: agent.sessionCount + 1, lastUsed: new Date().toISOString() })
    toast(`Dispatched to "${agent.name || "Unnamed"}"`, "success")
    refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRoute()
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
          Agent Router
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "2px 0 0" }}>
          Describe a task — the system finds the best agent. Recommendations improve with use.
        </p>
      </div>

      <div className="card" style={{ padding: "0.75rem", marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Task Description
        </label>
        <textarea
          className="field"
          rows={3}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Review this PR for security vulnerabilities, then write API docs for the new endpoint..."
          style={{ marginBottom: 8, fontFamily: "var(--font-sans)", minHeight: 60 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn-primary" onClick={handleRoute} disabled={!task.trim()}>
            Route
          </button>
          {ran && results.length > 0 && (
            <button className="btn-secondary" onClick={handleDispatch} disabled={!selectedId}>
              Dispatch to Selected
            </button>
          )}
          <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", alignSelf: "center", marginLeft: "auto" }}>
            {activeAgents.length} agent{activeAgents.length !== 1 ? "s" : ""} available · Ctrl+Enter to route
          </span>
        </div>
      </div>

      {ran && results.length === 0 && (
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>No matching agents found. Try a different description.</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.35rem" }}>
            Recommendations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {results.map((r, idx) => {
              const agent = r.agent
              const modeColor = MODE_COLORS[agent.mode]
              const caps = computeCapabilities(agent)
              const isSelected = selectedId === agent.id
              const isExpanded = expanded === agent.id
              const pct = (r.score * 100).toFixed(1)

              return (
                <div
                  key={agent.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    borderColor: isSelected ? "var(--color-accent)" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedId(isSelected ? null : agent.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.65rem", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: modeColor, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
                    }}>
                      #{idx + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-text)" }}>
                          {agent.name || "Unnamed"}
                        </span>
                        <span className="mode-badge" style={{ color: modeColor, border: `1px solid ${modeColor}40`, fontSize: "0.55rem" }}>
                          {agent.mode}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {agent.description}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
                        {pct}%
                      </div>
                      <div style={{ display: "flex", gap: 6, fontSize: "0.5rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                        <span title="Tag match">T:{r.breakdown.tagMatch}</span>
                        <span title="Description match">D:{r.breakdown.descriptionMatch}</span>
                        <span title="Capability fit">C:{r.breakdown.capabilityFit}</span>
                      </div>
                    </div>

                    <button
                      className="btn-ghost"
                      style={{ padding: "2px 6px", fontSize: "0.65rem" }}
                      onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : agent.id) }}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "0.5rem 0.65rem", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-base)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 2 }}>Match Breakdown</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                            Tag: {r.breakdown.tagMatch} · Desc: {r.breakdown.descriptionMatch} · Cap: {r.breakdown.capabilityFit} · Recency: {r.breakdown.usageBonus}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 2 }}>Agent Info</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Tags: {agent.tags.join(", ") || "none"} · {agent.sessionCount} session{agent.sessionCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginBottom: 3 }}>Capabilities</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {CAPABILITY_KEYS.map((k) => {
                          const val = caps[k]
                          const pctBar = Math.round((val / 18) * 100)
                          return (
                            <div key={k} style={{ flex: 1 }} title={`${k}: ${val}/18 (${capModifier(val) >= 0 ? "+" : ""}${capModifier(val)})`}>
                              <div style={{ fontSize: "0.5rem", color: CAPABILITY_COLORS[k], fontFamily: "var(--font-mono)", textAlign: "center" }}>
                                {k.slice(0, 3).toUpperCase()}
                              </div>
                              <div className="progress-track" style={{ height: 4 }}>
                                <div className="progress-fill" style={{ width: `${pctBar}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
