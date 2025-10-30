// // src\pages\Auth\CompanyRegistration.jsx

// "use client"

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from "react-bootstrap"
// import { MdBusiness, MdPerson, MdCreditCard } from "react-icons/md"

// const CompanyRegistration = () => {
//   const [activeTab, setActiveTab] = useState("company")
//   const [formData, setFormData] = useState({
//     // Company Info
//     companyName: "",
//     companyEmail: "",
//     companyPhone: "",
//     companyWebsite: "",
//     companySize: "",
//     industry: "",
//     country: "",

//     // Admin User Info
//     firstName: "",
//     lastName: "",
//     adminEmail: "",
//     password: "",
//     confirmPassword: "",

//     // Subscription Plan
//     plan: "free",
//     paymentMethod: "",
//   })
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     try {
//       // Validate passwords match
//       if (formData.password !== formData.confirmPassword) {
//         setError("Passwords do not match")
//         return
//       }

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 2000))

//       // Redirect to dashboard
//       navigate("/app")
//     } catch (error) {
//       setError("Registration failed. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const plans = [
//     {
//       id: "free",
//       name: "Free Plan",
//       price: "$0/month",
//       features: ["1 Survey", "100 Responses", "Basic Analytics", "Email Support"],
//       popular: false,
//     },
//     {
//       id: "basic",
//       name: "Basic Plan",
//       price: "$29/month",
//       features: ["10 Surveys", "1,000 Responses", "Advanced Analytics", "Priority Support"],
//       popular: true,
//     },
//     {
//       id: "pro",
//       name: "Pro Plan",
//       price: "$99/month",
//       features: ["Unlimited Surveys", "10,000 Responses", "Custom Branding", "API Access"],
//       popular: false,
//     },
//   ]

//   return (
//     <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
//       <Row className="w-100 justify-content-center">
//         <Col xs={12} lg={10} xl={8}>
//           <Card className="shadow-lg border-0">
//             <Card.Body className="p-0">
//               <div className="text-center p-4 border-bottom">
//                 <h1 className="h3 text-primary fw-bold mb-2">Rate Pro</h1>
//                 <p className="text-muted">Register your company to start creating surveys</p>
//               </div>

//               {error && (
//                 <Alert variant="danger" className="m-4 mb-0">
//                   {error}
//                 </Alert>
//               )}

//               <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
//                 <Nav variant="tabs" className="px-4 pt-4">
//                   <Nav.Item>
//                     <Nav.Link eventKey="company" className="d-flex align-items-center">
//                       <MdBusiness className="me-2" />
//                       Company Info
//                     </Nav.Link>
//                   </Nav.Item>
//                   <Nav.Item>
//                     <Nav.Link eventKey="admin" className="d-flex align-items-center">
//                       <MdPerson className="me-2" />
//                       Admin User
//                     </Nav.Link>
//                   </Nav.Item>
//                   <Nav.Item>
//                     <Nav.Link eventKey="plan" className="d-flex align-items-center">
//                       <MdCreditCard className="me-2" />
//                       Choose Plan
//                     </Nav.Link>
//                   </Nav.Item>
//                 </Nav>

//                 <div className="p-4">
//                   <Form onSubmit={handleSubmit}>
//                     <Tab.Content>
//                       {/* Company Information */}
//                       <Tab.Pane eventKey="company">
//                         <Row>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Company Name *</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 value={formData.companyName}
//                                 onChange={(e) => handleChange("companyName", e.target.value)}
//                                 required
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Company Email *</Form.Label>
//                               <Form.Control
//                                 type="email"
//                                 value={formData.companyEmail}
//                                 onChange={(e) => handleChange("companyEmail", e.target.value)}
//                                 required
//                               />
//                             </Form.Group>
//                           </Col>
//                         </Row>

//                         <Row>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Phone Number</Form.Label>
//                               <Form.Control
//                                 type="tel"
//                                 value={formData.companyPhone}
//                                 onChange={(e) => handleChange("companyPhone", e.target.value)}
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Website</Form.Label>
//                               <Form.Control
//                                 type="url"
//                                 value={formData.companyWebsite}
//                                 onChange={(e) => handleChange("companyWebsite", e.target.value)}
//                                 placeholder="https://example.com"
//                               />
//                             </Form.Group>
//                           </Col>
//                         </Row>

//                         <Row>
//                           <Col md={4}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Company Size</Form.Label>
//                               <Form.Select
//                                 value={formData.companySize}
//                                 onChange={(e) => handleChange("companySize", e.target.value)}
//                               >
//                                 <option value="">Select size</option>
//                                 <option value="1-10">1-10 employees</option>
//                                 <option value="11-50">11-50 employees</option>
//                                 <option value="51-200">51-200 employees</option>
//                                 <option value="201-500">201-500 employees</option>
//                                 <option value="500+">500+ employees</option>
//                               </Form.Select>
//                             </Form.Group>
//                           </Col>
//                           <Col md={4}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Industry</Form.Label>
//                               <Form.Select
//                                 value={formData.industry}
//                                 onChange={(e) => handleChange("industry", e.target.value)}
//                               >
//                                 <option value="">Select industry</option>
//                                 <option value="technology">Technology</option>
//                                 <option value="healthcare">Healthcare</option>
//                                 <option value="finance">Finance</option>
//                                 <option value="education">Education</option>
//                                 <option value="retail">Retail</option>
//                                 <option value="manufacturing">Manufacturing</option>
//                                 <option value="other">Other</option>
//                               </Form.Select>
//                             </Form.Group>
//                           </Col>
//                           <Col md={4}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Country</Form.Label>
//                               <Form.Select
//                                 value={formData.country}
//                                 onChange={(e) => handleChange("country", e.target.value)}
//                               >
//                                 <option value="">Select country</option>
//                                 <option value="US">United States</option>
//                                 <option value="UK">United Kingdom</option>
//                                 <option value="CA">Canada</option>
//                                 <option value="AU">Australia</option>
//                                 <option value="DE">Germany</option>
//                                 <option value="FR">France</option>
//                                 <option value="other">Other</option>
//                               </Form.Select>
//                             </Form.Group>
//                           </Col>
//                         </Row>

//                         <div className="d-flex justify-content-end">
//                           <Button variant="primary" onClick={() => setActiveTab("admin")}>
//                             Next: Admin User
//                           </Button>
//                         </div>
//                       </Tab.Pane>

//                       {/* Admin User */}
//                       <Tab.Pane eventKey="admin">
//                         <Row>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>First Name *</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 value={formData.firstName}
//                                 onChange={(e) => handleChange("firstName", e.target.value)}
//                                 required
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Last Name *</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 value={formData.lastName}
//                                 onChange={(e) => handleChange("lastName", e.target.value)}
//                                 required
//                               />
//                             </Form.Group>
//                           </Col>
//                         </Row>

//                         <Form.Group className="mb-3">
//                           <Form.Label>Admin Email *</Form.Label>
//                           <Form.Control
//                             type="email"
//                             value={formData.adminEmail}
//                             onChange={(e) => handleChange("adminEmail", e.target.value)}
//                             required
//                           />
//                         </Form.Group>

//                         <Row>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Password *</Form.Label>
//                               <Form.Control
//                                 type="password"
//                                 value={formData.password}
//                                 onChange={(e) => handleChange("password", e.target.value)}
//                                 required
//                               />
//                             </Form.Group>
//                           </Col>
//                           <Col md={6}>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Confirm Password *</Form.Label>
//                               <Form.Control
//                                 type="password"
//                                 value={formData.confirmPassword}
//                                 onChange={(e) => handleChange("confirmPassword", e.target.value)}
//                                 required
//                               />
//                             </Form.Group>
//                           </Col>
//                         </Row>

//                         <div className="d-flex justify-content-between">
//                           <Button variant="outline-secondary" onClick={() => setActiveTab("company")}>
//                             Previous
//                           </Button>
//                           <Button variant="primary" onClick={() => setActiveTab("plan")}>
//                             Next: Choose Plan
//                           </Button>
//                         </div>
//                       </Tab.Pane>

//                       {/* Choose Plan */}
//                       <Tab.Pane eventKey="plan">
//                         <Row className="g-3 mb-4">
//                           {plans.map((plan) => (
//                             <Col key={plan.id} md={4}>
//                               <Card
//                                 className={`h-100 cursor-pointer ${formData.plan === plan.id ? "border-primary" : ""} ${plan.popular ? "border-warning" : ""}`}
//                                 onClick={() => handleChange("plan", plan.id)}
//                               >
//                                 {plan.popular && (
//                                   <div className="bg-warning text-dark text-center py-1 small fw-bold">
//                                     Most Popular
//                                   </div>
//                                 )}
//                                 <Card.Body className="text-center">
//                                   <h5>{plan.name}</h5>
//                                   <h3 className="text-primary">{plan.price}</h3>
//                                   <ul className="list-unstyled mt-3">
//                                     {plan.features.map((feature, index) => (
//                                       <li key={index} className="mb-2">
//                                         ✓ {feature}
//                                       </li>
//                                     ))}
//                                   </ul>
//                                   <Form.Check
//                                     type="radio"
//                                     name="plan"
//                                     checked={formData.plan === plan.id}
//                                     onChange={() => handleChange("plan", plan.id)}
//                                     className="mt-3"
//                                   />
//                                 </Card.Body>
//                               </Card>
//                             </Col>
//                           ))}
//                         </Row>

//                         {formData.plan !== "free" && (
//                           <Card className="mb-4">
//                             <Card.Header>
//                               <h6 className="mb-0">Payment Information</h6>
//                             </Card.Header>
//                             <Card.Body>
//                               <Form.Group className="mb-3">
//                                 <Form.Label>Payment Method</Form.Label>
//                                 <Form.Select
//                                   value={formData.paymentMethod}
//                                   onChange={(e) => handleChange("paymentMethod", e.target.value)}
//                                 >
//                                   <option value="">Select payment method</option>
//                                   <option value="credit_card">Credit Card</option>
//                                   <option value="paypal">PayPal</option>
//                                   <option value="bank_transfer">Bank Transfer</option>
//                                 </Form.Select>
//                               </Form.Group>
//                             </Card.Body>
//                           </Card>
//                         )}

//                         <div className="d-flex justify-content-between">
//                           <Button variant="outline-secondary" onClick={() => setActiveTab("admin")}>
//                             Previous
//                           </Button>
//                           <Button type="submit" variant="success" disabled={loading}>
//                             {loading ? "Creating Account..." : "Complete Registration"}
//                           </Button>
//                         </div>
//                       </Tab.Pane>
//                     </Tab.Content>
//                   </Form>
//                 </div>
//               </Tab.Container>

//               <div className="text-center p-4 border-top">
//                 <p className="mb-0">
//                   Already have an account?{" "}
//                   <Link to="/login" className="text-primary text-decoration-none">
//                     Sign in
//                   </Link>
//                 </p>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   )
// }

// export default CompanyRegistration


// src\pages\Auth\CompanyRegistration.jsx

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from "react-bootstrap"
import { MdBusiness, MdPerson, MdCreditCard } from "react-icons/md"

