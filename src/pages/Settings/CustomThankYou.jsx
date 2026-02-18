// src\pages\Settings\CustomThankYou.jsx

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { MdCheckCircle, MdShare, MdHome } from "react-icons/md"
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa"

const CustomThankYou = () => {
  const { surveyId } = useParams()
  const [countdown, setCountdown] = useState(5)
  const [showCountdown, setShowCountdown] = useState(false)
  const [settings, setSettings] = useState({
    title: "Thank You!",
    message: "Thank you for completing our survey. Your feedback is valuable to us.",
    redirectUrl: "",
    redirectDelay: 5,
    showSocialShare: true,
  })

  // Fetch custom thank you settings for this survey
  useEffect(() => {
    // TODO: Fetch settings from API based on surveyId
    // For now using default settings
    console.log("Survey ID:", surveyId)
  }, [surveyId])

  // Countdown for redirect
  useEffect(() => {
    if (settings.redirectUrl) {
      setShowCountdown(true)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            window.location.href = settings.redirectUrl
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [settings.redirectUrl])

  const handleShare = (platform) => {
    const url = window.location.origin
    const text = encodeURIComponent("Check out this survey!")

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    }

    window.open(shareUrls[platform], "_blank", "width=600,height=400")
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen w-full bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg p-8 md:p-12 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--success-light)] flex items-center justify-center">
              <MdCheckCircle className="text-[var(--success-color)]" size={48} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">
            {settings.title}
          </h1>

          {/* Message */}
          <p className="text-center text-[var(--text-secondary)] mb-8 leading-relaxed">
            {settings.message}
          </p>

          {/* Social Share Section */}
          {settings.showSocialShare && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MdShare className="text-[var(--text-secondary)]" size={20} />
                <p className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  Share this survey
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] hover:border-[var(--primary-color)]"
                  aria-label="Share on Facebook"
                >
                  <FaFacebook className="text-[#1877F2]" size={18} />
                  <span className="text-sm">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] hover:border-[var(--primary-color)]"
                  aria-label="Share on Twitter"
                >
                  <FaTwitter className="text-[#1DA1F2]" size={18} />
                  <span className="text-sm">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] hover:border-[var(--primary-color)]"
                  aria-label="Share on LinkedIn"
                >
                  <FaLinkedin className="text-[#0A66C2]" size={18} />
                  <span className="text-sm">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] hover:border-[var(--primary-color)]"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="text-[#25D366]" size={18} />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Redirect Countdown */}
          {showCountdown && settings.redirectUrl && (
            <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
              <p className="text-sm text-center text-[var(--text-secondary)] mb-3">
                Redirecting in{" "}
                <span className="font-bold text-[var(--primary-color)]">
                  {countdown}
                </span>{" "}
                seconds...
              </p>
              
              <div className="w-full bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-color)] transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((settings.redirectDelay - countdown) / settings.redirectDelay) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] shadow-md"
            >
              <MdHome size={20} />
              <span>Back to Home</span>
            </button>

            {settings.redirectUrl && (
              <a
                href={settings.redirectUrl}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] hover:border-[var(--primary-color)]"
              >
                Continue Now
              </a>
            )}
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Your response has been recorded successfully
        </p>
      </div>
    </div>
  )
}

export default CustomThankYou