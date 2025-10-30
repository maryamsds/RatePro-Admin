// // src\pages\Auth\ForgotPassword.jsx
// "use client"

// import { useState } from "react"
// import { Link } from "react-router-dom"
// import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
// import { MdEmail, MdArrowBack, MdSend } from "react-icons/md"

// const ForgotPassword = ({ darkMode }) => {
//   const [email, setEmail] = useState("")
//   const [error, setError] = useState("")
//   const [message, setMessage] = useState("")
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       setMessage("")
//       setError("")
//       setLoading(true)
//       // Simulate password reset
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       setMessage("Check your email for further instructions")
//     } catch (error) {
//       setError("Failed to reset password")
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div
//       className="min-vh-100 d-flex align-items-center justify-content-center py-5"
//       style={{
//         backgroundColor: darkMode ? "var(--dark-bg)" : "var(--light-bg)",
//         transition: "background-color 0.3s ease",
//       }}
//     >
//       <Container>
//         <Row className="justify-content-center">
//           <Col xs={12} sm={8} md={6} lg={5} xl={4}>
//             <Card
//               className="border-0 shadow-lg card-enhanced"
//               style={{
//                 backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)",
//                 borderRadius: "1rem",
//               }}
//             >
//               <Card.Body className="p-4 p-md-5">
//                 {/* Header */}
//                 <div className="text-center mb-4">
//                   <div
//                     className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
//                     style={{ width: "64px", height: "64px" }}
//                   >
//                     <MdEmail className="text-primary" size={32} />
//                   </div>
//                   <h1 className={`h3 mb-2 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>Rate Pro</h1>
//                   <p className="text-muted mb-0">Reset your password</p>
//                 </div>

//                 {/* Alerts */}
//                 {error && (
//                   <Alert variant="danger" className="alert-enhanced mb-3">
//                     {error}
//                   </Alert>
//                 )}
//                 {message && (
//                   <Alert variant="success" className="alert-enhanced mb-3">
//                     {message}
//                   </Alert>
//                 )}

//                 {/* Form */}
//                 <Form onSubmit={handleSubmit}>
//                   <Form.Group className="mb-3">
//                     <Form.Label className={`fw-medium ${darkMode ? "text-white" : "text-dark"}`}>
//                       Email Address
//                     </Form.Label>
//                     <Form.Control
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="Enter your email address"
//                       className="form-enhanced py-2"
//                       required
//                       disabled={loading}
//                     />
//                     <Form.Text className="text-muted">We'll send you a link to reset your password.</Form.Text>
//                   </Form.Group>

//                   <Button
//                     type="submit"
//                     variant="primary"
//                     className="w-100 py-2 btn-enhanced fw-medium"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <MdSend className="me-2" />
//                         Reset Password
//                       </>
//                     )}
//                   </Button>
//                 </Form>

//                 {/* Footer */}
//                 <div className="text-center mt-4">
//                   <Link
//                     to="/login"
//                     className="text-decoration-none d-inline-flex align-items-center"
//                     style={{ color: "var(--primary-color)" }}
//                   >
//                     <MdArrowBack className="me-1" size={16} />
//                     Back to Login
//                   </Link>
//                 </div>
//               </Card.Body>
//             </Card>

//             {/* Additional Help */}
//             <div className="text-center mt-4">
//               <p className="text-muted small mb-0">
//                 Need help? Contact our{" "}
//                 <Link to="/support" className="text-decoration-none" style={{ color: "var(--primary-color)" }}>
//                   support team
//                 </Link>
//               </p>
//             </div>
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   )
// }

// export default ForgotPassword
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Form, Button, Alert } from "react-bootstrap"
import { MdEmail, MdArrowBack, MdSend } from "react-icons/md"
import AuthLayout from "../../layouts/AuthLayout"
import axiosInstance from "../../api/axiosInstance"

const ForgotPassword = ({ darkMode }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   try {
  //     setMessage("")
  //     setError("")
  //     setLoading(true)
  //     await new Promise((resolve) => setTimeout(resolve, 1000))
  //     setMessage("Check your email for further instructions")
  //   } catch (error) {
  //     setError("Failed to reset password")
  //     console.error(error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setMessage("")
      setError("")
      setLoading(true)

      const res = await axiosInstance.post("/auth/forgotpassword", { email });
      console.log("Response: ", res.data);

      // Save email in localStorage
      localStorage.setItem("resetEmail", email)

      // Redirect to Enter Reset Code page
      navigate("/enter-reset-code")

    } catch (error) {
      setError(error.response?.data.message || "Failed to reset password")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Rate Pro"
      subtitle="Reset your password"
      icon={<MdEmail className="text-white" size={32} />}
      footer={
        <div className="text-center mt-4">
          <p className="text-muted small mb-0">
            Need help? Contact our{" "}
            <Link
              to="/support"
              className="text-decoration-none"
              style={{ color: "var(--primary-color)" }}
            >
              support team
            </Link>
          </p>
        </div>
      }
    >
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-medium">Email Address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="py-2"
            required
            disabled={loading}
          />
          <Form.Text className="text-muted">
            We'll send you a link to reset your password.
          </Form.Text>
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100 py-2 fw-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Sending...
            </>
          ) : (
            <>
              <MdSend className="me-2" />
              Reset Password
            </>
          )}
        </Button>
      </Form>

      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-decoration-none d-inline-flex align-items-center"
          style={{ color: "var(--primary-color)" }}
        >
          <MdArrowBack className="me-1" size={16} />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
