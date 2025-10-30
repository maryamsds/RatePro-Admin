//src\components\Footer\Footer.jsx

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="d-footer p-3 border-top">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <p className="mb-0">© {currentYear} Rate Pro. All Rights Reserved.</p>
        <p className="mb-0">
          Made with <span className="text-primary">♥</span> by Rate Pro Team
        </p>
      </div>
    </footer>
  )
}

export default Footer
