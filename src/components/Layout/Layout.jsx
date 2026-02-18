// src\components\Layout\Layout.jsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar/Sidebar.jsx"
import Header from "../Header/Header.jsx"

const Layout = ({ darkMode, toggleTheme }) => {
  // Responsive breakpoints
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Enhanced responsive detection
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth
    const newScreenSize = {
      isMobile: width <= 767,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width
    }

    setScreenSize(prevSize => {
      if (prevSize.isMobile !== newScreenSize.isMobile ||
        prevSize.isTablet !== newScreenSize.isTablet ||
        prevSize.isDesktop !== newScreenSize.isDesktop) {
        return newScreenSize
      }
      return prevSize
    })
  }, [])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (screenSize.isMobile) {
          setSidebarOpen(false)
        } else if (!sidebarCollapsed) {
          setSidebarCollapsed(true)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screenSize.isMobile, sidebarCollapsed])

  // Initialize and handle responsive behavior
  useEffect(() => {
    updateScreenSize()
    setIsInitialized(true)

    const handleResize = () => {
      updateScreenSize()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateScreenSize])

  // Handle sidebar state based on screen size
  useEffect(() => {
    if (!isInitialized) return

    if (screenSize.isMobile) {
      // On mobile, sidebar should NEVER be collapsed (always show full menu when open)
      setSidebarCollapsed(false)
      setSidebarOpen(false)
    } else if (screenSize.isTablet) {
      setSidebarCollapsed(true)
      setSidebarOpen(true)
    } else {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        setSidebarCollapsed(JSON.parse(savedState))
      } else {
        setSidebarCollapsed(screenSize.width < 1200)
      }
      setSidebarOpen(true)
    }
  }, [screenSize.isMobile, screenSize.isTablet, screenSize.width, isInitialized])

  // Save sidebar collapsed state to localStorage (desktop only)
  useEffect(() => {
    if (screenSize.isDesktop) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed, screenSize.isDesktop])

  // Enhanced sidebar control functions
  const toggleSidebar = useCallback(() => {
    if (screenSize.isMobile) {
      setSidebarOpen(prev => !prev)
    } else {
      setSidebarCollapsed(prev => !prev)
    }
  }, [screenSize])

  const closeSidebar = useCallback(() => {
    if (screenSize.isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarCollapsed(true)
    }
  }, [screenSize])

  return (
    <div className={`flex min-h-screen w-full bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] ${darkMode ? "dark" : ""}`}>
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={screenSize.isMobile}
        isTablet={screenSize.isTablet}
        isDesktop={screenSize.isDesktop}
        collapsed={sidebarCollapsed}
        darkMode={darkMode}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        screenSize={screenSize}
      />

      <div 
        className={`
          flex flex-col w-full min-h-screen relative
          transition-all duration-300
          ${screenSize.isMobile 
            ? 'ml-0' 
            : screenSize.isTablet 
              ? 'ml-[var(--sidebar-collapsed-width)]' 
              : sidebarCollapsed 
                ? 'ml-[var(--sidebar-collapsed-width)]' 
                : 'ml-[var(--sidebar-width)]'
          }
        `}
      >
        <Header
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          isMobile={screenSize.isMobile}
          isTablet={screenSize.isTablet}
          isDesktop={screenSize.isDesktop}
          width={screenSize.width}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          screenSize={screenSize}
        />

        <main className="flex-1 w-full">
          <div
            className={`
              w-full
              mt-[var(--header-height)]
              min-h-[calc(100vh-var(--header-height))]
              p-[var(--container-padding-mobile)]
              md:p-[var(--container-padding-tablet)]
              lg:p-[var(--container-padding-desktop)]
            `}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay - only for screens ≤ 767px */}
      {screenSize.isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
          onTouchStart={(e) => {
            e.preventDefault()
            closeSidebar()
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
        />
      )}

      {/* Loading state */}
      {!isInitialized && (
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] z-50">
          <div 
            className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" 
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout