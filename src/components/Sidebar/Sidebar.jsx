// src\components\Sidebar\Sidebar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
// react-bootstrap removed — using native HTML + Tailwind
import {
  MdDashboard,
  MdAssignment,
  MdAddCircleOutline,
  MdPeople,
  MdInsertChart,
  MdSettings,
  MdExpandMore,
  MdExpandLess,
  MdMenu,
  MdClose,
  MdOutlineDashboardCustomize,
  MdSecurity,
  MdGroup,
  MdVpnKey,
  MdEmail,
  MdNotifications,
  MdSupport,
  MdSchedule,
  MdApi,
  MdSegment,
  MdTrendingUp,
  MdSync,
  MdDescription,
  MdPersonAdd,
  MdManageAccounts,
  MdQuestionAnswer,
  MdAnalytics,
  MdShare,
  MdOutlineSettingsApplications,
  MdViewList,
  MdLogin,
  MdLock,
  MdVisibility,
  MdList,
  MdBarChart,
  MdShowChart,
  MdPayment,
  MdColorLens,
  MdMailOutline,
  MdBusiness,
  MdPersonOutline,
  MdAssignmentInd,
  MdContacts,
  MdThumbUp,
  MdCode,
  MdCampaign,
  MdTask,
  MdPsychology,
  MdMessage,
  MdSms,
  MdFeedback,
  MdMonetizationOn,
  MdOutlineCardGiftcard,
  MdCreditCard, // Add this
  MdReceipt // Add this
} from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import SupportTickets from "../../pages/Support/SupportTickets";

