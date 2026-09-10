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
  Calendar,
  FolderKanban,
  ClipboardList,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getMyWorkReports,
  getMyAssignedProjects,
} from "../services/workReportApi";
import { showError } from "../../shared/utils/toast";

function MyWorkReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState(null);

  // ---------------------------------------------------------
  // Load assigned projects
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await getMyAssignedProjects();
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects for filter", err);
      }
    }

    loadProjects();
  }, []);

  // ---------------------------------------------------------
  // Fetch employee work reports
  // ---------------------------------------------------------
  const fetchReports = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        project_id: selectedProjectId || undefined,
      };

      const res = await getMyWorkReports(params);

      setReports(res.data?.items || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch work reports", err);
      showError("Failed to load work reports.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedProjectId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ---------------------------------------------------------
  // Reset project filter
  // ---------------------------------------------------------
  const handleResetFilter = () => {
    setSelectedProjectId("");
    setPage(1);
  };

  // ---------------------------------------------------------
  // Close modal
  // ---------------------------------------------------------
  const closeModal = () => {
    setSelectedReport(null);
  };

  // ---------------------------------------------------------
  // Statistics based on loaded reports
  // ---------------------------------------------------------
  const blockerCount = reports.filter(
    (report) => report.problems_faced
  ).length;

  const attachmentCount = reports.filter(
    (report) => report.document_url
  ).length;

  return (
    <AppLayout title="My Work Reports">
      <div style={styles.page}>
        {/* =====================================================
            TOP NAVIGATION
        ====================================================== */}
        <div style={styles.topNavigation}>
          <BackToDashboard
            to="/employee/dashboard"
            role="EMPLOYEE"
            icon={ArrowLeft}
          />

          <div style={styles.topActions}>
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              style={{
                ...styles.refreshButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw
                size={15}
                style={{
                  animation: loading
                    ? "spin 1s linear infinite"
                    : "none",
                }}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/employee/work-reports/new"
              style={styles.submitButton}
            >
              <Plus size={16} />
              Submit Today's Report
            </Link>
          </div>
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.eyebrow}>
              <ClipboardList size={14} />
              EMPLOYEE WORKSPACE
            </div>

            <h1 style={styles.title}>My Work Reports</h1>

            <p style={styles.subtitle}>
              Track your daily submissions, review your project
              activities, and keep your work progress organized.
            </p>

            <div style={styles.heroMeta}>
              <span style={styles.heroMetaItem}>
                <FileText size={14} />
                Daily Reports
              </span>

              <span style={styles.heroDivider}>•</span>

              <span style={styles.heroMetaItem}>
                <FolderKanban size={14} />
                Project Activity
              </span>

              <span style={styles.heroDivider}>•</span>

              <span style={styles.heroMetaItem}>
                <Calendar size={14} />
                Work History
              </span>
            </div>
          </div>

          <div style={styles.heroSide}>
            <div style={styles.heroIcon}>
              <ClipboardList size={34} />
            </div>

            <div>
              <div style={styles.heroSideLabel}>YOUR REPORTS</div>
              <div style={styles.heroSideValue}>
                {totalItems}
              </div>
              <div style={styles.heroSideText}>
                Total submissions
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FileText size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Total Reports</div>
              <div style={styles.statValue}>{totalItems}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FolderKanban size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Assigned Projects</div>
              <div style={styles.statValue}>
                {projects.length}
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Paperclip size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Attachments</div>
              <div style={styles.statValue}>
                {attachmentCount}
              </div>
            </div>
          </div>

          <div style={styles.statCardWarning}>
            <div style={styles.statIconWarning}>
              <AlertTriangle size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Reported Issues</div>
              <div style={styles.statValue}>
                {blockerCount}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PROJECT FILTER WORKSPACE
        ====================================================== */}
        <section style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                <FolderKanban size={14} />
                REPORT FILTER
              </div>

              <h2 style={styles.sectionTitle}>
                Find Your Reports
              </h2>

              <p style={styles.sectionDescription}>
                Filter your submitted reports by assigned project.
              </p>
            </div>

            {selectedProjectId && (
              <button
                type="button"
                onClick={handleResetFilter}
                style={styles.clearButton}
              >
                <RotateCcw size={14} />
                Clear Filter
              </button>
            )}
          </div>

          <div style={styles.filterBody}>
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>
                Assigned Project
              </label>

              <div style={styles.selectWrapper}>
                <FolderKanban
                  size={16}
                  style={styles.selectIcon}
                />

                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by project"
                  style={styles.select}
                >
                  <option value="">
                    All Assigned Projects
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.project_id}
                      value={project.project_id}
                    >
                      {project.project_name} (
                      {project.project_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.filterSummary}>
              <span style={styles.filterSummaryLabel}>
                REPORTS
              </span>

              <strong style={styles.filterSummaryValue}>
                {totalItems}
              </strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            REPORT DIRECTORY
        ====================================================== */}
        <section style={styles.reportSection}>
          <div style={styles.reportHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                <ClipboardList size={14} />
                REPORT HISTORY
              </div>

              <h2 style={styles.sectionTitle}>
                Your Submitted Reports
              </h2>
            </div>

            {!loading && reports.length > 0 && (
              <div style={styles.pageBadge}>
                Page {page} of {totalPages}
              </div>
            )}
          </div>

          {/* ===================================================
              LOADING
          ==================================================== */}
          {loading ? (
            <div style={styles.loadingCard}>
              <div style={styles.loadingIcon}>
                <RefreshCw size={23} />
              </div>

              <h3 style={styles.loadingTitle}>
                Loading your reports
              </h3>

              <p style={styles.loadingText}>
                Fetching your submitted work reports...
              </p>
            </div>
          ) : reports.length === 0 ? (
            /* =================================================
                EMPTY STATE
            ================================================== */
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <FileText size={30} />
              </div>

              <h3 style={styles.emptyTitle}>
                No Work Reports Found
              </h3>

              <p style={styles.emptySubtitle}>
                {selectedProjectId
                  ? "No work reports submitted for the selected project filter."
                  : "You have not submitted any daily work reports yet."}
              </p>

              {selectedProjectId ? (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  style={styles.emptySecondaryButton}
                >
                  <RotateCcw size={14} />
                  Clear Project Filter
                </button>
              ) : (
                <Link
                  to="/employee/work-reports/new"
                  style={styles.emptyPrimaryButton}
                >
                  <Plus size={15} />
                  Submit Your First Report
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div
                className="my-work-reports-desktop"
                style={styles.tableCard}
              >
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHead}>
                          Report Date
                        </th>

                        <th style={styles.tableHead}>
                          Project
                        </th>

                        <th style={styles.tableHead}>
                          Work Description
                        </th>

                        <th style={styles.tableHead}>
                          Attachment
                        </th>

                        <th style={styles.tableHead}>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map((report) => (
                        <tr
                          key={report.id}
                          style={styles.tableRow}
                        >
                          {/* Date */}
                          <td style={styles.tableCell}>
                            <div style={styles.dateCell}>
                              <div style={styles.dateIcon}>
                                <Calendar size={15} />
                              </div>

                              <div>
                                <div style={styles.dateValue}>
                                  {report.report_date}
                                </div>

                                <div style={styles.dateLabel}>
                                  Report submitted
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Project */}
                          <td style={styles.tableCell}>
                            <div style={styles.projectCell}>
                              <div style={styles.projectIcon}>
                                <FolderKanban size={15} />
                              </div>

                              <div>
                                <div
                                  style={
                                    styles.projectName
                                  }
                                >
                                  {report.project_name ||
                                    "Project"}
                                </div>

                                <div
                                  style={
                                    styles.projectCode
                                  }
                                >
                                  {report.project_code ||
                                    "No project code"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td style={styles.tableCell}>
                            <div
                              style={
                                styles.descriptionWrapper
                              }
                            >
                              <div
                                style={
                                  styles.descriptionSnippet
                                }
                              >
                                {report.work_description}
                              </div>

                              {report.problems_faced && (
                                <span
                                  style={
                                    styles.blockerBadge
                                  }
                                  title={
                                    report.problems_faced
                                  }
                                >
                                  <AlertTriangle
                                    size={11}
                                  />
                                  Issue Reported
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Attachment */}
                          <td style={styles.tableCell}>
                            {report.document_url ? (
                              <a
                                href={report.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.attachmentLink}
                              >
                                <Paperclip size={14} />

                                <span>
                                  {report.document_name ||
                                    "Attachment"}
                                </span>

                                <ExternalLink
                                  size={11}
                                />
                              </a>
                            ) : (
                              <span
                                style={
                                  styles.noAttachment
                                }
                              >
                                No attachment
                              </span>
                            )}
                          </td>

                          {/* View */}
                          <td style={styles.tableCell}>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedReport(report)
                              }
                              style={styles.viewButton}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================== */}
              <div
                className="my-work-reports-mobile"
                style={styles.mobileList}
              >
                {reports.map((report) => (
                  <article
                    key={report.id}
                    style={styles.mobileCard}
                  >
                    <div style={styles.mobileTop}>
                      <div style={styles.mobileDate}>
                        <div style={styles.mobileDateIcon}>
                          <Calendar size={15} />
                        </div>

                        <div>
                          <div style={styles.mobileDateValue}>
                            {report.report_date}
                          </div>

                          <div style={styles.mobileDateLabel}>
                            Daily report
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReport(report)
                        }
                        style={styles.mobileViewButton}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>

                    <div style={styles.mobileProject}>
                      <div style={styles.mobileProjectIcon}>
                        <FolderKanban size={15} />
                      </div>

                      <div>
                        <div style={styles.mobileProjectName}>
                          {report.project_name ||
                            "Project"}
                        </div>

                        <div style={styles.mobileProjectCode}>
                          {report.project_code ||
                            "No project code"}
                        </div>
                      </div>
                    </div>

                    <div style={styles.mobileDivider} />

                    <div style={styles.mobileDescription}>
                      <div style={styles.mobileLabel}>
                        WORK DESCRIPTION
                      </div>

                      <p style={styles.mobileDescriptionText}>
                        {report.work_description}
                      </p>
                    </div>

                    {report.problems_faced && (
                      <div style={styles.mobileBlocker}>
                        <AlertTriangle size={14} />

                        <div>
                          <strong>Problems Faced</strong>

                          <p
                            style={
                              styles.mobileBlockerText
                            }
                          >
                            {report.problems_faced}
                          </p>
                        </div>
                      </div>
                    )}

                    {report.document_url && (
                      <a
                        href={report.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.mobileAttachment}
                      >
                        <Paperclip size={14} />

                        <span>
                          {report.document_name ||
                            "View Attachment"}
                        </span>

                        <ExternalLink size={11} />
                      </a>
                    )}
                  </article>
                ))}
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <div style={styles.paginationInfo}>
                    Page <strong>{page}</strong> of{" "}
                    <strong>{totalPages}</strong>

                    <span style={styles.totalText}>
                      ({totalItems} total reports)
                    </span>
                  </div>

                  <div style={styles.paginationActions}>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((currentPage) =>
                          Math.max(1, currentPage - 1)
                        )
                      }
                      style={{
                        ...styles.paginationButton,
                        opacity: page <= 1 ? 0.45 : 1,
                        cursor:
                          page <= 1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <ChevronLeft size={15} />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((currentPage) =>
                          Math.min(
                            totalPages,
                            currentPage + 1
                          )
                        )
                      }
                      style={{
                        ...styles.paginationButton,
                        opacity:
                          page >= totalPages ? 0.45 : 1,
                        cursor:
                          page >= totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* =====================================================
            REPORT DETAILS MODAL
        ====================================================== */}
        {selectedReport && (
          <div
            style={styles.modalOverlay}
            onClick={closeModal}
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderLeft}>
                  <div style={styles.modalIcon}>
                    <FileText size={20} />
                  </div>

                  <div>
                    <div style={styles.modalEyebrow}>
                      WORK REPORT
                    </div>

                    <h3 style={styles.modalTitle}>
                      Work Report Details
                    </h3>

                    <div style={styles.modalSub}>
                      {selectedReport.report_date}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  style={styles.closeButton}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={styles.modalBody}>
                {/* Project */}
                <div style={styles.detailCard}>
                  <div style={styles.detailCardHeader}>
                    <FolderKanban size={15} />
                    PROJECT
                  </div>

                  <div style={styles.detailValue}>
                    {selectedReport.project_name ||
                      "Project"}
                  </div>

                  <div style={styles.detailSubValue}>
                    {selectedReport.project_code ||
                      "No project code"}
                  </div>
                </div>

                {/* Date */}
                <div style={styles.detailCard}>
                  <div style={styles.detailCardHeader}>
                    <Calendar size={15} />
                    REPORT DATE
                  </div>

                  <div style={styles.detailValue}>
                    {selectedReport.report_date}
                  </div>
                </div>

                {/* Work Description */}
                <div style={styles.detailSection}>
                  <div style={styles.detailSectionTitle}>
                    <FileText size={15} />
                    Work Description
                  </div>

                  <div style={styles.detailContent}>
                    {selectedReport.work_description ||
                      "No work description provided."}
                  </div>
                </div>

                {/* Problems */}
                <div style={styles.detailSection}>
                  <div style={styles.detailSectionTitle}>
                    <AlertTriangle size={15} />
                    Problems Faced
                  </div>

                  <div
                    style={{
                      ...styles.detailContent,
                      ...(selectedReport.problems_faced
                        ? styles.problemContent
                        : {}),
                    }}
                  >
                    {selectedReport.problems_faced ||
                      "None reported."}
                  </div>
                </div>

                {/* Attachment */}
                <div style={styles.detailSection}>
                  <div style={styles.detailSectionTitle}>
                    <Paperclip size={15} />
                    Attachment
                  </div>

                  {selectedReport.document_url ? (
                    <a
                      href={selectedReport.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.documentButton}
                    >
                      <Paperclip size={16} />

                      <span>
                        Download / View{" "}
                        {selectedReport.document_name ||
                          "Attachment"}
                      </span>

                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <div style={styles.noDocument}>
                      No attachment uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={styles.modalCloseButton}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          RESPONSIVE CSS
      ======================================================== */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .my-work-reports-desktop {
            display: block;
          }

          .my-work-reports-mobile {
            display: none;
          }

          @media (max-width: 900px) {
            .my-work-reports-desktop {
              display: block;
            }
          }

          @media (max-width: 767px) {
            .my-work-reports-desktop {
              display: none !important;
            }

            .my-work-reports-mobile {
              display: flex !important;
            }
          }

          @media (max-width: 700px) {
            .hr-work-report-mobile {
              display: block;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = {
  page: {
    padding: "0 0 40px",
    color: "#1d3027",
  },

  // -----------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------

  topNavigation: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    height: "38px",
    padding: "0 12px",
    borderRadius: "9px",
    border: "1px solid #d2e1d8",
    background: "#ffffff",
    color: "#24543c",
    fontSize: "11px",
    fontWeight: "800",
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    height: "38px",
    padding: "0 14px",
    borderRadius: "9px",
    border: "1px solid #17613d",
    background: "#17613d",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "800",
    textDecoration: "none",
    boxShadow: "0 5px 12px rgba(23, 97, 61, 0.16)",
  },

  // -----------------------------------------------------------
  // Hero
  // -----------------------------------------------------------

  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    padding: "30px",
    marginBottom: "16px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #124d31 0%, #236c47 100%)",
    boxShadow: "0 12px 30px rgba(18, 77, 49, 0.14)",
    overflow: "hidden",
  },

  heroContent: {
    minWidth: 0,
    flex: 1,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    color: "#d9f1e2",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.13em",
    marginBottom: "9px",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(1.75rem, 3vw, 2.4rem)",
    fontWeight: "800",
    lineHeight: 1.15,
    letterSpacing: "-0.025em",
  },

  subtitle: {
    maxWidth: "690px",
    margin: "10px 0 0",
    color: "#d6e9dd",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "17px",
  },

  heroMetaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#e0efe6",
    fontSize: "10px",
    fontWeight: "700",
  },

  heroDivider: {
    color: "#86b99b",
    fontSize: "10px",
  },

  heroSide: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "175px",
    padding: "15px",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  heroIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    flexShrink: 0,
  },

  heroSideLabel: {
    color: "#a7cdb5",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.12em",
  },

  heroSideValue: {
    marginTop: "2px",
    color: "#ffffff",
    fontSize: "21px",
    fontWeight: "800",
  },

  heroSideText: {
    color: "#c1ddcb",
    fontSize: "9px",
  },

  // -----------------------------------------------------------
  // Stats
  // -----------------------------------------------------------

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    gap: "11px",
    marginBottom: "16px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "16px",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "13px",
    boxShadow: "0 4px 14px rgba(18, 77, 49, 0.035)",
  },

  statCardWarning: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "16px",
    background: "#fffdf7",
    border: "1px solid #eadfbe",
    borderRadius: "13px",
    boxShadow: "0 4px 14px rgba(120, 90, 20, 0.035)",
  },

  statIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e7f3eb",
    color: "#17613d",
    flexShrink: 0,
  },

  statIconWarning: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9efd5",
    color: "#80611e",
    flexShrink: 0,
  },

  statLabel: {
    color: "#75837b",
    fontSize: "10px",
    fontWeight: "700",
    marginBottom: "3px",
  },

  statValue: {
    color: "#1d3027",
    fontSize: "20px",
    fontWeight: "800",
  },

  // -----------------------------------------------------------
  // Filter
  // -----------------------------------------------------------

  filterCard: {
    marginBottom: "18px",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(18, 77, 49, 0.035)",
  },

  filterHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    padding: "19px 20px",
    borderBottom: "1px solid #e5eee8",
    flexWrap: "wrap",
  },

  sectionEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#347452",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "5px",
  },

  sectionTitle: {
    margin: 0,
    color: "#21362b",
    fontSize: "16px",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "4px 0 0",
    color: "#7b8881",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #d5e2da",
    background: "#f8fbf9",
    color: "#315d47",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  filterBody: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "15px",
    padding: "17px 20px",
    flexWrap: "wrap",
  },

  filterField: {
    flex: "1 1 300px",
    maxWidth: "500px",
  },

  filterLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#52635a",
    fontSize: "10px",
    fontWeight: "800",
  },

  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  selectIcon: {
    position: "absolute",
    left: "11px",
    color: "#708078",
    pointerEvents: "none",
    zIndex: 1,
  },

  select: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    padding: "0 12px 0 34px",
    border: "1px solid #d4e1d9",
    borderRadius: "9px",
    background: "#fbfdfc",
    color: "#24382e",
    fontSize: "11px",
    outline: "none",
  },

  filterSummary: {
    minWidth: "120px",
    padding: "9px 13px",
    borderRadius: "9px",
    background: "#f3f8f5",
    border: "1px solid #dce8df",
    textAlign: "right",
  },

  filterSummaryLabel: {
    display: "block",
    color: "#7b8981",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.1em",
  },

  filterSummaryValue: {
    display: "block",
    marginTop: "2px",
    color: "#17613d",
    fontSize: "17px",
    fontWeight: "800",
  },

  // -----------------------------------------------------------
  // Report Section
  // -----------------------------------------------------------

  reportSection: {
    marginTop: "2px",
  },

  reportHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  pageBadge: {
    padding: "6px 9px",
    borderRadius: "8px",
    background: "#f3f8f5",
    border: "1px solid #dce7df",
    color: "#607068",
    fontSize: "9px",
    fontWeight: "800",
  },

  loadingCard: {
    minHeight: "270px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "15px",
  },

  loadingIcon: {
    width: "46px",
    height: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    background: "#e7f3eb",
    color: "#17613d",
    animation: "spin 1.2s linear infinite",
  },

  loadingTitle: {
    margin: "12px 0 4px",
    color: "#25382e",
    fontSize: "14px",
    fontWeight: "800",
  },

  loadingText: {
    margin: 0,
    color: "#7c8982",
    fontSize: "11px",
  },

  emptyCard: {
    minHeight: "270px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "15px",
  },

  emptyIcon: {
    width: "57px",
    height: "57px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    background: "#eaf4ed",
    color: "#347452",
  },

  emptyTitle: {
    margin: "12px 0 5px",
    color: "#26392f",
    fontSize: "15px",
    fontWeight: "800",
  },

  emptySubtitle: {
    maxWidth: "430px",
    margin: 0,
    color: "#7b8881",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  emptyPrimaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "14px",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#17613d",
    border: "1px solid #17613d",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "800",
    textDecoration: "none",
  },

  emptySecondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "14px",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#f7faf8",
    border: "1px solid #cfe0d5",
    color: "#315d47",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  // -----------------------------------------------------------
  // Table
  // -----------------------------------------------------------

  tableCard: {
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(18, 77, 49, 0.035)",
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "930px",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "11px",
  },

  tableHead: {
    padding: "12px 13px",
    background: "#f3f8f5",
    borderBottom: "1px solid #dfe9e2",
    color: "#5c6d64",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #edf2ee",
  },

  tableCell: {
    padding: "13px",
    color: "#35483e",
    verticalAlign: "middle",
  },

  dateCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "145px",
  },

  dateIcon: {
    width: "31px",
    height: "31px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#eaf4ed",
    color: "#347452",
    flexShrink: 0,
  },

  dateValue: {
    color: "#26392f",
    fontSize: "11px",
    fontWeight: "800",
  },

  dateLabel: {
    marginTop: "2px",
    color: "#8a9690",
    fontSize: "8px",
  },

  projectCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "160px",
  },

  projectIcon: {
    width: "31px",
    height: "31px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#f0f5f2",
    color: "#397254",
    flexShrink: 0,
  },

  projectName: {
    color: "#2b4035",
    fontSize: "11px",
    fontWeight: "800",
  },

  projectCode: {
    marginTop: "2px",
    color: "#86928b",
    fontSize: "8px",
  },

  descriptionWrapper: {
    maxWidth: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
  },

  descriptionSnippet: {
    color: "#4b5c53",
    lineHeight: 1.5,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  blockerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#fff6df",
    border: "1px solid #ead9aa",
    color: "#80611e",
    fontSize: "8px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  attachmentLink: {
    maxWidth: "175px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#17613d",
    fontSize: "9px",
    fontWeight: "800",
    textDecoration: "none",
  },

  noAttachment: {
    color: "#9aa59f",
    fontSize: "9px",
  },

  viewButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #cfe0d5",
    background: "#f7faf8",
    color: "#17613d",
    fontSize: "9px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // -----------------------------------------------------------
  // Mobile
  // -----------------------------------------------------------

  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  mobileCard: {
    padding: "15px",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "14px",
    boxShadow: "0 4px 13px rgba(18, 77, 49, 0.035)",
  },

  mobileTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },

  mobileDate: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },

  mobileDateIcon: {
    width: "33px",
    height: "33px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    background: "#eaf4ed",
    color: "#347452",
    flexShrink: 0,
  },

  mobileDateValue: {
    color: "#26392f",
    fontSize: "11px",
    fontWeight: "800",
  },

  mobileDateLabel: {
    marginTop: "2px",
    color: "#87938c",
    fontSize: "8px",
  },

  mobileViewButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
    padding: "7px 9px",
    borderRadius: "8px",
    border: "1px solid #cfe0d5",
    background: "#f7faf8",
    color: "#17613d",
    fontSize: "9px",
    fontWeight: "800",
    cursor: "pointer",
  },

  mobileProject: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "13px",
  },

  mobileProjectIcon: {
    width: "31px",
    height: "31px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#f0f5f2",
    color: "#397254",
    flexShrink: 0,
  },

  mobileProjectName: {
    color: "#2b4035",
    fontSize: "11px",
    fontWeight: "800",
  },

  mobileProjectCode: {
    marginTop: "2px",
    color: "#86928b",
    fontSize: "8px",
  },

  mobileDivider: {
    height: "1px",
    margin: "12px 0",
    background: "#edf2ee",
  },

  mobileDescription: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  mobileLabel: {
    color: "#718078",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  mobileDescriptionText: {
    margin: 0,
    color: "#45574e",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  mobileBlocker: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "11px",
    padding: "10px",
    borderRadius: "9px",
    background: "#fff8e8",
    border: "1px solid #ead9aa",
    color: "#80611e",
    fontSize: "10px",
    lineHeight: 1.45,
  },

  mobileBlockerText: {
    margin: "3px 0 0",
    color: "#80611e",
    fontSize: "10px",
    lineHeight: 1.45,
  },

  mobileAttachment: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "10px",
    color: "#17613d",
    textDecoration: "none",
    fontSize: "9px",
    fontWeight: "800",
  },

  // -----------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "12px",
    padding: "12px 2px",
    flexWrap: "wrap",
  },

  paginationInfo: {
    color: "#68776f",
    fontSize: "10px",
  },

  totalText: {
    marginLeft: "4px",
    color: "#9aa59f",
  },

  paginationActions: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  paginationButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #d5e1d9",
    background: "#ffffff",
    color: "#345448",
    fontSize: "9px",
    fontWeight: "800",
  },

  // -----------------------------------------------------------
  // Modal
  // -----------------------------------------------------------

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    background: "rgba(10, 28, 19, 0.63)",
    backdropFilter: "blur(5px)",
  },

  modal: {
    width: "min(94vw, 620px)",
    maxHeight: "calc(100vh - 32px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #dce7df",
    borderRadius: "17px",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.22)",
  },

  modalHeader: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "16px 18px",
    background: "#f4f9f6",
    borderBottom: "1px solid #dfe9e2",
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  modalIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background: "#dceee3",
    color: "#17613d",
    flexShrink: 0,
  },

  modalEyebrow: {
    color: "#397254",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "3px",
  },

  modalTitle: {
    margin: 0,
    color: "#1e3027",
    fontSize: "15px",
    fontWeight: "800",
  },

  modalSub: {
    marginTop: "3px",
    color: "#7c8982",
    fontSize: "9px",
  },

  closeButton: {
    width: "33px",
    height: "33px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #d5e1d9",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#607168",
    cursor: "pointer",
  },

  modalBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "17px",
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },

  detailCard: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #dfe9e2",
    background: "#fbfdfc",
  },

  detailCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#397254",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  detailValue: {
    marginTop: "7px",
    color: "#26392f",
    fontSize: "12px",
    fontWeight: "800",
    lineHeight: 1.4,
  },

  detailSubValue: {
    marginTop: "2px",
    color: "#87938c",
    fontSize: "9px",
  },

  detailSection: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  detailSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#3d594a",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  detailContent: {
    padding: "11px",
    borderRadius: "9px",
    border: "1px solid #dfe9e2",
    background: "#f8fbf9",
    color: "#45574e",
    fontSize: "11px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },

  problemContent: {
    background: "#fff9eb",
    border: "1px solid #ead9aa",
    color: "#765b22",
  },

  documentButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    width: "fit-content",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: "9px 11px",
    borderRadius: "9px",
    border: "1px solid #cfe0d5",
    background: "#f5faf7",
    color: "#17613d",
    textDecoration: "none",
    fontSize: "10px",
    fontWeight: "800",
  },

  noDocument: {
    padding: "10px 11px",
    borderRadius: "9px",
    border: "1px dashed #d8e2dc",
    background: "#fafcfb",
    color: "#89958e",
    fontSize: "10px",
  },

  modalFooter: {
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end",
    padding: "11px 17px",
    borderTop: "1px solid #dfe9e2",
    background: "#f8fbf9",
  },

  modalCloseButton: {
    padding: "8px 15px",
    borderRadius: "9px",
    border: "1px solid #cfe0d5",
    background: "#ffffff",
    color: "#315c46",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default MyWorkReports;