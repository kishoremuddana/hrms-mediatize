import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CalendarDays,
  Megaphone,
  Star,
  Clock,
  ClipboardList,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import { useAuth } from "../../authentication_service/hooks/useAuth";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationApi";
import {
  showSuccess,
  showError,
} from "../../shared/utils/toast";

function formatDateTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTimeAgo(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Just now";

  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }

  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }

  if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  return formatDateTime(dateString);
}

function getNotificationTypeBadge(type) {
  switch (type) {
    case "LEAVE_REQUEST":
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
    case "LEAVE_CANCELLED":
      return {
        label: "Leave",
        bg: "#edf6f0",
        color: "#17613f",
      };

    case "HOLIDAY_ANNOUNCEMENT":
      return {
        label: "Holiday",
        bg: "#fff7e8",
        color: "#9a6700",
      };

    case "PERFORMANCE_UPDATE":
      return {
        label: "Performance",
        bg: "#f5f3ed",
        color: "#7a6330",
      };

    case "ATTENDANCE_UPDATE":
      return {
        label: "Attendance",
        bg: "#eef7f2",
        color: "#276749",
      };

    case "PROJECT_UPDATE":
      return {
        label: "Project",
        bg: "#edf6f0",
        color: "#17613f",
      };

    case "TASK_UPDATE":
      return {
        label: "Task",
        bg: "#f3f5f2",
        color: "#52665b",
      };

    default:
      return {
        label: "General",
        bg: "#f1f4f2",
        color: "#61736a",
      };
  }
}

function getNotificationIcon(type) {
  switch (type) {
    case "LEAVE_REQUEST":
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
    case "LEAVE_CANCELLED":
      return <CalendarDays size={18} strokeWidth={2} />;

    case "HOLIDAY_ANNOUNCEMENT":
      return <Megaphone size={18} strokeWidth={2} />;

    case "PERFORMANCE_UPDATE":
      return <Star size={18} strokeWidth={2} />;

    case "ATTENDANCE_UPDATE":
      return <Clock size={18} strokeWidth={2} />;

    case "PROJECT_UPDATE":
    case "TASK_UPDATE":
      return <ClipboardList size={18} strokeWidth={2} />;

    default:
      return <Bell size={18} strokeWidth={2} />;
  }
}

