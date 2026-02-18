// src\pages\ContentManagement\Integrations.jsx

"use client"

import { useState } from "react"

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: "slack",
      name: "Slack",
      description: "Send survey notifications to Slack channels",
      category: "Communication",
      icon: "fab fa-slack",
      connected: true,
      config: { webhook: "https://hooks.slack.com/...", channel: "#surveys" },
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automate workflows with 3000+ apps",
      category: "Automation",
      icon: "fas fa-bolt",
      connected: false,
      config: {},
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Sync survey data with Salesforce CRM",
      category: "CRM",
      icon: "fab fa-salesforce",
      connected: true,
      config: { instance: "mycompany.salesforce.com", object: "Lead" },
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Import contacts and sync survey responses",
      category: "CRM",
      icon: "fab fa-hubspot",
      connected: false,
      config: {},
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Send surveys to Mailchimp audiences",
      category: "Email Marketing",
      icon: "fab fa-mailchimp",
      connected: true,
      config: { listId: "abc123", apiKey: "***" },
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track survey engagement and conversions",
      category: "Analytics",
      icon: "fab fa-google",
      connected: false,
      config: {},
    },
  ])

  const [showConfigModal, setShowConfigModal] = useState(false)
  const [currentIntegration, setCurrentIntegration] = useState(null)
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = ["all", "Communication", "Automation", "CRM", "Email Marketing", "Analytics"]

  const toggleIntegration = (id) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id ? { ...integration, connected: !integration.connected } : integration,
      ),
    )
  }

  const configureIntegration = (integration) => {
    setCurrentIntegration(integration)
    setShowConfigModal(true)
  }

  const saveConfiguration = () => {
    setShowConfigModal(false)
    setCurrentIntegration(null)
  }

  const filteredIntegrations = integrations.filter(
    (integration) => filterCategory === "all" || integration.category === filterCategory,
  )

  return (
    <div className="w-full px-4 py-4">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold mb-1">Integrations</h1>
            <p className="text-[var(--text-secondary)]">Connect RatePro with your favorite tools and services</p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors font-medium inline-flex items-center gap-2">
            <i className="fas fa-plus"></i>
            Request Integration
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <div className="max-w-xs">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <div key={integration.id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4 flex flex-col h-full">
            <div className="flex items-start mb-3">
              <div className="mr-3">
                <i className={`${integration.icon} fa-2x text-[var(--primary-color)]`}></i>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h5 className="font-semibold mb-1">{integration.name}</h5>
                  <span className={`px-2 py-0.5 ${integration.connected ? "bg-green-500" : "bg-gray-500"} text-white rounded-full text-xs font-medium`}>
                    {integration.connected ? "Connected" : "Not Connected"}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                  {integration.category}
                </span>
              </div>
            </div>

            <p className="text-[var(--text-secondary)] flex-grow">{integration.description}</p>

            {integration.connected && Object.keys(integration.config).length > 0 && (
              <div className="mb-3">
                <small className="text-[var(--text-secondary)]">Configuration:</small>
                <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-2 rounded text-sm">
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {typeof value === "string" && value.includes("***") ? value : value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              {integration.connected ? (
                <>
                  <button
                    className="flex-grow px-3 py-1.5 rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors text-sm inline-flex items-center justify-center gap-1"
                    onClick={() => configureIntegration(integration)}
                  >
                    <i className="fas fa-cog"></i>
                    Configure
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-colors text-sm"
                    onClick={() => toggleIntegration(integration.id)}
                  >
                    <i className="fas fa-unlink"></i>
                  </button>
                </>
              ) : (
                <button
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors text-sm inline-flex items-center justify-center gap-1"
                  onClick={() => toggleIntegration(integration.id)}
                >
                  <i className="fas fa-link"></i>
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfigModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0">Configure {currentIntegration?.name}</h5>
              <button onClick={() => setShowConfigModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-xl">×</button>
            </div>
            <div className="p-4">
              {currentIntegration && (
                <form>
                  {currentIntegration.id === "slack" && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Webhook URL</label>
                        <input
                          type="url"
                          placeholder="https://hooks.slack.com/services/..."
                          defaultValue={currentIntegration.config.webhook}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        />
                        <small className="text-[var(--text-secondary)]">Get your webhook URL from Slack's Incoming Webhooks app</small>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Default Channel</label>
                        <input
                          type="text"
                          placeholder="#surveys"
                          defaultValue={currentIntegration.config.channel}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        />
                      </div>
                    </>
                  )}

                  {currentIntegration.id === "salesforce" && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Salesforce Instance</label>
                        <input
                          type="text"
                          placeholder="mycompany.salesforce.com"
                          defaultValue={currentIntegration.config.instance}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Object Type</label>
                        <select
                          defaultValue={currentIntegration.config.object}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Contact">Contact</option>
                          <option value="Account">Account</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">API Token</label>
                        <input
                          type="password"
                          placeholder="Enter your Salesforce API token"
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        />
                      </div>
                    </>
                  )}

                  {currentIntegration.id === "mailchimp" && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <input
                          type="password"
                          placeholder="Enter your Mailchimp API key"
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Default List ID</label>
                        <input
                          type="text"
                          placeholder="abc123"
                          defaultValue={currentIntegration.config.listId}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <button type="button" className="px-3 py-1.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors text-sm inline-flex items-center gap-1">
                      <i className="fas fa-vial"></i>
                      Test Connection
                    </button>
                    <button type="button" className="px-3 py-1.5 rounded-lg border border-cyan-400 text-cyan-500 hover:bg-cyan-50 transition-colors text-sm inline-flex items-center gap-1">
                      <i className="fas fa-book"></i>
                      View Documentation
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveConfiguration}
                className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Integrations