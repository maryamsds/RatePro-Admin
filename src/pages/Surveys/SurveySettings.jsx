import { useState } from "react";
import {
  MdSettings,
  MdSave,
  MdPreview,
  MdShare,
  MdArchive,
  MdSecurity,
  MdVisibility,
  MdSchedule,
  MdNotifications,
  MdMonitor,
  MdAccessTime,
  MdPeople,
  MdLock,
  MdPublic,
  MdCheckCircle,
  MdInfo,
  MdWarning,
  MdClose,
  MdRefresh,
  MdEmail,
  MdDateRange,
  MdTimer,
  MdToggleOn,
  MdToggleOff,
  MdViewList,
  MdShuffle,
  MdCheck,
} from "react-icons/md";

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
    notificationEmail: "admin@company.com",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasChanges(true);
  };

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
      notificationEmail: "admin@company.com",
    });
    setHasChanges(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // Get survey status info
  const getSurveyStatus = () => {
    if (!settings.isActive) return { status: "inactive", text: "Inactive" };
    if (settings.startDate && new Date(settings.startDate) > new Date()) {
      return { status: "scheduled", text: "Scheduled" };
    }
    if (settings.endDate && new Date(settings.endDate) < new Date()) {
      return { status: "ended", text: "Ended" };
    }
    return { status: "active", text: "Active" };
  };

  const statusInfo = getSurveyStatus();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary-light)] text-[var(--primary-color)]">
              <MdSettings className="text-2xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                Survey Settings
              </h1>
              <p className="text-[var(--text-secondary)]">
                Configure your survey preferences, access control, and display
                options
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetSettings}
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-2"
            >
              <MdRefresh />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <MdInfo className="text-2xl text-[var(--primary-color)]" />
            <div className="flex flex-col">
              <span className="text-sm text-[var(--text-secondary)]">
                Survey:
              </span>
              <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {settings.surveyName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MdAccessTime className="text-2xl text-[var(--primary-color)]" />
            <div className="flex flex-col">
              <span className="text-sm text-[var(--text-secondary)]">
                Status:
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  statusInfo.status === "active"
                    ? "bg-[var(--success-light)] text-[var(--success-color)]"
                    : statusInfo.status === "scheduled"
                      ? "bg-[var(--info-light)] text-[var(--info-color)]"
                      : statusInfo.status === "ended"
                        ? "bg-[var(--danger-light)] text-[var(--danger-color)]"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {statusInfo.text}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MdPeople className="text-2xl text-[var(--primary-color)]" />
            <div className="flex flex-col">
              <span className="text-sm text-[var(--text-secondary)]">
                Access:
              </span>
              <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {settings.allowAnonymous ? "Public" : "Restricted"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSaved(false)}
        >
          <div
            className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--success-light)] text-[var(--success-color)]">
                <MdCheck className="text-2xl" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                  Settings Saved
                </h4>
                <p className="text-[var(--text-secondary)]">
                  Your survey configuration has been updated successfully!
                </p>
              </div>
              <button
                onClick={() => setSaved(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Changes Alert */}
      {hasChanges && !saving && (
        <div className="bg-[var(--warning-light)] border-l-4 border-[var(--warning-color)] rounded-md p-4">
          <div className="flex items-center gap-3">
            <MdWarning className="text-xl text-[var(--warning-color)]" />
            <span className="text-[var(--warning-color)] font-medium">
              You have unsaved changes. Don't forget to save your settings.
            </span>
          </div>
        </div>
      )}

      {/* Survey Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MdInfo className="text-2xl text-[var(--primary-color)]" />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Basic Information
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Configure survey name, description, and completion settings
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="surveyName"
                  className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                >
                  Survey Name *
                </label>
                <input
                  type="text"
                  id="surveyName"
                  name="surveyName"
                  value={settings.surveyName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={settings.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose and scope of this survey..."
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="thankYouMessage"
                  className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                >
                  Thank You Message
                </label>
                <textarea
                  id="thankYouMessage"
                  name="thankYouMessage"
                  rows="2"
                  value={settings.thankYouMessage}
                  onChange={handleChange}
                  placeholder="Message shown after survey completion"
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="redirectUrl"
                  className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                >
                  Redirect URL{" "}
                  <span className="text-[var(--text-secondary)]">
                    (Optional)
                  </span>
                </label>
                <input
                  type="url"
                  id="redirectUrl"
                  name="redirectUrl"
                  placeholder="https://example.com"
                  value={settings.redirectUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                />
                <span className="text-xs text-[var(--text-secondary)] mt-1 block">
                  Redirect users to this URL after survey completion
                </span>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MdSecurity className="text-2xl text-[var(--primary-color)]" />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Access Control
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Manage survey availability and access permissions
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Survey Status
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Enable or disable survey responses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "isActive",
                        type: "checkbox",
                        checked: !settings.isActive,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.isActive ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.isActive ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Anonymous Responses
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Allow users to respond without registration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "allowAnonymous",
                        type: "checkbox",
                        checked: !settings.allowAnonymous,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.allowAnonymous ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.allowAnonymous ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Require Login
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Users must be logged in to participate
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "requireLogin",
                        type: "checkbox",
                        checked: !settings.requireLogin,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.requireLogin ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.requireLogin ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Multiple Responses
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Allow users to submit multiple responses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "multipleResponses",
                        type: "checkbox",
                        checked: !settings.multipleResponses,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.multipleResponses ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.multipleResponses ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="flex items-center gap-2 mb-4">
                  <MdDateRange className="text-xl text-[var(--primary-color)]" />
                  <h3 className="text-base font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Schedule
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                    >
                      Start Date{" "}
                      <span className="text-[var(--text-secondary)]">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={settings.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                    >
                      End Date{" "}
                      <span className="text-[var(--text-secondary)]">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={settings.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="responseLimit"
                  className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                >
                  Response Limit{" "}
                  <span className="text-[var(--text-secondary)]">
                    (Optional)
                  </span>
                </label>
                <input
                  type="number"
                  id="responseLimit"
                  name="responseLimit"
                  placeholder="Leave empty for unlimited"
                  value={settings.responseLimit}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                />
                <span className="text-xs text-[var(--text-secondary)] mt-1 block">
                  Maximum number of responses allowed
                </span>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MdMonitor className="text-2xl text-[var(--primary-color)]" />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Display Options
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Customize survey presentation and user experience
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Progress Bar
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Show completion progress to users
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "showProgressBar",
                        type: "checkbox",
                        checked: !settings.showProgressBar,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.showProgressBar ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.showProgressBar ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Randomize Questions
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Present questions in random order
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "randomizeQuestions",
                        type: "checkbox",
                        checked: !settings.randomizeQuestions,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.randomizeQuestions ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.randomizeQuestions ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Auto-Save Responses
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Automatically save progress as users type
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "autoSave",
                        type: "checkbox",
                        checked: !settings.autoSave,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.autoSave ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.autoSave ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MdNotifications className="text-2xl text-[var(--primary-color)]" />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Notifications
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Configure notification preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div>
                  <h4 className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Get notified of new responses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "emailNotifications",
                        type: "checkbox",
                        checked: !settings.emailNotifications,
                      },
                    })
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.emailNotifications ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.emailNotifications ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div>
                <label
                  htmlFor="notificationEmail"
                  className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2"
                >
                  Notification Email
                </label>
                <input
                  type="email"
                  id="notificationEmail"
                  name="notificationEmail"
                  value={settings.notificationEmail}
                  onChange={handleChange}
                  disabled={!settings.emailNotifications}
                  placeholder="admin@company.com"
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MdShare className="text-2xl text-[var(--primary-color)]" />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Survey management actions
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 rounded-md font-medium transition-colors bg-[var(--info-light)] text-[var(--info-color)] hover:opacity-80 flex items-center justify-center gap-2">
                <MdPreview className="text-xl" />
                Preview Survey
              </button>

              <button className="w-full px-4 py-3 rounded-md font-medium transition-colors bg-[var(--success-light)] text-[var(--success-color)] hover:opacity-80 flex items-center justify-center gap-2">
                <MdShare className="text-xl" />
                Share Survey
              </button>

              <button className="w-full px-4 py-3 rounded-md font-medium transition-colors bg-[var(--warning-light)] text-[var(--warning-color)] hover:opacity-80 flex items-center justify-center gap-2">
                <MdArchive className="text-xl" />
                Archive Survey
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveySettings;