const Sidebar = ({
  darkMode,
  isOpen,
  isMobile,
  isTablet,
  collapsed,
  onClose,
  onToggle,
}) => {
  // Add this state
  const [subscriptionSubmenuOpen, setSubscriptionSubmenuOpen] = useState(false);

  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const [authSubmenuOpen, setAuthSubmenuOpen] = useState(false);
  const [surveySubmenuOpen, setSurveySubmenuOpen] = useState(false);
  const [userSubmenuOpen, setUserSubmenuOpen] = useState(false);
  const [accessSubmenuOpen, setAccessSubmenuOpen] = useState(false);
  const [analyticsSubmenuOpen, setAnalyticsSubmenuOpen] = useState(false);
  const [audienceSubmenuOpen, setAudienceSubmenuOpen] = useState(false);
  const [communicationSubmenuOpen, setCommunicationSubmenuOpen] =
    useState(false);
  const [settingsSubmenuOpen, setSettingsSubmenuOpen] = useState(false);
  const [incentivesSubmenuOpen, setIncentivesSubmenuOpen] = useState(false);
  const [contentmanagement, setcontentmanagement] = useState(false);
  const [supportTickets, setSupportTickets] = useState(false);

  const [_hoveredItem, setHoveredItem] = useState(null);
  const [collapsedDropdownOpen, setCollapsedDropdownOpen] = useState(null);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const sidebarRef = useRef();

  // Reset submenu states when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
      setSupportTickets(false);
      setSubscriptionSubmenuOpen(false);
      setCollapsedDropdownOpen(null);
    }
  }, [collapsed]);

  // Auto-open submenu if current route matches
  useEffect(() => {
    const currentPath = location.pathname;

    // Check which submenu should be open based on current path
    if (
      currentPath.startsWith("/login") ||
      currentPath.startsWith("/signup") ||
      currentPath.startsWith("/company-registration") ||
      currentPath.startsWith("/forgot-password") ||
      currentPath.startsWith("/reset-password") ||
      currentPath.startsWith("/enter-email") ||
      currentPath.startsWith("/enter-reset-code")
    ) {
      setAuthSubmenuOpen(true);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
      setSupportTickets(false);
      setSubscriptionSubmenuOpen(false);
    } else if (currentPath.startsWith("/surveys")) {
      setSurveySubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/users") || currentPath === "/profile") {
      setUserSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/access")) {
      setAccessSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/analytics")) {
      setAnalyticsSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/audiences")) {
      setAudienceSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/communication")) {
      setCommunicationSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/incentives")) {
      setIncentivesSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setcontentmanagement(false);
      setSupportTickets(false);
    } else if (currentPath.startsWith("/app/support")) {
      setSupportTickets(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
    } else if (currentPath.startsWith("/settings")) {
      setSettingsSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
      setSupportTickets(false);
      setSubscriptionSubmenuOpen(false);
    } else if (currentPath.startsWith("/app/subscription")) {
      setSubscriptionSubmenuOpen(true);
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
      setSupportTickets(false);
    } else {
      // Close all submenus for single pages
      setAuthSubmenuOpen(false);
      setSurveySubmenuOpen(false);
      setUserSubmenuOpen(false);
      setAccessSubmenuOpen(false);
      setAnalyticsSubmenuOpen(false);
      setAudienceSubmenuOpen(false);
      setCommunicationSubmenuOpen(false);
      setSettingsSubmenuOpen(false);
      setIncentivesSubmenuOpen(false);
      setcontentmanagement(false);
      setSupportTickets(false);
      setSubscriptionSubmenuOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
        //  &&
        // (((isMobile || isTablet) && isOpen) || (!isMobile && !isTablet && !collapsed && isOpen))
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isTablet, isOpen, onClose, collapsed]);

  // Focus management for mobile - accessibility enhancement
  useEffect(() => {
    // console.log('Sidebar state changed:', { isMobile, isOpen, collapsed }); // Debug log
    if (isMobile && isOpen) {
      // When sidebar opens on mobile, focus the close button
      const closeButton = sidebarRef.current?.querySelector('.mobile-close-button');
      if (closeButton) {
        closeButton.focus();
      }

      // Prevent body scrolling when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
      document.body.classList.add('sidebar-open');
    } else if (isMobile && !isOpen) {
      // When sidebar closes on mobile, restore body scroll and focus hamburger button
      document.body.style.overflow = '';
      document.body.classList.remove('sidebar-open');

      // Return focus to hamburger button
      const hamburgerButton = document.getElementById('mobile-hamburger');
      if (hamburgerButton) {
        hamburgerButton.focus();
      }
    }

    // Cleanup on unmount
    return () => {
      if (isMobile) {
        document.body.style.overflow = '';
        document.body.classList.remove('sidebar-open');
      }
    };
  }, [isMobile, isOpen, collapsed]);

  // Keyboard event handler for mobile accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isMobile && isOpen) {
        // Close sidebar on Escape key
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }

        // Trap focus within sidebar on mobile
        if (event.key === 'Tab' && sidebarRef.current) {
          const focusableElements = sidebarRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen, onClose]);

  const toggleSubmenu = (submenu) => {
    switch (submenu) {
      case "auth":
        setAuthSubmenuOpen(!authSubmenuOpen);
        break;
      case "survey":
        setSurveySubmenuOpen(!surveySubmenuOpen);
        break;
      case "user":
        setUserSubmenuOpen(!userSubmenuOpen);
        break;
      case "access":
        setAccessSubmenuOpen(!accessSubmenuOpen);
        break;
      case "analytics":
        setAnalyticsSubmenuOpen(!analyticsSubmenuOpen);
        break;
      case "audience":
        setAudienceSubmenuOpen(!audienceSubmenuOpen);
        break;
      case "communication":
        setCommunicationSubmenuOpen(!communicationSubmenuOpen);
        break;
      case "incentives":
        setIncentivesSubmenuOpen(!incentivesSubmenuOpen);
        break;
      case "settings":
        setSettingsSubmenuOpen(!settingsSubmenuOpen);
        break;
      case "content":
        setcontentmanagement(!contentmanagement);
        break;
      case "support":
        setSupportTickets(!supportTickets);
        break;
      case "subscription":
        setSubscriptionSubmenuOpen(!subscriptionSubmenuOpen);
        break;
    }
  };

  const hasAccess = (item, user, hasPermission) => {
    const role = user?.role?.toLowerCase();

    // 🔹 Direct role check
    if (item.roles && item.roles.map((r) => r.toLowerCase()).includes(role)) {
      return true;
    }

    // 🔹 Permission based check
    if (item.permissions) {
      if (item.permissions.some((p) => hasPermission(p))) {
        return true;
      }
    }

    // 🔹 Submenu items check (agar parent khud match nahi karta)
    if (item.submenuItems && item.submenuItems.length > 0) {
      const anySubItemVisible = item.submenuItems.some((sub) =>
        hasAccess(sub, user, hasPermission)
      );
      if (anySubItemVisible) return true;
    }

    return false;
  };

  const handleCollapsedDropdownClick = (itemName) => {
    if (collapsed) {
      setCollapsedDropdownOpen(
        collapsedDropdownOpen === itemName ? null : itemName
      );
    }
  };

  const handleCollapsedDropdownHover = (itemName) => {
    if (collapsed) {
      setCollapsedDropdownOpen(itemName);
    }
  };

  const handleCollapsedDropdownLeave = () => {
    if (collapsed) {
      setTimeout(() => {
        setCollapsedDropdownOpen(null);
      }, 300);
    }
  };

  // Mobile touch handlers for better UX
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setIsScrolling(false);
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const deltaY = Math.abs(touchY - touchStartY);
    if (deltaY > 10) {
      setIsScrolling(true);
    }
  };

  const handleItemClick = (path, hasSubmenu = false) => {
    if (!isScrolling) {
      if (!hasSubmenu && (isMobile || isTablet)) {
        onClose();
      }
    }
  };

  // CRITICAL: On mobile, sidebar should NEVER be collapsed
  // This ensures menu items and close button are always visible
  const effectiveCollapsed = isMobile ? false : collapsed;

  const navItems = [
    // Platform Dashboard - System Admin Only
    {
      path: "/app/platform",
      name: "Platform Overview",
      icon: <MdDashboard />,
      roles: ["admin"],
    },
    {
      path: "/app/platform/profile-updates",
      name: "Profile Requests",
      icon: <MdBusiness />,
      roles: ["admin"],
    },
    // Tenant Dashboard - Company Admin & Members
    {
      path: "/app",
      name: "Dashboard",
      icon: <MdOutlineDashboardCustomize />,
      roles: ["companyAdmin", "member"],
    },
    {
      name: "Survey Management",
      icon: <MdAssignment />,
      submenu: true,
      isOpen: surveySubmenuOpen,
      roles: ["admin", "companyAdmin"],
      toggle: () => toggleSubmenu("survey"),
      permissions: [
        "survey:create",
        "survey:read",
        "survey:update",
        "survey:delete",
        "survey:templates",
        "survey:schedule",
        "survey:responses:view",
        "survey:analytics:view",
        "survey:customize",
        "survey:share",
        "survey:settings:update",
        "survey:detail:view",
      ],
      submenuItems: [
        {
          path: "/app/surveys",
          name: "All Surveys",
          icon: <MdViewList />,
          roles: ["companyAdmin"],
          permissions: ["survey:read"]
        },
        {
          path: "/app/surveys/create",
          name: "Create Survey",
          icon: <MdAddCircleOutline />,
          roles: ["companyAdmin"],
          permissions: ["survey:create"]
        },
        {
          path: "/app/templates",
          name: "Survey Templates",
          icon: <MdDescription />,
          roles: ["admin", "companyAdmin"],
          permissions: ["survey:templates"]
        },
        {
          path: "/app/surveys/settings",
          name: "Survey Settings",
          icon: <MdSettings />,
          roles: ["companyAdmin"],
          permissions: ["survey:settings:update"],
        },
      ],
    },
    {
      name: "User Management",
      icon: <MdGroup />,
      submenu: true,
      isOpen: userSubmenuOpen,
      roles: ["companyAdmin", "admin"],
      toggle: () => toggleSubmenu("user"),
      permissions: [
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "user:toggle",
        "user:export",
        "user:notify",
      ],
      submenuItems: [
        {
          path: "/app/users",
          name: "All Users",
          icon: <MdPeople />,
          roles: ["companyAdmin", "admin"],
          permissions: [
            "user:create",
            "user:read",
            "user:update",
            "user:delete",
            "user:toggle",
            "user:export",
            "user:notify",
          ],
        },
        {
          path: "/app/users/create",
          name: "Create User",
          icon: <MdPersonAdd />,
          roles: ["companyAdmin", "admin"],
          permissions: ["user:create", "user:update"],
        },
      ],
    },
    {
      path: "/app/access",
      name: "Access Management",
      icon: <MdSecurity />,
      roles: ["companyAdmin"],
    },
    {
      path: "/app/roles",
      name: "Role Management",
      icon: <MdManageAccounts />,
      roles: ["companyAdmin"],
      permissions: ["role:create", "role:read", "role:update", "role:delete"],
    },
    {
      path: "/app/actions",
      name: "Action Management",
      icon: <MdTask />,
      roles: ["companyAdmin"],
    },
    {
      name: "Analytics & Reports",
      icon: <MdInsertChart />,
      submenu: true,
      isOpen: analyticsSubmenuOpen,
      toggle: () => toggleSubmenu("analytics"),
      roles: ["companyAdmin"],
      permissions: [
        "analytics:view",
        "analytics:realtime",
        "analytics:trends",
        "analytics:custom",
        "analytics:responses",
      ],
      submenuItems: [
        {
          path: "/app/analytics",
          name: "Analytics Overview",
          icon: <MdInsertChart />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/analytics/dashboard",
          name: "Executive Dashboard",
          icon: <MdAnalytics />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/analytics/feedback",
          name: "Feedback Analysis",
          icon: <MdFeedback />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/analytics/real-time",
          name: "Real-Time Results",
          icon: <MdSync />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/analytics/trends",
          name: "Trend Analysis",
          icon: <MdTrendingUp />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/analytics/custom-reports",
          name: "Custom Reports",
          icon: <MdBarChart />,
          roles: ["companyAdmin"],
        },
      ],
    },
    {
      name: "Communication",
      icon: <MdMessage />,
      submenu: true,
      isOpen: communicationSubmenuOpen,
      toggle: () => toggleSubmenu("communication"),
      roles: ["admin"],
      permissions: [
        "communication:whatsapp",
        "communication:sms",
        "communication:email",
      ],
      submenuItems: [
        {
          path: "/app/settings/email-templates",
          name: "Email Templates",
          icon: <MdMailOutline />,
          roles: ["admin"],
        },
        {
          path: "/app/communication/whatsapp",
          name: "WhatsApp Settings",
          icon: <IoLogoWhatsapp />,
          roles: ["admin"],
        },
      ],
    },
    {
      name: "Audience Management",
      icon: <MdPeople />,
      submenu: true,
      isOpen: audienceSubmenuOpen,
      roles: ["companyAdmin"],
      toggle: () => toggleSubmenu("audience"),
      permissions: ["audience:view", "audience:segment", "audience:contacts"],
      submenuItems: [
        {
          path: "/app/audiences",
          name: "All Audiences",
          icon: <MdPeople />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/audiences/category",
          name: "Audience Category",
          icon: <MdSegment />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/audiences/contacts",
          name: "Contact Management",
          icon: <MdContacts />,
          roles: ["companyAdmin"],
        },
      ],
    },
    {
      name: "Subscription",
      icon: <MdCreditCard />,
      submenu: true,
      isOpen: subscriptionSubmenuOpen,
      roles: ["admin", "companyAdmin"],
      toggle: () => toggleSubmenu("subscription"),
      submenuItems: [
        // Company Admin pages
        {
          path: "/app/subscription/my-plan",
          name: "My Plan",
          icon: <MdReceipt />,
          roles: ["companyAdmin"]
        },
        {
          path: "/app/subscription/usage",
          name: "Usage Dashboard",
          icon: <MdBarChart />,
          roles: ["companyAdmin"]
        },
        // Super Admin pages
        {
          path: "/app/subscription/features",
          name: "Feature Definitions",
          icon: <MdSettings />,
          roles: ["admin"]
        },
        {
          path: "/app/subscription/plans",
          name: "Plan Templates",
          icon: <MdCreditCard />,
          roles: ["admin"]
        },
        {
          path: "/app/subscription/tenants",
          name: "Tenant Subscriptions",
          icon: <MdBusiness />,
          roles: ["admin"]
        }
      ]
    },
    {
      name: "Support Tickets",
      icon: <MdSupport />,
      toggle: () => toggleSubmenu("support"),
      submenu: true,
      isOpen: supportTickets,
      roles: ["admin", "companyAdmin", "member"],
      permissions: ["support:view", "support:create"],
      submenuItems: [
        {
          path: "/app/support",
          name: "View Tickets",
          icon: <MdSupport />,
          roles: ["admin", "companyAdmin", "member"],
          permissions: ["support:view"],
        },
        {
          path: "/app/support/create",
          name: "Create Ticket",
          icon: <MdAddCircleOutline />,
          roles: ["companyAdmin", "member"],
          permissions: ["support:create"],
        },
      ],
    },
    {
      name: "Settings",
      icon: <MdSettings />,
      submenu: true,
      isOpen: settingsSubmenuOpen,
      roles: ["admin"],
      toggle: () => toggleSubmenu("settings"),
      permissions: ["settings:general"],
      submenuItems: [
        {
          path: "/app/settings",
          name: "General Settings",
          icon: <MdSettings />,
          roles: ["admin"],
          permissions: ["settings:general"],
        },
        // {
        //   path: "/app/settings/notifications",
        //   name: "Notification Settings",
        //   icon: <MdNotifications />,
        //   roles: ["admin"],
        // },
        {
          path: "/app/settings/smtp",
          name: "SMTP Configuration",
          icon: <MdEmail />,
          roles: ["admin"],
        },
        {
          path: "/app/settings/theme",
          name: "Theme Settings",
          icon: <MdColorLens />,
          roles: ["admin"],
        },
        {
          path: "/app/settings/dropdowns",
          name: "Dropdown Settings",
          icon: <MdList />,
          roles: ["admin"], // System Admin only
        },
      ],
    },
    {
      path: "/app/profile",
      name: "Profile",
      icon: <MdPersonOutline />,
      roles: ["admin", "companyAdmin", "member"],
    },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Toggle Button - Shows when sidebar is closed on mobile (kept for backward compatibility) */}
      {isMobile && !isOpen && (
        <button
          className="fixed top-1 left-4 z-[1060] flex items-center justify-center w-11 h-11 rounded-lg border-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] shadow-md transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] cursor-pointer"
          onClick={onToggle}
          aria-label="Open sidebar"
        >
          <MdMenu size={24} />
        </button>
      )}

      <aside
        id="mobile-sidebar"
        ref={sidebarRef}
        className={`fixed top-0 h-screen bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-r border-[var(--light-border)] dark:border-[var(--dark-border)] shadow-[var(--shadow-md)] overflow-y-auto overflow-x-hidden flex flex-col z-[1050] transition-all duration-300 ease-in-out
          ${effectiveCollapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]'}
          ${isMobile ? (isOpen ? 'left-0 w-full max-w-[320px]' : '-left-full') : 'left-0'}
          ${isTablet && !effectiveCollapsed ? 'w-[var(--sidebar-width)]' : ''}
        `}
        role={isMobile ? "dialog" : undefined}
        aria-modal={isMobile ? "true" : undefined}
        aria-label={isMobile ? "Navigation menu" : undefined}
        aria-labelledby={isMobile ? undefined : "sidebar-nav"}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Header with mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex-shrink-0 h-[var(--header-height)]">
          {!effectiveCollapsed && <h4 className="text-xl font-bold text-[var(--primary-color)] m-0">Rate Pro</h4>}

          {/* Mobile close button - only shows when sidebar is open on mobile */}
          {isMobile && isOpen ? (
            <button
              type="button"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-lg border-0 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] mobile-close-button"
              onClick={onClose}
              aria-label="Close navigation menu"
              tabIndex={0}
              autoFocus
            >
              <MdClose size={24} />
            </button>
          ) : !isMobile ? (
            /* Desktop/tablet toggle button */
            <button
              type="button"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-lg border-0 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)]"
              onClick={() => onToggle(!effectiveCollapsed)}
              aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              tabIndex={0}
            >
              {effectiveCollapsed ? (
                <MdMenu size={isMobile ? 20 : 24} />
              ) : (
                <MdClose size={isMobile ? 20 : 24} />
              )}
            </button>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-2">
          {navItems
            .filter((item) => hasAccess(item, user, hasPermission))
            .map((item, index) => (
              <div key={index} className="mb-1 relative">
                {item.submenu ? (
                  <>
                    <button
                      className={`flex items-center w-full min-h-[44px] p-3 rounded-lg border-0 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] hover:translate-x-0.5 font-medium relative group ${effectiveCollapsed ? 'justify-center' : ''}`}
                      onClick={
                        effectiveCollapsed
                          ? () => handleCollapsedDropdownClick(item.name)
                          : item.toggle
                      }
                      onMouseEnter={() => {
                        setHoveredItem(item.name);
                        if (effectiveCollapsed && !isMobile)
                          handleCollapsedDropdownHover(item.name);
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null);
                        if (effectiveCollapsed && !isMobile)
                          handleCollapsedDropdownLeave();
                      }}
                      aria-expanded={item.isOpen}
                      aria-controls={`submenu-${item.name}`}
                    >
                      <span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 ${!effectiveCollapsed ? 'mr-3' : ''}`}>{item.icon}</span>
                      {!effectiveCollapsed && (
                        <>
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                          <span
                            className={`ml-auto transition-transform duration-200 ${item.isOpen ? 'rotate-180' : ''}`}
                          >
                            <MdExpandMore />
                          </span>
                        </>
                      )}
                      {effectiveCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 rounded-lg bg-[var(--dark-card)] text-[var(--dark-text)] text-sm whitespace-nowrap z-[1050] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg pointer-events-none">{item.name}</div>
                      )}
                    </button>

                    {/* Collapsed Dropdown */}
                    {effectiveCollapsed &&
                      collapsedDropdownOpen === item.name &&
                      !isMobile && (
                        <div
                          className="absolute left-full top-0 ml-2 min-w-[220px] max-w-[280px] bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg shadow-lg overflow-hidden z-[1050] animate-slideIn"
                          onMouseEnter={() =>
                            setCollapsedDropdownOpen(item.name)
                          }
                          onMouseLeave={() => setCollapsedDropdownOpen(null)}
                        >
                          <div className="px-4 py-3 bg-[var(--primary-light)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)] font-semibold text-[var(--primary-color)] text-sm">
                            {item.name}
                          </div>

                          {item.submenuItems
                            .filter((subItem) =>
                              hasAccess(subItem, user, hasPermission)
                            )
                            .map((subItem, subIndex) => (
                              <div
                                key={subIndex}
                                className={`px-4 py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-b-0 transition-all duration-200 cursor-pointer hover:bg-[var(--primary-light)] ${isActiveRoute(subItem.path) ? 'bg-[var(--primary-light)] text-[var(--primary-color)]' : ''}`}
                                onClick={() => {
                                  setCollapsedDropdownOpen(null);
                                  handleItemClick(subItem.path);
                                }}
                              >
                                <NavLink
                                  to={subItem.path}
                                  className="flex items-center text-inherit no-underline text-sm"
                                >
                                  <span className="flex items-center justify-center w-4 h-4 mr-2 flex-shrink-0">
                                    {subItem.icon}
                                  </span>
                                  <span>{subItem.name}</span>
                                </NavLink>
                              </div>
                            ))}
                        </div>
                      )}

                    {/* Expanded Submenu */}
                    {!effectiveCollapsed && (
                      <div
                        id={`submenu-${item.name}`}
                        className="ml-4 border-l-2 border-[var(--light-border)] dark:border-[var(--dark-border)] pl-2 overflow-hidden transition-all duration-300"
                        style={{
                          maxHeight: item.isOpen ? `${(item.submenuItems?.filter(s => hasAccess(s, user, hasPermission)).length || 0) * 50}px` : "0px",
                          opacity: item.isOpen ? 1 : 0,
                        }}
                      >
                        {item.submenuItems
                          .filter((subItem) =>
                            hasAccess(subItem, user, hasPermission)
                          )
                          .map((subItem, subIndex) => (
                            <div key={subIndex} className="mb-1">
                              <NavLink
                                to={subItem.path}
                                className={`flex items-center min-h-[40px] p-2 px-3 rounded-md no-underline text-[var(--light-text)] dark:text-[var(--dark-text)] transition-all duration-200 text-sm hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] hover:translate-x-1 ${isActiveRoute(subItem.path) ? 'bg-[var(--primary-light)] text-[var(--primary-color)] font-semibold' : ''}`}
                                onClick={() => handleItemClick(subItem.path)}
                              >
                                <span className="flex items-center justify-center w-[18px] h-[18px] mr-2 flex-shrink-0">
                                  {subItem.icon}
                                </span>
                                <span>{subItem.name}</span>
                              </NavLink>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={`flex items-center w-full min-h-[44px] p-3 rounded-lg no-underline cursor-pointer transition-all duration-200 font-medium relative group ${effectiveCollapsed ? 'justify-center' : ''} ${isActiveRoute(item.path) ? 'bg-[var(--primary-color)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--primary-hover)]' : 'bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] hover:translate-x-0.5'}`}
                    onClick={() => handleItemClick(item.path)}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 ${!effectiveCollapsed ? 'mr-3' : ''}`}>{item.icon}</span>
                    {!effectiveCollapsed && (
                      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                    )}

                    {effectiveCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 rounded-lg bg-[var(--dark-card)] text-[var(--dark-text)] text-sm whitespace-nowrap z-[1050] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg pointer-events-none">{item.name}</div>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;