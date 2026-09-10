import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
} from "../services/notificationApi";
import NotificationDropdown from "./NotificationDropdown";

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch unread notification count", err);
    }
  }, []);

  const fetchRecentNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getNotifications({
        page: 1,
        limit: 10,
      });

      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchRecentNotifications();
    fetchUnreadCount();
  }, [fetchRecentNotifications, fetchUnreadCount]);

  useEffect(() => {
    fetchUnreadCount();

    const handleCustomUpdate = () => {
      handleRefresh();
    };

    window.addEventListener(
      "hrms:notification_update",
      handleCustomUpdate
    );

    return () => {
      window.removeEventListener(
        "hrms:notification_update",
        handleCustomUpdate
      );
    };
  }, [fetchUnreadCount, handleRefresh]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }

    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <div style={styles.container} ref={containerRef}>
        <button
          type="button"
          style={{
            ...styles.bellBtn,
            ...(isOpen ? styles.bellBtnActive : {}),
          }}
          onClick={toggleDropdown}
          aria-label="Notifications"
          aria-expanded={isOpen}
          title="Notifications"
        >
          <span
            style={{
              ...styles.iconWrapper,
              ...(unreadCount > 0 ? styles.iconWrapperUnread : {}),
            }}
          >
            {unreadCount > 0 ? (
              <BellRing
                size={19}
                strokeWidth={2}
              />
            ) : (
              <Bell
                size={19}
                strokeWidth={2}
              />
            )}
          </span>

          {unreadCount > 0 && (
            <span
              style={styles.badge}
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          <span style={styles.activeIndicator} />
        </button>

        {isOpen && (
          <div style={styles.dropdownWrapper}>
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onClose={() => setIsOpen(false)}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </div>

      {loading && isOpen && (
        <style>
          {`
            @keyframes hrmsNotificationSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      )}
    </>
  );
}

const styles = {
  container: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  bellBtn: {
    position: "relative",
    width: "42px",
    height: "42px",
    padding: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    border: "1px solid #dfe7e1",
    borderRadius: "12px",

    backgroundColor: "#ffffff",
    color: "#284238",

    cursor: "pointer",

    boxShadow: "0 2px 8px rgba(24, 61, 45, 0.06)",

    transition:
      "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
  },

  bellBtnActive: {
    backgroundColor: "#f1f7f3",
    borderColor: "#b8cfbf",
    color: "#174d36",
    boxShadow: "0 4px 14px rgba(24, 77, 54, 0.12)",
  },

  iconWrapper: {
    width: "30px",
    height: "30px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "9px",

    transition: "background-color 180ms ease, color 180ms ease",
  },

  iconWrapperUnread: {
    backgroundColor: "#edf6f0",
    color: "#17613f",
  },

  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",

    minWidth: "19px",
    height: "19px",

    padding: "0 5px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#b42318",
    color: "#ffffff",

    border: "2px solid #ffffff",
    borderRadius: "999px",

    fontSize: "10px",
    lineHeight: 1,
    fontWeight: "800",

    boxShadow: "0 2px 6px rgba(180, 35, 24, 0.25)",

    zIndex: 3,
  },

  activeIndicator: {
    position: "absolute",
    bottom: "3px",
    right: "4px",

    width: "5px",
    height: "5px",

    backgroundColor: "#2e7d57",
    borderRadius: "50%",

    opacity: 0,

    pointerEvents: "none",
  },

  dropdownWrapper: {
    position: "absolute",
    top: "67px",
    right: "-40px",
    

    width: "min(420px, calc(100vw - 32px))",

    maxHeight: "calc(100vh - 90px)",

    zIndex: 1100,

    animation: "notificationDropdownEnter 160ms ease-out",
  },
};

export default NotificationBell;