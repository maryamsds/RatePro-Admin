// // src\pages\Auth\EnterEmail.jsx

// "use client"

// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
// import { MdEmail } from "react-icons/md"

// const EnterEmail = () => {
//   const [email, setEmail] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState("")
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       setMessage("Survey invitation sent to your email!")

//       // Redirect after 2 seconds
//       setTimeout(() => {
//         navigate("/thank-you")
//       }, 2000)
//     } catch (error) {
//       setMessage("Failed to send invitation. Please try again.")
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
//                   <MdEmail className="text-white" size={30} />
//                 </div>
//                 <h1 className="h3 text-primary fw-bold mb-2">Rate Pro</h1>
//                 <p className="text-muted">Enter your email to receive survey invitation</p>
//               </div>

//               {message && (
//                 <Alert variant={message.includes("sent") ? "success" : "danger"} className="text-center">
//                   {message}
//                 </Alert>
//               )}

//               <Form onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Email Address</Form.Label>
//                   <Form.Control
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email address"
//                     required
//                   />
//                 </Form.Group>

//                 <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
//                   {loading ? "Sending..." : "Send Survey Invitation"}
//                 </Button>
//               </Form>

//               <div className="text-center">
//                 <p className="mb-0 small text-muted">You will receive an email with a link to complete the survey</p>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   )
// }

// export default EnterEmail
import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FaEnvelopeOpenText } from "react-icons/fa";
import AuthLayout from "../../layouts/AuthLayout";
import Swal from "sweetalert2"
import { forgotPassword } from "../../api/axiosInstance";

const EnterEmail = ({ onOTPSent }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      Swal.fire("✅ OTP Sent", res.data.message || "Check your email", "success")
      onOTPSent(email)
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      Swal.fire("❌ Failed", err.response?.data?.message || "Something went wrong", "error")
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email to receive a reset code"
      icon={<FaEnvelopeOpenText className="text-white" size={28} />}
    >
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default EnterEmail;

