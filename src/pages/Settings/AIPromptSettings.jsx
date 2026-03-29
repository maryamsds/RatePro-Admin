// src/pages/Settings/AIPromptSettings.jsx
"use client"

import { useState, useEffect } from "react"
import { MdSmartToy, MdEdit, MdHistory, MdRestartAlt, MdSave, MdClose, MdExpandMore, MdExpandLess, MdCheck, MdInfo, MdCode, MdTune } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

// ─── Category badge colors ──────────────────────────────────────
const categoryColors = {
  "Survey Engine": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Insight Engine": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Action Engine": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Translation Engine": "bg-green-500/10 text-green-600 dark:text-green-400",
}

const sourceColors = {
  db: "bg-[var(--success-light)] text-[var(--success-color)]",
  default: "bg-[var(--info-light)] text-[var(--info-color)]",
}

const AIPromptSettings = () => {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingKey, setEditingKey] = useState(null)
  const [editTemplate, setEditTemplate] = useState("")
  const [editConfig, setEditConfig] = useState({})
  const [expandedKey, setExpandedKey] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  // ─── Fetch all prompts ────────────────────────────────────────
  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/prompt-settings")
      setPrompts(res.data?.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load prompts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrompts() }, [])

  // ─── Toast helper ─────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── Save updated prompt ──────────────────────────────────────
  const handleSave = async (key) => {
    try {
      setSaving(true)
      await axiosInstance.put(`/prompt-settings/${key}`, {
        template: editTemplate,
        config: editConfig
      })
      showToast(`Prompt "${key}" updated successfully`)
      setEditingKey(null)
      fetchPrompts()
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error")
    } finally {
      setSaving(false)
    }
  }

  // ─── Reset to default ─────────────────────────────────────────
  const handleReset = async (key) => {
    if (!confirm(`Reset "${key}" to default? This deletes all DB versions.`)) return
    try {
      await axiosInstance.post(`/prompt-settings/${key}/reset`)
      showToast(`Prompt "${key}" reset to default`)
      fetchPrompts()
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset", "error")
    }
  }

  // ─── Start editing ────────────────────────────────────────────
  const startEdit = (prompt) => {
    setEditingKey(prompt.key)
    setEditTemplate(prompt.template)
    setEditConfig(prompt.config || {})
    setExpandedKey(prompt.key)
  }

  // ─── Filter prompts ───────────────────────────────────────────
  const filteredPrompts = prompts.filter(p => {
    const matchSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.key?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = filterCategory === "all" || p.featureEngine === filterCategory
    return matchSearch && matchCategory
  })

  const categories = [...new Set(prompts.map(p => p.featureEngine).filter(Boolean))]

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full py-4 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg border-l-4 flex items-center gap-2 animate-pulse ${
          toast.type === "error" 
            ? "border-[var(--danger-color)] bg-[var(--danger-light)] text-[var(--danger-color)]" 
            : "border-[var(--success-color)] bg-[var(--success-light)] text-[var(--success-color)]"
        }`}>
          {toast.type === "error" ? <MdClose size={18} /> : <MdCheck size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <MdSmartToy size={32} className="text-[var(--primary-color)] mr-3" />
          <div>
            <h2 className="text-2xl font-bold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
              AI Prompt Settings
            </h2>
            <p className="text-[var(--text-secondary)] mb-0">
              Manage AI prompt templates, execution configs, and versioning
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-sm p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <p className="text-2xl font-bold text-[var(--primary-color)]">{prompts.length}</p>
          <p className="text-xs text-[var(--text-secondary)]">Total Prompts</p>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-sm p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <p className="text-2xl font-bold text-[var(--success-color)]">{prompts.filter(p => p.source === "db").length}</p>
          <p className="text-xs text-[var(--text-secondary)]">Customized</p>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-sm p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <p className="text-2xl font-bold text-[var(--info-color)]">{prompts.filter(p => p.source === "default").length}</p>
          <p className="text-xs text-[var(--text-secondary)]">Using Default</p>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-sm p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <p className="text-2xl font-bold text-[var(--warning-color)]">{categories.length}</p>
          <p className="text-xs text-[var(--text-secondary)]">Engines</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
        >
          <option value="all">All Engines</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
          <span className="ml-3 text-[var(--text-secondary)]">Loading prompts...</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-md border-l-4 border-[var(--danger-color)] bg-[var(--danger-light)] mb-4">
          <p className="text-[var(--danger-color)] m-0 flex items-center gap-2">
            <MdInfo /> {error}
          </p>
        </div>
      )}

      {/* Prompt Cards */}
      {!loading && !error && filteredPrompts.map(prompt => (
        <div
          key={prompt.key}
          className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4 overflow-hidden transition-all"
        >
          {/* Card Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => setExpandedKey(expandedKey === prompt.key ? null : prompt.key)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MdCode className="text-[var(--primary-color)] flex-shrink-0" size={20} />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] truncate text-sm">
                  {prompt.name}
                </h3>
                <span className="text-xs text-[var(--text-secondary)] font-mono">{prompt.key}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Category Badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden md:inline-block ${categoryColors[prompt.featureEngine] || "bg-gray-100 text-gray-600"}`}>
                {prompt.featureEngine}
              </span>

              {/* Source Badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[prompt.source]}`}>
                {prompt.source === "db" ? `v${prompt.activeVersion}` : "Default"}
              </span>

              {/* Expand Icon */}
              {expandedKey === prompt.key ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </div>
          </div>

          {/* Expanded Content */}
          {expandedKey === prompt.key && (
            <div className="border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              {/* Template Section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-1">
                    <MdCode size={16} /> Prompt Template
                  </label>
                  <div className="flex gap-2">
                    {editingKey !== prompt.key && (
                      <button
                        onClick={() => startEdit(prompt)}
                        className="px-3 py-1 rounded-md text-xs font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center gap-1"
                      >
                        <MdEdit size={14} /> Edit
                      </button>
                    )}
                    {prompt.source === "db" && (
                      <button
                        onClick={() => handleReset(prompt.key)}
                        className="px-3 py-1 rounded-md text-xs font-medium transition-colors border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-light)] inline-flex items-center gap-1"
                      >
                        <MdRestartAlt size={14} /> Reset
                      </button>
                    )}
                  </div>
                </div>

                {editingKey === prompt.key ? (
                  /* Edit Mode */
                  <div>
                    <textarea
                      value={editTemplate}
                      onChange={(e) => setEditTemplate(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] font-mono text-xs leading-relaxed transition-all resize-y"
                      placeholder="Enter prompt template..."
                    />

                    {/* Execution Config */}
                    <div className="mt-4 p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                      <h4 className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3 flex items-center gap-1">
                        <MdTune size={16} /> Execution Config
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Temperature</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={editConfig.temperature ?? 0.7}
                            onChange={(e) => setEditConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            className="w-full px-2 py-1.5 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Max Tokens</label>
                          <input
                            type="number"
                            step="50"
                            min="50"
                            max="4000"
                            value={editConfig.maxTokens ?? 500}
                            onChange={(e) => setEditConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                            className="w-full px-2 py-1.5 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Top P</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="1"
                            value={editConfig.topP ?? 0.9}
                            onChange={(e) => setEditConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                            className="w-full px-2 py-1.5 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Response Format</label>
                          <select
                            value={editConfig.responseFormat ?? "json"}
                            onChange={(e) => setEditConfig(prev => ({ ...prev, responseFormat: e.target.value }))}
                            className="w-full px-2 py-1.5 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          >
                            <option value="json">JSON</option>
                            <option value="text">Text</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleSave(prompt.key)}
                        disabled={saving}
                        className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <MdSave size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center gap-2"
                      >
                        <MdClose size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <pre className="w-full px-3 py-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {prompt.template}
                  </pre>
                )}
              </div>

              {/* Config Display (view mode only) */}
              {editingKey !== prompt.key && prompt.config && (
                <div className="px-4 pb-4">
                  <div className="flex gap-4 flex-wrap text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <MdTune size={14} /> Temperature: <strong>{prompt.config.temperature ?? "—"}</strong>
                    </span>
                    <span>MaxTokens: <strong>{prompt.config.maxTokens ?? "—"}</strong></span>
                    <span>TopP: <strong>{prompt.config.topP ?? "—"}</strong></span>
                    <span>Format: <strong>{prompt.config.responseFormat ?? "—"}</strong></span>
                    {prompt.versionCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MdHistory size={14} /> Versions: <strong>{prompt.versionCount}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {!loading && !error && filteredPrompts.length === 0 && (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <MdSmartToy size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No prompts found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-6 px-4 py-3 rounded-md border-l-4 border-[var(--info-color)] bg-[var(--info-light)]">
        <p className="flex items-start gap-2 m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">
          <MdInfo className="text-[var(--info-color)] mt-0.5 flex-shrink-0" />
          <small>
            <strong>How it works:</strong> Editing a prompt creates a new version in the database.
            The system uses DB → Cache → Default fallback. Resetting removes the DB override and reverts to the hardcoded default.
            Use <code className="bg-black/10 dark:bg-white/10 px-1 rounded font-mono">{"{variable}"}</code> for dynamic values.
          </small>
        </p>
      </div>
    </div>
  )
}

export default AIPromptSettings
