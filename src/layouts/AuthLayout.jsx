import logo from "../images/logo.jpg"

const AuthLayout = ({ title, subtitle, children, footer }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] py-3 sm:py-4 px-3 sm:px-4">
            <div className="w-full max-w-md">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                    {/* Brand gradient bar */}
                    <div className="h-1 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)]" />
                    {/* Card Body */}
                    <div className="p-6 sm:p-8 md:p-10">
                        <div className="text-center mb-4 sm:mb-6">
                            <img
                                src={logo}
                                alt="RatePro"
                                className="h-12 w-auto mx-auto mb-3 object-contain"
                            />
                            <h1 className="text-xl sm:text-2xl md:text-3xl text-[var(--primary-color)] font-bold mb-2">{title}</h1>
                            {subtitle && <p className="text-[var(--secondary-color)] text-sm sm:text-base mb-0">{subtitle}</p>}
                        </div>
                        <div className="auth-form-content">
                            {children}
                        </div>
                        {/* Footer branding */}
                        <p className="text-center text-xs text-[var(--secondary-color)] mt-6">
                            &copy; {new Date().getFullYear()} RatePro &mdash; Soft Desk Solutions
                        </p>
                    </div>
                    {/* Card Footer */}
                    {footer && (
                        <div className="text-center py-3 text-sm sm:text-base border-t border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--secondary-color)]">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
