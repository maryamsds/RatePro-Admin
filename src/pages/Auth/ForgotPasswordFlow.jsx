import { useState } from "react"
import EnterEmail from "./EnterEmail"
import EnterOTP from "./EnterOTP"
import ResetPassword from "./ResetPassword"

const ForgotPasswordFlow = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  const handleOTPSent = (userEmail) => {
    setEmail(userEmail)
    setStep(2)
  }

  const handleOTPVerified = (userEmail, userOtp) => {
    setOtp(userOtp)
    setStep(3)
  }

  if (step === 1) return <EnterEmail onOTPSent={handleOTPSent} />
  if (step === 2) return <EnterOTP email={email} onVerified={handleOTPVerified} />
  if (step === 3) return <ResetPassword email={email} otp={otp} />

  return null
}

export default ForgotPasswordFlow
