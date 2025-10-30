// // src\pages\Settings\BillingPlans.jsx

// "use client"

// import { useState } from "react"
// import { Container, Row, Col, Card, Button, Badge, Table, Modal } from "react-bootstrap"

// const BillingPlans = () => {
//   const [currentPlan, setCurrentPlan] = useState("pro")
//   const [billingCycle, setBillingCycle] = useState("monthly")
//   const [showUpgradeModal, setShowUpgradeModal] = useState(false)
//   const [selectedPlan, setSelectedPlan] = useState("")

//   const plans = [
//     {
//       id: "starter",
//       name: "Starter",
//       description: "Perfect for small teams getting started",
//       monthlyPrice: 29,
//       yearlyPrice: 290,
//       features: [
//         "Up to 5 surveys",
//         "100 responses per month",
//         "Basic analytics",
//         "Email support",
//         "Standard templates",
//       ],
//       limitations: ["Limited customization", "No advanced analytics"],
//     },
//     {
//       id: "pro",
//       name: "Professional",
//       description: "Ideal for growing businesses",
//       monthlyPrice: 79,
//       yearlyPrice: 790,
//       features: [
//         "Unlimited surveys",
//         "5,000 responses per month",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//         "API access",
//         "Team collaboration",
//       ],
//       popular: true,
//     },
//     {
//       id: "enterprise",
//       name: "Enterprise",
//       description: "For large organizations with advanced needs",
//       monthlyPrice: 199,
//       yearlyPrice: 1990,
//       features: [
//         "Everything in Pro",
//         "Unlimited responses",
//         "Advanced security",
//         "Dedicated support",
//         "Custom integrations",
//         "White-label solution",
//         "SLA guarantee",
//       ],
//     },
//   ]

//   const invoices = [
//     {
//       id: "INV-2024-001",
//       date: "2024-01-01",
//       amount: 79,
//       status: "Paid",
//       plan: "Professional",
//       period: "Jan 2024",
//     },
//     {
//       id: "INV-2023-012",
//       date: "2023-12-01",
//       amount: 79,
//       status: "Paid",
//       plan: "Professional",
//       period: "Dec 2023",
//     },
//     {
//       id: "INV-2023-011",
//       date: "2023-11-01",
//       amount: 79,
//       status: "Paid",
//       plan: "Professional",
//       period: "Nov 2023",
//     },
//   ]

//   const handleUpgrade = (planId) => {
//     setSelectedPlan(planId)
//     setShowUpgradeModal(true)
//   }

//   const confirmUpgrade = () => {
//     setCurrentPlan(selectedPlan)
//     setShowUpgradeModal(false)
//     // Handle actual upgrade logic here
//   }

//   const getStatusBadge = (status) => {
//     const variants = {
//       Paid: "success",
//       Pending: "warning",
//       Failed: "danger",
//       Refunded: "secondary",
//     }
//     return <Badge bg={variants[status] || "secondary"}>{status}</Badge>
//   }

//   const getPrice = (plan) => {
//     return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
//   }

//   const getPriceLabel = (plan) => {
//     if (billingCycle === "monthly") {
//       return `$${plan.monthlyPrice}/month`
//     } else {
//       const monthlySavings = plan.monthlyPrice * 12 - plan.yearlyPrice
//       return (
//         <div>
//           <div>${plan.yearlyPrice}/year</div>
//           <small className="text-success">Save ${monthlySavings}/year</small>
//         </div>
//       )
//     }
//   }

//   return (
//     <Container fluid>
//       <Row className="mb-4">
//         <Col>
//           <h1 className="h3 mb-0">Billing & Plans</h1>
//           <p className="text-muted">Manage your subscription and billing information</p>
//         </Col>
//       </Row>

