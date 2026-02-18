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
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary-light)] text-[var(--primary-color)] text-2xl">
              <MdPalette />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Theme Customization</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Customize colors, branding, and visual appearance</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-2"
              onClick={resetTheme}
            >
              <MdRefresh />
              Reset to Default
            </button>
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
              onClick={saveTheme}
            >
              <MdSave />
              Save Theme
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSaved(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-lg p-6 max-w-md w-full border border-[var(--success-color)] relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--success-light)] text-[var(--success-color)] text-xl flex-shrink-0">
                <MdCheck />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Theme Saved</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Your theme customization has been applied successfully!</p>
              </div>
              <button 
                className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors"
                onClick={() => setSaved(false)}
              >
                <MdClose className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Content */}
      <div className="space-y-6">
        {/* Color Customization */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <MdColorLens className="text-2xl text-[var(--primary-color)] mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Color Scheme</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Customize the primary and secondary colors</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={theme.primaryColor}
                  onChange={handleColorChange}
                  className="w-12 h-12 rounded border-2 border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer"
                />
                <div className="flex-1 px-4 py-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex items-center justify-between">
                  <span className="text-sm font-mono text-[var(--light-text)] dark:text-[var(--dark-text)]">{theme.primaryColor}</span>
                  <div className="w-6 h-6 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ backgroundColor: theme.primaryColor }}></div>
                </div>
              </div>
              <span className="block text-xs text-[var(--text-secondary)]">Main brand color used throughout the interface</span>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="secondaryColor"
                  value={theme.secondaryColor}
                  onChange={handleColorChange}
                  className="w-12 h-12 rounded border-2 border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer"
                />
                <div className="flex-1 px-4 py-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex items-center justify-between">
                  <span className="text-sm font-mono text-[var(--light-text)] dark:text-[var(--dark-text)]">{theme.secondaryColor}</span>
                  <div className="w-6 h-6 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ backgroundColor: theme.secondaryColor }}></div>
                </div>
              </div>
              <span className="block text-xs text-[var(--text-secondary)]">Accent color for highlights and emphasis</span>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <MdImage className="text-2xl text-[var(--primary-color)] mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Brand Logo</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Upload your company logo for the application</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
              {theme.logoPreview ? (
                <div className="relative">
                  <img 
                    src={theme.logoPreview} 
                    alt="Logo Preview" 
                    className="max-w-full max-h-40 rounded"
                  />
                  <button 
                    className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--danger-color)] text-white hover:bg-red-600 transition-colors shadow-md"
                    onClick={() => setTheme(prev => ({ ...prev, logo: null, logoPreview: '' }))}
                  >
                    <MdClose />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <MdImage className="text-5xl text-[var(--text-secondary)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">No logo uploaded</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <label className="px-6 py-3 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center justify-center gap-2 cursor-pointer">
                <MdUpload className="text-xl" />
                Choose Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <div className="space-y-2 px-2">
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
                  Recommended: PNG or SVG format
                </p>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
                  Maximum size: 2MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings