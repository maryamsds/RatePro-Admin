// // src\pages\Auth\Signup.jsx

// "use client"

// import { useState } from "react"
// import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
// import { useNavigate, Link } from "react-router-dom"
// import { FaEye, FaEyeSlash } from "react-icons/fa"

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     company: "",
//     agreeToTerms: false,
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const navigate = useNavigate()

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match")
//       setLoading(false)
//       return
//     }

//     if (!formData.agreeToTerms) {
//       setError("Please agree to the terms and conditions")
//       setLoading(false)
//       return
//     }

//     try {
//       // Simulate signup
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       navigate("/dashboard")
//     } catch (err) {
//       setError("Signup failed. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//       <Row className="w-100 justify-content-center">
//         <Col xs={12} sm={10} md={8} lg={6} xl={4}>
//           <Card className="shadow">
//             <Card.Body className="p-4">
//               <div className="text-center mb-4">
//                 <h2 className="h4 mb-1">Create Account</h2>
//                 <p className="text-muted">Join RatePro and start creating surveys</p>
//               </div>

//               {error && <Alert variant="danger">{error}</Alert>}

//               <Form onSubmit={handleSubmit}>
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>First Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="firstName"
//                         placeholder="Enter first name"
//                         value={formData.firstName}
//                         onChange={handleChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Last Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="lastName"
//                         placeholder="Enter last name"
//                         value={formData.lastName}
//                         onChange={handleChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Email Address</Form.Label>
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Company (Optional)</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="company"
//                     placeholder="Enter company name"
//                     value={formData.company}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Password</Form.Label>
//                   <div className="position-relative">
//                     <Form.Control
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       placeholder="Create a password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       style={{
//                         position: "absolute",
//                         top: "50%",
//                         right: "18px",
//                         transform: "translateY(-50%)",
//                         cursor: "pointer",
//                         color: "#6c757d",
//                         fontSize: "1.1rem"
//                       }}
//                     >
//                       {showPassword ? <FaEyeSlash /> : <FaEye />}
//                     </span>
//                   </div>
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Confirm Password</Form.Label>
//                   <div className="position-relative">
//                     <Form.Control
//                       type={showPassword ? "text" : "password"}
//                       name="confirmPassword"
//                       placeholder="Confirm your password"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       required
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       style={{
//                         position: "absolute",
//                         top: "50%",
//                         right: "18px",
//                         transform: "translateY(-50%)",
//                         cursor: "pointer",
//                         color: "#6c757d",
//                         fontSize: "1.1rem"
//                       }}
//                     >
//                       {showPassword ? <FaEyeSlash /> : <FaEye />}
//                     </span>
//                   </div>
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Check
//                     type="checkbox"
//                     name="agreeToTerms"
//                     label="I agree to the Terms of Service and Privacy Policy"
//                     checked={formData.agreeToTerms}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>

//                 <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
//                   {loading ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                       Creating account...
//                     </>
//                   ) : (
//                     "Create Account"
//                   )}
//                 </Button>
//               </Form>
//             </Card.Body>
//             <Card.Footer className="text-center py-3">
//               <span className="text-muted">Already have an account? </span>
//               <Link to="/login" className="text-decoration-none">
//                 Sign in
//               </Link>
//             </Card.Footer>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   )
// }

// export default Signup

"use client"

import { useState } from "react"
import { Form, Button, Alert, Card } from "react-bootstrap"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa"
import AuthLayout from "../../layouts/AuthLayout"
import axiosInstance from "../../api/axiosInstance"

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError("")

  //   if (formData.password !== formData.confirmPassword) {
  //     setError("Passwords do not match")
  //     setLoading(false)
  //     return
  //   }

  //   if (!formData.agreeToTerms) {
  //     setError("Please agree to the terms and conditions")
  //     setLoading(false)
  //     return
  //   }

  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1000))
  //     navigate("/dashboard")
  //   } catch (err) {
  //     setError("Signup failed. Please try again.")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
  
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      setLoading(false)
      return
    }
  
    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        // role: "user"  // optional, backend default 'user' rakha hua hai
      }
  
      const res = await axiosInstance.post("/auth/register", userData)
  
      // Optional: show success message
      alert("Account created successfully. Check your email for verification.")
  
      // Redirect to login
      navigate("/login")
  
    } catch (err) {
      setError(err.response?.data.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }  

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join RatePro and start creating surveys"
      icon={<FaUserPlus className="text-white" size={28} />}
      footer={
        <>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="text-decoration-none">Sign in</Link>
        </>
      }>
      <Card.Body className="p-4 p-sm-5">
        <div className="text-center mb-4">
          <h2 className="h4 mb-1">Create Account</h2>
          <p className="text-muted">Join RatePro and start creating surveys</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company (Optional)</Form.Label>
            <Form.Control type="text" name="company" value={formData.company} onChange={handleChange} />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3 position-relative">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)} style={toggleStyle}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-3 position-relative">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)} style={toggleStyle}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="agreeToTerms"
              label="I agree to the Terms of Service and Privacy Policy"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>
      </Card.Body>
    </AuthLayout>
  )
}

const toggleStyle = {
  position: "absolute",
  top: "50%",
  right: "18px",
  transform: "translateY(-50%)",
  cursor: "pointer",
  color: "#6c757d",
  fontSize: "1.1rem",
}

export default Signup
