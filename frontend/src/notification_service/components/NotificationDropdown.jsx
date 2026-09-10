import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authentication_service/hooks/useAuth";
import {
  CalendarDays,
  Megaphone,
  Star,
  Clock,
  ClipboardList,
  Bell,
  ArrowRight,
  CheckCheck,
  Inbox,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationApi";

function formatRelativeTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";

  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
}

function getNotificationIcon(type) {
  switch (type) {
    case "LEAVE_REQUEST":
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
    case "LEAVE_CANCELLED":
      return (
        <CalendarDays
          size={17}
          strokeWidth={2}
        />
      );

    case "HOLIDAY_ANNOUNCEMENT":
      return (
        <Megaphone
          size={17}
          strokeWidth={2}
        />
      );

    case "PERFORMANCE_UPDATE":
      return (
        <Star
          size={17}
          strokeWidth={2}
        />
      );

    case "ATTENDANCE_UPDATE":
      return (
        <Clock
          size={17}
          strokeWidth={2}
        />
      );

    case "PROJECT_UPDATE":
    case "TASK_UPDATE":
      return (
        <ClipboardList
          size={17}
          strokeWidth={2}
        />
      );

    default:
      return (
        <Bell
          size={17}
          strokeWidth={2}
        />
      );
  }
}

function getNotificationIconStyle(type) {
  switch (type) {

    case "HOLIDAY_ANNOUNCEMENT":
      return {
        backgroundColor: "#f1f7f3",
        color: "#17613f",
      };

    case "PERFORMANCE_UPDATE":
      return {
        backgroundColor: "#fff7e8",
        color: "#a16207",
      };

    case "ATTENDANCE_UPDATE":
      return {
        backgroundColor: "#eef7f2",
        color: "#276749",
      };

    case "LEAVE_REQUEST":
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
    case "LEAVE_CANCELLED":
      return {
        backgroundColor: "#edf6f0",
        color: "#17613f",
      };

    case "PROJECT_UPDATE":
    case "TASK_UPDATE":
      return {
        backgroundColor: "#edf6f0",
        color: "#17613f",
      };

    default:
      return {
        backgroundColor: "#f2f5f3",
        color: "#4b6358",
      };
  }
}

