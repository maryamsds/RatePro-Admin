const AuthLayout = ({ title, subtitle, icon, children, footer }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] py-3 sm:py-4 px-3 sm:px-4">
            <div className="w-full max-w-md">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    {/* Card Body */}
                    <div className="p-6 sm:p-8 md:p-10">
                        <div className="text-center mb-4 sm:mb-6">
                            <div
                                className="w-[50px] h-[50px] rounded-full bg-[var(--primary-color)] flex items-center justify-center mx-auto mb-3"
                            >
                                <div className="text-2xl sm:text-3xl text-white">
                                    {icon}
                                </div>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl text-[var(--primary-color)] font-bold mb-2">{title}</h1>
                            {subtitle && <p className="text-[var(--secondary-color)] text-sm sm:text-base mb-0">{subtitle}</p>}
                        </div>
                        <div className="auth-form-content">
                            {children}
                        </div>
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