const CompanyRegistration = () => {
  const [activeTab, setActiveTab] = useState("company")
  const [formData, setFormData] = useState({
    // Company Info
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    country: "",

    // Admin User Info
    firstName: "",
    lastName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",

    // Subscription Plan
    plan: "free",
    paymentMethod: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to dashboard
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

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 px-3">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={11} lg={10} xl={8}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-0">
              {/* Header */}
              <div className="text-center p-4 border-bottom">
                <h1 className="h4 text-primary fw-bold mb-1">Rate Pro</h1>
                <p className="text-muted mb-0">Register your company to start creating surveys</p>
              </div>

              {error && (
                <Alert variant="danger" className="m-4 mb-0">{error}</Alert>
              )}

              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="px-4 pt-3 flex-wrap">
                  {[
                    { key: "company", label: "Company Info", icon: <MdBusiness className="me-2" /> },
                    { key: "admin", label: "Admin User", icon: <MdPerson className="me-2" /> },
                    { key: "plan", label: "Choose Plan", icon: <MdCreditCard className="me-2" /> },
                  ].map(({ key, label, icon }) => (
                    <Nav.Item key={key}>
                      <Nav.Link eventKey={key} className="d-flex align-items-center">
                        {icon}{label}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>

                <div className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Tab.Content>
                      {/* Company Tab */}
                      <Tab.Pane eventKey="company">
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Company Name *</Form.Label>
                              <Form.Control
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => handleChange("companyName", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Company Email *</Form.Label>
                              <Form.Control
                                type="email"
                                value={formData.companyEmail}
                                onChange={(e) => handleChange("companyEmail", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                value={formData.companyPhone}
                                onChange={(e) => handleChange("companyPhone", e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Website</Form.Label>
                              <Form.Control
                                type="url"
                                value={formData.companyWebsite}
                                onChange={(e) => handleChange("companyWebsite", e.target.value)}
                                placeholder="https://example.com"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Company Size</Form.Label>
                              <Form.Select
                                value={formData.companySize}
                                onChange={(e) => handleChange("companySize", e.target.value)}
                              >
                                <option value="">Select size</option>
                                <option value="1-10">1-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-500">201-500</option>
                                <option value="500+">500+</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Industry</Form.Label>
                              <Form.Select
                                value={formData.industry}
                                onChange={(e) => handleChange("industry", e.target.value)}
                              >
                                <option value="">Select industry</option>
                                <option value="technology">Technology</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="finance">Finance</option>
                                <option value="education">Education</option>
                                <option value="retail">Retail</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="other">Other</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Country</Form.Label>
                              <Form.Select
                                value={formData.country}
                                onChange={(e) => handleChange("country", e.target.value)}
                              >
                                <option value="">Select country</option>
                                <option value="US">US</option>
                                <option value="UK">UK</option>
                                <option value="CA">Canada</option>
                                <option value="AU">Australia</option>
                                <option value="DE">Germany</option>
                                <option value="FR">France</option>
                                <option value="other">Other</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-end mt-3">
                          <Button variant="primary" onClick={() => setActiveTab("admin")}>
                            Next: Admin User
                          </Button>
                        </div>
                      </Tab.Pane>

                      {/* Admin Tab */}
                      <Tab.Pane eventKey="admin">
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>First Name *</Form.Label>
                              <Form.Control
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Last Name *</Form.Label>
                              <Form.Control
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Admin Email *</Form.Label>
                              <Form.Control
                                type="email"
                                value={formData.adminEmail}
                                onChange={(e) => handleChange("adminEmail", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Password *</Form.Label>
                              <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Confirm Password *</Form.Label>
                              <Form.Control
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-between mt-3">
                          <Button variant="outline-secondary" onClick={() => setActiveTab("company")}>
                            Previous
                          </Button>
                          <Button variant="primary" onClick={() => setActiveTab("plan")}>
                            Next: Choose Plan
                          </Button>
                        </div>
                      </Tab.Pane>

                      {/* Plan Tab */}
                      <Tab.Pane eventKey="plan">
                        <Row className="g-3 mb-3">
                          {plans.map(plan => (
                            <Col key={plan.id} md={4}>
                              <Card
                                className={`h-100 cursor-pointer border ${formData.plan === plan.id ? "border-primary" : ""} ${plan.popular ? "border-warning" : ""}`}
                                onClick={() => handleChange("plan", plan.id)}
                              >
                                {plan.popular && (
                                  <div className="bg-warning text-dark text-center py-1 small fw-bold">
                                    Most Popular
                                  </div>
                                )}
                                <Card.Body className="text-center">
                                  <h5>{plan.name}</h5>
                                  <h3 className="text-primary">{plan.price}</h3>
                                  <ul className="list-unstyled mt-3 mb-0">
                                    {plan.features.map((f, i) => (
                                      <li key={i} className="mb-2">✓ {f}</li>
                                    ))}
                                  </ul>
                                  <Form.Check
                                    type="radio"
                                    name="plan"
                                    checked={formData.plan === plan.id}
                                    className="mt-3"
                                    onChange={() => handleChange("plan", plan.id)}
                                  />
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>

                        {formData.plan !== "free" && (
                          <Card className="mb-4">
                            <Card.Header><h6 className="mb-0">Payment Information</h6></Card.Header>
                            <Card.Body>
                              <Form.Group>
                                <Form.Label>Payment Method</Form.Label>
                                <Form.Select
                                  value={formData.paymentMethod}
                                  onChange={(e) => handleChange("paymentMethod", e.target.value)}
                                >
                                  <option value="">Select payment method</option>
                                  <option value="credit_card">Credit Card</option>
                                  <option value="paypal">PayPal</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                </Form.Select>
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        )}

                        <div className="d-flex justify-content-between">
                          <Button variant="outline-secondary" onClick={() => setActiveTab("admin")}>
                            Previous
                          </Button>
                          <Button type="submit" variant="success" disabled={loading}>
                            {loading ? "Creating Account..." : "Complete Registration"}
                          </Button>
                        </div>
                      </Tab.Pane>
                    </Tab.Content>
                  </Form>
                </div>
              </Tab.Container>

              <div className="text-center p-4 border-top">
                <p className="mb-0">Already have an account?{" "}
                  <Link to="/login" className="text-primary text-decoration-none">Sign in</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CompanyRegistration