import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  ShieldCheck,
  Activity,
  Clock3,
  Users,
  Filter,
  RotateCcw,
  CalendarDays,
  UserRound,
  Globe,
  CheckCircle2,
  XCircle,
  KeyRound,
  LogIn,
  LogOut,
  UserX,
  FileClock,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getAuditLogs } from "../services/auditApi";
import { showError } from "../../shared/utils/toast";

const AUDIT_ACTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILURE",
  "PASSWORD_CHANGE",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_RESET_APPROVED",
  "PASSWORD_RESET_REJECTED",
  "LOGOUT",
  "ACCOUNT_DEACTIVATED",
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (actionFilter) {
        params.action = actionFilter;
      }

      if (fromDate) {
        params.from_date = new Date(fromDate).toISOString();
      }

      if (toDate) {
        params.to_date = new Date(toDate).toISOString();
      }

      const res = await getAuditLogs(params);
      const data = res.data;

      setLogs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching audit logs:", err);

      const msg =
        err.response?.data?.detail ||
        "Failed to load system audit logs.";

      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, fromDate, toDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearch("");
    setActionFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return "--";

    try {
      return new Date(isoStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  const getActionConfig = (action = "") => {
    if (
      action.includes("FAILURE") ||
      action.includes("REJECTED") ||
      action.includes("DEACTIVATED")
    ) {
      return {
        background: "#fef2f2",
        color: "#b91c1c",
        border: "#fecaca",
        icon: XCircle,
        label: "Security Alert",
      };
    }

    if (
      action.includes("SUCCESS") ||
      action.includes("APPROVED")
    ) {
      return {
        background: "#ecfdf5",
        color: "#047857",
        border: "#bbf7d0",
        icon: CheckCircle2,
        label: "Successful",
      };
    }

    if (action.includes("PASSWORD")) {
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "#fed7aa",
        icon: KeyRound,
        label: "Credential Event",
      };
    }

    if (action.includes("LOGOUT")) {
      return {
        background: "#f1f5f9",
        color: "#475569",
        border: "#cbd5e1",
        icon: LogOut,
        label: "Session Event",
      };
    }

    return {
      background: "#f0fdf4",
      color: "#166534",
      border: "#bbf7d0",
      icon: Activity,
      label: "System Event",
    };
  };

  const getActionIcon = (action = "") => {
    if (action.includes("LOGIN")) {
      return LogIn;
    }

    if (action.includes("LOGOUT")) {
      return LogOut;
    }

    if (action.includes("PASSWORD")) {
      return KeyRound;
    }

    if (action.includes("DEACTIVATED")) {
      return UserX;
    }

    return Activity;
  };

  const activeFilterCount = [
    search,
    actionFilter,
    fromDate,
    toDate,
  ].filter(Boolean).length;

  const currentPageEvents = logs.length;

  return (
    <AppLayout title="System Audit Logs">
      <div style={styles.page}>
        <BackToDashboard to="/hr/dashboard" role="HR" />

        {/* =====================================================
            HERO SECTION
        ===================================================== */}
        <section style={styles.hero}>
          <div style={styles.heroGlowOne} />
          <div style={styles.heroGlowTwo} />

          <div style={styles.heroContent}>
            <div style={styles.heroLeft}>
              <div style={styles.heroIcon}>
                <ShieldCheck size={28} strokeWidth={2} />
              </div>

              <div>
                <div style={styles.eyebrow}>
                  SECURITY & COMPLIANCE
                </div>

                <h1 style={styles.heroTitle}>
                  System Audit Logs
                </h1>

                <p style={styles.heroSubtitle}>
                  Monitor authentication, credential, account, and
                  operational security events across the HRMS.
                </p>
              </div>
            </div>

            <div style={styles.heroStatus}>
              <span style={styles.statusDot} />
              Audit monitoring active
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}
        <section style={styles.summaryGrid}>
          <SummaryCard
            icon={FileClock}
            label="Total Events"
            value={total}
            description="Matching audit records"
          />

          <SummaryCard
            icon={Activity}
            label="Current Page"
            value={currentPageEvents}
            description={`Events displayed on page ${page}`}
          />

          <SummaryCard
            icon={Filter}
            label="Active Filters"
            value={activeFilterCount}
            description={
              activeFilterCount === 0
                ? "No filters applied"
                : "Filters currently applied"
            }
          />

          <SummaryCard
            icon={Clock3}
            label="Page Status"
            value={`${page}/${totalPages || 1}`}
            description="Current pagination position"
          />
        </section>

        {/* =====================================================
            FILTER / SEARCH PANEL
        ===================================================== */}
        <section style={styles.controlCard}>
          <div style={styles.controlHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                AUDIT EXPLORER
              </div>

              <h2 style={styles.sectionTitle}>
                Search & Filter Events
              </h2>

              <p style={styles.sectionDescription}>
                Narrow the audit history by user, employee, action,
                or date range.
              </p>
            </div>

            <div style={styles.filterIndicator}>
              <Filter size={16} />
              {activeFilterCount > 0
                ? `${activeFilterCount} active`
                : "No filters"}
            </div>
          </div>

          <form onSubmit={handleSearchSubmit}>
            {/* Search */}
            <div style={styles.searchBlock}>
              <label style={styles.fieldLabel}>
                Search Audit Records
              </label>

              <div style={styles.searchWrapper}>
                <Search
                  size={19}
                  style={styles.searchIcon}
                />

                <input
                  type="text"
                  placeholder="Search user email, employee code, or action..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />

                <button
                  type="submit"
                  style={styles.searchButton}
                >
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={styles.filterGrid}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  <Activity size={13} />
                  Action
                </label>

                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  style={styles.select}
                >
                  <option value="">
                    All Audit Actions
                  </option>

                  {AUDIT_ACTIONS.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  <CalendarDays size={13} />
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  style={styles.dateInput}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  <CalendarDays size={13} />
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  style={styles.dateInput}
                />
              </div>

              <div style={styles.resetArea}>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                  style={{
                    ...styles.resetButton,
                    opacity:
                      activeFilterCount === 0 ? 0.5 : 1,
                    cursor:
                      activeFilterCount === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <RotateCcw size={15} />
                  Reset Filters
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* =====================================================
            AUDIT TABLE
        ===================================================== */}
        <section style={styles.auditCard}>
          <div style={styles.auditHeader}>
            <div style={styles.auditHeaderLeft}>
              <div style={styles.auditIcon}>
                <ShieldCheck size={20} />
              </div>

              <div>
                <div style={styles.auditEyebrow}>
                  EVENT HISTORY
                </div>

                <h2 style={styles.auditTitle}>
                  Security Activity
                </h2>
              </div>
            </div>

            <div style={styles.recordCount}>
              <span>{total}</span>
              records
            </div>
          </div>

          {loading ? (
            <div style={styles.stateContainer}>
              <div style={styles.spinner} />

              <div style={styles.stateTitle}>
                Loading audit events
              </div>

              <div style={styles.stateDescription}>
                Retrieving the latest system security records...
              </div>
            </div>
          ) : error ? (
            <div style={styles.stateContainer}>
              <div style={styles.errorIcon}>
                <AlertCircle size={25} />
              </div>

              <div style={styles.stateTitle}>
                Unable to load audit logs
              </div>

              <div style={styles.stateDescription}>
                {error}
              </div>

              <button
                onClick={fetchLogs}
                style={styles.retryButton}
              >
                <RotateCcw size={15} />
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div style={styles.stateContainer}>
              <div style={styles.emptyIcon}>
                <FileClock size={26} />
              </div>

              <div style={styles.stateTitle}>
                No audit events found
              </div>

              <div style={styles.stateDescription}>
                No records match the current search and filter
                criteria.
              </div>

              <button
                onClick={handleClearFilters}
                style={styles.secondaryAction}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={styles.tableScroll}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Date & Time
                      </th>

                      <th style={styles.th}>
                        User
                      </th>

                      <th style={styles.th}>
                        Employee
                      </th>

                      <th style={styles.th}>
                        Event Action
                      </th>

                      <th style={styles.th}>
                        Network
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log) => {
                      const actionConfig =
                        getActionConfig(log.action);

                      const ActionIcon =
                        getActionIcon(log.action);

                      return (
                        <tr
                          key={log.id}
                          style={styles.tr}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "#f8fffa";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "#ffffff";
                          }}
                        >
                          {/* Date */}
                          <td style={styles.timeCell}>
                            <div style={styles.timeMain}>
                              <Clock3 size={14} />
                              {formatTimestamp(
                                log.created_at
                              )}
                            </div>
                          </td>

                          {/* User */}
                          <td style={styles.userCell}>
                            <div style={styles.userIdentity}>
                              <div style={styles.userAvatar}>
                                <UserRound size={16} />
                              </div>

                              <div style={styles.userInfo}>
                                <span style={styles.userEmail}>
                                  {log.user_email ||
                                    "System / Anonymous"}
                                </span>

                                <span style={styles.userRole}>
                                  {log.user_email
                                    ? "Authenticated user"
                                    : "System event"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Employee code */}
                          <td style={styles.employeeCell}>
                            {log.employee_code ? (
                              <div style={styles.employeeBadge}>
                                <Users size={13} />

                                {log.employee_code}
                              </div>
                            ) : (
                              <span style={styles.noneText}>
                                —
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td style={styles.actionCell}>
                            <div
                              style={{
                                ...styles.actionBadge,
                                background:
                                  actionConfig.background,
                                color: actionConfig.color,
                                borderColor:
                                  actionConfig.border,
                              }}
                            >
                              <ActionIcon size={14} />

                              <span>
                                {log.action}
                              </span>
                            </div>

                            <div
                              style={{
                                ...styles.actionCategory,
                                color:
                                  actionConfig.color,
                              }}
                            >
                              {actionConfig.label}
                            </div>
                          </td>

                          {/* IP */}
                          <td style={styles.ipCell}>
                            <div style={styles.ipWrapper}>
                              <Globe size={14} />

                              <span>
                                {log.ip_address ||
                                  "Internal"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}
              <div style={styles.pagination}>
                <div style={styles.paginationMeta}>
                  <span style={styles.paginationLabel}>
                    Showing
                  </span>

                  <strong>
                    {currentPageEvents}
                  </strong>

                  <span style={styles.paginationLabel}>
                    events on this page
                  </span>
                </div>

                <div style={styles.paginationControls}>
                  <button
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={page <= 1 || loading}
                    style={{
                      ...styles.pageButton,
                      ...(page <= 1
                        ? styles.pageButtonDisabled
                        : {}),
                    }}
                  >
                    <ArrowLeft size={15} />
                    Previous
                  </button>

                  <div style={styles.pageNumber}>
                    <span>Page</span>

                    <strong>{page}</strong>

                    <span>of</span>

                    <strong>
                      {totalPages || 1}
                    </strong>
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          totalPages,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      page >= totalPages ||
                      loading
                    }
                    style={{
                      ...styles.pageButton,
                      ...(page >= totalPages
                        ? styles.pageButtonDisabled
                        : {}),
                    }}
                  >
                    Next
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Security note */}
        <div style={styles.securityNote}>
          <ShieldCheck size={16} />

          <div>
            <strong>Read-only security record</strong>

            <span>
              Audit events are displayed for monitoring and
              compliance purposes. This screen does not modify
              audit history.
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* =============================================================
   SUMMARY CARD
============================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryTop}>
        <div style={styles.summaryIcon}>
          <Icon size={19} />
        </div>

        <span style={styles.summaryLabel}>
          {label}
        </span>
      </div>

      <div style={styles.summaryValue}>
        {value}
      </div>

      <div style={styles.summaryDescription}>
        {description}
      </div>
    </div>
  );
}

/* =============================================================
   STYLES
============================================================= */

const styles = {
  page: {
    padding: "0 0 2.5rem",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  /* ---------------------------------------------------------
     HERO
  --------------------------------------------------------- */

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0b3d27 0%, #14532d 55%, #166534 100%)",
    borderRadius: "20px",
    padding: "30px 32px",
    marginBottom: "18px",
    color: "#ffffff",
    boxShadow: "0 14px 35px rgba(15, 77, 50, 0.18)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "230px",
    height: "230px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.08)",
    right: "-70px",
    top: "-120px",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.06)",
    right: "100px",
    bottom: "-100px",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  heroIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.6px",
    color: "rgba(255,255,255,0.68)",
    marginBottom: "5px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "28px",
    lineHeight: "1.2",
    fontWeight: 800,
    color: "#ffffff",
  },

  heroSubtitle: {
    margin: "7px 0 0",
    maxWidth: "700px",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "rgba(255,255,255,0.72)",
  },

  heroStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 13px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.13)",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#86efac",
    boxShadow: "0 0 0 4px rgba(134,239,172,0.12)",
  },

  /* ---------------------------------------------------------
     SUMMARY
  --------------------------------------------------------- */

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    padding: "18px",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.04)",
  },

  summaryTop: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "13px",
  },

  summaryIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#ecfdf5",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
  },

  summaryValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#17251d",
    lineHeight: "1.1",
  },

  summaryDescription: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#94a3b8",
  },

  /* ---------------------------------------------------------
     CONTROL CARD
  --------------------------------------------------------- */

  controlCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.04)",
  },

  controlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  sectionEyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.4px",
    color: "#15803d",
    marginBottom: "5px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#17251d",
  },

  sectionDescription: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },

  filterIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  searchBlock: {
    marginBottom: "18px",
  },

  fieldLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    color: "#64748b",
    marginBottom: "7px",
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    color: "#94a3b8",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    background: "#f8fafc",
    color: "#17251d",
    padding: "0 110px 0 44px",
    fontSize: "13px",
    outline: "none",
  },

  searchButton: {
    position: "absolute",
    right: "6px",
    height: "36px",
    padding: "0 14px",
    border: "none",
    borderRadius: "8px",
    background: "#166534",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 1.4fr) minmax(170px, 1fr) minmax(170px, 1fr) auto",
    gap: "14px",
    alignItems: "end",
  },

  field: {
    minWidth: 0,
  },

  select: {
    width: "100%",
    height: "43px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#17251d",
    padding: "0 11px",
    fontSize: "12px",
    outline: "none",
  },

  dateInput: {
    width: "100%",
    height: "43px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#17251d",
    padding: "0 11px",
    fontSize: "12px",
    outline: "none",
  },

  resetArea: {
    display: "flex",
    alignItems: "flex-end",
  },

  resetButton: {
    height: "43px",
    padding: "0 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#f8fafc",
    color: "#475569",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: 700,
  },

  /* ---------------------------------------------------------
     AUDIT CARD
  --------------------------------------------------------- */

  auditCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.04)",
  },

  auditHeader: {
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom: "1px solid #e5e7eb",
  },

  auditHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  auditIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#ecfdf5",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  auditEyebrow: {
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1.2px",
    color: "#15803d",
    marginBottom: "3px",
  },

  auditTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    color: "#17251d",
  },

  recordCount: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    color: "#64748b",
  },

  recordCountSpan: {
    fontWeight: 800,
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1000px",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    padding: "13px 18px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "9px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #eef2f7",
    background: "#ffffff",
    transition: "background 0.15s ease",
  },

  timeCell: {
    padding: "15px 18px",
    width: "190px",
    verticalAlign: "middle",
  },

  timeMain: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#475569",
    fontSize: "11px",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  },

  userCell: {
    padding: "15px 18px",
    minWidth: "220px",
  },

  userIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  userAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#f0fdf4",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  },

  userEmail: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#17251d",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "240px",
  },

  userRole: {
    fontSize: "10px",
    color: "#94a3b8",
  },

  employeeCell: {
    padding: "15px 18px",
    width: "150px",
  },

  employeeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "7px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "10px",
    fontWeight: 800,
    fontFamily: "monospace",
  },

  actionCell: {
    padding: "15px 18px",
    minWidth: "260px",
  },

  actionBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "7px",
    border: "1px solid",
    fontSize: "10px",
    fontWeight: 800,
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  },

  actionCategory: {
    marginTop: "4px",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  ipCell: {
    padding: "15px 18px",
    width: "160px",
  },

  ipWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748b",
    fontSize: "11px",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  },

  noneText: {
    color: "#94a3b8",
    fontStyle: "italic",
  },

  /* ---------------------------------------------------------
     STATES
  --------------------------------------------------------- */

  stateContainer: {
    minHeight: "300px",
    padding: "45px 25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  spinner: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "3px solid #dcfce7",
    borderTopColor: "#15803d",
    animation: "auditSpin 0.8s linear infinite",
    marginBottom: "14px",
  },

  stateTitle: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#17251d",
    marginBottom: "5px",
  },

  stateDescription: {
    maxWidth: "420px",
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#64748b",
  },

  errorIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "13px",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#f0fdf4",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "13px",
  },

  retryButton: {
    marginTop: "16px",
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#b91c1c",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryAction: {
    marginTop: "16px",
    padding: "9px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  /* ---------------------------------------------------------
     PAGINATION
  --------------------------------------------------------- */

  pagination: {
    padding: "14px 18px",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  paginationMeta: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
  },

  paginationLabel: {
    color: "#64748b",
  },

  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  pageButton: {
    height: "35px",
    padding: "0 11px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#166534",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  pageButtonDisabled: {
    color: "#94a3b8",
    background: "#f1f5f9",
    cursor: "not-allowed",
  },

  pageNumber: {
    minWidth: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    color: "#64748b",
    fontSize: "11px",
  },

  /* ---------------------------------------------------------
     SECURITY NOTE
  --------------------------------------------------------- */

  securityNote: {
    marginTop: "14px",
    padding: "12px 15px",
    borderRadius: "11px",
    background: "#f0fdf4",
    border: "1px solid #dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "11px",
  },
};
