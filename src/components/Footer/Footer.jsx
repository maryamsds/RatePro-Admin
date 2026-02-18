//src\components\Footer\Footer.jsx

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]
                       bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-[var(--text-secondary)] mb-0">
          © {currentYear} Rate Pro. All Rights Reserved.
        </p>
        <p className="text-sm text-[var(--text-secondary)] mb-0">
          Made with <span className="text-[var(--primary-color)]">♥</span> by Rate Pro Team
        </p>
      </div>
    </footer>
  )
}

export default Footer
