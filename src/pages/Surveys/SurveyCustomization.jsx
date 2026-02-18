// src\pages\Surveys\SurveyCustomization.jsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { MdSave, MdPreview, MdPalette, MdImage, MdBrush } from "react-icons/md"

const SurveyCustomization = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("branding")
  const [customization, setCustomization] = useState({
    logo: "",
    companyName: "Rate Pro",
    primaryColor: "#0d6efd",
    secondaryColor: "#6c757d",
    backgroundColor: "#ffffff",
    textColor: "#212529",
    theme: "modern",
    layout: "centered",
    progressBar: true,
    questionNumbers: true,
    customCss: "",
    welcomeMessage: "Welcome to our survey",
    thankYouMessage: "Thank you for your participation",
    footerText: "Powered by Rate Pro",
    favicon: "",
    customDomain: "",
    embedCode: "",
  })

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [id])

  const handleChange = (field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving customization:", customization)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const generateEmbedCode = () => {
    const embedCode = `<iframe src="https://ratepro.com/survey/${id}" width="100%" height="600" frameborder="0"></iframe>`
    setCustomization((prev) => ({ ...prev, embedCode }))
  }

  const themes = [
    { id: "modern", name: "Modern", preview: "Clean and minimal design" },
    { id: "classic", name: "Classic", preview: "Traditional form layout" },
    { id: "material", name: "Material", preview: "Google Material Design" },
    { id: "bootstrap", name: "Bootstrap", preview: "Bootstrap-styled components" },
  ]

  const layouts = [
    { id: "centered", name: "Centered", description: "Questions centered on page" },
    { id: "left-aligned", name: "Left Aligned", description: "Questions aligned to left" },
    { id: "full-width", name: "Full Width", description: "Questions span full width" },
  ]

  const tabs = [
    { key: "branding", label: "Branding", icon: MdPalette },
    { key: "layout", label: "Layout", icon: MdBrush },
    { key: "content", label: "Content", icon: MdImage },
    { key: "advanced", label: "Advanced", icon: null },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <span className="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[var(--secondary-color)]">Loading customization options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Survey Customization</h1>
          <p className="text-[var(--secondary-color)] text-sm">Customize the look and feel of your survey</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-200">
            <MdPreview size={16} />
            Preview
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all duration-200">
            <MdSave size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          Customization settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization Options */}
        <div className="lg:col-span-2">
          <div className="card border-0 shadow-sm rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent px-4">
              <div className="flex gap-1 -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200
                      ${activeTab === tab.key
                        ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                        : "border-transparent text-[var(--secondary-color)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]"
                      }`}
                  >
                    {tab.icon && <tab.icon size={16} />}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Branding Tab */}
              {activeTab === "branding" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Company Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleChange("logo", e.target.files[0])}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-[var(--primary-color)]/10 file:text-[var(--primary-color)] file:text-sm"
                      />
                      <small className="text-[var(--secondary-color)] text-xs mt-1 block">Upload your company logo (PNG, JPG, SVG)</small>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Company Name</label>
                      <input
                        type="text"
                        value={customization.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: "Primary Color", field: "primaryColor" },
                      { label: "Secondary Color", field: "secondaryColor" },
                      { label: "Background Color", field: "backgroundColor" },
                      { label: "Text Color", field: "textColor" },
                    ].map((item) => (
                      <div key={item.field}>
                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{item.label}</label>
                        <input
                          type="color"
                          value={customization[item.field]}
                          onChange={(e) => handleChange(item.field, e.target.value)}
                          className="w-full h-10 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Theme</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {themes.map((theme) => (
                        <div
                          key={theme.id}
                          onClick={() => handleChange("theme", theme.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all duration-200
                            ${customization.theme === theme.id
                              ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                              : "border-[var(--light-border)] dark:border-[var(--dark-border)] hover:border-[var(--primary-color)]/50"
                            }`}
                        >
                          <h6 className="font-semibold text-sm mb-1">{theme.name}</h6>
                          <p className="text-[var(--secondary-color)] text-xs mb-2">{theme.preview}</p>
                          <input
                            type="radio"
                            name="theme"
                            checked={customization.theme === theme.id}
                            onChange={() => handleChange("theme", theme.id)}
                            className="accent-[var(--primary-color)]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Layout Tab */}
              {activeTab === "layout" && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Layout Style</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {layouts.map((layout) => (
                        <div
                          key={layout.id}
                          onClick={() => handleChange("layout", layout.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all duration-200
                            ${customization.layout === layout.id
                              ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                              : "border-[var(--light-border)] dark:border-[var(--dark-border)] hover:border-[var(--primary-color)]/50"
                            }`}
                        >
                          <h6 className="font-semibold text-sm mb-1">{layout.name}</h6>
                          <p className="text-[var(--secondary-color)] text-xs mb-2">{layout.description}</p>
                          <input type="radio" name="layout" checked={customization.layout === layout.id} onChange={() => handleChange("layout", layout.id)} className="accent-[var(--primary-color)]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={customization.progressBar} onChange={(e) => handleChange("progressBar", e.target.checked)} className="w-4 h-4 accent-[var(--primary-color)]" />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Show Progress Bar</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={customization.questionNumbers} onChange={(e) => handleChange("questionNumbers", e.target.checked)} className="w-4 h-4 accent-[var(--primary-color)]" />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Show Question Numbers</span>
                    </label>
                  </div>
                </>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <>
                  {[
                    { label: "Welcome Message", field: "welcomeMessage", rows: 3 },
                    { label: "Thank You Message", field: "thankYouMessage", rows: 3 },
                  ].map((item) => (
                    <div key={item.field} className="mb-4">
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{item.label}</label>
                      <textarea
                        rows={item.rows}
                        value={customization[item.field]}
                        onChange={(e) => handleChange(item.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 resize-y"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Footer Text</label>
                    <input
                      type="text"
                      value={customization.footerText}
                      onChange={(e) => handleChange("footerText", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    />
                  </div>
                </>
              )}

              {/* Advanced Tab */}
              {activeTab === "advanced" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Custom CSS</label>
                    <textarea
                      rows={8}
                      value={customization.customCss}
                      onChange={(e) => handleChange("customCss", e.target.value)}
                      placeholder="/* Add your custom CSS here */"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 resize-y"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Custom Domain</label>
                    <input
                      type="text"
                      value={customization.customDomain}
                      onChange={(e) => handleChange("customDomain", e.target.value)}
                      placeholder="surveys.yourcompany.com"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    />
                    <small className="text-[var(--secondary-color)] text-xs mt-1 block">Use your own domain for surveys (requires DNS configuration)</small>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Embed Code</label>
                      <button onClick={generateEmbedCode} className="text-xs px-3 py-1 rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all">
                        Generate Code
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={customization.embedCode}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-gray-50 dark:bg-gray-800 text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm font-mono"
                      placeholder="Click 'Generate Code' to create embed code"
                    />
                    <small className="text-[var(--secondary-color)] text-xs mt-1 block">Use this code to embed the survey on your website</small>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="card border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h6 className="font-semibold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Live Preview</h6>
            </div>
            <div className="p-4">
              <div
                className="border rounded-lg p-4"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  minHeight: "400px",
                }}
              >
                <div className="text-center mb-4">
                  {customization.logo && (
                    <div className="mb-2">
                      <div className="inline-block px-3 py-2 bg-gray-100 rounded" style={{ color: customization.primaryColor }}>
                        Logo
                      </div>
                    </div>
                  )}
                  <h5 className="font-semibold" style={{ color: customization.primaryColor }}>{customization.companyName}</h5>
                </div>
                <div className="mb-3">
                  <p className="text-sm">{customization.welcomeMessage}</p>
                </div>
                {customization.progressBar && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full" style={{ height: "6px" }}>
                      <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: customization.primaryColor }} />
                    </div>
                    <small className="text-gray-500 text-xs">Question 3 of 5</small>
                  </div>
                )}
                <div className="mb-3">
                  {customization.questionNumbers && (
                    <span className="inline-block px-2 py-0.5 rounded text-white text-xs mr-2" style={{ backgroundColor: customization.primaryColor }}>1</span>
                  )}
                  <h6 className="inline font-semibold text-sm">How satisfied are you with our service?</h6>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className="px-2 py-1 text-xs rounded border"
                        style={{ borderColor: customization.primaryColor, color: customization.primaryColor }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center mt-6 pt-3 border-t border-gray-200">
                  <small className="text-gray-500">{customization.footerText}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyCustomization
