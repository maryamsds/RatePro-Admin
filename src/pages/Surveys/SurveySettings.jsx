import { useState } from "react"
import { 
  MdSettings, MdSave, MdPreview, MdShare, MdArchive, 
  MdSecurity, MdVisibility, MdSchedule, MdNotifications,
  MdMonitor, MdAccessTime, MdPeople, MdLock, MdPublic,
  MdCheckCircle, MdInfo, MdWarning, MdClose, MdRefresh,
  MdEmail, MdDateRange, MdTimer, MdToggleOn, MdToggleOff,
  MdViewList, MdShuffle, MdCheck
} from "react-icons/md"

const SurveySettings = () => {
  const [settings, setSettings] = useState({
    surveyName: "Customer Satisfaction Q4",
    description: "Quarterly customer satisfaction survey",
    isActive: true,
    allowAnonymous: true,
    requireLogin: false,
    multipleResponses: false,
    showProgressBar: true,
    randomizeQuestions: false,
    autoSave: true,
    thankYouMessage: "Thank you for your participation!",
    redirectUrl: "",
    emailNotifications: true,
    responseLimit: "",
    startDate: "",
    endDate: "",
    notificationEmail: "admin@company.com"
  })

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setHasChanges(true)
  }

  const resetSettings = () => {
    setSettings({
      surveyName: "Customer Satisfaction Q4",
      description: "Quarterly customer satisfaction survey",
      isActive: true,
      allowAnonymous: true,
      requireLogin: false,
      multipleResponses: false,
      showProgressBar: true,
      randomizeQuestions: false,
      autoSave: true,
      thankYouMessage: "Thank you for your participation!",
      redirectUrl: "",
      emailNotifications: true,
      responseLimit: "",
      startDate: "",
      endDate: "",
      notificationEmail: "admin@company.com"
    })
    setHasChanges(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  // Get survey status info
  const getSurveyStatus = () => {
    if (!settings.isActive) return { status: 'inactive', text: 'Inactive' }
    if (settings.startDate && new Date(settings.startDate) > new Date()) {
      return { status: 'scheduled', text: 'Scheduled' }
    }
    if (settings.endDate && new Date(settings.endDate) < new Date()) {
      return { status: 'ended', text: 'Ended' }
    }
    return { status: 'active', text: 'Active' }
  }

  const statusInfo = getSurveyStatus()

  return (
    <div className="survey-settings-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdSettings />
            </div>
            <div className="page-header-text">
              <h1>Survey Settings</h1>
              <p>Configure your survey preferences, access control, and display options</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="secondary-action" onClick={resetSettings}>
              <MdRefresh />
              Reset to Default
            </button>
            <button className="primary-action" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <MdSave />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Survey Status Summary */}
      <div className="survey-status-bar">
        <div className="status-item">
          <MdInfo className="status-icon" />
          <div className="status-content">
            <span className="status-label">Survey:</span>
            <span className="status-value">{settings.surveyName}</span>
          </div>
        </div>
        <div className="status-item">
          <MdAccessTime className="status-icon" />
          <div className="status-content">
            <span className="status-label">Status:</span>
            <span className={`status-badge ${statusInfo.status}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
        <div className="status-item">
          <MdPeople className="status-icon" />
          <div className="status-content">
            <span className="status-label">Access:</span>
            <span className="status-value">
              {settings.allowAnonymous ? 'Public' : 'Restricted'}
            </span>
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
              <h4>Settings Saved</h4>
              <p>Your survey configuration has been updated successfully!</p>
            </div>
            <button className="notification-close" onClick={() => setSaved(false)}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Changes Alert */}
      {hasChanges && !saving && (
        <div className="changes-alert">
          <div className="alert-content">
            <MdWarning className="alert-icon" />
            <span>You have unsaved changes. Don't forget to save your settings.</span>
          </div>
        </div>
      )}

      {/* Survey Settings Content */}
      <div className="survey-settings-content">
        <div className="settings-grid">
          <div className="main-settings">
            {/* Basic Information */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdInfo className="section-icon" />
                  <div>
                    <h2>Basic Information</h2>
                    <p>Configure survey name, description, and completion settings</p>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="surveyName">Survey Name *</label>
                    <input
                      type="text"
                      id="surveyName"
                      name="surveyName"
                      value={settings.surveyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={settings.description}
                      onChange={handleChange}
                      placeholder="Describe the purpose and scope of this survey..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="thankYouMessage">Thank You Message</label>
                    <textarea
                      id="thankYouMessage"
                      name="thankYouMessage"
                      rows="2"
                      value={settings.thankYouMessage}
                      onChange={handleChange}
                      placeholder="Message shown after survey completion"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="redirectUrl">
                      Redirect URL <span className="optional">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      id="redirectUrl"
                      name="redirectUrl"
                      placeholder="https://example.com"
                      value={settings.redirectUrl}
                      onChange={handleChange}
                    />
                    <span className="form-hint">Redirect users to this URL after survey completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdSecurity className="section-icon" />
                  <div>
                    <h2>Access Control</h2>
                    <p>Manage survey availability and access permissions</p>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <div className="switch-group">
                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Survey Status</h4>
                      <p>Enable or disable survey responses</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={settings.isActive}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Anonymous Responses</h4>
                      <p>Allow users to respond without registration</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="allowAnonymous"
                        checked={settings.allowAnonymous}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Require Login</h4>
                      <p>Users must be logged in to participate</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="requireLogin"
                        checked={settings.requireLogin}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Multiple Responses</h4>
                      <p>Allow users to submit multiple responses</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="multipleResponses"
                        checked={settings.multipleResponses}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="schedule-section">
                  <div className="subsection-header">
                    <MdDateRange className="subsection-icon" />
                    <h3>Schedule</h3>
                  </div>
                  <div className="form-grid two-columns">
                    <div className="form-group">
                      <label htmlFor="startDate">
                        Start Date <span className="optional">(Optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={settings.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="endDate">
                        End Date <span className="optional">(Optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={settings.endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="responseLimit">
                    Response Limit <span className="optional">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="responseLimit"
                    name="responseLimit"
                    placeholder="Leave empty for unlimited"
                    value={settings.responseLimit}
                    onChange={handleChange}
                    min="1"
                  />
                  <span className="form-hint">Maximum number of responses allowed</span>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdMonitor className="section-icon" />
                  <div>
                    <h2>Display Options</h2>
                    <p>Customize survey presentation and user experience</p>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <div className="switch-group">
                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Progress Bar</h4>
                      <p>Show completion progress to users</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="showProgressBar"
                        checked={settings.showProgressBar}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Randomize Questions</h4>
                      <p>Present questions in random order</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="randomizeQuestions"
                        checked={settings.randomizeQuestions}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  <div className="switch-item">
                    <div className="switch-content">
                      <h4>Auto-Save Responses</h4>
                      <p>Automatically save progress as users type</p>
                    </div>
                    <label className="custom-switch">
                      <input
                        type="checkbox"
                        name="autoSave"
                        checked={settings.autoSave}
                        onChange={handleChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-settings">
            {/* Notifications */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdNotifications className="section-icon" />
                  <div>
                    <h2>Notifications</h2>
                    <p>Configure notification preferences</p>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <div className="switch-item">
                  <div className="switch-content">
                    <h4>Email Notifications</h4>
                    <p>Get notified of new responses</p>
                  </div>
                  <label className="custom-switch">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="notificationEmail">Notification Email</label>
                  <input
                    type="email"
                    id="notificationEmail"
                    name="notificationEmail"
                    value={settings.notificationEmail}
                    onChange={handleChange}
                    disabled={!settings.emailNotifications}
                    placeholder="admin@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card actions-card">
              <div className="section-header">
                <div className="section-title">
                  <MdShare className="section-icon" />
                  <div>
                    <h2>Quick Actions</h2>
                    <p>Survey management actions</p>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <div className="action-buttons">
                  <button className="action-button preview">
                    <MdPreview />
                    Preview Survey
                  </button>
                  
                  <button className="action-button share">
                    <MdShare />
                    Share Survey
                  </button>
                  
                  <button className="action-button archive">
                    <MdArchive />
                    Archive Survey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveySettings
