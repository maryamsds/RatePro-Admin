// src\pages\NotFound\NotFound.jsx

import { Link } from "react-router-dom"
import { MdErrorOutline } from "react-icons/md"

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-6">
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg p-8 border border-[var(--light-border)] dark:border-[var(--dark-border)] max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--warning-color)]/10 dark:bg-[var(--warning-color)]/20 flex items-center justify-center mx-auto mb-6">
          <MdErrorOutline className="text-5xl text-[var(--warning-color)]" />
        </div>
        <h1 className="text-6xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">404</h1>
        <p className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Page Not Found</p>
        <p className="text-[var(--text-secondary)] mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/app"
          className="inline-block px-6 py-3 rounded-md font-medium bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
