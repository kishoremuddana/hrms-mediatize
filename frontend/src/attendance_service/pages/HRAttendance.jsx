import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getHRAttendance } from "../services/attendanceApi";
import { showError } from "../../shared/utils/toast";

export default function HRAttendance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = { page, limit };

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const res = await getHRAttendance(params);
      const data = res.data;

      setLogs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching HR attendance list:", err);

      const msg =
        err.response?.data?.detail ||
        "Failed to load employee attendance records.";

      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, statusFilter, fromDate, toDate]);

  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 767);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttendance();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const hasActiveFilters =
    search || statusFilter || fromDate || toDate;

  const formatTime = (isoStr) => {
    if (!isoStr) return "--:--";

    const dt = new Date(isoStr);

    return dt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";

    try {
      const parts = dateStr.split("-");

      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const dt = new Date(year, month, day);

        return dt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatWorkingHours = (minutes) => {
    if (minutes === null || minutes === undefined) return "--";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;

    return `${hrs}h ${mins}m`;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "PRESENT":
        return {
          backgroundColor: "#e8f2ec",
          color: "#244d38",
          border: "1px solid #c9dfd0",
          icon: <CheckCircle2 size={14} />,
        };

      case "LATE":
        return {
          backgroundColor: "#fff5df",
          color: "#8a5a00",
          border: "1px solid #efd89e",
          icon: <Clock3 size={14} />,
        };

      case "HALF_DAY":
        return {
          backgroundColor: "#fff0df",
          color: "#9a4f00",
          border: "1px solid #edc59b",
          icon: <Clock3 size={14} />,
        };

      case "ABSENT":
        return {
          backgroundColor: "#fdecec",
          color: "#a33a3a",
          border: "1px solid #efc6c6",
          icon: <X size={14} />,
        };

      default:
        return {
          backgroundColor: "#f1f4f2",
          color: "#52615a",
          border: "1px solid #dce5df",
          icon: <AlertCircle size={14} />,
        };
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "E";
  };

  return (
    <AppLayout title="HR Attendance Management">
      <div style={styles.page}>
        <BackToDashboard to="/hr/dashboard" role="HR" />

        {/* -------------------------------------------------
            HERO
        ------------------------------------------------- */}
        <section style={styles.hero}>
          <div style={styles.heroGlowOne} />
          <div style={styles.heroGlowTwo} />

          <div style={styles.heroContent}>
            <div
                style={{
                  ...styles.heroTopRow,
                  ...(isMobile && {
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: "1.25rem",
                    minHeight: "auto",
                  }),
                }}
              >
              <div>
                <div style={styles.eyebrow}>
                  <span style={styles.eyebrowIcon}>
                    <CalendarDays size={14} />
                  </span>
                  HR OPERATIONS
                </div>

                <h1 style={styles.heroTitle}>
                  Attendance
                  <span style={styles.heroTitleAccent}> Workspace</span>
                </h1>

                <p style={styles.heroSubtitle}>
                  Monitor employee attendance, working hours and daily
                  attendance records from one place.
                </p>
              </div>

              <div style={styles.heroMetric}>
                <div style={styles.heroMetricIcon}>
                  <Users size={20} />
                </div>

                <div>
                  <span style={styles.heroMetricLabel}>
                    RECORDS
                  </span>
                  <strong style={styles.heroMetricValue}>
                    {total}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------
            SUMMARY STRIP
        ------------------------------------------------- */}
        <section
            style={{
              ...styles.summaryGrid,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(3, minmax(0, 1fr))",
            }}
          >
          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#e8f2ec",
                color: "#2f6b4f",
              }}
            >
              <Users size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                ATTENDANCE RECORDS
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
                backgroundColor: "#eef5f0",
                color: "#244d38",
              }}
            >
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                CURRENT VIEW
              </span>
              <strong style={styles.summaryValue}>
                Page {page}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#fff5df",
                color: "#8a5a00",
              }}
            >
              <Filter size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                ACTIVE FILTERS
              </span>
              <strong style={styles.summaryValue}>
                {[
                  search,
                  statusFilter,
                  fromDate,
                  toDate,
                ].filter(Boolean).length}
              </strong>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------
            FILTER WORKSPACE
        ------------------------------------------------- */}
        <section style={styles.workspaceCard}>
          <div style={styles.workspaceHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                RECORD EXPLORER
              </div>

              <h2 style={styles.sectionTitle}>
                Find attendance records
              </h2>

              <p style={styles.sectionDescription}>
                Search employees or narrow records by attendance
                status and date range.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen((value) => !value)
              }
              style={styles.mobileFilterButton}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <div style={styles.searchRow}>
              <div style={styles.searchWrapper}>
                <Search
                  size={18}
                  style={styles.searchIcon}
                />

                <input
                  type="text"
                  placeholder="Search by employee name, code or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  style={styles.searchInput}
                />
              </div>

              <button
                type="submit"
                style={styles.searchButton}
              >
                <Search size={16} />
                Search Records
              </button>
            </div>

            <div
              style={{
                ...styles.filterGrid,
                ...(isMobile && {
                  gridTemplateColumns: "1fr",
                }),
                ...(mobileFiltersOpen
                  ? styles.mobileFiltersVisible
                  : {}),
              }}
            >
              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  Attendance Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  style={styles.select}
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  From Date
                </label>

                <div style={styles.dateWrapper}>
                  <CalendarDays
                    size={16}
                    style={styles.fieldIcon}
                  />

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
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  To Date
                </label>

                <div style={styles.dateWrapper}>
                  <CalendarDays
                    size={16}
                    style={styles.fieldIcon}
                  />

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
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={styles.resetButton}
                >
                  <X size={15} />
                  Reset
                </button>
              )}
            </div>
          </form>

          {hasActiveFilters && (
            <div style={styles.activeFilterBar}>
              <div style={styles.activeFilterText}>
                <Filter size={14} />
                Filters are currently applied
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                style={styles.clearFiltersButton}
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* -------------------------------------------------
            RECORDS
        ------------------------------------------------- */}
        <section style={styles.recordsCard}>
          <div style={styles.recordsHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                ATTENDANCE LOG
              </div>

              <h2 style={styles.sectionTitle}>
                Employee attendance
              </h2>
            </div>

            <button
              type="button"
              onClick={fetchAttendance}
              disabled={loading}
              style={{
                ...styles.refreshButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw
                size={15}
                style={
                  loading
                    ? styles.spinIcon
                    : undefined
                }
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.stateContainer}>
              <div style={styles.loadingIndicator}>
                <div style={styles.loadingSpinner} />
              </div>

              <h3 style={styles.stateTitle}>
                Loading attendance records
              </h3>

              <p style={styles.stateDescription}>
                Please wait while the latest attendance data
                is being loaded.
              </p>
            </div>
          ) : error ? (
            <div style={styles.stateContainer}>
              <div
                style={{
                  ...styles.stateIcon,
                  backgroundColor: "#fdecec",
                  color: "#a33a3a",
                }}
              >
                <AlertCircle size={24} />
              </div>

              <h3 style={styles.stateTitle}>
                Unable to load attendance
              </h3>

              <p style={styles.errorDescription}>
                {error}
              </p>

              <button
                type="button"
                onClick={fetchAttendance}
                style={styles.retryButton}
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div style={styles.stateContainer}>
              <div
                style={{
                  ...styles.stateIcon,
                  backgroundColor: "#f1f4f2",
                  color: "#52615a",
                }}
              >
                <CalendarDays size={24} />
              </div>

              <h3 style={styles.stateTitle}>
                No attendance records
              </h3>

              <p style={styles.stateDescription}>
                No records match the current search and filter
                criteria.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={styles.retryButton}
                >
                  <X size={15} />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div
                style={{
                  ...styles.tableWrapper,
                  display: isMobile ? "none" : "block",
                }}
              >
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thEmployee}>
                        Employee
                      </th>
                      <th style={styles.th}>
                        Date
                      </th>
                      <th style={styles.th}>
                        Check In
                      </th>
                      <th style={styles.th}>
                        Check Out
                      </th>
                      <th style={styles.th}>
                        Status
                      </th>
                      <th style={styles.th}>
                        Working Hours
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((row) => {
                      const statusStyle =
                        getStatusConfig(row.status);

                      return (
                        <tr
                          key={row.id}
                          style={styles.tr}
                        >
                          <td style={styles.employeeCell}>
                            <div
                              style={
                                styles.employeeIdentity
                              }
                            >
                              <div
                                style={
                                  styles.avatar
                                }
                              >
                                {getInitials(
                                  row.first_name,
                                  row.last_name
                                )}
                              </div>

                              <div
                                style={
                                  styles.employeeDetails
                                }
                              >
                                <div
                                  style={
                                    styles.employeeName
                                  }
                                >
                                  {row.first_name}{" "}
                                  {row.last_name}
                                </div>

                                <div
                                  style={
                                    styles.employeeMeta
                                  }
                                >
                                  {row.email}
                                </div>

                                <span
                                  style={
                                    styles.employeeCode
                                  }
                                >
                                  {row.employee_code}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={styles.dateCell}>
                            <span
                              style={
                                styles.datePrimary
                              }
                            >
                              {formatDate(
                                row.attendance_date
                              )}
                            </span>
                          </td>

                          <td style={styles.timeCell}>
                            <div
                              style={
                                styles.timeValue
                              }
                            >
                              <Clock3 size={15} />
                              {formatTime(row.check_in)}
                            </div>
                          </td>

                          <td style={styles.timeCell}>
                            <div
                              style={
                                styles.timeValue
                              }
                            >
                              <Clock3 size={15} />
                              {formatTime(row.check_out)}
                            </div>
                          </td>

                          <td style={styles.statusCell}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor:
                                  statusStyle.backgroundColor,
                                color:
                                  statusStyle.color,
                                border:
                                  statusStyle.border,
                              }}
                            >
                              {statusStyle.icon}
                              {row.status}
                            </span>
                          </td>

                          <td style={styles.hoursCell}>
                            <strong>
                              {formatWorkingHours(
                                row.working_minutes
                              )}
                            </strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div
                style={{
                  ...styles.mobileRecords,
                  display: isMobile ? "block" : "none",
                }}
              >
                {logs.map((row) => {
                  const statusStyle =
                    getStatusConfig(row.status);

                  return (
                    <article
                      key={row.id}
                      style={styles.mobileRecordCard}
                    >
                      <div
                        style={
                          styles.mobileRecordTop
                        }
                      >
                        <div
                          style={
                            styles.employeeIdentity
                          }
                        >
                          <div
                            style={styles.avatar}
                          >
                            {getInitials(
                              row.first_name,
                              row.last_name
                            )}
                          </div>

                          <div
                            style={
                              styles.employeeDetails
                            }
                          >
                            <div
                              style={
                                styles.employeeName
                              }
                            >
                              {row.first_name}{" "}
                              {row.last_name}
                            </div>

                            <div
                              style={
                                styles.employeeMeta
                              }
                            >
                              {row.email}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              statusStyle.backgroundColor,
                            color:
                              statusStyle.color,
                            border:
                              statusStyle.border,
                          }}
                        >
                          {statusStyle.icon}
                          {row.status}
                        </span>
                      </div>

                      <div
                        style={
                          styles.mobileEmployeeCode
                        }
                      >
                        Employee Code:{" "}
                        <strong>
                          {row.employee_code}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.mobileDataGrid
                        }
                      >
                        <div
                          style={
                            styles.mobileDataItem
                          }
                        >
                          <span
                            style={
                              styles.mobileDataLabel
                            }
                          >
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              row.attendance_date
                            )}
                          </strong>
                        </div>

                        <div
                          style={
                            styles.mobileDataItem
                          }
                        >
                          <span
                            style={
                              styles.mobileDataLabel
                            }
                          >
                            WORKING HOURS
                          </span>

                          <strong>
                            {formatWorkingHours(
                              row.working_minutes
                            )}
                          </strong>
                        </div>

                        <div
                          style={
                            styles.mobileDataItem
                          }
                        >
                          <span
                            style={
                              styles.mobileDataLabel
                            }
                          >
                            CHECK IN
                          </span>

                          <strong>
                            {formatTime(
                              row.check_in
                            )}
                          </strong>
                        </div>

                        <div
                          style={
                            styles.mobileDataItem
                          }
                        >
                          <span
                            style={
                              styles.mobileDataLabel
                            }
                          >
                            CHECK OUT
                          </span>

                          <strong>
                            {formatTime(
                              row.check_out
                            )}
                          </strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              <div style={styles.pagination}>
                <div style={styles.paginationSummary}>
                  Showing page{" "}
                  <strong>{page}</strong> of{" "}
                  <strong>{totalPages || 1}</strong>
                </div>

                <div style={styles.paginationControls}>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={
                      page <= 1 || loading
                    }
                    style={{
                      ...styles.paginationButton,
                      ...(page <= 1
                        ? styles.paginationButtonDisabled
                        : {}),
                    }}
                  >
                    <ArrowLeft size={15} />
                    Previous
                  </button>

                  <div
                    style={
                      styles.currentPage
                    }
                  >
                    {page}
                  </div>

                  <button
                    type="button"
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
                      ...styles.paginationButton,
                      ...(page >= totalPages
                        ? styles.paginationButtonDisabled
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
      </div>
    </AppLayout>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "0 1rem 3rem",
    boxSizing: "border-box",
  },

  /* =====================================================
     HERO
  ===================================================== */

  hero: {
    position: "relative",
    overflow: "hidden",
    marginTop: "1rem",
    marginBottom: "1.25rem",
    borderRadius: "28px",
    backgroundColor: "#17251f",
    minHeight: "220px",
  },

  heroGlowOne: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    right: "-80px",
    top: "-140px",
    backgroundColor: "rgba(86, 139, 105, 0.18)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    left: "42%",
    bottom: "-170px",
    backgroundColor: "rgba(71, 118, 87, 0.15)",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    padding: "2rem 2.25rem",
  },

  heroTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "2rem",
    minHeight: "175px",
    minWidth: 0,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#b8d8c4",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "0.8rem",
  },

  eyebrowIcon: {
    width: "27px",
    height: "27px",
    borderRadius: "9px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(232, 242, 236, 0.12)",
    color: "#d7ebde",
  },

  heroTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(2rem, 4vw, 3rem)",
    lineHeight: 1.05,
    fontWeight: "800",
    letterSpacing: "-0.04em",
  },

  heroTitleAccent: {
    color: "#a9cfb6",
  },

  heroSubtitle: {
    maxWidth: "650px",
    margin: "1rem 0 0",
    color: "#c2d0c8",
    fontSize: "0.95rem",
    lineHeight: 1.65,
  },

  heroMetric: {
    minWidth: "180px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    padding: "1rem",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.11)",
  },

  heroMetricIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
  },

  heroMetricLabel: {
    display: "block",
    color: "#9fb8aa",
    fontSize: "0.65rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "0.15rem",
  },

  heroMetricValue: {
    color: "#ffffff",
    fontSize: "1.5rem",
    lineHeight: 1,
  },

  /* =====================================================
     SUMMARY
  ===================================================== */

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    minHeight: "88px",
    padding: "1rem 1.15rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "20px",
    boxShadow:
      "0 6px 20px rgba(23, 37, 31, 0.05)",
    boxSizing: "border-box",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    display: "block",
    color: "#718078",
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "0.25rem",
  },

  summaryValue: {
    display: "block",
    color: "#17251f",
    fontSize: "1.35rem",
    fontWeight: "800",
  },

  /* =====================================================
     WORKSPACE
  ===================================================== */

  workspaceCard: {
    marginBottom: "1.25rem",
    padding: "1.4rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "24px",
    boxShadow:
      "0 8px 25px rgba(23, 37, 31, 0.045)",
  },

  workspaceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.25rem",
  },

  sectionEyebrow: {
    color: "#668072",
    fontSize: "0.66rem",
    fontWeight: "800",
    letterSpacing: "0.11em",
    marginBottom: "0.35rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#17251f",
    fontSize: "1.2rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },

  sectionDescription: {
    margin: "0.35rem 0 0",
    color: "#718078",
    fontSize: "0.82rem",
    lineHeight: 1.5,
  },

  mobileFilterButton: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.65rem 0.85rem",
    borderRadius: "12px",
    border: "1px solid #dce5df",
    backgroundColor: "#ffffff",
    color: "#2f6b4f",
    fontWeight: "700",
    cursor: "pointer",
  },

  searchRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) auto",
    gap: "0.75rem",
    marginBottom: "1rem",
  },

  searchWrapper: {
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#7d8c84",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    padding: "0 1rem 0 2.8rem",
    borderRadius: "14px",
    border: "1px solid #d5e0d9",
    backgroundColor: "#f8faf8",
    color: "#17251f",
    fontSize: "0.88rem",
    outline: "none",
  },

  searchButton: {
    minHeight: "48px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.45rem",
    padding: "0 1.15rem",
    border: "none",
    borderRadius: "14px",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
    fontSize: "0.84rem",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) auto",
    alignItems: "end",
    gap: "0.85rem",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },

  fieldLabel: {
    color: "#52615a",
    fontSize: "0.7rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
  },

  select: {
    width: "100%",
    height: "44px",
    boxSizing: "border-box",
    padding: "0 0.75rem",
    borderRadius: "12px",
    border: "1px solid #d5e0d9",
    backgroundColor: "#f8faf8",
    color: "#17251f",
    fontSize: "0.84rem",
    outline: "none",
  },

  dateWrapper: {
    position: "relative",
  },

  fieldIcon: {
    position: "absolute",
    left: "0.8rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#718078",
    pointerEvents: "none",
  },

  dateInput: {
    width: "100%",
    height: "44px",
    boxSizing: "border-box",
    padding: "0 0.7rem 0 2.35rem",
    borderRadius: "12px",
    border: "1px solid #d5e0d9",
    backgroundColor: "#f8faf8",
    color: "#17251f",
    fontSize: "0.84rem",
    outline: "none",
  },

  resetButton: {
    height: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    padding: "0 0.9rem",
    borderRadius: "12px",
    border: "1px solid #dce5df",
    backgroundColor: "#ffffff",
    color: "#52615a",
    fontSize: "0.8rem",
    fontWeight: "700",
    cursor: "pointer",
  },

  activeFilterBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    marginTop: "1rem",
    padding: "0.7rem 0.85rem",
    borderRadius: "12px",
    backgroundColor: "#f4f8f5",
    border: "1px solid #dce9e0",
  },

  activeFilterText: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "#3f5d4b",
    fontSize: "0.78rem",
    fontWeight: "600",
  },

  clearFiltersButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#2f6b4f",
    fontSize: "0.78rem",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* =====================================================
     RECORDS
  ===================================================== */

  recordsCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow:
      "0 8px 25px rgba(23, 37, 31, 0.045)",
  },

  recordsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1.4rem",
    borderBottom: "1px solid #e4ebe6",
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.65rem 0.85rem",
    borderRadius: "11px",
    border: "1px solid #d5e0d9",
    backgroundColor: "#ffffff",
    color: "#2f6b4f",
    fontSize: "0.78rem",
    fontWeight: "700",
    cursor: "pointer",
  },

  spinIcon: {
    animation: "spin 1s linear infinite",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  thEmployee: {
    padding: "0.85rem 1.4rem",
    backgroundColor: "#f6f8f6",
    color: "#64736b",
    fontSize: "0.66rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #dce5df",
  },

  th: {
    padding: "0.85rem 1rem",
    backgroundColor: "#f6f8f6",
    color: "#64736b",
    fontSize: "0.66rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #dce5df",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #edf1ee",
  },

  employeeCell: {
    padding: "1rem 1.4rem",
  },

  employeeIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  avatar: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    backgroundColor: "#e8f2ec",
    color: "#2f6b4f",
    fontSize: "0.78rem",
    fontWeight: "800",
  },

  employeeDetails: {
    minWidth: 0,
  },

  employeeName: {
    color: "#17251f",
    fontSize: "0.86rem",
    fontWeight: "800",
    marginBottom: "0.18rem",
  },

  employeeMeta: {
    maxWidth: "230px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#7a8881",
    fontSize: "0.72rem",
  },

  employeeCode: {
    display: "inline-block",
    marginTop: "0.28rem",
    color: "#557060",
    fontSize: "0.65rem",
    fontWeight: "700",
    letterSpacing: "0.03em",
  },

  dateCell: {
    padding: "1rem",
    whiteSpace: "nowrap",
  },

  datePrimary: {
    color: "#2d3e35",
    fontSize: "0.8rem",
    fontWeight: "700",
  },

  timeCell: {
    padding: "1rem",
    whiteSpace: "nowrap",
  },

  timeValue: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "#52615a",
    fontSize: "0.78rem",
    fontWeight: "600",
  },

  statusCell: {
    padding: "1rem",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.4rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.67rem",
    fontWeight: "800",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
  },

  hoursCell: {
    padding: "1rem",
    color: "#2f6b4f",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },

  /* =====================================================
     MOBILE RECORDS
  ===================================================== */

  mobileRecords: {
    display: "none",
  },

  mobileRecordCard: {
    padding: "1rem",
    borderBottom: "1px solid #e8eeea",
  },

  mobileRecordTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0.75rem",
  },

  mobileEmployeeCode: {
    marginTop: "0.7rem",
    color: "#718078",
    fontSize: "0.7rem",
  },

  mobileDataGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "0.7rem",
    marginTop: "0.9rem",
    paddingTop: "0.9rem",
    borderTop: "1px solid #edf1ee",
  },

  mobileDataItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    color: "#2d3e35",
    fontSize: "0.78rem",
  },

  mobileDataLabel: {
    color: "#849089",
    fontSize: "0.62rem",
    fontWeight: "800",
    letterSpacing: "0.06em",
  },

  /* =====================================================
     STATES
  ===================================================== */

  stateContainer: {
    minHeight: "340px",
    padding: "3rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  loadingIndicator: {
    width: "48px",
    height: "48px",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "#e8f2ec",
  },

  loadingSpinner: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "3px solid #c9dfd0",
    borderTopColor: "#2f6b4f",
    animation: "spin 0.8s linear infinite",
  },

  stateIcon: {
    width: "50px",
    height: "50px",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
  },

  stateTitle: {
    margin: 0,
    color: "#17251f",
    fontSize: "1rem",
    fontWeight: "800",
  },

  stateDescription: {
    maxWidth: "430px",
    margin: "0.45rem 0 0",
    color: "#7a8881",
    fontSize: "0.8rem",
    lineHeight: 1.55,
  },

  errorDescription: {
    maxWidth: "550px",
    margin: "0.45rem 0 1rem",
    color: "#9a5757",
    fontSize: "0.8rem",
    lineHeight: 1.55,
  },

  retryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    marginTop: "1rem",
    padding: "0.65rem 0.9rem",
    border: "none",
    borderRadius: "11px",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
    fontSize: "0.78rem",
    fontWeight: "700",
    cursor: "pointer",
  },

  /* =====================================================
     PAGINATION
  ===================================================== */

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1rem 1.4rem",
    backgroundColor: "#f8faf8",
    borderTop: "1px solid #e2e9e4",
  },

  paginationSummary: {
    color: "#718078",
    fontSize: "0.75rem",
  },

  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
  },

  paginationButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    minHeight: "38px",
    padding: "0 0.75rem",
    borderRadius: "10px",
    border: "1px solid #d5e0d9",
    backgroundColor: "#ffffff",
    color: "#2f6b4f",
    fontSize: "0.74rem",
    fontWeight: "700",
    cursor: "pointer",
  },

  paginationButtonDisabled: {
    color: "#a0aaa4",
    backgroundColor: "#f1f4f2",
    cursor: "not-allowed",
  },

  currentPage: {
    minWidth: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: "800",
  },
};