function NotificationDropdown({
  notifications,
  unreadCount,
  onClose,
  onRefresh,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleItemClick = async (item) => {
    // Close dropdown immediately
    onClose();

    // Leave notifications
    if (
    item.notification_type === "LEAVE_REQUEST" ||
    item.notification_type === "LEAVE_APPROVED" ||
    item.notification_type === "LEAVE_REJECTED" ||
    item.notification_type === "LEAVE_CANCELLED" ||
    item.reference_type === "LEAVE"
  ) {


    if (user?.role === "HR") {
      navigate("/hr/leaves");
    } else {
        navigate("/employee/leave");
      }
    } else if (item.notification_type === "PROJECT_UPDATE") {
      if (user?.role === "HR") {
        navigate("/hr/projects");
      } else {
        navigate("/employee/projects");
      }
    } else if (item.notification_type === "PERFORMANCE_UPDATE") {
      
      if (user?.role === "HR") {
        navigate("/hr/performance");
      } else {
        navigate("/employee/performance");
      }
    } else if (
        item.notification_type === "COMPANY_ANNOUNCEMENT" ||
        item.notification_type === "PROJECT_ANNOUNCEMENT" ||
        item.notification_type === "HOLIDAY_ANNOUNCEMENT" ||
        item.notification_type === "GENERAL_ANNOUNCEMENT"
      ) {
        
        if (user?.role === "HR") {
          navigate("/hr/announcements");
        } else {
          navigate("/employee/announcements");
        }
      } else if (
        item.notification_type === "COMPLAINT_SUBMITTED" ||
        item.notification_type === "COMPLAINT_UPDATED" ||
        item.notification_type === "COMPLAINT_RESOLVED"
      ) {
  
        if (user?.role === "HR") {
          navigate("/hr/complaints");
        } else {
          navigate("/employee/complaints");
        }
      }
      // Mark as read after navigation
      if (!item.is_read) {
      try {
        await markNotificationAsRead(item.id);
        onRefresh();
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      onRefresh();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate("/notifications");
  };

  return (
    <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Bell size={18} strokeWidth={2} />
          </div>

          <div>
            <div style={styles.title}>Notifications</div>

            <div style={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up"}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            style={styles.markAllBtn}
            onClick={handleMarkAllRead}
            title="Mark all notifications as read"
          >
            <CheckCheck size={15} strokeWidth={2} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      <div
        className="hrms-custom-scrollbar"
        style={styles.list}
      >
        {notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Inbox size={25} strokeWidth={1.8} />
            </div>

            <p style={styles.emptyTitle}>
              No notifications
            </p>

            <p style={styles.emptyText}>
              You're all caught up. New updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.item,
                ...(item.is_read
                  ? styles.readItem
                  : styles.unreadItem),
              }}
              onClick={() => handleItemClick(item)}
            >
              {/* Unread indicator */}
              {!item.is_read && (
                <span style={styles.unreadIndicator} />
              )}

              {/* Icon */}
              <div
                style={{
                  ...styles.iconBox,
                  ...getNotificationIconStyle(
                    item.notification_type
                  ),
                }}
              >
                {getNotificationIcon(
                  item.notification_type
                )}
              </div>

              {/* Content */}
              <div style={styles.content}>
                <div style={styles.itemHeader}>
                  <span
                    style={{
                      ...styles.itemTitle,
                      ...(item.is_read
                        ? styles.readTitle
                        : styles.unreadTitle),
                    }}
                  >
                    {item.title}
                  </span>

                  {!item.is_read && (
                    <span
                      style={styles.unreadDot}
                      title="Unread"
                    />
                  )}
                </div>

                <p style={styles.itemMessage}>
                  {item.message}
                </p>

                <div style={styles.itemFooter}>
                  <Clock
                    size={12}
                    strokeWidth={2}
                  />

                  <span>
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          type="button"
          style={styles.viewAllBtn}
          onClick={handleViewAll}
        >
          <span>View all notifications</span>

          <span style={styles.arrowCircle}>
            <ArrowRight
              size={14}
              strokeWidth={2}
            />
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  dropdown: {
    position: "absolute",
    top: "calc(100% + 0.75rem)",
    right: 0,

    width: "390px",
    maxWidth: "calc(100vw - 24px)",
    maxHeight: "500px",

    backgroundColor: "#ffffff",

    border: "1px solid #dce6df",
    borderRadius: "16px",

    boxShadow:
      "0 18px 45px rgba(23, 63, 44, 0.14)",

    zIndex: 1200,

    display: "flex",
    flexDirection: "column",

    overflow: "hidden",

    animation:
      "hrmsNotificationDropdownIn 160ms ease-out",
  },

  header: {
    padding: "16px 17px",

    backgroundColor: "#f8fbf9",

    borderBottom: "1px solid #e3ebe5",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "12px",

    flexShrink: 0,
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  headerIcon: {
    width: "38px",
    height: "38px",

    borderRadius: "11px",

    backgroundColor: "#e8f3ec",
    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  title: {
    color: "#1d3329",
    fontSize: "14px",
    fontWeight: "800",
    lineHeight: 1.25,
  },

  subtitle: {
    color: "#708278",
    fontSize: "11px",
    fontWeight: "500",
    marginTop: "3px",
  },

  markAllBtn: {
    border: "1px solid #c9dacf",
    backgroundColor: "#ffffff",

    color: "#17613f",

    borderRadius: "8px",

    padding: "7px 9px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",

    fontSize: "10px",
    fontWeight: "700",

    cursor: "pointer",

    whiteSpace: "nowrap",

    transition:
      "background-color 160ms ease, border-color 160ms ease",
  },

  list: {
    overflowY: "auto",

    flex: 1,
    minHeight: 0,

    maxHeight: "360px",

    display: "flex",
    flexDirection: "column",

    backgroundColor: "#ffffff",
  },

  emptyState: {
    minHeight: "245px",

    padding: "30px 25px",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    textAlign: "center",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",

    borderRadius: "15px",

    backgroundColor: "#f1f6f3",
    color: "#6c8277",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: "12px",
  },

  emptyTitle: {
    margin: 0,

    color: "#263d32",

    fontSize: "14px",
    fontWeight: "750",
  },

  emptyText: {
    margin: "6px 0 0",

    maxWidth: "260px",

    color: "#819088",

    fontSize: "11px",
    lineHeight: 1.5,
  },

  item: {
    position: "relative",

    padding: "13px 15px",

    display: "flex",
    alignItems: "flex-start",

    gap: "11px",

    borderBottom: "1px solid #edf1ee",

    cursor: "pointer",

    transition:
      "background-color 160ms ease, padding-left 160ms ease",
  },

  readItem: {
    backgroundColor: "#ffffff",
  },

  unreadItem: {
    backgroundColor: "#f5faf7",
  },

  unreadIndicator: {
    position: "absolute",

    left: "0",
    top: "0",
    bottom: "0",

    width: "3px",

    backgroundColor: "#28734d",
  },

  iconBox: {
    width: "34px",
    height: "34px",

    borderRadius: "10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    marginTop: "1px",
  },

  content: {
    flex: 1,

    minWidth: 0,

    display: "flex",
    flexDirection: "column",

    gap: "4px",
  },

  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "8px",

    minWidth: 0,
  },

  itemTitle: {
    fontSize: "12px",
    lineHeight: 1.35,

    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  unreadTitle: {
    color: "#1c3529",
    fontWeight: "750",
  },

  readTitle: {
    color: "#40554b",
    fontWeight: "650",
  },

  unreadDot: {
    width: "7px",
    height: "7px",

    borderRadius: "50%",

    backgroundColor: "#28734d",

    flexShrink: 0,
  },

  itemMessage: {
    margin: 0,

    color: "#718178",

    fontSize: "11px",
    lineHeight: 1.45,

    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",

    overflow: "hidden",
  },

  itemFooter: {
    display: "flex",
    alignItems: "center",
    gap: "4px",

    color: "#9aa79f",

    fontSize: "9px",
    fontWeight: "600",

    marginTop: "2px",
  },

  footer: {
    padding: "10px 12px",

    borderTop: "1px solid #e3ebe5",

    backgroundColor: "#f8fbf9",

    flexShrink: 0,
  },

  viewAllBtn: {
    width: "100%",

    border: "1px solid #d2e0d7",

    backgroundColor: "#ffffff",

    color: "#17613f",

    borderRadius: "9px",

    padding: "9px 11px",

    fontSize: "11px",
    fontWeight: "750",

    cursor: "pointer",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "8px",

    transition:
      "background-color 160ms ease, border-color 160ms ease",
  },

  arrowCircle: {
    width: "21px",
    height: "21px",

    borderRadius: "50%",

    backgroundColor: "#edf6f0",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default NotificationDropdown;