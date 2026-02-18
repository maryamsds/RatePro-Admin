"use client"

import { useState, useRef, useEffect } from "react"
import { MdLanguage } from "react-icons/md"

const LanguageSelector = ({ darkMode }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ]

  const currentLang = languages.find((lang) => lang.code === currentLanguage)

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
    setIsOpen(false)
    console.log("Language changed to:", langCode)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 bg-transparent border-0 cursor-pointer
                   text-[var(--light-text)] dark:text-[var(--dark-text)] hover:opacity-80 transition-opacity"
      >
        <MdLanguage size={20} />
        <span className="hidden lg:inline">{currentLang?.flag}</span>
        <span className="hidden xl:inline">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 min-w-[180px] rounded-lg shadow-lg border z-50
                     bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                     border-[var(--light-border)] dark:border-[var(--dark-border)]"
        >
          <div className="px-3 py-2 text-xs font-semibold text-[var(--secondary-color)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            Select Language
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-0
                         text-[var(--light-text)] dark:text-[var(--dark-text)]
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         ${currentLanguage === lang.code ? "bg-[var(--primary-color)]/10 font-medium" : "bg-transparent"}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
