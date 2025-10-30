// src\components\Layout\Layout.jsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { Container } from "react-bootstrap"
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
      isMobile: width <= 767, // Changed to match requirement: ≤ 767px
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width
    }
    
    setScreenSize(prevSize => {
      // Only update if values actually changed
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
      // Mobile: Sidebar is overlay, closed by default
      setSidebarOpen(false)
    } else if (screenSize.isTablet) {
      // Tablet: Sidebar is collapsed by default, but visible
      setSidebarCollapsed(true)
      setSidebarOpen(true) // Always "open" but in collapsed state
    } else {
      // Desktop: Load saved collapsed state
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        setSidebarCollapsed(JSON.parse(savedState))
      } else {
        // Auto-collapse on smaller desktop screens
        setSidebarCollapsed(screenSize.width < 1200)
      }
      setSidebarOpen(true) // Always open on desktop
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
    // console.log('toggleSidebar called:', { screenSize, sidebarOpen }); // Debug log
    if (screenSize.isMobile) {
      setSidebarOpen(prev => !prev)
    } else {
      setSidebarCollapsed(prev => !prev)
    }
  }, [screenSize, sidebarOpen])

  const closeSidebar = useCallback(() => {
    // console.log('closeSidebar called:', { screenSize, sidebarOpen }); // Debug log
    if (screenSize.isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarCollapsed(true)
    }
  }, [screenSize, sidebarOpen])

  // Enhanced content styling with better responsive behavior
  const getContentStyle = useCallback(() => {
    const baseStyle = {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      minHeight: "100vh",
      position: "relative"
    }

    if (screenSize.isMobile) {
      return {
        ...baseStyle,
        marginLeft: 0,
        width: "100%",
        padding: "0"
      }
    }

    if (screenSize.isTablet) {
      // Tablet: Always account for collapsed sidebar
      return {
        ...baseStyle,
        // marginLeft: "var(--sidebar-collapsed-width, 0px)",
        width: "calc(100% - var(--sidebar-collapsed-width, 70px))",
        padding: "0 8px"
      }
    }

    // Desktop
    // const sidebarWidth = sidebarCollapsed ? "var(--sidebar-collapsed-width, 70px)" : "var(--sidebar-width, 280px)"
    // return {
    //   ...baseStyle,
    //   marginLeft: sidebarWidth,
    //   width: `calc(100% - ${sidebarWidth})`,
    //   padding: "0"
    // }
  }, [screenSize.isMobile, screenSize.isTablet])

  // Get container padding based on screen size
  const getContainerPadding = useCallback(() => {
    if (screenSize.isMobile) return "p-2 p-sm-3"
    if (screenSize.isTablet) return "p-3 p-md-4"
    return "p-3 p-lg-4"
  }, [screenSize.isMobile, screenSize.isTablet])

  return (
    <div className={`layout-container ${darkMode ? "dark" : "light"}`}>
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

      <div className="content-wrapper" style={getContentStyle()}>
        <Header
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          {...screenSize}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          screenSize={screenSize}
        />

        <main className="main-content">
          <Container 
            fluid 
            className={`main-container ${getContainerPadding()}`}
            style={{ 
              marginTop: "var(--header-height)",
              minHeight: `calc(100vh - var(--header-height))`
            }}
          >
            <div className="content-area">
              <Outlet />
            </div>
          </Container>
        </main>
      </div>

      {/* Mobile overlay - only for screens ≤ 767px */}
      {screenSize.isMobile && sidebarOpen && (
        <div
          id="sidebar-overlay"
          className="sidebar-overlay"
          onClick={closeSidebar}
          onTouchStart={(e) => {
            e.preventDefault();
            closeSidebar();
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
        />
      )}

      {/* Loading state for better UX */}
      {!isInitialized && (
        <div className="layout-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout