// src\components\Header\Header.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Navbar,
  Dropdown,
  Form,
  InputGroup,
  Button,
  Badge,
  Offcanvas,
} from "react-bootstrap";
import {
  MdMenu,
  MdLightMode,
  MdDarkMode,
  MdNotifications,
  MdPerson,
  MdClose,
  MdSearch,
  MdSettings,
  MdExitToApp,
  MdAccountCircle,
  MdMoreVert,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import LanguageSelector from "../LanguageSelector/LanguageSelector.jsx";
import { capitalize } from "../../utilities/capitalize";

const Header = ({
  isMobile,
  isTablet,
  isDesktop,
  darkMode,
  toggleTheme,
  toggleSidebar,
  sidebarOpen,
  sidebarCollapsed: _sidebarCollapsed, // Marked as unused for mobile behavior
  screenSize: _screenSize, // Kept for compatibility
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Handle scroll effect with performance optimization
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setShowMobileSearch(false);
        setSearchQuery("");
      }
    },
    [searchQuery, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Close mobile search on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowMobileSearch(false);
      }
    };

    const handleClickOutside = (e) => {
      const searchContainer = document.querySelector(".search-container");
      if (searchContainer && !searchContainer.contains(e.target)) {
        setShowMobileSearch(false);
      }
    };

    if (showMobileSearch) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMobileSearch]);

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className={`header-navbar ${scrolled ? "scrolled" : ""} ${
          darkMode ? "dark" : "light"
        }`}
        style={{
          height: "var(--header-height)",
          backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)",
          borderBottom: `1px solid ${
            darkMode ? "var(--dark-border)" : "var(--light-border)"
          }`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          zIndex: 1050,
        }}
      >
        <div className="header-content d-flex align-items-center w-100">
          {/* Mobile hamburger button - only visible on mobile (≤ 767px) */}
          {/* {isMobile && (
            <Button
              id="mobile-hamburger"
              variant="link"
              className="sidebar-toggle me-2 p-2 text-decoration-none rounded-circle"
              onClick={toggleSidebar}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-controls="mobile-sidebar"
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              style={{
                color: darkMode ? "#fff" : "#000",
                minWidth: "44px",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <MdMenu size={22} />
            </Button>
          )} */}

          {/* Brand/Logo - responsive visibility */}
          <Navbar.Brand
            className={`brand-logo mb-0`}
            style={{
              flex: isMobile ? 0 : 1,
              color: darkMode ? "#fff" : "#000",
              fontSize: isMobile ? "1.1rem" : "1.25rem",
              fontWeight: "600",

            }}
          >
            Rate Pro
          </Navbar.Brand>

          {/* Enhanced Search bar */}
          <div
            className={`search-container ${
              isMobile || isTablet
                ? showMobileSearch
                  ? "search-active d-flex"
                  : "d-none d-md-flex"
                : "d-flex"
            }`}
            style={{
              flex:
                (isMobile || isTablet) && showMobileSearch ? 1 : "0 1 400px",
              maxWidth:
                (isMobile || isTablet) && showMobileSearch ? "none" : "400px",
              marginLeft: isMobile ? "0" : "auto",
              marginRight: isMobile ? "0" : "1rem",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Form onSubmit={handleSearch} className="w-100">
              <InputGroup
                className={`search-input-group ${
                  searchFocused ? "focused" : ""
                }`}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: searchFocused
                    ? "0 0 0 2px rgba(31, 218, 228, 0.25)"
                    : scrolled
                    ? "0 2px 8px rgba(0,0,0,0.1)"
                    : "none",
                }}
              >
                <InputGroup.Text
                  className="search-icon border-end-0"
                  style={{
                    borderColor: darkMode
                      ? "var(--dark-border)"
                      : "var(--light-border)",
                    backgroundColor: darkMode
                      ? "var(--dark-card)"
                      : "var(--light-card)",
                    color: darkMode ? "var(--dark-text)" : "var(--light-text)",
                    cursor: "pointer",
                  }}
                  onClick={handleSearch}
                >
                  <MdSearch size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={
                    isMobile ? "Search" : "Search surveys, responses..."
                  }
                  className="search-input border-start-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: darkMode
                      ? "var(--dark-card)"
                      : "var(--light-card)",
                    color: darkMode ? "var(--dark-text)" : "var(--light-text)",
                    borderColor: darkMode
                      ? "var(--dark-border)"
                      : "var(--light-border)",
                    fontSize: isMobile ? "16px" : "14px", // Prevents zoom on iOS
                    minHeight: isMobile ? "44px" : "38px",
                    paddingLeft: "45px",
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </InputGroup>
            </Form>
          </div>

          <div className="d-flex gap-2">
            {/* Mobile search toggle */}
            {(isMobile || isTablet) && !showMobileSearch && (
              <Button
                variant="link"
                className="search-toggle me-2 p-2 text-decoration-none d-md-none rounded-circle"
                onClick={() => setShowMobileSearch(true)}
                title="Search"
                style={{
                  color: darkMode ? "#fff" : "#000",
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdSearch size={20} />
              </Button>
            )}

            {/* Close search button */}
            {(isMobile || isTablet) && showMobileSearch && (
              <Button
                variant="link"
                className="search-close text-decoration-none rounded-circle"
                onClick={() => setShowMobileSearch(false)}
                title="Close search"
                style={{
                  color: darkMode ? "#fff" : "#000",
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdClose size={20} />
              </Button>
            )}

            {/* Header controls */}
            <div
              className={`header-controls d-flex align-items-center ${
                showMobileSearch ? "d-none d-md-flex" : ""
              }`}
            >
              {/* Language selector - responsive visibility */}
              <div className="language-selector me-2 d-none d-lg-block">
                <LanguageSelector />
              </div>

              {/* Fullscreen toggle - desktop only */}
              {isDesktop && (
                <Button
                  variant="link"
                  className="fullscreen-toggle p-2 me-2 text-decoration-none rounded-circle"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  style={{
                    color: darkMode ? "#fff" : "#000",
                    minWidth: "40px",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4rem",
                  }}
                >
                  {isFullscreen ? (
                    <MdFullscreenExit size={18} />
                  ) : (
                    <MdFullscreen size={18} />
                  )}
                </Button>
              )}

              {/* Theme toggle - enhanced */}
              <Button
                variant="link"
                className="theme-toggle p-2 me-2 text-decoration-none rounded-circle"
                onClick={toggleTheme}
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                style={{
                  color: darkMode ? "#fff" : "#000",
                  minWidth: "40px",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {darkMode ? (
                  <MdLightMode size={18} />
                ) : (
                  <MdDarkMode size={18} />
                )}
              </Button>

              {/* Notifications dropdown - Enhanced for mobile */}
              <Dropdown
                align="end"
                className="notifications-dropdown me-2"
                show={showNotifications}
                onToggle={setShowNotifications}
              >
                <Dropdown.Toggle
                  variant="link"
                  className="notifications-toggle p-2 text-decoration-none rounded-circle position-relative"
                  style={{
                    color: darkMode ? "#fff" : "#000",
                    border: "none",
                    backgroundColor: "transparent",
                    minWidth: "40px",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdNotifications size={18} />
                  <Badge
                    bg="danger"
                    className="position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: "10px", padding: "2px 6px" }}
                  >
                    3
                  </Badge>
                </Dropdown.Toggle>{" "}
                <Dropdown.Menu
                  style={{
                    width: isMobile ? "100vw" : "320px",
                    backgroundColor: darkMode
                      ? "var(--dark-card)"
                      : "var(--light-card)",
                    borderColor: darkMode
                      ? "var(--dark-border)"
                      : "var(--light-border)",
                    boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                    marginTop: "0.5rem",
                    ...(isMobile && {
                      position: "fixed",
                      top: "var(--header-height)",
                      left: "0",
                      right: "0",
                      margin: "0",
                      borderRadius: "0",
                    }),
                  }}
                >
                  <Dropdown.Header
                    className="d-flex justify-content-between"
                    style={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    <span>Notifications</span>
                    <span className="badge bg-primary">3</span>
                  </Dropdown.Header>

                  {/* Stats Section */}
                  <div
                    className="px-3 py-2"
                    style={{
                      backgroundColor: darkMode
                        ? "var(--dark-bg)"
                        : "var(--light-bg)",
                      borderBottom: `1px solid ${
                        darkMode ? "var(--dark-border)" : "var(--light-border)"
                      }`,
                    }}
                  >
                    <div className="row text-center small">
                      <div className="col-6 border-end py-2">
                        <div className="fw-bold">24</div>
                        <div className="text-muted">Total Surveys</div>
                      </div>
                      <div className="col-6 py-2">
                        <div className="fw-bold">1,247</div>
                        <div className="text-muted">Active Responses</div>
                      </div>
                      <div className="col-6 border-end py-2">
                        <div className="fw-bold">78.5%</div>
                        <div className="text-muted">Completion Rate</div>
                      </div>
                      <div className="col-6 py-2">
                        <div className="fw-bold">3.2 min</div>
                        <div className="text-muted">Avg Response Time</div>
                      </div>
                    </div>
                  </div>

                  {/* Notification Items */}
                  <div
                    className="p-2"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    <div className="d-flex align-items-center px-2 py-1">
                      <h6
                        className="mb-0 small fw-bold"
                        style={{ color: darkMode ? "#fff" : "#000" }}
                      >
                        Recent Activity
                      </h6>
                    </div>

                    <Dropdown.Item
                      className="py-2"
                      as={Link}
                      to="/app/communication/notifications"
                      style={{ color: darkMode ? "#fff" : "#000" }}
                    >
                      <div className="d-flex">
                        <div
                          className="rounded-circle bg-success d-flex align-items-center justify-content-center me-3"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <MdNotifications className="text-white" size={16} />
                        </div>
                        <div className="flex-fill">
                          <h6
                            className="mb-1 small"
                            style={{ color: darkMode ? "#fff" : "#000" }}
                          >
                            New Response
                          </h6>
                          <p className="mb-1 small text-muted">
                            You received a new survey response
                          </p>
                          <small className="text-muted">5 mins ago</small>
                        </div>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                      className="py-2"
                      as={Link}
                      to="/app/communication/notifications"
                      style={{ color: darkMode ? "#fff" : "#000" }}
                    >
                      <div className="d-flex">
                        <div
                          className="rounded-circle bg-info d-flex align-items-center justify-content-center me-3"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <MdNotifications className="text-white" size={16} />
                        </div>
                        <div className="flex-fill">
                          <h6
                            className="mb-1 small"
                            style={{ color: darkMode ? "#fff" : "#000" }}
                          >
                            Survey Completed
                          </h6>
                          <p className="mb-1 small text-muted">
                            Customer survey reached 100 responses
                          </p>
                          <small className="text-muted">1 hour ago</small>
                        </div>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                      className="py-2"
                      style={{ color: darkMode ? "#fff" : "#000" }}
                    >
                      <div className="d-flex">
                        <div
                          className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <MdNotifications className="text-white" size={16} />
                        </div>
                        <div className="flex-fill">
                          <h6
                            className="mb-1 small"
                            style={{ color: darkMode ? "#fff" : "#000" }}
                          >
                            Low Response Rate
                          </h6>
                          <p className="mb-1 small text-muted">
                            Product feedback survey needs attention
                          </p>
                          <small className="text-muted">2 hours ago</small>
                        </div>
                      </div>
                    </Dropdown.Item>
                  </div>

                  <Dropdown.Divider
                    style={{
                      backgroundColor: darkMode
                        ? "var(--dark-border)"
                        : "var(--light-border)",
                    }}
                  />
                  <Dropdown.Item
                    as={Link}
                    to="/app/communication/notifications"
                    className="text-center"
                    style={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    See All Notifications
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* User profile dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  className="d-flex align-items-center p-1 text-decoration-none"
                  style={{
                    color: darkMode ? "#fff" : "#000",
                    border: "none",
                    backgroundColor: "transparent",
                  }}
                >
                  <div
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                  >
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt="avatar"
                        className="rounded-circle"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        className={`fw-bold ${
                          darkMode ? "text-white" : "text-secondary"
                        }`}
                        style={{ fontSize: "1rem" }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="d-none d-lg-inline ms-2">
                    {capitalize(user?.name?.split(" ")[0])}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  style={{
                    backgroundColor: darkMode
                      ? "var(--dark-card)"
                      : "var(--light-card)",
                    borderColor: darkMode
                      ? "var(--dark-border)"
                      : "var(--light-border)",
                    marginTop: "0.5rem",
                    minWidth: "200px",
                  }}
                >
                  <Dropdown.Header
                    style={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    <h6 className="mb-0">{capitalize(user?.role)}</h6>
                    <small className="text-muted">{user.email}</small>
                  </Dropdown.Header>
                  <Dropdown.Item
                    as={Link}
                    to="/app/profile"
                    className="d-flex align-items-center"
                    style={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    <MdAccountCircle className="me-2" />
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link}
                    to="/app/settings"
                    className="d-flex align-items-center"
                    style={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    <MdSettings className="me-2" />
                    Settings
                  </Dropdown.Item>
                  <Dropdown.Divider
                    style={{
                      backgroundColor: darkMode
                        ? "var(--dark-border)"
                        : "var(--light-border)",
                    }}
                  />
                  <Dropdown.Item
                    onClick={handleLogout}
                    className="d-flex align-items-center text-danger"
                  >
                    <MdExitToApp className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
