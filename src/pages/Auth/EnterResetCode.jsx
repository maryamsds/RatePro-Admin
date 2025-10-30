// // src\pages\Auth\EnterResetCode.jsx


// "use client"

// import { useState } from "react"
// import { useNavigate, Link } from "react-router-dom"
// import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
// import { MdVpnKey } from "react-icons/md"

// const EnterResetCode = () => {
//   const [code, setCode] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       if (code === "123456") {
//         navigate("/reset-password")
//       } else {
//         setError("Invalid reset code. Please try again.")
//       }
//     } catch (error) {
//       setError("Failed to verify code. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resendCode = async () => {
//     setLoading(true)
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       alert("Reset code sent to your email!")
//     } catch (error) {
//       setError("Failed to resend code. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//       <Row className="w-100 justify-content-center">
//         <Col xs={12} sm={8} md={6} lg={4}>
//           <Card className="shadow-lg border-0">
//             <Card.Body className="p-4">
//               <div className="text-center mb-4">
//                 <div
//                   className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
//                   style={{ width: "60px", height: "60px" }}
//                 >
//                   <MdVpnKey className="text-white" size={30} />
//                 </div>
//                 <h1 className="h3 text-primary fw-bold mb-2">Enter Reset Code</h1>
//                 <p className="text-muted">We've sent a 6-digit code to your email</p>
//               </div>

//               {error && <Alert variant="danger">{error}</Alert>}

//               <Form onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Reset Code</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={code}
//                     onChange={(e) => setCode(e.target.value)}
//                     placeholder="Enter 6-digit code"
//                     maxLength={6}
//                     className="text-center fs-4 letter-spacing-2"
//                     required
//                   />
//                   <Form.Text className="text-muted">Enter the 6-digit code sent to your email</Form.Text>
//                 </Form.Group>

//                 <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
//                   {loading ? "Verifying..." : "Verify Code"}
//                 </Button>
//               </Form>

//               <div className="text-center">
//                 <p className="mb-2">
//                   Didn't receive the code?{" "}
//                   <Button variant="link" className="p-0 text-primary" onClick={resendCode} disabled={loading}>
//                     Resend Code
//                   </Button>
//                 </p>
//                 <Link to="/forgot-password" className="text-muted text-decoration-none small">
//                   Back to Forgot Password
//                 </Link>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   )
// }

// export default EnterResetCode
"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { MdVpnKey } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

const EnterResetCode = () => {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const email = localStorage.getItem("resetEmail")
      const otp = code.toString()
      
      console.log("Sending data", { email, otp });
      
      const res = await axiosInstance.post("/auth/verify-reset-code", {
        email,
        otp
      })
      
      // ✅ Save verified OTP for reset-password
      localStorage.setItem("resetOTP", code.toString());
      
      localStorage.setItem("isResetVerified", "true")
      navigate("/reset-password")
    } catch (error) {
      setError(error.response?.data.message || "Invalid reset code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Reset code sent to your email!")
    } catch {
      setError("Failed to resend code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 px-3">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "64px", height: "64px" }}
                >
                  <MdVpnKey className="text-white" size={32} />
                </div>
                <h1 className="h4 text-primary fw-bold mb-1">Enter Reset Code</h1>
                <p className="text-muted mb-0">We've sent a 6-digit code to your email</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="resetCode">Reset Code</Form.Label>
                  <Form.Control
                    id="resetCode"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center fs-4 letter-spacing-2"
                    required
                    autoFocus
                  />
                  <Form.Text className="text-muted">Check your inbox for the code</Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-2 small">
                  Didn’t receive the code?{" "}
                  <Button
                    variant="link"
                    className="p-0 text-primary fw-medium"
                    onClick={resendCode}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                </p>
                <Link to="/forgot-password" className="text-muted text-decoration-none small">
                  Back to Forgot Password
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default EnterResetCode