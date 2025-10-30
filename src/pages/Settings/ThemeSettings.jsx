import { useState } from "react"
import { 
  MdColorLens, 
  MdUpload, 
  MdSave, 
  MdRefresh,
  MdPalette,
  MdCheck,
  MdClose,
  MdImage
} from "react-icons/md"

const ThemeSettings = () => {
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState({
    primaryColor: '#1fdae4',
    secondaryColor: '#6366f1',
    logo: null,
    logoPreview: ''
  })

  const handleColorChange = (e) => {
    const { name, value } = e.target
    setTheme(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTheme(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const resetTheme = () => {
    setTheme({
      primaryColor: '#1fdae4',
      secondaryColor: '#6366f1',
      logo: null,
      logoPreview: ''
    })
  }

  const saveTheme = (e) => {
    e.preventDefault()
    // Save theme settings
    console.log('Theme saved:', theme)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="theme-settings-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdPalette />
            </div>
            <div className="page-header-text">
              <h1>Theme Customization</h1>
              <p>Customize colors, branding, and visual appearance</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="secondary-action" onClick={resetTheme}>
              <MdRefresh />
              Reset to Default
            </button>
            <button className="primary-action" onClick={saveTheme}>
              <MdSave />
              Save Theme
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="notification-overlay" onClick={() => setSaved(false)}>
          <div className="notification-container success">
            <div className="notification-icon">
              <MdCheck />
            </div>
            <div className="notification-content">
              <h4>Theme Saved</h4>
              <p>Your theme customization has been applied successfully!</p>
            </div>
            <button className="notification-close" onClick={() => setSaved(false)}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Theme Content */}
      <div className="theme-content">
        {/* Color Customization */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <MdColorLens className="section-icon" />
              <div>
                <h2>Color Scheme</h2>
                <p>Customize the primary and secondary colors</p>
              </div>
            </div>
          </div>
          <div className="section-content">
            <div className="color-grid">
              <div className="color-group">
                <label>Primary Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    name="primaryColor"
                    value={theme.primaryColor}
                    onChange={handleColorChange}
                    className="color-input"
                  />
                  <div className="color-preview" style={{ backgroundColor: theme.primaryColor }}>
                    <span className="color-value">{theme.primaryColor}</span>
                  </div>
                </div>
                <span className="color-description">Main brand color used throughout the interface</span>
              </div>

              <div className="color-group">
                <label>Secondary Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={theme.secondaryColor}
                    onChange={handleColorChange}
                    className="color-input"
                  />
                  <div className="color-preview" style={{ backgroundColor: theme.secondaryColor }}>
                    <span className="color-value">{theme.secondaryColor}</span>
                  </div>
                </div>
                <span className="color-description">Accent color for highlights and emphasis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <MdImage className="section-icon" />
              <div>
                <h2>Brand Logo</h2>
                <p>Upload your company logo for the application</p>
              </div>
            </div>
          </div>
          <div className="section-content">
            <div className="logo-upload-section">
              <div className="logo-preview-container">
                {theme.logoPreview ? (
                  <div className="logo-preview-wrapper">
                    <img src={theme.logoPreview} alt="Logo Preview" className="logo-preview" />
                    <button 
                      className="logo-remove"
                      onClick={() => setTheme(prev => ({ ...prev, logo: null, logoPreview: '' }))}
                    >
                      <MdClose />
                    </button>
                  </div>
                ) : (
                  <div className="logo-placeholder">
                    <MdImage />
                    <p>No logo uploaded</p>
                  </div>
                )}
              </div>
              <div className="logo-upload-actions">
                <label className="upload-button">
                  <MdUpload />
                  Choose Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <div className="upload-info">
                  <p className="upload-hint">Recommended: PNG or SVG format</p>
                  <p className="upload-hint">Maximum size: 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings