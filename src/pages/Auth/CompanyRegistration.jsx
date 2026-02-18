// src\pages\Auth\CompanyRegistration.jsx
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MdBusiness, MdPerson, MdCreditCard } from "react-icons/md"
import useDropdownOptions from "../../hooks/useDropdownOptions"

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base`

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]"

const selectClass = `${inputClass} appearance-auto`

const CompanyRegistration = () => {
  const [activeTab, setActiveTab] = useState("company")
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    country: "",
    firstName: "",
    lastName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
    plan: "free",
    paymentMethod: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { options: industryOptions, loading: industriesLoading } = useDropdownOptions('industry')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
      navigate("/app")
    } catch (error) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: "$0/month",
      features: ["1 Survey", "100 Responses", "Basic Analytics", "Email Support"],
      popular: false,
    },
    {
      id: "basic",
      name: "Basic Plan",
      price: "$29/month",
      features: ["10 Surveys", "1,000 Responses", "Advanced Analytics", "Priority Support"],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "$99/month",
      features: ["Unlimited Surveys", "10,000 Responses", "Custom Branding", "API Access"],
      popular: false,
    },
  ]

  const tabs = [
    { key: "company", label: "Company Info", icon: <MdBusiness className="mr-2" /> },
    { key: "admin", label: "Admin User", icon: <MdPerson className="mr-2" /> },
    { key: "plan", label: "Choose Plan", icon: <MdCreditCard className="mr-2" /> },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-4 px-3
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] transition-colors duration-300">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl shadow-lg border-0 overflow-hidden
                        bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
          {/* Header */}
          <div className="text-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h1 className="text-xl font-bold mb-1 text-[var(--primary-color)]">Rate Pro</h1>
            <p className="text-[var(--secondary-color)] text-sm mb-0">Register your company to start creating surveys</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap border-b border-[var(--light-border)] dark:border-[var(--dark-border)] px-4 pt-3">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200
                  ${activeTab === key
                    ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                    : "border-transparent text-[var(--secondary-color)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]"
                  }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              {/* Company Tab */}
              {activeTab === "company" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company Name *</label>
                      <input type="text" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Company Email *</label>
                      <input type="email" value={formData.companyEmail} onChange={(e) => handleChange("companyEmail", e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" value={formData.companyPhone} onChange={(e) => handleChange("companyPhone", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Website</label>
                      <input type="url" value={formData.companyWebsite} onChange={(e) => handleChange("companyWebsite", e.target.value)} placeholder="https://example.com" className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className={labelClass}>Company Size</label>
                      <select value={formData.companySize} onChange={(e) => handleChange("companySize", e.target.value)} className={selectClass}>
                        <option value="">Select size</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Industry</label>
                      <select value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)} disabled={industriesLoading} className={selectClass}>
                        <option value="">{industriesLoading ? 'Loading...' : 'Select industry'}</option>
                        {industryOptions.map(opt => (
                          <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <select value={formData.country} onChange={(e) => handleChange("country", e.target.value)} className={selectClass}>
                        <option value="">Select country</option>
                        <option value="US">US</option>
                        <option value="UK">UK</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button type="button" onClick={() => setActiveTab("admin")}
                      className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all duration-200">
                      Next: Admin User
                    </button>
                  </div>
                </>
              )}

              {/* Admin Tab */}
              {activeTab === "admin" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input type="text" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input type="text" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} required className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Admin Email *</label>
                    <input type="email" value={formData.adminEmail} onChange={(e) => handleChange("adminEmail", e.target.value)} required className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={labelClass}>Password *</label>
                      <input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm Password *</label>
                      <input type="password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required className={inputClass} />
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button type="button" onClick={() => setActiveTab("company")}
                      className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                      Previous
                    </button>
                    <button type="button" onClick={() => setActiveTab("plan")}
                      className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all duration-200">
                      Next: Choose Plan
                    </button>
                  </div>
                </>
              )}

              {/* Plan Tab */}
              {activeTab === "plan" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {plans.map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => handleChange("plan", plan.id)}
                        className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 relative
                          bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                          ${formData.plan === plan.id
                            ? "border-[var(--primary-color)] shadow-md"
                            : "border-[var(--light-border)] dark:border-[var(--dark-border)] hover:border-[var(--primary-color)]/50"
                          }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-0.5 rounded-full">
                            Most Popular
                          </div>
                        )}
                        <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mt-1">{plan.name}</h5>
                        <h3 className="text-2xl font-bold text-[var(--primary-color)] my-2">{plan.price}</h3>
                        <ul className="list-none p-0 mt-3 mb-0 space-y-2 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {plan.features.map((f, i) => (
                            <li key={i}>✓ {f}</li>
                          ))}
                        </ul>
                        <input
                          type="radio"
                          name="plan"
                          checked={formData.plan === plan.id}
                          onChange={() => handleChange("plan", plan.id)}
                          className="mt-3 w-4 h-4 text-[var(--primary-color)]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Payment section */}
                  {formData.plan !== "free" && (
                    <div className="mb-4 rounded-xl border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <h6 className="font-medium text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] mb-0">Payment Information</h6>
                      </div>
                      <div className="p-4">
                        <label className={labelClass}>Payment Method</label>
                        <select value={formData.paymentMethod} onChange={(e) => handleChange("paymentMethod", e.target.value)} className={selectClass}>
                          <option value="">Select payment method</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="paypal">PayPal</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setActiveTab("admin")}
                      className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                      Previous
                    </button>
                    <button type="submit" disabled={loading}
                      className="px-6 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white
                                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? "Creating Account..." : "Complete Registration"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="text-center p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <p className="mb-0 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
              Already have an account?{" "}
              <Link to="/login" className="text-[var(--primary-color)] hover:underline no-underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyRegistration