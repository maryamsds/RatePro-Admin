// src\components\Header\Header.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  MdMenu,
  MdLightMode,
  MdDarkMode,
  MdNotifications,
  MdClose,
  MdSearch,
  MdSettings,
  MdExitToApp,
  MdAccountCircle,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import LanguageSelector from "../LanguageSelector/LanguageSelector.jsx";
import { capitalize } from "../../utilities/capitalize";
import { notificationAPI } from "../../api/axiosInstance.js";

const Header = ({
  isMobile,
  isTablet,
  isDesktop,
  darkMode,
  toggleTheme,
  toggleSidebar,
  sidebarOpen,
  sidebarCollapsed: _sidebarCollapsed,
  screenSize: _screenSize,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationAPI.getMyNotifications({
        limit: 10,
        sort: '-createdAt'
      });
      if (response?.data?.success) {
        const notifs = response.data.data?.notifications || response.data.notifications || [];
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err?.message);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Fetch unread count separately for efficiency
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response?.data?.success) {
        setUnreadCount(response.data.count || response.data.data?.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err?.message);
      setUnreadCount(0);
    }
  }, []);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, status: 'read', read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err?.message);
    }
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read', read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err?.message);
    }
  }, []);

  // Format notification time
  const formatNotificationTime = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const notifInterval = setInterval(fetchNotifications, 30000);
    const countInterval = setInterval(fetchUnreadCount, 15000);
    return () => {
      clearInterval(notifInterval);
      clearInterval(countInterval);
    };
  }, [fetchNotifications, fetchUnreadCount]);

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

  // Icon button helper – reduces boilerplate
  const IconButton = ({ onClick, title, children, className = "" }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-0 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <nav
      className={`top-0 right-0 left-0 h-[var(--header-height)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)] transition-all duration-300 z-[1050] ${scrolled ? 'backdrop-blur-[10px]' : ''}`}
    >
      <div className="flex items-center justify-between w-full h-full px-4 ps-16">
        {/* Brand/Logo */}
        <span
          className={`mb-0 font-semibold select-none text-[var(--light-text)] dark:text-[var(--dark-text)] ${isMobile ? 'flex-none text-lg' : 'flex-1 text-xl'}`}
        >
          Rate Pro
        </span>

        {/* Search bar */}
        <div
          className={`transition-all duration-300 ${isMobile || isTablet ? (showMobileSearch ? 'flex flex-1' : 'hidden md:flex md:flex-[0_1_400px] md:max-w-[400px]') : 'flex flex-[0_1_400px] max-w-[400px]'} ${isMobile ? '' : 'ml-auto mr-4'}`}
        >
          <form onSubmit={handleSearch} className="w-full">
            <div
              className={`flex items-center rounded-xl overflow-hidden transition-shadow duration-200 ${searchFocused ? 'shadow-[0_0_0_2px_rgba(31,218,228,0.25)]' : (scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : '')}`}
            >
              <span
                className="flex items-center justify-center px-3 cursor-pointer bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                onClick={handleSearch}
              >
                <MdSearch size={18} />
              </span>
              <input
                type="text"
                placeholder={isMobile ? "Search" : "Search surveys, responses..."}
                className={`flex-1 outline-none border-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] p-2 ${isMobile ? 'text-base min-h-[44px]' : 'text-sm min-h-[38px]'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </form>
        </div>

        <div className="flex gap-2 items-center">
          {/* Mobile search toggle */}
          {(isMobile || isTablet) && !showMobileSearch && (
            <IconButton onClick={() => setShowMobileSearch(true)} title="Search" className="md:hidden">
              <MdSearch size={20} />
            </IconButton>
          )}

          {/* Close search button */}
          {(isMobile || isTablet) && showMobileSearch && (
            <IconButton onClick={() => setShowMobileSearch(false)} title="Close search">
              <MdClose size={20} />
            </IconButton>
          )}

          {/* Header controls */}
          <div className={`header-controls flex items-center ${showMobileSearch ? "hidden md:flex" : ""}`}>
            {/* Language selector */}
            <div className="language-selector mr-2 hidden lg:block">
              <LanguageSelector />
            </div>

            {/* Fullscreen toggle */}
            {isDesktop && (
              <IconButton onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                {isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
              </IconButton>
            )}

            {/* Theme toggle */}
            <IconButton onClick={toggleTheme} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
            </IconButton>

            {/* Notifications dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-full border-0 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] transition-all duration-200 relative hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] hover:scale-105"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <MdNotifications size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[var(--danger-color)] text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-50 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] max-h-[400px] overflow-y-auto animate-slideDown ${isMobile ? 'fixed top-[calc(var(--header-height)+0.5rem)] left-2 right-2 w-[calc(100vw-1rem)]' : 'w-[320px]'}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center px-3 py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="text-[var(--primary-color)] text-sm bg-transparent border-0 cursor-pointer hover:underline transition-colors duration-200"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAllAsRead(); }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification items */}
                  {loadingNotifications ? (
                    <div className="text-center py-3">
                      <span className="text-[var(--secondary-color)]">Loading...</span>
                    </div>
                  ) : notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 5).map((notif) => (
                        <button
                          key={notif._id || notif.id}
                          type="button"
                          className={`w-full text-left px-3 py-2 border-0 cursor-pointer transition-colors duration-200
                                      hover:bg-[var(--primary-light)]
                                      ${notif.status !== 'read' && !notif.read ? "bg-[var(--primary-light)]" : "bg-transparent"}`}
                          onClick={() => {
                            if (notif.status !== 'read' && !notif.read) handleMarkAsRead(notif._id || notif.id);
                            navigate(notif.link || '/app/notifications');
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <h6 className="mb-1 text-sm font-bold" style={{ color: darkMode ? "#fff" : "#000" }}>
                              {notif.title}
                            </h6>
                            {notif.priority === 'high' && (
                              <span className="bg-[var(--danger-color)] text-white text-[9px] px-1.5 py-0.5 rounded ml-2">High</span>
                            )}
                          </div>
                          <p className="mb-1 text-sm text-[var(--secondary-color)] truncate max-w-[260px]">
                            {notif.message || notif.body}
                          </p>
                          <small className="text-[var(--secondary-color)]">
                            {formatNotificationTime(notif.createdAt)}
                          </small>
                        </button>
                      ))}
                      <div className="border-t" style={{ borderColor: darkMode ? "var(--dark-border)" : "var(--light-border)" }} />
                      <Link
                        to="/app/notifications"
                        className="block text-center py-2 text-[var(--primary-color)] hover:bg-[var(--primary-light)] transition-colors duration-200 no-underline"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <MdNotifications size={32} className="text-[var(--secondary-color)] mb-2 mx-auto block" />
                      <p className="text-[var(--secondary-color)] mb-0 text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex items-center p-1 border-0 bg-transparent cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ color: darkMode ? "#fff" : "#000" }}
              >
                <div
                  className="w-9 h-9 rounded-full bg-[var(--light-bg)] dark:bg-[var(--dark-border)] flex items-center justify-center overflow-hidden"
                >
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className={`font-bold text-base ${darkMode ? "text-white" : "text-[var(--secondary-color)]"}`}>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline ml-2">
                  {capitalize(user?.name?.split(" ")[0])}
                </span>
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)",
                    border: `1px solid ${darkMode ? "var(--dark-border)" : "var(--light-border)"}`,
                    minWidth: "200px",
                    animation: "slideDown 0.2s ease-out",
                  }}
                >
                  {/* User info header */}
                  <div
                    className="px-3 py-2 border-b"
                    style={{
                      borderColor: darkMode ? "var(--dark-border)" : "var(--light-border)",
                      color: darkMode ? "#fff" : "#000",
                    }}
                  >
                    <h6 className="mb-0 font-semibold text-sm">{capitalize(user?.role)}</h6>
                    <small className="text-[var(--secondary-color)]">{user?.email}</small>
                  </div>

                  {/* Menu items */}
                  <Link
                    to="/app/profile"
                    className="flex items-center px-3 py-2.5 no-underline transition-colors duration-200 hover:bg-[var(--primary-light)]"
                    style={{ color: darkMode ? "#fff" : "#000" }}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <MdAccountCircle className="mr-2" /> Profile
                  </Link>
                  <Link
                    to="/app/settings"
                    className="flex items-center px-3 py-2.5 no-underline transition-colors duration-200 hover:bg-[var(--primary-light)]"
                    style={{ color: darkMode ? "#fff" : "#000" }}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <MdSettings className="mr-2" /> Settings
                  </Link>
                  <div
                    className="border-t"
                    style={{ borderColor: darkMode ? "var(--dark-border)" : "var(--light-border)" }}
                  />
                  <button
                    type="button"
                    className="flex items-center px-3 py-2.5 w-full text-left border-0 bg-transparent cursor-pointer
                               text-[var(--danger-color)] transition-colors duration-200 hover:bg-[var(--danger-light)]"
                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                  >
                    <MdExitToApp className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
