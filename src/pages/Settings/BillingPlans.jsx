// src\pages\Settings\BillingPlans.jsx

import { useState } from "react"
import { MdCheck, MdClose, MdEdit, MdDownload, MdVisibility } from "react-icons/md"

const BillingPlans = () => {
  const [currentPlan, setCurrentPlan] = useState("pro")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small teams getting started",
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        "Up to 5 surveys",
        "100 responses per month",
        "Basic analytics",
        "Email support",
        "Standard templates",
      ],
      limitations: ["Limited customization", "No advanced analytics"],
    },
    {
      id: "pro",
      name: "Professional",
      description: "Ideal for growing businesses",
      monthlyPrice: 79,
      yearlyPrice: 790,
      features: [
        "Unlimited surveys",
        "5,000 responses per month",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "API access",
        "Team collaboration",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        "Everything in Pro",
        "Unlimited responses",
        "Advanced security",
        "Dedicated support",
        "Custom integrations",
        "White-label solution",
        "SLA guarantee",
      ],
    },
  ]

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-01",
      amount: 79,
      status: "Paid",
      plan: "Professional",
      period: "Jan 2024",
    },
    {
      id: "INV-2023-012",
      date: "2023-12-01",
      amount: 79,
      status: "Paid",
      plan: "Professional",
      period: "Dec 2023",
    },
    {
      id: "INV-2023-011",
      date: "2023-11-01",
      amount: 79,
      status: "Paid",
      plan: "Professional",
      period: "Nov 2023",
    },
  ]

  const handleUpgrade = (planId) => {
    setSelectedPlan(planId)
    setShowUpgradeModal(true)
  }

  const confirmUpgrade = () => {
    setCurrentPlan(selectedPlan)
    setShowUpgradeModal(false)
    // Handle actual upgrade logic here
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      Paid: "bg-[var(--success-color)]",
      Pending: "bg-[var(--warning-color)]",
      Failed: "bg-[var(--danger-color)]",
      Refunded: "bg-[var(--secondary-color)]",
    }
    return (
      <span className={`px-2 py-1 rounded text-white text-xs font-medium ${statusColors[status] || "bg-[var(--secondary-color)]"}`}>
        {status}
      </span>
    )
  }

  const getPrice = (plan) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
  }

  const getPriceLabel = (plan) => {
    if (billingCycle === "monthly") {
      return `$${plan.monthlyPrice}/month`
    } else {
      const monthlySavings = plan.monthlyPrice * 12 - plan.yearlyPrice
      return (
        <div>
          <div>${plan.yearlyPrice}/year</div>
          <div className="text-sm text-[var(--success-color)] mt-1">Save ${monthlySavings}/year</div>
        </div>
      )
    }
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Billing & Plans</h1>
        <p className="text-[var(--text-secondary)]">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <div className="mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border-2 border-[var(--primary-color)]">
          <div className="bg-[var(--primary-color)] text-white p-4 rounded-t-md">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-lg font-semibold mb-1">Current Plan</h5>
                <p className="text-sm opacity-90">Your active subscription</p>
              </div>
              <span className="px-3 py-1 rounded bg-white text-[var(--primary-color)] text-sm font-medium">
                Active
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <h4 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                  {plans.find((p) => p.id === currentPlan)?.name} Plan
                </h4>
                <p className="text-[var(--text-secondary)] mb-3">{plans.find((p) => p.id === currentPlan)?.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[var(--primary-color)]">
                    ${getPrice(plans.find((p) => p.id === currentPlan))}
                  </span>
                  <span className="text-[var(--text-secondary)]">/{billingCycle === "monthly" ? "month" : "year"}</span>
                </div>
              </div>
              <div className="md:text-right">
                <div className="mb-3">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Next billing date</p>
                  <p className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">February 1, 2024</p>
                </div>
                <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white inline-flex items-center gap-2">
                  <MdEdit />
                  Manage Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-[var(--primary-color)] text-white"
                : "text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-card)] dark:hover:bg-[var(--dark-card)]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-md font-medium transition-colors inline-flex items-center gap-2 ${
              billingCycle === "yearly"
                ? "bg-[var(--primary-color)] text-white"
                : "text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-card)] dark:hover:bg-[var(--dark-card)]"
            }`}
          >
            Yearly
            <span className="px-2 py-0.5 rounded bg-[var(--success-color)] text-white text-xs font-medium">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border-2 hover:shadow-lg transition-shadow flex flex-col ${
              plan.popular
                ? "border-[var(--primary-color)]"
                : currentPlan === plan.id
                ? "border-[var(--success-color)]"
                : "border-[var(--light-border)] dark:border-[var(--dark-border)]"
            } ${currentPlan === plan.id ? "bg-[var(--primary-light)]" : ""}`}
          >
            {plan.popular && (
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-[var(--primary-color)] text-white text-sm font-medium whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              </div>
            )}
            <div
              className={`p-4 text-center rounded-t-md ${
                plan.popular ? "bg-[var(--primary-color)] text-white" : "bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]"
              }`}
            >
              <h5 className={`text-lg font-bold mb-1 ${plan.popular ? "text-white" : "text-[var(--light-text)] dark:text-[var(--dark-text)]"}`}>
                {plan.name}
              </h5>
              <p className={`text-sm ${plan.popular ? "text-white opacity-90" : "text-[var(--text-secondary)]"}`}>{plan.description}</p>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold">{getPriceLabel(plan)}</div>
              </div>

              <ul className="space-y-3 flex-grow mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdCheck className="text-[var(--success-color)] flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdClose className="text-[var(--text-secondary)] flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-[var(--text-secondary)] text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {currentPlan === plan.id ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-md font-medium bg-[var(--secondary-color)] text-white opacity-60 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                      plan.popular
                        ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                        : "border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                    }`}
                  >
                    {plans.findIndex((p) => p.id === currentPlan) < plans.findIndex((p) => p.id === plan.id)
                      ? "Upgrade"
                      : "Downgrade"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Billing History</h3>
          <button className="px-3 py-1.5 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] inline-flex items-center gap-2 text-sm">
            <MdDownload />
            Download All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Invoice</th>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Date</th>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Plan</th>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Period</th>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Amount</th>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                >
                  <td className="p-3 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{invoice.id}</td>
                  <td className="p-3 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{invoice.plan}</td>
                  <td className="p-3 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{invoice.period}</td>
                  <td className="p-3 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">${invoice.amount}</td>
                  <td className="p-3 text-sm">{getStatusBadge(invoice.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        title="View Invoice"
                        className="p-1.5 rounded border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                      >
                        <MdVisibility size={16} />
                      </button>
                      <button
                        title="Download PDF"
                        className="p-1.5 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                      >
                        <MdDownload size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-md w-full">
            <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Confirm Plan Change</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 rounded hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
              >
                <MdClose className="text-[var(--light-text)] dark:text-[var(--dark-text)]" size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">
                Are you sure you want to change to the <strong>{plans.find((p) => p.id === selectedPlan)?.name}</strong> plan?
              </p>
              <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">New plan cost:</span>
                  <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    ${getPrice(plans.find((p) => p.id === selectedPlan) || plans[0])}/{billingCycle === "monthly" ? "month" : "year"}
                  </strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Billing cycle:</span>
                  <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {billingCycle === "monthly" ? "Monthly" : "Yearly"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Next billing date:</span>
                  <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">February 1, 2024</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)] flex justify-end gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--secondary-color)] text-white hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingPlans
