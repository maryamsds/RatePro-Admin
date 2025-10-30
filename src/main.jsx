// src\main.jsx
import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "./index.css"
import { AuthProvider } from "./context/AuthContext.jsx"
import { BrowserRouter } from "react-router-dom"
import { I18nextProvider } from "react-i18next";
import i18n from "./utilities/i18n.js";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  </React.StrictMode>
)