//       {/* Current Plan */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="border-primary">
//             <Card.Header className="bg-primary text-white">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h5 className="mb-0">Current Plan</h5>
//                   <small>Your active subscription</small>
//                 </div>
//                 <Badge bg="light" text="dark">
//                   Active
//                 </Badge>
//               </div>
//             </Card.Header>
//             <Card.Body>
//               <Row className="align-items-center">
//                 <Col md={8}>
//                   <h4 className="mb-1">{plans.find((p) => p.id === currentPlan)?.name} Plan</h4>
//                   <p className="text-muted mb-2">{plans.find((p) => p.id === currentPlan)?.description}</p>
//                   <div className="d-flex align-items-center">
//                     <span className="h5 mb-0 me-2">${getPrice(plans.find((p) => p.id === currentPlan))}</span>
//                     <span className="text-muted">/{billingCycle === "monthly" ? "month" : "year"}</span>
//                   </div>
//                 </Col>
//                 <Col md={4} className="text-md-end">
//                   <div className="mb-2">
//                     <small className="text-muted">Next billing date</small>
//                     <div className="fw-medium">February 1, 2024</div>
//                   </div>
//                   <Button variant="outline-primary" size="sm">
//                     <i className="fas fa-edit me-2"></i>
//                     Manage Plan
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Billing Cycle Toggle */}
//       <Row className="mb-4">
//         <Col className="text-center">
//           <div className="d-inline-flex align-items-center bg-light rounded p-1">
//             <Button
//               variant={billingCycle === "monthly" ? "primary" : "light"}
//               size="sm"
//               onClick={() => setBillingCycle("monthly")}
//               className="me-1"
//             >
//               Monthly
//             </Button>
//             <Button
//               variant={billingCycle === "yearly" ? "primary" : "light"}
//               size="sm"
//               onClick={() => setBillingCycle("yearly")}
//             >
//               Yearly
//               <Badge bg="success" className="ms-2">
//                 Save 20%
//               </Badge>
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       {/* Plans */}
//       <Row className="mb-5">
//         {plans.map((plan) => (
//           <Col key={plan.id} lg={4} md={6} className="mb-4">
//             <Card
//               className={`h-100 ${plan.popular ? "border-primary" : ""} ${currentPlan === plan.id ? "bg-light" : ""}`}
//             >
//               {plan.popular && (
//                 <div className="position-absolute top-0 start-50 translate-middle">
//                   <Badge bg="primary" className="px-3 py-2">
//                     Most Popular
//                   </Badge>
//                 </div>
//               )}
//               <Card.Header className={`text-center ${plan.popular ? "bg-primary text-white" : ""}`}>
//                 <h5 className="mb-0">{plan.name}</h5>
//                 <small>{plan.description}</small>
//               </Card.Header>
//               <Card.Body className="d-flex flex-column">
//                 <div className="text-center mb-4">
//                   <div className="h2 mb-0">{getPriceLabel(plan)}</div>
//                 </div>

//                 <ul className="list-unstyled flex-grow-1">
//                   {plan.features.map((feature, index) => (
//                     <li key={index} className="mb-2">
//                       <i className="fas fa-check text-success me-2"></i>
//                       {feature}
//                     </li>
//                   ))}
//                   {plan.limitations?.map((limitation, index) => (
//                     <li key={index} className="mb-2 text-muted">
//                       <i className="fas fa-times text-muted me-2"></i>
//                       {limitation}
//                     </li>
//                   ))}
//                 </ul>

//                 <div className="mt-auto">
//                   {currentPlan === plan.id ? (
//                     <Button variant="outline-secondary" disabled className="w-100">
//                       Current Plan
//                     </Button>
//                   ) : (
//                     <Button
//                       variant={plan.popular ? "primary" : "outline-primary"}
//                       className="w-100"
//                       onClick={() => handleUpgrade(plan.id)}
//                     >
//                       {plans.findIndex((p) => p.id === currentPlan) < plans.findIndex((p) => p.id === plan.id)
//                         ? "Upgrade"
//                         : "Downgrade"}
//                     </Button>
//                   )}
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       {/* Billing History */}
//       <Row>
//         <Col>
//           <Card>
//             <Card.Header className="d-flex justify-content-between align-items-center">
//               <Card.Title className="mb-0">Billing History</Card.Title>
//               <Button variant="outline-secondary" size="sm">
//                 <i className="fas fa-download me-2"></i>
//                 Download All
//               </Button>
//             </Card.Header>
//             <Card.Body className="p-0">
//               <div className="table-responsive">
//                 <Table className="mb-0" hover>
//                   <thead className="table-light">
//                     <tr>
//                       <th>Invoice</th>
//                       <th>Date</th>
//                       <th>Plan</th>
//                       <th>Period</th>
//                       <th>Amount</th>
//                       <th>Status</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {invoices.map((invoice) => (
//                       <tr key={invoice.id}>
//                         <td className="fw-medium">{invoice.id}</td>
//                         <td>{new Date(invoice.date).toLocaleDateString()}</td>
//                         <td>{invoice.plan}</td>
//                         <td>{invoice.period}</td>
//                         <td>${invoice.amount}</td>
//                         <td>{getStatusBadge(invoice.status)}</td>
//                         <td>
//                           <div className="btn-group btn-group-sm">
//                             <Button variant="outline-primary" size="sm" title="View Invoice">
//                               <i className="fas fa-eye"></i>
//                             </Button>
//                             <Button variant="outline-secondary" size="sm" title="Download PDF">
//                               <i className="fas fa-download"></i>
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Upgrade Modal */}
//       <Modal show={showUpgradeModal} onHide={() => setShowUpgradeModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Plan Change</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>
//             Are you sure you want to change to the <strong>{plans.find((p) => p.id === selectedPlan)?.name}</strong>{" "}
//             plan?
//           </p>
//           <div className="bg-light p-3 rounded">
//             <div className="d-flex justify-content-between">
//               <span>New plan cost:</span>
//               <strong>
//                 ${getPrice(plans.find((p) => p.id === selectedPlan) || plans[0])}/
//                 {billingCycle === "monthly" ? "month" : "year"}
//               </strong>
//             </div>
//             <div className="d-flex justify-content-between">
//               <span>Billing cycle:</span>
//               <span>{billingCycle === "monthly" ? "Monthly" : "Yearly"}</span>
//             </div>
//             <div className="d-flex justify-content-between">
//               <span>Next billing date:</span>
//               <span>February 1, 2024</span>
//             </div>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowUpgradeModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={confirmUpgrade}>
//             Confirm Change
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   )
// }

// export default BillingPlans
