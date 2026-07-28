import { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAgents, saveAgent } from "../db/hooks.ts"
import { deleteAgent, duplicateAgent } from "../db/hooks.ts"
import { downloadAllAgents } from "../utils/export.ts"
import { parseAgentMarkdown, readFileAsText } from "../utils/import.ts"
import { getClassTheme } from "../utils/classTheme.ts"
import { MODE_CLASS_MAP } from "../types/agent.ts"
import AgentCard from "../components/AgentCard.tsx"
import { useToast } from "../components/Toast.tsx"

type SortKey = "name" | "updatedAt" | "sessionCount" | "dndLevel" | "createdAt"
type ViewMode = "grid" | "list"
type FilterMode = "all" | "primary" | "subagent" | "all-modes"

export default function Library() {
  const { agents, loading, refresh } = useAgents()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt")
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [view, setView] = useState<ViewMode>("grid")
  const [groupByClass, setGroupByClass] = useState(false)

  const filtered = useMemo(() => {
    let result = [...agents]

    if (filterMode !== "all") {
      result = result.filter((a) => a.mode === filterMode || (filterMode === "all-modes" && a.mode === "all"))
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.model.toLowerCase().includes(q) ||
        a.dndRace.toLowerCase().includes(q) ||
        a.dndClass.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case "name": cmp = a.name.localeCompare(b.name); break
        case "sessionCount": cmp = a.sessionCount - b.sessionCount; break
        case "dndLevel": cmp = a.dndLevel - b.dndLevel; break
        case "createdAt": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
        case "updatedAt": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break
      }
      return sortDir === "desc" ? -cmp : cmp
    })

    return result
  }, [agents, search, sortBy, sortDir, filterMode])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    await deleteAgent(id)
    toast("Agent deleted", "error")
    refresh()
  }

  const handleDuplicate = async (agent: typeof agents[0]) => {
    const dup = await duplicateAgent(agent)
    toast(`Duplicated as "${dup.name}"`, "success")
    refresh()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    let imported = 0
    for (const file of Array.from(files)) {
      try {
        const text = await readFileAsText(file)
        const partial = parseAgentMarkdown(text, file.name)
        const agent = {
          ...partial,
          id: partial.id || crypto.randomUUID(),
          name: partial.name || file.name.replace(/\.md$/i, ""),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTemplate: false,
        } as import("../types/agent.ts").Agent
        await saveAgent(agent)
        imported++
      } catch (err) {
        toast(`Failed to import ${file.name}: ${err}`, "error")
      }
    }
    if (imported > 0) {
      toast(`Imported ${imported} agent${imported > 1 ? "s" : ""}`, "success")
      refresh()
    }
    if (e.target) e.target.value = ""
  }

  const toggleSortDir = () => setSortDir((d) => d === "desc" ? "asc" : "desc")

  const hasActiveFilters = search || filterMode !== "all"

  const clearFilters = () => { setSearch(""); setFilterMode("all") }

  const grouped = useMemo(() => {
    if (!groupByClass) return null
    const groups: Record<string, typeof filtered> = {}
    for (const a of filtered) {
      const cls = MODE_CLASS_MAP[a.mode]
      if (!groups[cls]) groups[cls] = []
      groups[cls].push(a)
    }
    return groups
  }, [filtered, groupByClass])

  if (loading) {
    return <div style={{ color: "#8a8aae", textAlign: "center", paddingTop: "6rem", fontSize: "1.1rem" }}>
      Loading agent library...
    </div>
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 700, color: "#e2dcc8", margin: 0 }}>
            Agent Library
          </h1>
          <p style={{ color: "#8a8aae", fontSize: "0.8rem", margin: "4px 0 0" }}>
            {filtered.length} / {agents.length} agents
            {agents.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                · Avg Lv.{Math.round(agents.reduce((s, a) => s + a.dndLevel, 0) / agents.length)}
                · {agents.filter((a) => a.isTemplate).length} templates
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            multiple
            onChange={handleImport}
            style={{ display: "none" }}
          />
          <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ fontSize: "0.8rem" }}>
            Import .md
          </button>
          <button className="btn-ghost" onClick={() => { downloadAllAgents(agents); void 0 }} style={{ fontSize: "0.8rem" }}>
            Export
          </button>
          <button className="btn-gold" onClick={() => navigate("/editor/new")} style={{ fontSize: "0.8rem" }}>
            + New Agent
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: "flex", gap: 6, marginBottom: "0.75rem", flexWrap: "wrap",
        padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: 8,
        border: "1px solid #2a2a4e", alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 140 }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#5a5a7e", pointerEvents: "none" }}>
            🔍
          </span>
          <input
            className="input-field"
            placeholder="Search name, tags, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 26, fontSize: "0.8rem" }}
          />
        </div>

        <select
          className="input-field"
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as FilterMode)}
          style={{ maxWidth: 130, fontSize: "0.75rem" }}
        >
          <option value="all">All Classes</option>
          <option value="primary">⚔ Fighter</option>
          <option value="subagent">✦ Wizard</option>
          <option value="all-modes">♫ Bard</option>
        </select>

        <select
          className="input-field"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          style={{ maxWidth: 140, fontSize: "0.75rem" }}
        >
          <option value="updatedAt">Updated</option>
          <option value="createdAt">Created</option>
          <option value="name">Name</option>
          <option value="dndLevel">Level</option>
          <option value="sessionCount">Usage</option>
        </select>

        <button
          onClick={toggleSortDir}
          className="btn-ghost"
          style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem", minWidth: 36 }}
          title={sortDir === "desc" ? "Descending" : "Ascending"}
        >
          {sortDir === "desc" ? "↓" : "↑"}
        </button>

        <div style={{ width: 1, height: 20, background: "#2a2a4e" }} />

        <button
          onClick={() => setView("grid")}
          className="btn-ghost"
          style={{
            fontSize: "0.75rem", padding: "0.35rem 0.5rem",
            background: view === "grid" ? "rgba(212,168,67,0.1)" : "transparent",
            borderColor: view === "grid" ? "#d4a843" : "#2a2a4e",
          }}
        >
          ▦
        </button>
        <button
          onClick={() => setView("list")}
          className="btn-ghost"
          style={{
            fontSize: "0.75rem", padding: "0.35rem 0.5rem",
            background: view === "list" ? "rgba(212,168,67,0.1)" : "transparent",
            borderColor: view === "list" ? "#d4a843" : "#2a2a4e",
          }}
        >
          ☰
        </button>

        <div style={{ width: 1, height: 20, background: "#2a2a4e" }} />

        <label style={{ fontSize: "0.7rem", color: "#8a8aae", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <input type="checkbox" checked={groupByClass} onChange={(e) => setGroupByClass(e.target.checked)} style={{ accentColor: "#d4a843" }} />
          Group
        </label>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div style={{ display: "flex", gap: 4, marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {search && (
            <span style={{ fontSize: "0.65rem", background: "rgba(212,168,67,0.1)", color: "#d4a843", padding: "2px 8px", borderRadius: 12, display: "flex", alignItems: "center", gap: 4 }}>
              "{search}"
              <span onClick={() => setSearch("")} style={{ cursor: "pointer", marginLeft: 2 }}>✕</span>
            </span>
          )}
          {filterMode !== "all" && (
            <span style={{ fontSize: "0.65rem", background: `${getClassTheme(filterMode === "all-modes" ? "all" : filterMode).color}20`, color: getClassTheme(filterMode === "all-modes" ? "all" : filterMode).color, padding: "2px 8px", borderRadius: 12, display: "flex", alignItems: "center", gap: 4 }}>
              {getClassTheme(filterMode === "all-modes" ? "all" : filterMode).icon} {MODE_CLASS_MAP[filterMode === "all-modes" ? "all" : filterMode]}
              <span onClick={() => setFilterMode("all")} style={{ cursor: "pointer", marginLeft: 2 }}>✕</span>
            </span>
          )}
          <span onClick={clearFilters} style={{ fontSize: "0.6rem", color: "#5a5a7e", cursor: "pointer", textDecoration: "underline", marginLeft: 4 }}>
            Clear all
          </span>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem", opacity: 0.6 }}>{search ? "🔍" : "📭"}</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#8a8aae", margin: "0 0 0.5rem", fontSize: "1.2rem" }}>
            {search ? "No agents match your search" : "No agents yet"}
          </h2>
          <p style={{ color: "#5a5a7e", fontSize: "0.8rem", marginBottom: "1rem" }}>
            {search ? "Try different keywords or clear your filters" : "Create your first agent to get started"}
          </p>
          {search ? (
            <button className="btn-ghost" onClick={clearFilters}>Clear Filters</button>
          ) : (
            <button className="btn-gold" onClick={() => navigate("/editor/new")}>Create Agent</button>
          )}
        </div>
      ) : groupByClass ? (
        /* Grouped view */
        <div>
          {Object.entries(grouped!).map(([cls, clsAgents]) => {
            const theme = cls === "Fighter" ? getClassTheme("primary") : cls === "Wizard" ? getClassTheme("subagent") : getClassTheme("all")
            return (
              <div key={cls} style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem", padding: "0.25rem 0" }}>
                  <span style={{ fontSize: "1.2rem" }}>{theme.icon}</span>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: theme.color, margin: 0, fontWeight: 600 }}>
                    {cls}
                  </h2>
                  <span style={{ fontSize: "0.7rem", color: "#5a5a7e" }}>{clsAgents.length} agents</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${theme.color}40, transparent)` }} />
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr",
                  gap: view === "grid" ? 10 : 6,
                }}>
                  {clsAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} view={view} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Ungrouped grid/list */
        <div style={{
          display: "grid",
          gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr",
          gap: view === "grid" ? 10 : 6,
        }}>
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} view={view} />
          ))}
        </div>
      )}
    </div>
  )
}
