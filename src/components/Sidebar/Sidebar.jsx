// src\components\Sidebar\Sidebar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav, Collapse, Button } from "react-bootstrap";
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
  MdOutlineCardGiftcard

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

  const toggleSubmenu = (submenuName) => {
    // Check if the clicked submenu is already open
    let isCurrentlyOpen = false;

    switch (submenuName) {
      case "auth":
        isCurrentlyOpen = authSubmenuOpen;
        break;
      case "survey":
        isCurrentlyOpen = surveySubmenuOpen;
        break;
      case "user":
        isCurrentlyOpen = userSubmenuOpen;
        break;
      case "access":
        isCurrentlyOpen = accessSubmenuOpen;
        break;
      case "analytics":
        isCurrentlyOpen = analyticsSubmenuOpen;
        break;
      case "audience":
        isCurrentlyOpen = audienceSubmenuOpen;
        break;
      case "communication":
        isCurrentlyOpen = communicationSubmenuOpen;
        break;
      case "incentives":
        isCurrentlyOpen = incentivesSubmenuOpen;
        break;
      case "settings":
        isCurrentlyOpen = settingsSubmenuOpen;
        break;
      case "content":
        isCurrentlyOpen = contentmanagement;
        break;
      case "support":
        isCurrentlyOpen = supportTickets;
        break;
    }

    // Close all submenus first
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

    // If the clicked submenu was not open, open it
    if (!isCurrentlyOpen) {
      switch (submenuName) {
        case "auth":
          setAuthSubmenuOpen(true);
          break;
        case "survey":
          setSurveySubmenuOpen(true);
          break;
        case "user":
          setUserSubmenuOpen(true);
          break;
        case "access":
          setAccessSubmenuOpen(true);
          break;
        case "analytics":
          setAnalyticsSubmenuOpen(true);
          break;
        case "audience":
          setAudienceSubmenuOpen(true);
          break;
        case "communication":
          setCommunicationSubmenuOpen(true);
          break;
        case "incentives":
          setIncentivesSubmenuOpen(true);
          break;
        case "settings":
          setSettingsSubmenuOpen(true);
          break;
        case "content":
          setcontentmanagement(true);
          break;
        case "support":
          setSupportTickets(true);
          break;
      }
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
  const sidebarStyle = {
    width: collapsed ? "70px" : "280px",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: isMobile ? undefined : 0, // Let CSS handle mobile positioning, set desktop positioning
    zIndex: 1050,
    transition: isMobile ? undefined : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Let CSS handle mobile transitions
    backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)", // Theme colors for consistency
    borderRight: `1px solid ${
      darkMode ? "var(--dark-border)" : "var(--light-border)"
    }`,
    boxShadow: "var(--shadow-md)",
    overflowY: "auto",
    overflowX: "hidden",
  };

  const navItems = [
    {
      path: "/app",
      name: "Dashboard",
      icon: <MdDashboard />,
      roles: ["admin", "companyAdmin", "member"],
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
        { path: "/app/surveys", name: "All Surveys", icon: <MdViewList />, roles: ["companyAdmin", "admin"], permissions: ["survey:read"] },
        { path: "/app/surveys/create", name: "Create Survey", icon: <MdAddCircleOutline />, roles: ["companyAdmin"], permissions: ["survey:create"] },
        { path: "/app/surveys/templates", name: "Survey Templates", icon: <MdDescription />, roles: ["admin", "companyAdmin"], permissions: ["survey:templates"] },
        { path: "/app/surveys/scheduling", name: "Survey Scheduling", icon: <MdSchedule />, roles: ["companyAdmin"], permissions: ["survey:schedule"] },
        { path: "/app/surveys/responses/", name: "Survey Responses", icon: <MdQuestionAnswer />, roles: ["companyAdmin"], permissions: ["survey:responses:view"] },
        { path: "/app/surveys/analytics/:id", name: "Survey Analytics", icon: <MdAnalytics />, roles: ["companyAdmin"], permissions: ["survey:analytics:view"] },
        // { path: "/app/surveys/:id/customize", name: "Customization", icon: <MdOutlineSettingsApplications />, roles: ["companyAdmin"], permissions: ["survey:customize"] },
        // { path: "/app/surveys/:id/share", name: "Survey Sharing", icon: <MdShare />, roles: ["companyAdmin"], permissions: ["survey:share"] },
        {
          path: "/app/surveys/settings",
          name: "Survey Settings",
          icon: <MdSettings />,
          roles: ["companyAdmin"],
          permissions: ["survey:settings:update"],
        },
        // { path: "/app/surveys/detail", name: "Survey Detail", icon: <MdVisibility />, roles: ["companyAdmin"], permissions: ["survey:detail:view"] },
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
          path: "/app/users/form",
          name: "Create User",
          icon: <MdPersonAdd />,
          roles: ["companyAdmin", "admin"],
          permissions: ["user:create", "user:update"],
        },
      ],
    },
    { path: "/app/access", name: "Access Management", icon: <MdSecurity />, roles: ["companyAdmin"], },
    { path: "/app/roles", name: "Role Management", icon: <MdGroup />, roles: ["companyAdmin"], permissions: ["role:create", "role:read", "role:update", "role:delete"], },
    { path: "/app/actions", name: "Action Management", icon: <MdTask />, roles: ["companyAdmin", "admin"], },
    {
      name: "Analytics & Reports",
      icon: <MdInsertChart />,
      submenu: true,
      isOpen: analyticsSubmenuOpen,
      toggle: () => toggleSubmenu("analytics"),
      roles: ["companyAdmin", "admin"],
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
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/analytics/dashboard",
          name: "Executive Dashboard",
          icon: <MdAnalytics />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/analytics/feedback",
          name: "Feedback Analysis",
          icon: <MdFeedback />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/analytics/real-time",
          name: "Real-Time Results",
          icon: <MdSync />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/analytics/trends",
          name: "Trend Analysis",
          icon: <MdTrendingUp />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/analytics/custom-reports",
          name: "Custom Reports",
          icon: <MdBarChart />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/analytics/response-overview",
          name: "Response Overview",
          icon: <MdShowChart />,
          roles: ["companyAdmin", "admin"],
        },
      ],
    },
    {
      name: "Incentives Management",
      icon: <MdMonetizationOn />,
      submenu: true,
      isOpen: incentivesSubmenuOpen,
      toggle: () => toggleSubmenu("incentives"),
      roles: ["companyAdmin"],
      permissions: [
        "incentives:create",
        "incentives:read",
        "incentives:update",
        "incentives:delete",
      ],
      submenuItems: [
        {
          path: "/app/incentives/incentives-management",
          name: "Incentives Management",
          icon: <MdMonetizationOn />,
          roles: ["companyAdmin"],
        },
        {
          path: "/app/incentives/reward-system",
          name: "Reward System",
          icon: <MdOutlineCardGiftcard/>,
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
      roles: ["companyAdmin", "admin"],
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
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/communication/whatsapp",
          name: "WhatsApp Settings",
          icon: <IoLogoWhatsapp />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/communication/sms",
          name: "SMS Settings",
          icon: <MdSms />,
          roles: ["companyAdmin", "admin"],
        },
      ],
    },
    {
      name: "Audience Management",
      icon: <MdPeople />,
      submenu: true,
      isOpen: audienceSubmenuOpen,
      roles: ["companyAdmin", "admin"],
      toggle: () => toggleSubmenu("audience"),
      permissions: ["audience:view", "audience:segment", "audience:contacts"],
      submenuItems: [
        {
          path: "/app/audiences",
          name: "All Audiences",
          icon: <MdPeople />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/audiences/segmentation",
          name: "Audience Segmentation",
          icon: <MdSegment />,
          roles: ["companyAdmin", "admin"],
        },
        {
          path: "/app/audiences/contact-management",
          name: "Contact Management",
          icon: <MdContacts />,
          roles: ["companyAdmin", "admin"],
        },
      ],
    },
    {
      name: "Content Management",
      icon: <MdSettings />,
      submenu: true,
      isOpen: contentmanagement,
      roles: ["admin"],
      toggle: () => toggleSubmenu("content"),
      permissions: [
        "content:features",
        "content:pricing",
        "content:testimonials",
        "content:widgets",
      ],
      submenuItems: [
        {
          path: "/app/features",
          name: "Features",
          icon: <MdSettings />,
          roles: ["admin"],
        },
        {
          path: "/app/content/pricing",
          name: "Pricing",
          icon: <MdPayment />,
          roles: ["admin"],
        },
        {
          path: "/app/content/testimonials",
          name: "Testimonials",
          icon: <MdThumbUp />,
          roles: ["admin"],
        },
        {
          path: "/app/content/widgets",
          name: "Widgets",
          icon: <MdMailOutline />,
          roles: ["admin"],
        },
      ],
    },
    {
      // path: "/app/support",
      name: "Support Tickets",
      icon: <MdSupport />,
      toggle: () => toggleSubmenu("support"),
      submenu: true,
      isOpen: supportTickets,
      roles: ["admin", "companyAdmin"],
      permissions: ["support:view", "support:create"],
      submenuItems: [
        {
          path: "/app/support",
          name: "View Tickets",
          icon: <MdSupport />,
          roles: ["admin", "companyAdmin"],
          permissions: ["support:view"],
        },
        {
          path: "/app/support/create",
          name: "Create Ticket",
          icon: <MdAddCircleOutline />,
          roles: ["companyAdmin"],
          permissions: ["support:create"],
        },
        {
          path: "/app/support/1",
          name: "Ticket Details",
          icon: <MdVisibility />,
          roles: ["admin", "companyAdmin"],
          permissions: ["support:view"],
        },
      ],
    },
    {
      name: "Settings",
      icon: <MdSettings />,
      submenu: true,
      isOpen: settingsSubmenuOpen,
      roles: ["admin", "companyAdmin"],
      toggle: () => toggleSubmenu("settings"),
      permissions: ["settings:general"],
      submenuItems: [
        {
          path: "/app/settings",
          name: "General Settings",
          icon: <MdSettings />,
          roles: ["admin", "companyAdmin"],
          permissions: ["settings:general"],
        },
        {
          path: "/app/settings/email-templates",
          name: "Email Templates",
          icon: <MdMailOutline />,
          roles: ["admin"],
        },
        {
          path: "/app/settings/notification-settings",
          name: "Notification Settings",
          icon: <MdNotifications />,
          roles: ["admin"],
        },
        {
          path: "/app/settings/smtp-config",
          name: "SMTP Configuration",
          icon: <MdEmail />,
          roles: ["admin"],
        },
        {
          path: "/app/settings/custom-thank-you",
          name: "Thank You Page",
          icon: <MdThumbUp />,
          roles: ["admin"],
        },
        {
          path: "/app/settings/theme-settings",
          name: "Theme Settings",
          icon: <MdColorLens />,
          roles: ["admin", "companyAdmin", "member"],
        },
      ],
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
          className="mobile-sidebar-toggle"
          onClick={onToggle}
          aria-label="Open sidebar"
        >
          <MdMenu size={24} />
        </button>
      )}

      <div
        id="mobile-sidebar"
        ref={sidebarRef}
        style={sidebarStyle}
        className={`sidebar d-flex flex-column ${
          collapsed ? "collapsed" : "expanded"
        } ${isMobile ? "mobile" : ""} ${isTablet ? "tablet" : ""} ${
          darkMode ? "dark-mode" : ""
        } ${isOpen ? "open" : ""}`}
        role={isMobile ? "dialog" : undefined}
        aria-modal={isMobile ? "true" : undefined}
        aria-label={isMobile ? "Navigation menu" : undefined}
        aria-labelledby={isMobile ? undefined : "sidebar-nav"}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Header with mobile close button */}
        <div className="sidebar-header">
          {!collapsed && <h4 className="sidebar-logo">Rate Pro</h4>}
          
          {/* Mobile close button - only shows when sidebar is open on mobile */}
          {isMobile && isOpen ? (
            <Button
              variant="link"
              className="sidebar-toggle mobile-close-button"
              onClick={onClose}
              aria-label="Close navigation menu"
              tabIndex={0}
              autoFocus
            >
              <MdClose size={24} />
            </Button>
          ) : !isMobile ? (
            /* Desktop/tablet toggle button */
            <Button
              variant="link"
              className="sidebar-toggle"
              onClick={() => onToggle(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              tabIndex={0}
            >
              {collapsed ? (
                <MdMenu size={isMobile ? 20 : 24} />
              ) : (
                <MdClose size={isMobile ? 20 : 24} />
              )}
            </Button>
          ) : null}
        </div>

        {/* Navigation */}
        <Nav className="sidebar-nav flex-column flex-fill">
          {navItems
            .filter((item) => hasAccess(item, user, hasPermission))
            .map((item, index) => (
              <div key={index} className="nav-item">
                {item.submenu ? (
                  <>
                    <button
                      className="nav-link"
                      onClick={
                        collapsed
                          ? () => handleCollapsedDropdownClick(item.name)
                          : item.toggle
                      }
                      onMouseEnter={() => {
                        setHoveredItem(item.name);
                        if (collapsed && !isMobile)
                          handleCollapsedDropdownHover(item.name);
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null);
                        if (collapsed && !isMobile)
                          handleCollapsedDropdownLeave();
                      }}
                      aria-expanded={item.isOpen}
                      aria-controls={`submenu-${item.name}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="nav-text">{item.name}</span>
                          <span
                            className={`nav-arrow ${
                              item.isOpen ? "rotated" : ""
                            }`}
                          >
                            <MdExpandMore />
                          </span>
                        </>
                      )}
                      {collapsed && (
                        <div className="nav-tooltip">{item.name}</div>
                      )}
                    </button>

                    {/* Collapsed Dropdown */}
                    {collapsed &&
                      collapsedDropdownOpen === item.name &&
                      !isMobile && (
                        <div
                          className="collapsed-dropdown"
                          onMouseEnter={() =>
                            setCollapsedDropdownOpen(item.name)
                          }
                          onMouseLeave={() => setCollapsedDropdownOpen(null)}
                        >
                          <div className="collapsed-dropdown-header">
                            {item.name}
                          </div>

                          {item.submenuItems
                            .filter((subItem) =>
                              hasAccess(subItem, user, hasPermission)
                            )
                            .map((subItem, subIndex) => (
                              <div
                                key={subIndex}
                                className={`collapsed-dropdown-item ${
                                  isActiveRoute(subItem.path) ? "active" : ""
                                }`}
                                onClick={() => {
                                  setCollapsedDropdownOpen(null);
                                  handleItemClick(subItem.path);
                                }}
                              >
                                <NavLink
                                  to={subItem.path}
                                  className="collapsed-dropdown-link"
                                >
                                  <span className="collapsed-dropdown-icon">
                                    {subItem.icon}
                                  </span>
                                  <span>{subItem.name}</span>
                                </NavLink>
                              </div>
                            ))}
                        </div>
                      )}

                    {/* Expanded Submenu */}
                    {!collapsed && (
                      <Collapse in={item.isOpen} id={`submenu-${item.name}`}>
                        <div className="submenu">
                          {item.submenuItems
                            .filter((subItem) =>
                              hasAccess(subItem, user, hasPermission)
                            )
                            .map((subItem, subIndex) => (
                              <div key={subIndex} className="submenu-item">
                                <NavLink
                                  to={subItem.path}
                                  className={`submenu-link ${
                                    isActiveRoute(subItem.path) ? "active" : ""
                                  }`}
                                  onClick={() => handleItemClick(subItem.path)}
                                >
                                  <span className="submenu-icon">
                                    {subItem.icon}
                                  </span>
                                  <span>{subItem.name}</span>
                                </NavLink>
                              </div>
                            ))}
                        </div>
                      </Collapse>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={`nav-link ${
                      isActiveRoute(item.path) ? "active" : ""
                    }`}
                    onClick={() => handleItemClick(item.path)}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && (
                      <span className="nav-text">{item.name}</span>
                    )}

                    {collapsed && (
                      <div className="nav-tooltip">{item.name}</div>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
        </Nav>
      </div>
    </>
  );
};

export default Sidebar;