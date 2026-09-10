import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Search,
  CheckCircle2,
  Bell,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Folder,
  Building2,
  Pin,
  ArrowUp,
  Inbox,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getEmployeeAnnouncements,
  markAnnouncementAsRead,
} from "../services/announcementApi";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import AnnouncementDetailModal from "./AnnouncementDetailModal";

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);

  /* -------------------------------------------------------
     FETCH ANNOUNCEMENTS
  ------------------------------------------------------- */

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
      };

      if (filter === "UNREAD") {
        params.unread_only = true;
      }

      if (filter === "COMPANY") {
        params.scope = "COMPANY";
      }

      if (filter === "PROJECT") {
        params.scope = "PROJECT";
      }

      const res = await getEmployeeAnnouncements(params);

      setAnnouncements(res.data.items || []);
      setUnreadCount(res.data.unread_count || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load announcements."
      );

      toast.error("Failed to load announcements feed");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  /* -------------------------------------------------------
     OPEN ANNOUNCEMENT
  ------------------------------------------------------- */

  const handleOpenDetail = async (announcement) => {
    setSelectedAnnouncement(announcement);

    if (!announcement.is_read) {
      try {
        await markAnnouncementAsRead(announcement.id);

        setAnnouncements((prev) =>
          prev.map((item) =>
            item.id === announcement.id
              ? { ...item, is_read: true }
              : item
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // Non-blocking
      }
    }
  };

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  const getPriority = (priority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          bg: "#FEF2F2",
          color: "#B91C1C",
          border: "#FCA5A5",
          dot: "#DC2626",
        };

      case "IMPORTANT":
        return {
          label: "Important",
          bg: "#FFFBEB",
          color: "#B45309",
          border: "#FCD34D",
          dot: "#D97706",
        };

      default:
        return {
          label: "Normal",
          bg: "#F8FAFC",
          color: "#475569",
          border: "#CBD5E1",
          dot: "#64748B",
        };
    }
  };

  const getTypeName = (type) => {
    const types = {
      GENERAL: "General",
      COMPANY_UPDATE: "Company Update",
      HR_NOTICE: "HR Notice",
      HOLIDAY: "Holiday",
      SALARY: "Salary / Payroll",
    };

    return types[type] || type;
  };

  const getDateParts = (date) => {
    if (!date) {
      return {
        day: "--",
        month: "---",
      };
    }

    const parsed = new Date(date);

    return {
      day: parsed
        .getDate()
        .toString()
        .padStart(2, "0"),

      month: parsed
        .toLocaleString("en-US", {
          month: "short",
        })
        .toUpperCase(),
    };
  };

  const getCategoryCount = (scope) => {
    if (scope === "PROJECT") {
      return announcements.filter(
        (item) =>
          item.announcement_scope === "PROJECT"
      ).length;
    }

    return announcements.filter(
      (item) =>
        item.announcement_scope === "COMPANY"
    ).length;
  };

  /* -------------------------------------------------------
     SORT IMPORTANT / URGENT TO TOP
  ------------------------------------------------------- */

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => {
      const priorityRank = {
        URGENT: 3,
        IMPORTANT: 2,
        NORMAL: 1,
      };

      return (
        (priorityRank[b.priority] || 0) -
        (priorityRank[a.priority] || 0)
      );
    }
  );

  const pinnedAnnouncement = sortedAnnouncements.find(
    (item) =>
      item.priority === "URGENT" ||
      item.priority === "IMPORTANT"
  );

  const recentAnnouncements = sortedAnnouncements.filter(
    (item) =>
      !pinnedAnnouncement ||
      item.id !== pinnedAnnouncement.id
  );

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <AppLayout title="Announcements">
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "22px 24px 40px",
        }}
      >
        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <BackToDashboard role="EMPLOYEE" />

        {/* =================================================
            HERO HEADER
        ================================================= */}

        <section
          style={{
            marginTop: "22px",
            padding: "28px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, #123524 0%, #1F5A3A 100%)",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              right: "-60px",
              top: "-80px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
              right: "80px",
              bottom: "-100px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "25px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  opacity: 0.75,
                  marginBottom: "8px",
                }}
              >
                <Megaphone size={14} />
                EMPLOYEE COMMUNICATION CENTER
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  lineHeight: 1.2,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Announcements
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  opacity: 0.78,
                  maxWidth: "580px",
                }}
              >
                Company news, HR notices, important
                updates and project communication — all
                in one place.
              </p>
            </div>

            <button
              onClick={fetchAnnouncements}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "9px",
                border:
                  "1px solid rgba(255,255,255,0.18)",
                background:
                  "rgba(255,255,255,0.10)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                cursor: loading
                  ? "default"
                  : "pointer",
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: loading
                    ? "announcementSpin 1s linear infinite"
                    : "none",
                }}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* =================================================
            OVERVIEW CARDS
        ================================================= */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {/* ALL */}
          <button
            onClick={() => {
              setFilter("ALL");
              setPage(1);
            }}
            style={{
              textAlign: "left",
              padding: "17px",
              borderRadius: "13px",
              border:
                filter === "ALL"
                  ? "1px solid #86EFAC"
                  : "1px solid #E5E7EB",
              background:
                filter === "ALL"
                  ? "#F0FDF4"
                  : "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#DCFCE7",
                  color: "#166534",
                }}
              >
                <Inbox size={17} />
              </div>

              <ArrowUp
                size={15}
                color="#9CA3AF"
              />
            </div>

            <div
              style={{
                marginTop: "13px",
                fontSize: "24px",
                fontWeight: 800,
                color: "#17231B",
              }}
            >
              {announcements.length}
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#6B7280",
              }}
            >
              Announcements
            </div>
          </button>

          {/* UNREAD */}
          <button
            onClick={() => {
              setFilter("UNREAD");
              setPage(1);
            }}
            style={{
              textAlign: "left",
              padding: "17px",
              border:
                filter === "UNREAD"
                  ? "1px solid #86EFAC"
                  : "1px solid #E5E7EB",
              background:
                filter === "UNREAD"
                  ? "#F0FDF4"
                  : "#FFFFFF",
              borderRadius: "13px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    unreadCount > 0
                      ? "#DCFCE7"
                      : "#F3F4F6",
                  color:
                    unreadCount > 0
                      ? "#15803D"
                      : "#6B7280",
                }}
              >
                <Bell size={17} />
              </div>

              {unreadCount > 0 && (
                <span
                  style={{
                    padding: "4px 7px",
                    borderRadius: "20px",
                    background: "#DCFCE7",
                    color: "#15803D",
                    fontSize: "9px",
                    fontWeight: 800,
                  }}
                >
                  NEW
                </span>
              )}
            </div>

            <div
              style={{
                marginTop: "13px",
                fontSize: "24px",
                fontWeight: 800,
                color: "#17231B",
              }}
            >
              {unreadCount}
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#6B7280",
              }}
            >
              Unread
            </div>
          </button>

          {/* COMPANY */}
          <button
            onClick={() => {
              setFilter("COMPANY");
              setPage(1);
            }}
            style={{
              textAlign: "left",
              padding: "17px",
              border:
                filter === "COMPANY"
                  ? "1px solid #86EFAC"
                  : "1px solid #E5E7EB",
              background:
                filter === "COMPANY"
                  ? "#F0FDF4"
                  : "#FFFFFF",
              borderRadius: "13px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F3F4F6",
                color: "#475569",
              }}
            >
              <Building2 size={17} />
            </div>

            <div
              style={{
                marginTop: "13px",
                fontSize: "24px",
                fontWeight: 800,
                color: "#17231B",
              }}
            >
              {getCategoryCount("COMPANY")}
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#6B7280",
              }}
            >
              Company Updates
            </div>
          </button>

          {/* PROJECT */}
          <button
            onClick={() => {
              setFilter("PROJECT");
              setPage(1);
            }}
            style={{
              textAlign: "left",
              padding: "17px",
              border:
                filter === "PROJECT"
                  ? "1px solid #86EFAC"
                  : "1px solid #E5E7EB",
              background:
                filter === "PROJECT"
                  ? "#F0FDF4"
                  : "#FFFFFF",
              borderRadius: "13px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F0FDF4",
                color: "#166534",
              }}
            >
              <Folder size={17} />
            </div>

            <div
              style={{
                marginTop: "13px",
                fontSize: "24px",
                fontWeight: 800,
                color: "#17231B",
              }}
            >
              {getCategoryCount("PROJECT")}
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#6B7280",
              }}
            >
              Project Updates
            </div>
          </button>
        </section>

        {/* =================================================
            SEARCH / FILTER TOOLBAR
        ================================================= */}

        <section
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#17231B",
              }}
            >
              {filter === "ALL"
                ? "All Announcements"
                : filter === "UNREAD"
                ? "Unread Announcements"
                : filter === "COMPANY"
                ? "Company Announcements"
                : "Project Announcements"}
            </div>

            <div
              style={{
                marginTop: "3px",
                fontSize: "11px",
                color: "#9CA3AF",
              }}
            >
              Stay up to date with the latest
              communication.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "260px",
              }}
            >
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9CA3AF",
                }}
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search announcements..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding:
                    "9px 12px 9px 34px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "9px",
                  background: "#FFFFFF",
                  outline: "none",
                  fontSize: "11px",
                  color: "#17231B",
                }}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section style={{ marginTop: "18px" }}>
          {loading ? (
            <div>
              <div
                style={{
                  height: "190px",
                  borderRadius: "14px",
                  background: "#F3F4F6",
                  animation:
                    "announcementPulse 1.5s infinite",
                }}
              />

              <div
                style={{
                  height: "100px",
                  marginTop: "12px",
                  borderRadius: "12px",
                  background: "#F3F4F6",
                  animation:
                    "announcementPulse 1.5s infinite",
                }}
              />

              <div
                style={{
                  height: "100px",
                  marginTop: "12px",
                  borderRadius: "12px",
                  background: "#F3F4F6",
                  animation:
                    "announcementPulse 1.5s infinite",
                }}
              />
            </div>
          ) : error ? (
            <div
              style={{
                padding: "25px",
                borderRadius: "13px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#B91C1C",
              }}
            >
              <AlertCircle size={21} />

              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  Unable to load announcements
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    fontSize: "11px",
                  }}
                >
                  {error}
                </div>
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div
              style={{
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                borderRadius: "15px",
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "#F0FDF4",
                  color: "#15803D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Megaphone size={29} />
              </div>

              <h3
                style={{
                  margin:
                    "17px 0 0",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#17231B",
                }}
              >
                No announcements found
              </h3>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  maxWidth: "380px",
                  color: "#9CA3AF",
                  fontSize: "11px",
                  lineHeight: 1.6,
                }}
              >
                {filter === "UNREAD"
                  ? "You have already read all available announcements."
                  : "There are no announcements available for the selected filter."}
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  PINNED / IMPORTANT ANNOUNCEMENT
              ================================================= */}

              {pinnedAnnouncement && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "9px",
                      color: "#166534",
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                    }}
                  >
                    <Pin size={12} />
                    IMPORTANT UPDATE
                  </div>

                  <PinnedAnnouncement
                    announcement={
                      pinnedAnnouncement
                    }
                    onOpen={
                      handleOpenDetail
                    }
                    getPriority={
                      getPriority
                    }
                    getTypeName={
                      getTypeName
                    }
                    getDateParts={
                      getDateParts
                    }
                  />
                </div>
              )}

              {/* =================================================
                  RECENT UPDATES
              ================================================= */}

              {recentAnnouncements.length >
                0 && (
                <div>
                  <div
                    style={{
                      marginBottom: "10px",
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing:
                        "0.1em",
                      color: "#6B7280",
                    }}
                  >
                    RECENT UPDATES
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    {recentAnnouncements.map(
                      (ann) => (
                        <AnnouncementRow
                          key={ann.id}
                          announcement={ann}
                          onOpen={
                            handleOpenDetail
                          }
                          getPriority={
                            getPriority
                          }
                          getTypeName={
                            getTypeName
                          }
                          getDateParts={
                            getDateParts
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalPages > 1 && (
                <div
                  style={{
                    marginTop: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: "5px",
                  }}
                >
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((p) =>
                        Math.max(
                          1,
                          p - 1
                        )
                      )
                    }
                    style={{
                      padding:
                        "8px 12px",
                      border:
                        "1px solid #D1D5DB",
                      borderRadius: "8px",
                      background:
                        "#FFFFFF",
                      color:
                        "#374151",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor:
                        page <= 1
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        page <= 1
                          ? 0.4
                          : 1,
                    }}
                  >
                    Previous
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map(
                    (pageNumber) => (
                      <button
                        key={
                          pageNumber
                        }
                        onClick={() =>
                          setPage(
                            pageNumber
                          )
                        }
                        style={{
                          width: "32px",
                          height:
                            "32px",
                          borderRadius:
                            "8px",
                          border:
                            page ===
                            pageNumber
                              ? "1px solid #166534"
                              : "1px solid #E5E7EB",
                          background:
                            page ===
                            pageNumber
                              ? "#166534"
                              : "#FFFFFF",
                          color:
                            page ===
                            pageNumber
                              ? "#FFFFFF"
                              : "#6B7280",
                          fontSize:
                            "11px",
                          fontWeight: 800,
                          cursor:
                            "pointer",
                        }}
                      >
                        {
                          pageNumber
                        }
                      </button>
                    )
                  )}

                  <button
                    disabled={
                      page >=
                      totalPages
                    }
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          totalPages,
                          p + 1
                        )
                      )
                    }
                    style={{
                      padding:
                        "8px 12px",
                      border:
                        "1px solid #D1D5DB",
                      borderRadius: "8px",
                      background:
                        "#FFFFFF",
                      color:
                        "#374151",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor:
                        page >=
                        totalPages
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        page >=
                        totalPages
                          ? 0.4
                          : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <AnnouncementDetailModal
        isOpen={!!selectedAnnouncement}
        onClose={() =>
          setSelectedAnnouncement(null)
        }
        announcement={
          selectedAnnouncement
        }
      />

      <style>
        {`
          @keyframes announcementPulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.55;
            }
          }

          @keyframes announcementSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </AppLayout>
  );
};

/* =========================================================
   PINNED ANNOUNCEMENT
========================================================= */

const PinnedAnnouncement = ({
  announcement,
  onOpen,
  getPriority,
  getTypeName,
  getDateParts,
}) => {
  const priority = getPriority(
    announcement.priority
  );

  const date = getDateParts(
    announcement.published_at
  );

  const isProject =
    announcement.announcement_scope ===
    "PROJECT";

  return (
    <article
      onClick={() => onOpen(announcement)}
      style={{
        display: "grid",
        gridTemplateColumns:
          "75px 1fr auto",
        gap: "20px",
        alignItems: "center",
        padding: "22px",
        borderRadius: "15px",
        background: "#FFFFFF",
        border:
          "1px solid #D1FAE5",
        boxShadow:
          "0 4px 14px rgba(22,101,52,0.06)",
        cursor: "pointer",
      }}
    >
      {/* Date */}
      <div
        style={{
          width: "62px",
          height: "68px",
          borderRadius: "11px",
          background: "#F0FDF4",
          border:
            "1px solid #BBF7D0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "21px",
            fontWeight: 900,
            color: "#166534",
            lineHeight: 1,
          }}
        >
          {date.day}
        </div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "9px",
            fontWeight: 800,
            color: "#65A30D",
          }}
        >
          {date.month}
        </div>
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "4px 7px",
              borderRadius: "5px",
              background: priority.bg,
              color: priority.color,
              border:
                `1px solid ${priority.border}`,
              fontSize: "9px",
              fontWeight: 800,
            }}
          >
            {priority.label}
          </span>

          <span
            style={{
              padding: "4px 7px",
              borderRadius: "5px",
              background: "#F8FAFC",
              color: "#64748B",
              border:
                "1px solid #E2E8F0",
              fontSize: "9px",
              fontWeight: 700,
            }}
          >
            {getTypeName(
              announcement.announcement_type
            )}
          </span>

          <span
            style={{
              padding: "4px 7px",
              borderRadius: "5px",
              background: isProject
                ? "#F0FDF4"
                : "#F8FAFC",
              color: isProject
                ? "#166534"
                : "#475569",
              fontSize: "9px",
              fontWeight: 800,
            }}
          >
            {isProject
              ? `PROJECT • ${
                  announcement.project_code ||
                  "PRJ"
                }`
              : "COMPANY-WIDE"}
          </span>
        </div>

        <h2
          style={{
            margin:
              "10px 0 0",
            color: "#17231B",
            fontSize: "18px",
            fontWeight: 800,
          }}
        >
          {announcement.title}
        </h2>

        <p
          style={{
            margin:
              "6px 0 0",
            color: "#6B7280",
            fontSize: "12px",
            lineHeight: 1.6,
            display:
              "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient:
              "vertical",
            overflow:
              "hidden",
          }}
        >
          {announcement.content}
        </p>

        {announcement.creator_name && (
          <div
            style={{
              marginTop: "9px",
              color: "#9CA3AF",
              fontSize: "10px",
            }}
          >
            Published by{" "}
            <strong
              style={{
                color: "#6B7280",
              }}
            >
              {announcement.creator_name}
            </strong>
          </div>
        )}
      </div>

      {/* Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color: "#166534",
          fontSize: "10px",
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        Open
        <ChevronRight size={15} />
      </div>
    </article>
  );
};

/* =========================================================
   ANNOUNCEMENT ROW
========================================================= */

const AnnouncementRow = ({
  announcement,
  onOpen,
  getPriority,
  getTypeName,
  getDateParts,
}) => {
  const priority = getPriority(
    announcement.priority
  );

  const date = getDateParts(
    announcement.published_at
  );

  const isProject =
    announcement.announcement_scope ===
    "PROJECT";

  return (
    <article
      onClick={() => onOpen(announcement)}
      style={{
        display: "grid",
        gridTemplateColumns:
          "60px minmax(0, 1fr) auto",
        gap: "16px",
        alignItems: "center",
        padding: "13px 15px",
        borderRadius: "11px",
        background: "#FFFFFF",
        border:
          announcement.is_read
            ? "1px solid #E5E7EB"
            : "1px solid #BBF7D0",
        boxShadow:
          announcement.is_read
            ? "none"
            : "0 2px 8px rgba(22,101,52,0.05)",
        cursor: "pointer",
      }}
    >
      {/* Date */}
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "9px",
          background: "#F8FAFC",
          border:
            "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            lineHeight: 1,
            fontWeight: 900,
            color: "#334155",
          }}
        >
          {date.day}
        </div>

        <div
          style={{
            marginTop: "3px",
            fontSize: "8px",
            fontWeight: 800,
            color: "#94A3B8",
          }}
        >
          {date.month}
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {announcement.is_read ===
            false && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#15803D",
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing:
                  "0.05em",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius:
                    "50%",
                  background:
                    "#16A34A",
                }}
              />
              NEW
            </span>
          )}

          <span
            style={{
              padding: "3px 6px",
              borderRadius: "4px",
              background: isProject
                ? "#F0FDF4"
                : "#F8FAFC",
              color: isProject
                ? "#166534"
                : "#64748B",
              fontSize: "8px",
              fontWeight: 800,
            }}
          >
            {isProject
              ? `PROJECT • ${
                  announcement.project_code ||
                  "PRJ"
                }`
              : "COMPANY-WIDE"}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 6px",
              borderRadius: "4px",
              background:
                priority.bg,
              color:
                priority.color,
              fontSize: "8px",
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius:
                  "50%",
                background:
                  priority.dot,
              }}
            />

            {priority.label}
          </span>
        </div>

        <h3
          style={{
            margin:
              "5px 0 0",
            color:
              announcement.is_read
                ? "#374151"
                : "#17231B",
            fontSize: "13px",
            fontWeight:
              announcement.is_read
                ? 700
                : 800,
            overflow: "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {announcement.title}
        </h3>

        <p
          style={{
            margin:
              "3px 0 0",
            color: "#9CA3AF",
            fontSize: "10px",
            overflow: "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {announcement.content}
        </p>
      </div>

      {/* Meta / Arrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            textAlign: "right",
            color: "#9CA3AF",
            fontSize: "9px",
          }}
        >
          <div>
            {getTypeName(
              announcement.announcement_type
            )}
          </div>

          {announcement.creator_name && (
            <div
              style={{
                marginTop: "3px",
              }}
            >
              {announcement.creator_name}
            </div>
          )}
        </div>

        <ChevronRight
          size={15}
          color="#9CA3AF"
        />
      </div>
    </article>
  );
};

export default EmployeeAnnouncements;