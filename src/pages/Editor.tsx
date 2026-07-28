import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Agent, AgentPermissions, DnDStats } from "../types/agent.ts"
import { generateId, rollStats, MODE_CLASS_MAP } from "../types/agent.ts"
import { useAgent, saveAgent } from "../db/hooks.ts"
import { downloadAgentFile } from "../utils/export.ts"
import StatBlock from "../components/StatBlock.tsx"
import PermissionsPanel from "../components/PermissionsPanel.tsx"
import SkillProficiencies from "../components/SkillProficiencies.tsx"

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agent: existing, loading } = useAgent(id)
  const isNew = id === "new" || !id

  const [agent, setAgent] = useState<Agent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("character")
  const [showRoll, setShowRoll] = useState(false)

  useEffect(() => {
    if (isNew) {
      setAgent({
        id: generateId(),
        name: "",
        description: "",
        mode: "subagent",
        model: "anthropic/claude-sonnet-4-6",
        prompt: "",
        temperature: null,
        topP: null,
        steps: null,
        hidden: false,
        disabled: false,
        color: null,
        permissions: {},
        mcpServers: {},
        plugins: [],
        commands: {},
        tags: [],
        dndStats: rollStats(),
        dndClass: "Wizard",
        dndLevel: 1,
        dndRace: "Human",
        dndAlignment: "Neutral Good",
        dndBackground: "Sage",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sessionCount: 0,
        tokenCount: 0,
        lastUsed: null,
        isTemplate: false,
      })
    } else if (existing) {
      setAgent({ ...existing })
    }
  }, [existing, isNew, id])

  const update = <K extends keyof Agent>(key: K, value: Agent[K]) => {
    if (!agent) return
    setAgent({ ...agent, [key]: value })
    setSaved(false)
  }

  const handleSave = async () => {
    if (!agent) return
    setSaving(true)
    try {
      await saveAgent(agent)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (isNew) navigate(`/editor/${agent.id}`, { replace: true })
    } catch (err) {
      console.error("Failed to save agent:", err)
    }
    setSaving(false)
  }

  const handleRollStats = () => {
    setShowRoll(true)
    setTimeout(() => {
      if (agent) {
        setAgent({ ...agent, dndStats: rollStats() })
      }
      setShowRoll(false)
    }, 600)
  }

  if (loading || !agent) {
    return <div style={{ color: "#8a8aae", textAlign: "center", paddingTop: "4rem" }}>Loading character sheet...</div>
  }

  const tabs = [
    { id: "character", label: "Character" },
    { id: "permissions", label: "Permissions" },
    { id: "prompt", label: "Prompt" },
    { id: "advanced", label: "Advanced" },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 700, color: "#e2dcc8", margin: 0 }}>
            {isNew ? "Create Agent" : `Edit: ${agent.name || "Unnamed"}`}
          </h1>
          <p style={{ color: "#8a8aae", fontSize: "0.8rem", margin: "4px 0 0" }}>
            {MODE_CLASS_MAP[agent.mode]} · Level {agent.dndLevel} · {agent.dndRace}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => navigate("/library")}>
            Cancel
          </button>
          {!isNew && (
            <button className="btn-ghost" onClick={() => downloadAgentFile(agent)}>
              Export .md
            </button>
          )}
          <button className="btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem", borderBottom: "1px solid #2a2a4e" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: "none",
              border: "none",
              padding: "0.5rem 1rem",
              color: activeTab === t.id ? "#d4a843" : "#6a6a8e",
              borderBottom: activeTab === t.id ? "2px solid #d4a843" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "var(--font-serif)",
              fontSize: "0.9rem",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "character" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1rem" }}>
          <div>
            <div className="sheet-panel" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: 0 }}>
                  Ability Scores
                </h3>
                <button
                  onClick={handleRollStats}
                  className="btn-ghost"
                  style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                  title="Roll 4d6 drop lowest"
                >
                  {showRoll ? <span className="dice-icon">🎲</span> : "Roll"}
                </button>
              </div>
              <StatBlock
                stats={agent.dndStats}
                editable
                onChange={(s: DnDStats) => update("dndStats", s)}
              />
            </div>

            <div className="sheet-panel">
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 8px" }}>
                Skill Proficiencies
              </h3>
              <SkillProficiencies permissions={agent.permissions} />
            </div>
          </div>

          <div>
            <div className="sheet-panel" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Agent Name *
                  </label>
                  <input
                    className="input-field"
                    value={agent.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="my-reviewer"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Model
                  </label>
                  <select
                    className="input-field"
                    value={agent.model}
                    onChange={(e) => update("model", e.target.value)}
                  >
                    <option value="anthropic/claude-sonnet-4-6">Claude Sonnet 4</option>
                    <option value="anthropic/claude-haiku-4-20250514">Claude Haiku 4</option>
                    <option value="openai/gpt-5">GPT-5</option>
                    <option value="openai/gpt-5-codex">GPT-5 Codex</option>
                    <option value="opencode/gpt-5.1-codex">OpenCode GPT-5.1 Codex</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Class (Mode)
                  </label>
                  <select
                    className="input-field"
                    value={agent.mode}
                    onChange={(e) => update("mode", e.target.value as Agent["mode"])}
                  >
                    <option value="primary">Fighter (Primary)</option>
                    <option value="subagent">Wizard (Subagent)</option>
                    <option value="all">Bard (All)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Level
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min={1}
                    max={20}
                    value={agent.dndLevel}
                    onChange={(e) => update("dndLevel", Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Race
                  </label>
                  <select
                    className="input-field"
                    value={agent.dndRace}
                    onChange={(e) => update("dndRace", e.target.value)}
                  >
                    {["Human", "Elf", "Dwarf", "Halfling", "Gnome", "Tiefling", "Dragonborn", "Half-Orc", "Aasimar"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Alignment
                  </label>
                  <select
                    className="input-field"
                    value={agent.dndAlignment}
                    onChange={(e) => update("dndAlignment", e.target.value)}
                  >
                    {["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Background
                  </label>
                  <select
                    className="input-field"
                    value={agent.dndBackground}
                    onChange={(e) => update("dndBackground", e.target.value)}
                  >
                    {["Sage", "Soldier", "Entertainer", "Hermit", "Scribe", "Guild Artisan", "Acolyte", "Criminal", "Folk Hero", "Noble", "Outlander"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                    Temperature
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={agent.temperature ?? ""}
                    onChange={(e) => update("temperature", e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Default"
                  />
                </div>
              </div>
            </div>

            <div className="sheet-panel">
              <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 4 }}>
                Description *
              </label>
              <textarea
                className="textarea-field"
                rows={2}
                value={agent.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What does this agent do?"
              />

              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 4 }}>
                  Tags (comma separated)
                </label>
                <input
                  className="input-field"
                  value={agent.tags.join(", ")}
                  onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  placeholder="review, security, quality"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="sheet-panel">
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 8px" }}>
              Tool Permissions
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#8a8aae", marginBottom: 12 }}>
              Click to cycle: <span style={{ color: "#16a34a" }}>Allow</span> → <span style={{ color: "#d4a843" }}>Ask</span> → <span style={{ color: "#6a6a8e" }}>Deny</span>
            </p>
            <PermissionsPanel
              permissions={agent.permissions}
              onChange={(p: AgentPermissions) => update("permissions", p)}
            />
          </div>
          <div className="sheet-panel">
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 8px" }}>
              Saving Throws
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#8a8aae", marginBottom: 12 }}>
              Each permission acts as a saving throw against tool access.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "read", label: "Read", desc: "Resist information gathering" },
                { key: "edit", label: "Edit", desc: "Resist file modification" },
                { key: "bash", label: "Bash", desc: "Resist command execution" },
                { key: "task", label: "Task", desc: "Resist subagent invocation" },
                { key: "webfetch", label: "Web Fetch", desc: "Resist external access" },
              ].map(({ key, label, desc }) => {
                const levelValue = agent.permissions[key]
                const level = levelValue === "allow" ? "allow" : levelValue === "ask" ? "ask" : "deny"
                const color = level === "allow" ? "#16a34a" : level === "ask" ? "#d4a843" : "#6a6a8e"
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0.5rem", borderBottom: "1px solid #1a1a2e" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#b8b0a0" }}>{label}</div>
                      <div style={{ fontSize: "0.65rem", color: "#6a6a8e" }}>{desc}</div>
                    </div>
                    <div style={{
                      padding: "2px 10px",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: `${color}20`,
                      color,
                      border: `1px solid ${color}`,
                    }}>
                      {level === "allow" ? "Proficient" : level === "ask" ? "Trained" : "Untrained"}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "prompt" && (
        <div className="sheet-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: 0 }}>
              System Prompt
            </h3>
            <span style={{ fontSize: "0.65rem", color: "#8a8aae" }}>
              {agent.prompt.length} characters
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#8a8aae", marginBottom: 8 }}>
            This is the agent's core instruction set — its "class features" and "personality."
          </p>
          <textarea
            className="textarea-field"
            rows={20}
            value={agent.prompt}
            onChange={(e) => update("prompt", e.target.value)}
            placeholder="You are a specialized agent. Focus on..."
            style={{ minHeight: 300 }}
          />
        </div>
      )}

      {activeTab === "advanced" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="sheet-panel">
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 12px" }}>
              Configuration
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                  Max Steps
                </label>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  value={agent.steps ?? ""}
                  onChange={(e) => update("steps", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "block", marginBottom: 2 }}>
                  Top P
                </label>
                <input
                  className="input-field"
                  type="number"
                  step={0.1}
                  min={0}
                  max={1}
                  value={agent.topP ?? ""}
                  onChange={(e) => update("topP", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Default"
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.85rem", color: "#b8b0a0" }}>
                <input
                  type="checkbox"
                  checked={agent.hidden}
                  onChange={(e) => update("hidden", e.target.checked)}
                  style={{ accentColor: "#d4a843" }}
                />
                Hidden (invisible to @ menu)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.85rem", color: "#b8b0a0" }}>
                <input
                  type="checkbox"
                  checked={agent.disabled}
                  onChange={(e) => update("disabled", e.target.checked)}
                  style={{ accentColor: "#d4a843" }}
                />
                Disabled
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.85rem", color: "#b8b0a0" }}>
                <input
                  type="checkbox"
                  checked={agent.isTemplate}
                  onChange={(e) => update("isTemplate", e.target.checked)}
                  style={{ accentColor: "#d4a843" }}
                />
                Template
              </label>
            </div>
          </div>

          <div className="sheet-panel">
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 12px" }}>
              Equipment (MCP Servers)
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#8a8aae", marginBottom: 8 }}>
              MCP servers act as an agent's magical items and equipment.
            </p>
            {Object.keys(agent.mcpServers).length === 0 ? (
              <div style={{ fontSize: "0.8rem", color: "#5a5a7e", fontStyle: "italic" }}>
                No MCP servers configured. Add them in your opencode.json.
              </div>
            ) : (
              <div>
                {Object.entries(agent.mcpServers).map(([name, config]) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0.5rem", borderBottom: "1px solid #1a1a2e", fontSize: "0.85rem" }}>
                    <span style={{ color: "#b8b0a0" }}>{name}</span>
                    <span style={{ color: config.enabled ? "#16a34a" : "#6a6a8e", fontSize: "0.7rem" }}>
                      {config.type} · {config.enabled ? "Equipped" : "Stowed"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 8px" }}>
                Spells (Commands)
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#8a8aae", marginBottom: 8 }}>
                Custom commands are spells in the agent's spellbook.
              </p>
              {Object.keys(agent.commands).length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "#5a5a7e", fontStyle: "italic" }}>
                  No custom commands. Define them in your opencode.json.
                </div>
              ) : (
                Object.entries(agent.commands).map(([name, template]) => (
                  <div key={name} style={{ padding: "0.3rem 0.5rem", borderBottom: "1px solid #1a1a2e" }}>
                    <div style={{ fontSize: "0.85rem", color: "#b8b0a0" }}>{name}</div>
                    <div style={{ fontSize: "0.65rem", color: "#6a6a8e", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {template}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sheet-panel" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#d4a843", margin: "0 0 8px" }}>
              Adventuring Log (Usage Stats)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#8a8aae" }}>Sessions</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>{agent.sessionCount}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#8a8aae" }}>Tokens</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>{agent.tokenCount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#8a8aae" }}>Created</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>{new Date(agent.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#8a8aae" }}>Last Used</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: agent.lastUsed ? "#e2dcc8" : "#5a5a7e", fontFamily: "var(--font-serif)" }}>
                  {agent.lastUsed ? new Date(agent.lastUsed).toLocaleDateString() : "Never"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