function getNotificationIconStyle(type) {
  switch (type) {
    case "HOLIDAY_ANNOUNCEMENT":
    case "PERFORMANCE_UPDATE":
      return {
        backgroundColor: "#fff7e8",
        color: "#9a6700",
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
    case "PROJECT_UPDATE":
    case "TASK_UPDATE":
      return {
        backgroundColor: "#edf6f0",
        color: "#17613f",
      };

    default:
      return {
        backgroundColor: "#f1f4f2",
        color: "#61736a",
      };
  }
}

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 15;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getNotifications({
        page,
        limit,
        unread_only: unreadOnly,
      });

      const data = res.data || {};

      const totalItems = data.total || 0;

      const computedPages =
        data.pages ||
        (limit > 0
          ? Math.ceil(totalItems / limit)
          : 1) ||
        1;

      setNotifications(data.items || []);
      setTotal(totalItems);
      setPages(computedPages);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Failed to load notifications.");
      showError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      try {
        await markNotificationAsRead(item.id);
        fetchNotifications();
        window.dispatchEvent(new Event("hrms:notification_update"));
      } catch (err) {
          console.error("Failed to mark notification as read", err);
      }
    }

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
  };


  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      showSuccess("Notification marked as read.");

      fetchNotifications();

      window.dispatchEvent(
        new Event("hrms:notification_update")
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read",
        err
      );

      showError("Failed to mark notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();

      showSuccess("All notifications marked as read.");

      fetchNotifications();

      window.dispatchEvent(
        new Event("hrms:notification_update")
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read",
        err
      );

      showError(
        "Failed to mark all notifications as read."
      );
    }
  };

  const totalPages = Math.max(1, pages);

  const backTarget =
    user?.role === "HR"
      ? "/hr/dashboard"
      : "/employee/dashboard";

  return (
    <AppLayout title="Notifications Center">
      <div style={styles.pageContainer}>
        <BackToDashboard
          to={backTarget}
          role={user?.role}
        />

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <Bell size={25} strokeWidth={2} />
            </div>

            <div>
              <div style={styles.eyebrow}>
                HRMS COMMUNICATION CENTER
              </div>

              <h1 style={styles.title}>
                Notifications
              </h1>

              <p style={styles.subtitle}>
                Stay updated with important workplace
                activity, requests, announcements and
                system updates.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              style={styles.markAllBtn}
              onClick={handleMarkAllRead}
            >
              <CheckCheck
                size={16}
                strokeWidth={2}
              />

              <span>
                Mark all as read ({unreadCount})
              </span>
            </button>
          )}
        </section>

        {/* Summary */}
        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#edf6f0",
                color: "#17613f",
              }}
            >
              <Inbox size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                Total Notifications
              </span>

              <strong style={styles.summaryValue}>
                {total}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#fff7e8",
                color: "#9a6700",
              }}
            >
              <Bell size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                Unread
              </span>

              <strong style={styles.summaryValue}>
                {unreadCount}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#f1f4f2",
                color: "#61736a",
              }}
            >
              <RefreshCw size={18} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                Current View
              </span>

              <strong style={styles.summaryValueSmall}>
                {unreadOnly ? "Unread Only" : "All"}
              </strong>
            </div>
          </div>
        </section>

        {/* Explorer */}
        <section style={styles.explorer}>
          <div style={styles.explorerHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                NOTIFICATION EXPLORER
              </div>

              <h2 style={styles.sectionTitle}>
                Your notifications
              </h2>

              <p style={styles.sectionDescription}>
                Review recent updates and take action
                where required.
              </p>
            </div>

            <button
              type="button"
              style={styles.refreshBtn}
              onClick={fetchNotifications}
              title="Refresh notifications"
            >
              <RefreshCw
                size={15}
                strokeWidth={2}
              />

              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={styles.tabsContainer}>
            <button
              type="button"
              style={{
                ...styles.tab,
                ...(unreadOnly
                  ? {}
                  : styles.activeTab),
              }}
              onClick={() => {
                setUnreadOnly(false);
                setPage(1);
              }}
            >
              <Bell size={15} />

              <span>
                All Notifications ({total})
              </span>
            </button>

            <button
              type="button"
              style={{
                ...styles.tab,
                ...(unreadOnly
                  ? styles.activeTab
                  : {}),
              }}
              onClick={() => {
                setUnreadOnly(true);
                setPage(1);
              }}
            >
              <Inbox size={15} />

              <span>
                Unread ({unreadCount})
              </span>
            </button>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div style={styles.stateCard}>
            <div style={styles.loadingSpinner}>
              <RefreshCw
                size={22}
                strokeWidth={2}
              />
            </div>

            <h3 style={styles.stateTitle}>
              Loading notifications
            </h3>

            <p style={styles.stateText}>
              Please wait while we retrieve your
              latest notifications.
            </p>
          </div>
        ) : error ? (
          <div style={styles.stateCard}>
            <div style={styles.stateIcon}>
              <Bell size={23} />
            </div>

            <h3 style={styles.stateTitle}>
              Unable to load notifications
            </h3>

            <p style={styles.stateText}>
              {error}
            </p>

            <button
              type="button"
              style={styles.retryBtn}
              onClick={fetchNotifications}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.stateCard}>
            <div style={styles.stateIcon}>
              <Inbox size={26} />
            </div>

            <h3 style={styles.stateTitle}>
              No notifications found
            </h3>

            <p style={styles.stateText}>
              {unreadOnly
                ? "You have no unread notifications."
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <section style={styles.notificationList}>
            {notifications.map((item) => {
              const typeBadge =
                getNotificationTypeBadge(
                  item.notification_type
                );

              return (
                <article
                  key={item.id}
                  style={{
                    ...styles.card,
                    ...(item.is_read ? styles.readCard : styles.unreadCard),
                    cursor: "pointer",
                  }}
                  onClick={() => handleNotificationClick(item)}
                >
                  {/* Unread bar */}
                  {!item.is_read && (
                    <span
                      style={styles.unreadBar}
                    />
                  )}

                  {/* Top row */}
                  <div style={styles.cardTop}>
                    <div style={styles.cardIdentity}>
                      <div
                        style={{
                          ...styles.notificationIcon,
                          ...getNotificationIconStyle(
                            item.notification_type
                          ),
                        }}
                      >
                        {getNotificationIcon(
                          item.notification_type
                        )}
                      </div>

                      <div style={styles.badges}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            backgroundColor:
                              typeBadge.bg,
                            color:
                              typeBadge.color,
                          }}
                        >
                          {typeBadge.label}
                        </span>

                        {!item.is_read && (
                          <span
                            style={styles.newBadge}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={styles.timeText}>
                      {formatTimeAgo(
                        item.created_at
                      )}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={styles.cardContent}>
                    <h3 style={styles.itemTitle}>
                      {item.title}
                    </h3>

                    <p style={styles.itemMessage}>
                      {item.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={styles.cardFooter}>

                    <div style={styles.readAction}>
                      {!item.is_read ? (
                        <button
                          type="button"
                          style={styles.readBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(item.id);
                          }}
                        >
                          <CheckCheck size={14} />

                          <span>
                            Mark as read
                          </span>
                        </button>
                      ) : (
                        <span style={styles.readAtText}>
                          Read{" "}
                          {item.read_at
                            ? formatTimeAgo(
                                item.read_at
                              )
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              type="button"
              style={{
                ...styles.pageBtn,
                opacity: page === 1 ? 0.45 : 1,
                cursor:
                  page === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              disabled={page === 1}
              onClick={() =>
                setPage((p) =>
                  Math.max(1, p - 1)
                )
              }
            >
              <ChevronLeft size={16} />

              <span>Previous</span>
            </button>

            <div style={styles.pageIndicator}>
              <span style={styles.pageLabel}>
                PAGE
              </span>

              <strong>
                {page}
              </strong>

              <span>
                of {totalPages}
              </span>
            </div>

            <button
              type="button"
              style={{
                ...styles.pageBtn,
                opacity:
                  page === totalPages
                    ? 0.45
                    : 1,
                cursor:
                  page === totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1
                  )
                )
              }
            >
              <span>Next</span>

              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes hrmsNotificationsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {
            .hrms-notification-action {
              width: 100%;
            }
          }

          @media (max-width: 600px) {
            .hrms-notification-hero {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .hrms-notification-card-footer {
              flex-direction: column !important;
              align-items: stretch !important;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}

const styles = {
  pageContainer: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
    padding: "0 0 40px",
  },

  hero: {
    marginTop: "18px",
    padding: "24px 26px",

    background:
      "linear-gradient(135deg, #173f2d 0%, #245b42 100%)",

    borderRadius: "18px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "20px",

    boxShadow:
      "0 10px 28px rgba(23, 63, 45, 0.14)",
  },

  heroContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    minWidth: 0,
  },

  heroIcon: {
    width: "52px",
    height: "52px",

    borderRadius: "15px",

    backgroundColor:
      "rgba(255, 255, 255, 0.12)",

    color: "#ffffff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border:
      "1px solid rgba(255, 255, 255, 0.14)",
  },

  eyebrow: {
    color: "#b9d8c5",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    marginBottom: "5px",
  },

  title: {
    color: "#ffffff",
    fontSize: "25px",
    fontWeight: "800",
    margin: 0,
    lineHeight: 1.2,
  },

  subtitle: {
    color: "#d4e4da",
    fontSize: "12px",
    lineHeight: 1.5,
    margin: "6px 0 0",
    maxWidth: "650px",
  },

  markAllBtn: {
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "#ffffff",
    color: "#17613f",

    borderRadius: "10px",

    padding: "10px 13px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",

    fontSize: "11px",
    fontWeight: "750",

    cursor: "pointer",

    whiteSpace: "nowrap",

    flexShrink: 0,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",

    gap: "12px",

    marginTop: "14px",
  },

  summaryCard: {
    backgroundColor: "#ffffff",

    border: "1px solid #dfe8e2",

    borderRadius: "13px",

    padding: "14px 15px",

    display: "flex",
    alignItems: "center",
    gap: "11px",

    boxShadow:
      "0 2px 8px rgba(23, 63, 45, 0.04)",
  },

  summaryIcon: {
    width: "38px",
    height: "38px",

    borderRadius: "10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  summaryLabel: {
    display: "block",

    color: "#7a8981",

    fontSize: "10px",
    fontWeight: "650",

    marginBottom: "3px",
  },

  summaryValue: {
    display: "block",

    color: "#20382c",

    fontSize: "18px",
    fontWeight: "800",
  },

  summaryValueSmall: {
    display: "block",

    color: "#20382c",

    fontSize: "13px",
    fontWeight: "800",
  },

  explorer: {
    marginTop: "20px",

    backgroundColor: "#ffffff",

    border:
      "1px solid #dfe8e2",

    borderRadius: "15px",

    overflow: "hidden",

    boxShadow:
      "0 2px 10px rgba(23, 63, 45, 0.04)",
  },

  explorerHeader: {
    padding: "18px 20px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",
  },

  sectionEyebrow: {
    color: "#5b7869",

    fontSize: "9px",
    fontWeight: "800",

    letterSpacing: "1px",

    marginBottom: "4px",
  },

  sectionTitle: {
    margin: 0,

    color: "#20382c",

    fontSize: "16px",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "4px 0 0",

    color: "#7a8981",

    fontSize: "11px",
  },

  refreshBtn: {
    border: "1px solid #d3dfd7",

    backgroundColor: "#f7faf8",

    color: "#35614c",

    borderRadius: "9px",

    padding: "8px 11px",

    display: "inline-flex",
    alignItems: "center",
    gap: "6px",

    fontSize: "10px",
    fontWeight: "700",

    cursor: "pointer",

    flexShrink: 0,
  },

  tabsContainer: {
    display: "flex",
    alignItems: "center",

    gap: "5px",

    padding: "0 20px",

    borderTop: "1px solid #edf1ee",

    backgroundColor: "#fbfcfb",
  },

  tab: {
    position: "relative",

    border: "none",

    backgroundColor: "transparent",

    color: "#77867e",

    padding: "12px 13px",

    display: "inline-flex",
    alignItems: "center",
    gap: "7px",

    fontSize: "11px",
    fontWeight: "700",

    cursor: "pointer",

    borderBottom:
      "2px solid transparent",
  },

  activeTab: {
    color: "#17613f",

    borderBottom:
      "2px solid #28734d",

    backgroundColor: "#f1f7f3",
  },

  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",

    marginTop: "15px",
  },

  card: {
    position: "relative",

    border: "1px solid",

    borderRadius: "14px",

    padding: "16px 17px",

    display: "flex",
    flexDirection: "column",

    gap: "12px",

    overflow: "hidden",

    boxShadow:
      "0 2px 7px rgba(23, 63, 45, 0.035)",
  },

  readCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e8e3",
  },

  unreadCard: {
    backgroundColor: "#f8fbf9",
    borderColor: "#bfd3c6",
  },

  unreadBar: {
    position: "absolute",

    top: 0,
    bottom: 0,
    left: 0,

    width: "3px",

    backgroundColor: "#28734d",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "10px",
  },

  cardIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  notificationIcon: {
    width: "38px",
    height: "38px",

    borderRadius: "11px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  badges: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
  },

  typeBadge: {
    padding: "5px 8px",

    borderRadius: "6px",

    fontSize: "9px",
    fontWeight: "800",

    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  newBadge: {
    padding: "4px 7px",

    borderRadius: "999px",

    backgroundColor: "#e7f3eb",
    color: "#17613f",

    fontSize: "8px",
    fontWeight: "850",

    letterSpacing: "0.5px",
  },

  timeText: {
    color: "#8a9790",

    fontSize: "10px",
    fontWeight: "600",

    whiteSpace: "nowrap",
  },

  cardContent: {
    paddingLeft: "48px",
  },

  itemTitle: {
    color: "#243a2f",

    fontSize: "14px",
    fontWeight: "750",

    margin: 0,

    lineHeight: 1.35,
  },

  itemMessage: {
    color: "#68786f",

    fontSize: "11px",
    lineHeight: 1.55,

    margin: "6px 0 0",
  },

  cardFooter: {
    minHeight: "30px",

    display: "flex",
    alignItems: "center",

    gap: "10px",

    paddingLeft: "48px",

    borderTop: "1px solid #edf1ee",

    paddingTop: "10px",
  },

  actionBtn: {
    border: "1px solid #c9dacf",

    backgroundColor: "#edf6f0",

    color: "#17613f",

    borderRadius: "8px",

    padding: "7px 10px",

    display: "inline-flex",
    alignItems: "center",
    gap: "6px",

    fontSize: "10px",
    fontWeight: "750",

    cursor: "pointer",
  },

  readAction: {
    marginLeft: "auto",

    display: "flex",
    alignItems: "center",
  },

  readBtn: {
    border: "1px solid #cbd9d0",

    backgroundColor: "#ffffff",

    color: "#35614c",

    borderRadius: "8px",

    padding: "7px 10px",

    display: "inline-flex",
    alignItems: "center",
    gap: "6px",

    fontSize: "10px",
    fontWeight: "700",

    cursor: "pointer",
  },

  readAtText: {
    color: "#98a49e",

    fontSize: "9px",
    fontStyle: "italic",
  },

  stateCard: {
    marginTop: "15px",

    minHeight: "260px",

    backgroundColor: "#ffffff",

    border:
      "1px solid #dfe8e2",

    borderRadius: "15px",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    textAlign: "center",

    padding: "30px",
  },

  stateIcon: {
    width: "52px",
    height: "52px",

    borderRadius: "15px",

    backgroundColor: "#f1f6f3",
    color: "#5e796b",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: "12px",
  },

  loadingSpinner: {
    width: "48px",
    height: "48px",

    borderRadius: "14px",

    backgroundColor: "#edf6f0",
    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: "12px",

    animation:
      "hrmsNotificationsSpin 1s linear infinite",
  },

  stateTitle: {
    margin: 0,

    color: "#263d32",

    fontSize: "14px",
    fontWeight: "800",
  },

  stateText: {
    maxWidth: "390px",

    margin: "6px 0 0",

    color: "#7c8982",

    fontSize: "11px",
    lineHeight: 1.5,
  },

  retryBtn: {
    marginTop: "14px",

    border: "1px solid #c9dacf",

    backgroundColor: "#edf6f0",

    color: "#17613f",

    borderRadius: "8px",

    padding: "8px 12px",

    display: "inline-flex",
    alignItems: "center",
    gap: "6px",

    fontSize: "10px",
    fontWeight: "750",

    cursor: "pointer",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "12px",

    marginTop: "20px",
  },

  pageBtn: {
    border: "1px solid #d6e1da",

    backgroundColor: "#ffffff",

    color: "#3b5d4c",

    borderRadius: "9px",

    padding: "8px 11px",

    display: "inline-flex",
    alignItems: "center",
    gap: "5px",

    fontSize: "10px",
    fontWeight: "700",
  },

  pageIndicator: {
    minWidth: "100px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "5px",

    color: "#718078",

    fontSize: "10px",
  },

  pageLabel: {
    color: "#a0aaa5",

    fontSize: "8px",
    fontWeight: "800",

    letterSpacing: "0.7px",
  },
};

export default Notifications;