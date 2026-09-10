import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Eye,
  Paperclip,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  CalendarDays,
  FolderOpen,
  ArrowUpRight,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getMyComplaints,
  getActiveComplaintCategories,
} from "../services/complaintApi";
import { showError } from "../../shared/utils/toast";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Load categories for filter dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getActiveComplaintCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories for filter", err);
      }
    }

    loadCategories();
  }, []);

  // Fetch employee's complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        status: selectedStatus || undefined,
        category_id: selectedCategoryId || undefined,
      };

      const res = await getMyComplaints(params);

      setComplaints(res.data?.items || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
      showError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedCategoryId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ---------------------------------------------------------
  // Status Badge
  // ---------------------------------------------------------
  const getStatusBadge = (status) => {
    const config = {
      OPEN: {
        label: "Open",
        background: "#ecfdf3",
        color: "#15803d",
        border: "#bbf7d0",
        icon: <FileText size={13} />,
      },
      UNDER_REVIEW: {
        label: "Under Review",
        background: "#fffbeb",
        color: "#a16207",
        border: "#fde68a",
        icon: <Clock size={13} />,
      },
      IN_PROGRESS: {
        label: "In Progress",
        background: "#f0fdf4",
        color: "#166534",
        border: "#bbf7d0",
        icon: <RefreshCw size={13} />,
      },
      RESOLVED: {
        label: "Resolved",
        background: "#f0fdf4",
        color: "#166534",
        border: "#86efac",
        icon: <CheckCircle size={13} />,
      },
      CLOSED: {
        label: "Closed",
        background: "#f8fafc",
        color: "#475569",
        border: "#cbd5e1",
        icon: <CheckCircle size={13} />,
      },
      REJECTED: {
        label: "Rejected",
        background: "#fef2f2",
        color: "#b91c1c",
        border: "#fecaca",
        icon: <AlertTriangle size={13} />,
      },
    };

    const item = config[status] || {
      label: status,
      background: "#f8fafc",
      color: "#475569",
      border: "#cbd5e1",
      icon: <FileText size={13} />,
    };

    return (
      <span
        style={{
          ...styles.statusBadge,
          backgroundColor: item.background,
          color: item.color,
          borderColor: item.border,
        }}
      >
        {item.icon}
        {item.label}
      </span>
    );
  };

  // ---------------------------------------------------------
  // Priority Badge
  // ---------------------------------------------------------
  const getPriorityBadge = (priority) => {
    const config = {
      URGENT: {
        label: "Urgent",
        color: "#b91c1c",
        background: "#fef2f2",
      },
      HIGH: {
        label: "High",
        color: "#c2410c",
        background: "#fff7ed",
      },
      MEDIUM: {
        label: "Medium",
        color: "#a16207",
        background: "#fffbeb",
      },
      LOW: {
        label: "Low",
        color: "#64748b",
        background: "#f8fafc",
      },
    };

    const item = config[priority] || {
      label: priority,
      color: "#64748b",
      background: "#f8fafc",
    };

    return (
      <span
        style={{
          ...styles.priorityBadge,
          color: item.color,
          backgroundColor: item.background,
        }}
      >
        <span
          style={{
            ...styles.priorityDot,
            backgroundColor: item.color,
          }}
        />
        {item.label}
      </span>
    );
  };

  // ---------------------------------------------------------
  // Date Formatting
  // ---------------------------------------------------------
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ---------------------------------------------------------
  // Reset Filters
  // ---------------------------------------------------------
  const clearFilters = () => {
    setSelectedStatus("");
    setSelectedCategoryId("");
    setPage(1);
  };

  const hasFilters = selectedStatus || selectedCategoryId;

  // ---------------------------------------------------------
  // Current Page Summary
  // ---------------------------------------------------------
  const openCount = complaints.filter(
    (item) => item.status === "OPEN"
  ).length;

  const reviewCount = complaints.filter(
    (item) =>
      item.status === "UNDER_REVIEW" || item.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = complaints.filter(
    (item) => item.status === "RESOLVED"
  ).length;

  return (
    <AppLayout title="My Complaints">
      <div style={styles.container}>
        {/* =====================================================
            BACK NAVIGATION
        ====================================================== */}
        <BackToDashboard
          to="/employee/dashboard"
          role="EMPLOYEE"
          icon={ArrowLeft}
        />

        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.heroEyebrow}>
              <span style={styles.heroEyebrowLine} />
              EMPLOYEE SELF SERVICE
            </div>

            <h1 style={styles.heroTitle}>My Complaints</h1>

            <p style={styles.heroDescription}>
              Track the complaints you have submitted, monitor HR updates,
              and review the current resolution status.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button
              type="button"
              onClick={fetchComplaints}
              disabled={loading}
              style={styles.secondaryButton}
            >
              <RefreshCw
                size={16}
                className={loading ? "my-complaints-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/employee/complaints/new"
              style={styles.primaryButton}
            >
              <Plus size={17} />
              Submit Complaint
            </Link>
          </div>
        </section>

        {/* =====================================================
            OVERVIEW CARDS
        ====================================================== */}
        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#ecfdf3",
                color: "#166534",
              }}
            >
              <FileText size={20} />
            </div>

            <div>
              <div style={styles.summaryLabel}>Total Submitted</div>
              <div style={styles.summaryValue}>{totalItems}</div>
              <div style={styles.summaryHint}>
                All submitted complaints
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#f0fdf4",
                color: "#15803d",
              }}
            >
              <FolderOpen size={20} />
            </div>

            <div>
              <div style={styles.summaryLabel}>Open</div>
              <div style={styles.summaryValue}>{openCount}</div>
              <div style={styles.summaryHint}>
                Open cases on this page
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#fffbeb",
                color: "#a16207",
              }}
            >
              <Clock size={20} />
            </div>

            <div>
              <div style={styles.summaryLabel}>Being Handled</div>
              <div style={styles.summaryValue}>{reviewCount}</div>
              <div style={styles.summaryHint}>
                Review or in progress
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#dcfce7",
                color: "#166534",
              }}
            >
              <CheckCircle size={20} />
            </div>

            <div>
              <div style={styles.summaryLabel}>Resolved</div>
              <div style={styles.summaryValue}>{resolvedCount}</div>
              <div style={styles.summaryHint}>
                Resolved on this page
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FILTER / EXPLORER SECTION
        ====================================================== */}
        <section style={styles.explorerCard}>
          <div style={styles.explorerHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                <Filter size={14} />
                CASE EXPLORER
              </div>

              <h2 style={styles.sectionTitle}>
                Find your complaint
              </h2>

              <p style={styles.sectionDescription}>
                Filter your submitted complaints by status or category.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={styles.clearFilterButton}
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div style={styles.filterGrid}>
            <div style={styles.filterField}>
              <label style={styles.fieldLabel}>
                <span>Status</span>
              </label>

              <select
                style={styles.input}
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={styles.filterField}>
              <label style={styles.fieldLabel}>
                <span>Category</span>
              </label>

              <select
                style={styles.input}
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterInfo}>
              <Search size={17} />
              <div>
                <strong>{totalItems}</strong>
                <span> complaints found</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CASE DIRECTORY
        ====================================================== */}
        <section style={styles.directorySection}>
          <div style={styles.directoryHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                <FileText size={14} />
                CASE DIRECTORY
              </div>

              <h2 style={styles.sectionTitle}>
                Submitted Complaints
              </h2>
            </div>

            {!loading && complaints.length > 0 && (
              <span style={styles.pageCounter}>
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* ===================================================
              LOADING
          ==================================================== */}
          {loading ? (
            <div style={styles.loadingCard}>
              <div style={styles.loaderCircle}>
                <RefreshCw
                  size={22}
                  className="my-complaints-spin"
                />
              </div>

              <h3 style={styles.loadingTitle}>
                Loading your complaints
              </h3>

              <p style={styles.loadingText}>
                Please wait while we retrieve your complaint records.
              </p>
            </div>
          ) : complaints.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================== */
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <FileText size={28} />
              </div>

              <h3 style={styles.emptyTitle}>
                No Complaints Found
              </h3>

              <p style={styles.emptyText}>
                {selectedStatus || selectedCategoryId
                  ? "No complaints match the selected filters."
                  : "You have not submitted any complaints yet."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={styles.secondaryButton}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/employee/complaints/new"
                  style={styles.primaryButton}
                >
                  <Plus size={17} />
                  Submit Your First Complaint
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* ===============================================
                  DESKTOP CASE TABLE
              ================================================ */}
              <div className="my-complaints-desktop">
                <div style={styles.tableCard}>
                  <div style={styles.tableScroll}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Complaint</th>
                          <th style={styles.th}>Category</th>
                          <th style={styles.th}>Priority</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Submitted</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaints.map((complaint) => (
                          <tr
                            key={complaint.id}
                            style={styles.tableRow}
                          >
                            <td style={styles.td}>
                              <div style={styles.complaintCell}>
                                <div style={styles.complaintCode}>
                                  {complaint.complaint_code}
                                </div>

                                <div style={styles.complaintSubject}>
                                  {complaint.subject}
                                </div>

                                <div style={styles.complaintDescription}>
                                  {complaint.description}
                                </div>
                              </div>
                            </td>

                            <td style={styles.td}>
                              <span style={styles.categoryBadge}>
                                {complaint.category_name || "General"}
                              </span>
                            </td>

                            <td style={styles.td}>
                              {getPriorityBadge(complaint.priority)}
                            </td>

                            <td style={styles.td}>
                              {getStatusBadge(complaint.status)}
                            </td>

                            <td style={styles.td}>
                              <div style={styles.dateCell}>
                                <CalendarDays size={14} />
                                {formatDate(complaint.created_at)}
                              </div>
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                textAlign: "right",
                              }}
                            >
                              <button
                                type="button"
                                style={styles.viewButton}
                                onClick={() =>
                                  setSelectedComplaint(complaint)
                                }
                              >
                                <Eye size={15} />
                                View
                                <ArrowUpRight size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  MOBILE CASE CARDS
              ================================================ */}
              <div className="my-complaints-mobile">
                <div style={styles.mobileList}>
                  {complaints.map((complaint) => (
                    <article
                      key={complaint.id}
                      style={styles.mobileComplaintCard}
                    >
                      <div style={styles.mobileTop}>
                        <div>
                          <div style={styles.mobileCode}>
                            {complaint.complaint_code}
                          </div>

                          <h3 style={styles.mobileTitle}>
                            {complaint.subject}
                          </h3>
                        </div>

                        {getStatusBadge(complaint.status)}
                      </div>

                      <div style={styles.mobileDescription}>
                        {complaint.description}
                      </div>

                      <div style={styles.mobileMeta}>
                        <span style={styles.categoryBadge}>
                          {complaint.category_name || "General"}
                        </span>

                        {getPriorityBadge(complaint.priority)}

                        <span style={styles.mobileDate}>
                          <CalendarDays size={13} />
                          {formatDate(complaint.created_at)}
                        </span>
                      </div>

                      <button
                        type="button"
                        style={styles.mobileViewButton}
                        onClick={() =>
                          setSelectedComplaint(complaint)
                        }
                      >
                        <Eye size={15} />
                        View Complaint
                        <ArrowUpRight size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              </div>

              {/* ===============================================
                  PAGINATION
              ================================================ */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <div style={styles.paginationInfo}>
                    Showing page <strong>{page}</strong> of{" "}
                    <strong>{totalPages}</strong>
                    <span> · {totalItems} total complaints</span>
                  </div>

                  <div style={styles.paginationActions}>
                    <button
                      type="button"
                      style={{
                        ...styles.pageButton,
                        opacity: page <= 1 ? 0.5 : 1,
                        cursor:
                          page <= 1 ? "not-allowed" : "pointer",
                      }}
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.pageButton,
                        opacity:
                          page >= totalPages ? 0.5 : 1,
                        cursor:
                          page >= totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages, current + 1)
                        )
                      }
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* =====================================================
            COMPLAINT DETAILS MODAL
        ====================================================== */}
        {selectedComplaint && (
          <div
            style={styles.modalOverlay}
            onClick={() => setSelectedComplaint(null)}
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderLeft}>
                  <div style={styles.modalEyebrow}>
                    COMPLAINT DETAILS
                  </div>

                  <div style={styles.modalCodeRow}>
                    <span style={styles.modalCode}>
                      {selectedComplaint.complaint_code}
                    </span>

                    {getStatusBadge(selectedComplaint.status)}
                  </div>

                  <div style={styles.modalDate}>
                    Submitted on{" "}
                    {formatDateTime(selectedComplaint.created_at)}
                  </div>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={() => setSelectedComplaint(null)}
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={styles.modalBody}>
                {/* Basic Information */}
                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <span style={styles.infoLabel}>Category</span>
                    <strong style={styles.infoValue}>
                      {selectedComplaint.category_name || "General"}
                    </strong>
                  </div>

                  <div style={styles.infoCard}>
                    <span style={styles.infoLabel}>Priority</span>
                    <div>
                      {getPriorityBadge(
                        selectedComplaint.priority
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Subject</div>

                  <div style={styles.subjectBox}>
                    {selectedComplaint.subject}
                  </div>
                </div>

                {/* Description */}
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Your Complaint</div>

                  <div style={styles.contentBox}>
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* HR Response */}
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>
                    HR Response
                  </div>

                  <div
                    style={
                      selectedComplaint.hr_response
                        ? styles.responseBox
                        : styles.noResponseBox
                    }
                  >
                    {selectedComplaint.hr_response ? (
                      <>
                        <div style={styles.responseHeader}>
                          <CheckCircle size={16} />
                          <span>Response from HR</span>
                        </div>

                        <div style={styles.responseText}>
                          {selectedComplaint.hr_response}
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock size={17} />
                        <span>
                          No response has been provided by HR yet.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Resolution */}
                {selectedComplaint.resolution && (
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>
                      Final Resolution
                    </div>

                    <div style={styles.resolutionBox}>
                      <div style={styles.resolutionIcon}>
                        <CheckCircle size={17} />
                      </div>

                      <div>
                        <div style={styles.resolutionText}>
                          {selectedComplaint.resolution}
                        </div>

                        {selectedComplaint.resolved_at && (
                          <div style={styles.resolutionDate}>
                            Resolved on{" "}
                            {formatDateTime(
                              selectedComplaint.resolved_at
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachment */}
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>
                    Supporting Attachment
                  </div>

                  {selectedComplaint.attachment_url ? (
                    <a
                      href={selectedComplaint.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.attachmentButton}
                    >
                      <Paperclip size={16} />
                      <span>
                        {selectedComplaint.attachment_name ||
                          "View Attachment"}
                      </span>
                      <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <div style={styles.noAttachment}>
                      No attachment uploaded with this complaint.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.modalCloseButton}
                  onClick={() => setSelectedComplaint(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            RESPONSIVE / ANIMATION CSS
        ====================================================== */}
        <style>
          {`
            .my-complaints-spin {
              animation: myComplaintsSpin 0.9s linear infinite;
            }

            @keyframes myComplaintsSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            .my-complaints-desktop {
              display: block;
            }

            .my-complaints-mobile {
              display: none;
            }

            button,
            a,
            select {
              transition:
                background-color 0.18s ease,
                border-color 0.18s ease,
                color 0.18s ease,
                box-shadow 0.18s ease,
                transform 0.18s ease;
            }

            button:not(:disabled):hover {
              transform: translateY(-1px);
            }

            select:focus {
              border-color: #166534 !important;
              box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.12);
            }

            @media (max-width: 900px) {
              .my-complaints-desktop {
                display: none;
              }

              .my-complaints-mobile {
                display: block;
              }
            }

            @media (max-width: 640px) {
              .my-complaints-mobile {
                display: block;
              }
            }
          `}
        </style>
      </div>
    </AppLayout>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = {
  container: {
    padding: "0 0 3rem 0",
    color: "#17251c",
  },

  // -----------------------------------------------------------
  // Hero
  // -----------------------------------------------------------

  hero: {
    marginTop: "1rem",
    marginBottom: "1.5rem",
    padding: "1.75rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #123d29 0%, #195c3c 60%, #24734b 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
    boxShadow: "0 14px 35px rgba(18, 61, 41, 0.14)",
  },

  heroLeft: {
    maxWidth: "720px",
  },

  heroEyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    fontSize: "0.7rem",
    fontWeight: "800",
    letterSpacing: "0.14em",
    color: "#b7e4c7",
    marginBottom: "0.65rem",
  },

  heroEyebrowLine: {
    width: "26px",
    height: "2px",
    borderRadius: "999px",
    backgroundColor: "#86efac",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  heroDescription: {
    margin: "0.65rem 0 0",
    color: "#d8eee0",
    fontSize: "0.92rem",
    lineHeight: "1.6",
    maxWidth: "650px",
  },

  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    flexWrap: "wrap",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.45rem",
    backgroundColor: "#ffffff",
    color: "#14532d",
    border: "1px solid #ffffff",
    padding: "0.65rem 1rem",
    borderRadius: "10px",
    fontSize: "0.84rem",
    fontWeight: "750",
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.45rem",
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #d7e0da",
    padding: "0.65rem 1rem",
    borderRadius: "10px",
    fontSize: "0.84rem",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // -----------------------------------------------------------
  // Summary Cards
  // -----------------------------------------------------------

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "0.9rem",
    marginBottom: "1.5rem",
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "15px",
    padding: "1.1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    minWidth: 0,
    boxShadow: "0 5px 16px rgba(15, 23, 42, 0.035)",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryLabel: {
    fontSize: "0.74rem",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "0.15rem",
  },

  summaryValue: {
    fontSize: "1.55rem",
    fontWeight: "800",
    color: "#173524",
    lineHeight: 1.1,
  },

  summaryHint: {
    fontSize: "0.69rem",
    color: "#94a3b8",
    marginTop: "0.2rem",
  },

  // -----------------------------------------------------------
  // Explorer
  // -----------------------------------------------------------

  explorerCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "17px",
    padding: "1.35rem",
    marginBottom: "1.6rem",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.035)",
  },

  explorerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.15rem",
    flexWrap: "wrap",
  },

  sectionEyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#28754c",
    fontSize: "0.68rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "0.3rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#183326",
    fontSize: "1.1rem",
    fontWeight: "800",
    letterSpacing: "-0.015em",
  },

  sectionDescription: {
    margin: "0.3rem 0 0",
    color: "#718096",
    fontSize: "0.8rem",
  },

  clearFilterButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    backgroundColor: "#f8faf9",
    color: "#166534",
    border: "1px solid #cfe0d4",
    borderRadius: "9px",
    padding: "0.5rem 0.75rem",
    fontSize: "0.77rem",
    fontWeight: "700",
    cursor: "pointer",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
    gap: "0.85rem",
    alignItems: "end",
  },

  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.38rem",
  },

  fieldLabel: {
    color: "#475569",
    fontSize: "0.75rem",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fbfcfb",
    color: "#1e293b",
    border: "1px solid #d9e2dc",
    borderRadius: "9px",
    padding: "0.65rem 0.75rem",
    fontSize: "0.82rem",
    outline: "none",
  },

  filterInfo: {
    minHeight: "39px",
    boxSizing: "border-box",
    borderRadius: "9px",
    backgroundColor: "#f3f8f4",
    border: "1px solid #d8e7dc",
    color: "#4b6354",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.55rem 0.75rem",
    fontSize: "0.78rem",
  },

  // -----------------------------------------------------------
  // Directory
  // -----------------------------------------------------------

  directorySection: {
    marginTop: "0.25rem",
  },

  directoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1rem",
    marginBottom: "0.8rem",
    flexWrap: "wrap",
  },

  pageCounter: {
    backgroundColor: "#f4f8f5",
    color: "#557060",
    border: "1px solid #dce7df",
    borderRadius: "999px",
    padding: "0.35rem 0.7rem",
    fontSize: "0.72rem",
    fontWeight: "700",
  },

  // -----------------------------------------------------------
  // Table
  // -----------------------------------------------------------

  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.035)",
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "950px",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    backgroundColor: "#f6f9f7",
    color: "#66786d",
    padding: "0.8rem 0.95rem",
    fontSize: "0.68rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderBottom: "1px solid #e1e8e3",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #edf1ee",
  },

  td: {
    padding: "0.95rem",
    color: "#1f3327",
    verticalAlign: "middle",
  },

  complaintCell: {
    maxWidth: "330px",
  },

  complaintCode: {
    color: "#166534",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    marginBottom: "0.2rem",
  },

  complaintSubject: {
    color: "#1c3024",
    fontSize: "0.9rem",
    fontWeight: "750",
    marginBottom: "0.25rem",
  },

  complaintDescription: {
    color: "#7b8a81",
    fontSize: "0.75rem",
    lineHeight: "1.45",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  categoryBadge: {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    backgroundColor: "#f4f8f5",
    color: "#496154",
    border: "1px solid #dce7df",
    padding: "0.3rem 0.55rem",
    borderRadius: "7px",
    fontSize: "0.7rem",
    fontWeight: "700",
  },

  priorityBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    borderRadius: "999px",
    padding: "0.3rem 0.55rem",
    fontSize: "0.7rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  priorityDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    border: "1px solid",
    borderRadius: "999px",
    padding: "0.3rem 0.6rem",
    fontSize: "0.69rem",
    fontWeight: "750",
    whiteSpace: "nowrap",
  },

  dateCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "#687a70",
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },

  viewButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    backgroundColor: "#f5faf6",
    color: "#166534",
    border: "1px solid #cfe0d4",
    borderRadius: "8px",
    padding: "0.45rem 0.65rem",
    fontSize: "0.74rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  // -----------------------------------------------------------
  // Loading / Empty
  // -----------------------------------------------------------

  loadingCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "16px",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },

  loaderCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#eff8f2",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.8rem",
  },

  loadingTitle: {
    margin: 0,
    color: "#1f3528",
    fontSize: "1rem",
    fontWeight: "750",
  },

  loadingText: {
    margin: "0.35rem 0 0",
    color: "#829087",
    fontSize: "0.78rem",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "16px",
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },

  emptyIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#eff8f2",
    color: "#28754c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.85rem",
  },

  emptyTitle: {
    margin: 0,
    color: "#20372a",
    fontSize: "1.05rem",
    fontWeight: "800",
  },

  emptyText: {
    margin: "0.4rem 0 1rem",
    maxWidth: "430px",
    color: "#78877e",
    fontSize: "0.8rem",
    lineHeight: "1.5",
  },

  // -----------------------------------------------------------
  // Mobile
  // -----------------------------------------------------------

  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },

  mobileComplaintCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "15px",
    padding: "1rem",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.035)",
  },

  mobileTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.7rem",
  },

  mobileCode: {
    color: "#166534",
    fontSize: "0.7rem",
    fontWeight: "800",
    marginBottom: "0.25rem",
  },

  mobileTitle: {
    margin: 0,
    color: "#1e3327",
    fontSize: "0.95rem",
    fontWeight: "750",
    lineHeight: "1.35",
  },

  mobileDescription: {
    marginTop: "0.7rem",
    color: "#6e7d74",
    fontSize: "0.77rem",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  mobileMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.45rem",
    marginTop: "0.8rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #edf1ee",
  },

  mobileDate: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    color: "#7c8a82",
    fontSize: "0.69rem",
  },

  mobileViewButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    marginTop: "0.85rem",
    padding: "0.65rem",
    backgroundColor: "#f3f8f4",
    color: "#166534",
    border: "1px solid #d2e2d7",
    borderRadius: "9px",
    fontSize: "0.77rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  // -----------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },

  paginationInfo: {
    color: "#708078",
    fontSize: "0.75rem",
  },

  paginationActions: {
    display: "flex",
    gap: "0.45rem",
  },

  pageButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #d7e0da",
    borderRadius: "8px",
    padding: "0.5rem 0.7rem",
    fontSize: "0.74rem",
    fontWeight: "700",
  },

  // -----------------------------------------------------------
  // Modal
  // -----------------------------------------------------------

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 35, 24, 0.68)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: "1rem",
  },

  modal: {
    width: "min(94vw, 700px)",
    maxHeight: "calc(100vh - 30px)",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.22)",
    border: "1px solid #dce5df",
  },

  modalHeader: {
    padding: "1.2rem 1.35rem",
    background:
      "linear-gradient(135deg, #123d29 0%, #195c3c 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexShrink: 0,
  },

  modalHeaderLeft: {
    minWidth: 0,
  },

  modalEyebrow: {
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.13em",
    color: "#b7e4c7",
    marginBottom: "0.45rem",
  },

  modalCodeRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.55rem",
  },

  modalCode: {
    fontSize: "1.05rem",
    fontWeight: "800",
    color: "#ffffff",
  },

  modalDate: {
    marginTop: "0.35rem",
    color: "#c9e2d2",
    fontSize: "0.72rem",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    flexShrink: 0,
    borderRadius: "9px",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  modalBody: {
    padding: "1.35rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    backgroundColor: "#ffffff",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "0.75rem",
  },

  infoCard: {
    backgroundColor: "#f7faf8",
    border: "1px solid #dfe8e2",
    borderRadius: "11px",
    padding: "0.8rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },

  infoLabel: {
    color: "#78877e",
    fontSize: "0.66rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  infoValue: {
    color: "#20372a",
    fontSize: "0.84rem",
  },

  detailSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },

  detailLabel: {
    color: "#65766c",
    fontSize: "0.69rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  subjectBox: {
    color: "#1f3327",
    fontSize: "1rem",
    fontWeight: "750",
    lineHeight: "1.4",
  },

  contentBox: {
    backgroundColor: "#f8faf9",
    border: "1px solid #dfe8e2",
    borderRadius: "10px",
    padding: "0.9rem",
    color: "#33443a",
    fontSize: "0.84rem",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },

  responseBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #c8e6d0",
    borderRadius: "10px",
    padding: "0.9rem",
  },

  responseHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#166534",
    fontSize: "0.72rem",
    fontWeight: "800",
    marginBottom: "0.45rem",
  },

  responseText: {
    color: "#365243",
    fontSize: "0.84rem",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },

  noResponseBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #f3df9c",
    borderRadius: "10px",
    padding: "0.85rem",
    color: "#8a6a19",
    fontSize: "0.8rem",
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
  },

  resolutionBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.65rem",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bfe5c8",
    borderRadius: "10px",
    padding: "0.9rem",
  },

  resolutionIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  resolutionText: {
    color: "#31503c",
    fontSize: "0.84rem",
    lineHeight: "1.55",
    whiteSpace: "pre-wrap",
  },

  resolutionDate: {
    color: "#718078",
    fontSize: "0.7rem",
    marginTop: "0.4rem",
  },

  attachmentButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    width: "fit-content",
    maxWidth: "100%",
    boxSizing: "border-box",
    backgroundColor: "#f3f8f4",
    color: "#166534",
    border: "1px solid #cfe0d4",
    borderRadius: "9px",
    padding: "0.6rem 0.75rem",
    fontSize: "0.77rem",
    fontWeight: "750",
    textDecoration: "none",
  },

  noAttachment: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "0.75rem",
    color: "#7b8794",
    fontSize: "0.77rem",
  },

  modalFooter: {
    padding: "0.9rem 1.35rem",
    borderTop: "1px solid #e1e8e3",
    backgroundColor: "#f8faf9",
    display: "flex",
    justifyContent: "flex-end",
    flexShrink: 0,
  },

  modalCloseButton: {
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #d6e0d9",
    borderRadius: "9px",
    padding: "0.55rem 1rem",
    fontSize: "0.78rem",
    fontWeight: "750",
    cursor: "pointer",
  },
};

export default MyComplaints;