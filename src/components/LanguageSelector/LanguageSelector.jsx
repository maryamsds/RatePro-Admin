"use client"

import { useState } from "react"
import { Dropdown } from "react-bootstrap"
import { MdLanguage } from "react-icons/md"

const LanguageSelector = ({ darkMode }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en")

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
    console.log("Language changed to:", langCode)
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="link"
        className="d-flex align-items-center p-2 text-decoration-none"
        style={{ color: "inherit", border: "none" }}
      >
        <MdLanguage className="me-1" size={20} />
        <span className="d-none d-lg-inline me-1">{currentLang?.flag}</span>
        <span className="d-none d-xl-inline">{currentLang?.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)",
          borderColor: darkMode ? "var(--dark-border)" : "var(--light-border)",
          marginTop: "0.5rem",
          minWidth: "180px",
        }}
      >
        <Dropdown.Header style={{ color: darkMode ? "#fff" : "#000" }}>Select Language</Dropdown.Header>
        {languages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`d-flex align-items-center ${currentLanguage === lang.code ? "active" : ""}`}
            style={{ color: darkMode ? "#fff" : "#000" }}
          >
            <span className="me-2">{lang.flag}</span>
            <span>{lang.name}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default LanguageSelector
