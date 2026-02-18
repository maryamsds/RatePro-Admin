// src/components/modals/EmailModal.jsx
import { useEffect, useRef } from "react";

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-sm`

const EmailModal = ({
    show,
    onClose,
    onSend,
    subject,
    setSubject,
    message,
    setMessage,
    recipientEmail,
    sending,
}) => {
    const overlayRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        if (show) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
            <div className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden
                        bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Send Email</h5>
                    <button
                        onClick={onClose}
                        className="text-2xl leading-none text-[var(--secondary-color)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]
                         bg-transparent border-0 cursor-pointer p-1"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            Email Subject
                        </label>
                        <input
                            type="text"
                            placeholder="Enter subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            Email Message
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Write your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={`${inputClass} resize-y`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-5 py-3.5 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <button
                        onClick={onSend}
                        disabled={sending}
                        className="px-5 py-2 text-sm font-medium rounded-lg
                         bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailModal;
