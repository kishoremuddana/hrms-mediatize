import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Paperclip,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Users,
  Briefcase,
  ClipboardList,
  AlertTriangle,
  ExternalLink,
  Filter,
  RotateCcw,
  UserRound,
  FolderKanban,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getAllWorkReports } from "../services/workReportApi";
import { getEmployees } from "../../employee_service/services/employeeApi";
import { getProjects } from "../../project_service/services/projectApi";
import { showError } from "../../shared/utils/toast";

function HRWorkReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter options
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Detail modal
  const [selectedReport, setSelectedReport] = useState(null);

  // ---------------------------------------------------------
  // Load employees and projects
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [empRes, projRes] = await Promise.allSettled([
          getEmployees({ limit: 100 }),
          getProjects({ limit: 100 }),
        ]);

        if (empRes.status === "fulfilled") {
          setEmployees(empRes.value.data?.items || []);
        }

        if (projRes.status === "fulfilled") {
          setProjects(projRes.value.data?.items || []);
        }
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    }

    loadFilterOptions();
  }, []);

  // ---------------------------------------------------------
  // Fetch work reports
  // ---------------------------------------------------------
  const fetchReports = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        employee_id: selectedEmployeeId || undefined,
        project_id: selectedProjectId || undefined,
        report_date: selectedDate || undefined,
        search: searchTerm.trim() || undefined,
      };

      const res = await getAllWorkReports(params);

      setReports(res.data?.items || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch HR work reports", err);
      showError("Failed to load work reports.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    selectedEmployeeId,
    selectedProjectId,
    selectedDate,
    searchTerm,
  ]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // ---------------------------------------------------------
  // Reset filters
  // ---------------------------------------------------------
  const handleResetFilters = () => {
    setSelectedEmployeeId("");
    setSelectedProjectId("");
    setSelectedDate("");
    setSearchTerm("");
    setPage(1);
  };

  // ---------------------------------------------------------
  // Summary calculations based on currently loaded reports
  // ---------------------------------------------------------
  const employeeCount = new Set(
    reports.map((report) => report.employee_id || report.employee_code)
  ).size;

  const projectCount = new Set(
    reports.map((report) => report.project_id || report.project_code)
  ).size;

  const blockerCount = reports.filter(
    (report) => report.problems_faced
  ).length;

  const hasFilters =
    selectedEmployeeId ||
    selectedProjectId ||
    selectedDate ||
    searchTerm;

  return (
    <AppLayout title="HR Work Reports Management">
      <div style={styles.page}>
        {/* =====================================================
            TOP NAVIGATION
        ====================================================== */}
        <div style={styles.topNavigation}>
          <BackToDashboard
            to="/hr/dashboard"
            role="HR"
            icon={ArrowLeft}
          />

          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
            {loading ? "Refreshing..." : "Refresh Reports"}
          </button>
        </div>

        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.eyebrow}>
              <ClipboardList size={14} />
              HR OPERATIONS
            </div>

            <h1 style={styles.pageTitle}>Employee Work Reports</h1>

            <p style={styles.pageDescription}>
              Review daily employee submissions, monitor project activity,
              and identify reported blockers from one workspace.
            </p>

            <div style={styles.heroMeta}>
              <span style={styles.metaItem}>
                <FileText size={14} />
                Daily submissions
              </span>

              <span style={styles.metaDivider}>•</span>

              <span style={styles.metaItem}>
                <FolderKanban size={14} />
                Project tracking
              </span>

              <span style={styles.metaDivider}>•</span>

              <span style={styles.metaItem}>
                <AlertTriangle size={14} />
                Blocker monitoring
              </span>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.heroIconBox}>
              <ClipboardList size={34} />
            </div>

            <div>
              <div style={styles.heroVisualLabel}>REPORT CENTER</div>
              <div style={styles.heroVisualValue}>
                {totalItems} Reports
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            OVERVIEW STATS
        ====================================================== */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FileText size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Reports Found</div>
              <div style={styles.statValue}>{totalItems}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Users size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Employees</div>
              <div style={styles.statValue}>{employeeCount}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Briefcase size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Projects</div>
              <div style={styles.statValue}>{projectCount}</div>
            </div>
          </div>

          <div style={styles.statCardWarning}>
            <div style={styles.statIconWarning}>
              <AlertTriangle size={19} />
            </div>

            <div>
              <div style={styles.statLabel}>Reported Blockers</div>
              <div style={styles.statValue}>{blockerCount}</div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FILTER WORKSPACE
        ====================================================== */}
        <section style={styles.workspaceCard}>
          <div style={styles.workspaceHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                <Filter size={14} />
                REPORT FILTERS
              </div>

              <h2 style={styles.sectionTitle}>Search & Filter Reports</h2>

              <p style={styles.sectionDescription}>
                Narrow the report list by employee, project, date, or
                keywords.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={styles.clearFiltersButton}
              >
                <RotateCcw size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div style={styles.filterGrid}>
            {/* Search */}
            <div style={styles.searchField}>
              <label style={styles.fieldLabel}>Search</label>

              <div style={styles.searchBox}>
                <Search size={17} style={styles.searchIcon} />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Employee, project, description..."
                  aria-label="Search work reports"
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Employee */}
            <div style={styles.filterField}>
              <label style={styles.fieldLabel}>Employee</label>

              <div style={styles.selectWrapper}>
                <UserRound size={16} style={styles.selectIcon} />

                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by employee"
                  style={styles.selectInput}
                >
                  <option value="">All Employees</option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} (
                      {employee.employee_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project */}
            <div style={styles.filterField}>
              <label style={styles.fieldLabel}>Project</label>

              <div style={styles.selectWrapper}>
                <FolderKanban size={16} style={styles.selectIcon} />

                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by project"
                  style={styles.selectInput}
                >
                  <option value="">All Projects</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.project_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div style={styles.filterField}>
              <label style={styles.fieldLabel}>Report Date</label>

              <div style={styles.dateWrapper}>
                <Calendar size={16} style={styles.selectIcon} />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by date"
                  style={styles.dateInput}
                />
              </div>
            </div>
          </div>

          <div style={styles.filterFooter}>
            <div style={styles.resultText}>
              Showing{" "}
              <strong>{reports.length}</strong> of{" "}
              <strong>{totalItems}</strong> reports
            </div>

            {hasFilters && (
              <div style={styles.activeFilterBadge}>
                <Filter size={13} />
                Filters active
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            REPORT CONTENT
        ====================================================== */}
        <section style={styles.reportSection}>
          <div style={styles.reportSectionHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                <ClipboardList size={14} />
                REPORT DIRECTORY
              </div>

              <h2 style={styles.sectionTitle}>Submitted Work Reports</h2>
            </div>

            {!loading && reports.length > 0 && (
              <span style={styles.pageIndicator}>
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={styles.loadingCard}>
              <div style={styles.loadingSpinner}>
                <RefreshCw size={22} />
              </div>

              <h3 style={styles.loadingTitle}>
                Loading work reports
              </h3>

              <p style={styles.loadingText}>
                Fetching the latest employee submissions...
              </p>
            </div>
          ) : reports.length === 0 ? (
            /* Empty */
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <FileText size={28} />
              </div>

              <h3 style={styles.emptyTitle}>
                No Work Reports Found
              </h3>

              <p style={styles.emptySubtitle}>
                No employee work reports match the specified filter
                criteria.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={styles.emptyAction}
                >
                  <RotateCcw size={14} />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div
                className="employee-desktop-table"
                style={styles.tableCard}
              >
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHead}>Employee</th>
                        <th style={styles.tableHead}>Project</th>
                        <th style={styles.tableHead}>Report Date</th>
                        <th style={styles.tableHead}>Work Summary</th>
                        <th style={styles.tableHead}>Attachment</th>
                        <th style={styles.tableHead}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} style={styles.tableRow}>
                          {/* Employee */}
                          <td style={styles.tableCell}>
                            <div style={styles.employeeCell}>
                              <div style={styles.avatar}>
                                {(
                                  report.employee_name ||
                                  "Employee"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div style={styles.primaryText}>
                                  {report.employee_name ||
                                    "Employee"}
                                </div>

                                <div style={styles.secondaryText}>
                                  {report.employee_code ||
                                    "No code"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Project */}
                          <td style={styles.tableCell}>
                            <div style={styles.projectCell}>
                              <div style={styles.projectIcon}>
                                <Briefcase size={15} />
                              </div>

                              <div>
                                <div style={styles.primaryText}>
                                  {report.project_name ||
                                    "Project"}
                                </div>

                                <div style={styles.secondaryText}>
                                  {report.project_code ||
                                    "No code"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td style={styles.tableCell}>
                            <div style={styles.dateCell}>
                              <Calendar size={14} />
                              <strong>
                                {report.report_date}
                              </strong>
                            </div>
                          </td>

                          {/* Work description */}
                          <td style={styles.tableCell}>
                            <div style={styles.descriptionCell}>
                              {report.work_description}

                              {report.problems_faced && (
                                <span style={styles.blockerBadge}>
                                  <AlertTriangle size={11} />
                                  Blocker reported
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
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={styles.noAttachment}>
                                No attachment
                              </span>
                            )}
                          </td>

                          {/* Action */}
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
                className="employee-mobile-cards"
                style={styles.mobileList}
              >
                {reports.map((report) => (
                  <article
                    key={report.id}
                    style={styles.mobileCard}
                  >
                    <div style={styles.mobileCardTop}>
                      <div style={styles.mobileIdentity}>
                        <div style={styles.mobileAvatar}>
                          {(
                            report.employee_name ||
                            "Employee"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3 style={styles.mobileEmployeeName}>
                            {report.employee_name || "Employee"}
                          </h3>

                          <p style={styles.mobileEmployeeCode}>
                            {report.employee_code || "No code"}
                          </p>
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
                      <FolderKanban size={15} />

                      <span>
                        {report.project_name || "Project"}
                      </span>

                      <span style={styles.mobileDot}>•</span>

                      <span>
                        {report.report_date}
                      </span>
                    </div>

                    <div style={styles.mobileDescription}>
                      {report.work_description}
                    </div>

                    {report.problems_faced && (
                      <div style={styles.mobileBlocker}>
                        <AlertTriangle size={14} />

                        <div>
                          <strong>Problems Faced</strong>
                          <p style={styles.mobileBlockerText}>
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
                        {report.document_name ||
                          "View Attachment"}
                        <ExternalLink size={12} />
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
                    Showing page <strong>{page}</strong> of{" "}
                    <strong>{totalPages}</strong>
                    <span style={styles.paginationTotal}>
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
                      <ChevronLeft size={16} />
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
                      <ChevronRight size={16} />
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
            onClick={() => setSelectedReport(null)}
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderIdentity}>
                  <div style={styles.modalIcon}>
                    <FileText size={20} />
                  </div>

                  <div>
                    <div style={styles.modalEyebrow}>
                      WORK REPORT
                    </div>

                    <h3 style={styles.modalTitle}>
                      Daily Work Report Details
                    </h3>

                    <div style={styles.modalSub}>
                      Submitted on{" "}
                      {selectedReport.report_date}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  style={styles.closeButton}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={styles.modalBody}>
                {/* Employee / Project */}
                <div style={styles.detailGrid}>
                  <div style={styles.detailCard}>
                    <div style={styles.detailCardHeader}>
                      <UserRound size={15} />
                      Employee
                    </div>

                    <div style={styles.detailMainValue}>
                      {selectedReport.employee_name ||
                        "Employee"}
                    </div>

                    <div style={styles.detailSubValue}>
                      {selectedReport.employee_code ||
                        "No employee code"}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailCardHeader}>
                      <FolderKanban size={15} />
                      Project
                    </div>

                    <div style={styles.detailMainValue}>
                      {selectedReport.project_name ||
                        "Project"}
                    </div>

                    <div style={styles.detailSubValue}>
                      {selectedReport.project_code ||
                        "No project code"}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div style={styles.detailCard}>
                  <div style={styles.detailCardHeader}>
                    <Calendar size={15} />
                    Report Date
                  </div>

                  <div style={styles.detailMainValue}>
                    {selectedReport.report_date}
                  </div>
                </div>

                {/* Work Description */}
                <div style={styles.contentSection}>
                  <div style={styles.contentSectionHeader}>
                    <FileText size={15} />
                    <span>Work Description</span>
                  </div>

                  <div style={styles.contentBox}>
                    {selectedReport.work_description ||
                      "No work description provided."}
                  </div>
                </div>

                {/* Problems */}
                <div style={styles.contentSection}>
                  <div style={styles.contentSectionHeader}>
                    <AlertTriangle size={15} />
                    <span>Problems Faced</span>
                  </div>

                  <div
                    style={{
                      ...styles.contentBox,
                      ...(selectedReport.problems_faced
                        ? styles.problemContentBox
                        : {}),
                    }}
                  >
                    {selectedReport.problems_faced ||
                      "None reported."}
                  </div>
                </div>

                {/* Supporting Document */}
                <div style={styles.contentSection}>
                  <div style={styles.contentSectionHeader}>
                    <Paperclip size={15} />
                    <span>Supporting Document</span>
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
                        Open / Download{" "}
                        {selectedReport.document_name ||
                          "Attachment"}
                      </span>

                      <ExternalLink size={14} />
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
                  onClick={() => setSelectedReport(null)}
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
          RESPONSIVE + ANIMATION STYLES
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

          .employee-mobile-cards {
            display: none !important;
          }

          .employee-desktop-table {
            display: block !important;
          }

          @media (max-width: 900px) {
            .employee-desktop-table {
              display: block !important;
            }
          }

          @media (max-width: 767px) {
            .employee-desktop-table {
              display: none !important;
            }

            .employee-mobile-cards {
              display: flex !important;
            }
          }

          @media (max-width: 600px) {
            .hr-work-report-page {
              padding-left: 0;
              padding-right: 0;
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
    color: "#17251d",
  },

  topNavigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1px solid #cfe0d5",
    background: "#ffffff",
    color: "#165b3a",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    background: "linear-gradient(135deg, #124d31 0%, #1f6b43 100%)",
    borderRadius: "18px",
    padding: "30px",
    marginBottom: "18px",
    boxShadow: "0 12px 30px rgba(18, 77, 49, 0.14)",
  },

  heroLeft: {
    minWidth: 0,
    flex: 1,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    color: "#d9f2e2",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "9px",
  },

  pageTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(1.7rem, 3vw, 2.45rem)",
    lineHeight: 1.15,
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },

  pageDescription: {
    maxWidth: "720px",
    margin: "10px 0 0",
    color: "#d8eadf",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "9px",
    marginTop: "18px",
  },

  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#e4f2e9",
    fontSize: "11px",
    fontWeight: "600",
  },

  metaDivider: {
    color: "#8fbea4",
    fontSize: "11px",
  },

  heroVisual: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "190px",
    padding: "15px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  heroIconBox: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.13)",
    color: "#ffffff",
    flexShrink: 0,
  },

  heroVisualLabel: {
    color: "#a9d2b8",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.12em",
  },

  heroVisualValue: {
    marginTop: "3px",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "800",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "17px",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(18, 77, 49, 0.04)",
  },

  statCardWarning: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "17px",
    background: "#fffdf7",
    border: "1px solid #eadfbe",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(120, 90, 20, 0.04)",
  },

  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8f4ed",
    color: "#17613d",
    flexShrink: 0,
  },

  statIconWarning: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9efd5",
    color: "#8a681f",
    flexShrink: 0,
  },

  statLabel: {
    color: "#718078",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "3px",
  },

  statValue: {
    color: "#183026",
    fontSize: "21px",
    fontWeight: "800",
  },

  workspaceCard: {
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "16px",
    marginBottom: "18px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(18, 77, 49, 0.04)",
  },

  workspaceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    padding: "21px",
    borderBottom: "1px solid #e6eee8",
    flexWrap: "wrap",
  },

  sectionEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#27714c",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "6px",
  },

  sectionTitle: {
    margin: 0,
    color: "#1b2e24",
    fontSize: "17px",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "5px 0 0",
    color: "#77847d",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  clearFiltersButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #d8e4dc",
    background: "#f8fbf9",
    color: "#315c46",
    borderRadius: "9px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(250px, 1.7fr) repeat(3, minmax(160px, 1fr))",
    gap: "12px",
    padding: "18px 21px",
  },

  searchField: {
    minWidth: 0,
  },

  filterField: {
    minWidth: 0,
  },

  fieldLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#52625a",
    fontSize: "11px",
    fontWeight: "800",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#829087",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    padding: "0 12px 0 36px",
    border: "1px solid #d6e2da",
    borderRadius: "9px",
    background: "#fbfdfc",
    color: "#20332a",
    fontSize: "12px",
    outline: "none",
  },

  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  selectIcon: {
    position: "absolute",
    left: "11px",
    color: "#6d7e74",
    pointerEvents: "none",
    zIndex: 1,
  },

  selectInput: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    padding: "0 10px 0 34px",
    border: "1px solid #d6e2da",
    borderRadius: "9px",
    background: "#fbfdfc",
    color: "#20332a",
    fontSize: "12px",
    outline: "none",
  },

  dateWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  dateInput: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    padding: "0 10px 0 34px",
    border: "1px solid #d6e2da",
    borderRadius: "9px",
    background: "#fbfdfc",
    color: "#20332a",
    fontSize: "12px",
    outline: "none",
  },

  filterFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "12px 21px",
    background: "#f8fbf9",
    borderTop: "1px solid #e6eee8",
    flexWrap: "wrap",
  },

  resultText: {
    color: "#64736b",
    fontSize: "11px",
  },

  activeFilterBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#17613d",
    background: "#e7f3eb",
    border: "1px solid #cce2d3",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "800",
  },

  reportSection: {
    marginTop: "4px",
  },

  reportSectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "11px",
    flexWrap: "wrap",
  },

  pageIndicator: {
    color: "#65746c",
    background: "#f4f8f5",
    border: "1px solid #dce7df",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "700",
  },

  loadingCard: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "16px",
  },

  loadingSpinner: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8f4ed",
    color: "#17613d",
    animation: "spin 1.2s linear infinite",
  },

  loadingTitle: {
    margin: "13px 0 4px",
    color: "#25382e",
    fontSize: "15px",
    fontWeight: "800",
  },

  loadingText: {
    margin: 0,
    color: "#78857e",
    fontSize: "12px",
  },

  emptyCard: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "35px 20px",
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "16px",
  },

  emptyIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#edf5ef",
    color: "#337452",
  },

  emptyTitle: {
    margin: "13px 0 5px",
    color: "#263a30",
    fontSize: "16px",
    fontWeight: "800",
  },

  emptySubtitle: {
    maxWidth: "430px",
    margin: 0,
    color: "#78857e",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  emptyAction: {
    marginTop: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #cfe0d5",
    background: "#f6faf7",
    color: "#17613d",
    borderRadius: "9px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  tableCard: {
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(18, 77, 49, 0.04)",
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "980px",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "12px",
  },

  tableHead: {
    padding: "12px 14px",
    background: "#f3f8f5",
    color: "#5b6d63",
    borderBottom: "1px solid #dfe9e2",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #edf2ee",
  },

  tableCell: {
    padding: "14px",
    color: "#26382f",
    verticalAlign: "middle",
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "175px",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "#e5f2e9",
    color: "#17613d",
    fontSize: "12px",
    fontWeight: "800",
  },

  primaryText: {
    color: "#26382f",
    fontSize: "12px",
    fontWeight: "800",
    lineHeight: 1.35,
  },

  secondaryText: {
    marginTop: "2px",
    color: "#829087",
    fontSize: "10px",
  },

  projectCell: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minWidth: "155px",
  },

  projectIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f5f2",
    color: "#397254",
    flexShrink: 0,
  },

  dateCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#4b5c53",
    whiteSpace: "nowrap",
  },

  descriptionCell: {
    maxWidth: "290px",
    lineHeight: 1.5,
    color: "#405148",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
  },

  blockerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#fff5dd",
    border: "1px solid #ead9a9",
    color: "#80611e",
    fontSize: "9px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  attachmentLink: {
    maxWidth: "170px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#17613d",
    fontSize: "10px",
    fontWeight: "700",
    textDecoration: "none",
  },

  noAttachment: {
    color: "#9aa59f",
    fontSize: "10px",
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
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  mobileCard: {
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "14px",
    padding: "15px",
    boxShadow: "0 4px 13px rgba(18, 77, 49, 0.04)",
  },

  mobileCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },

  mobileIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minWidth: 0,
  },

  mobileAvatar: {
    width: "37px",
    height: "37px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "#e5f2e9",
    color: "#17613d",
    fontSize: "12px",
    fontWeight: "800",
  },

  mobileEmployeeName: {
    margin: 0,
    color: "#26382f",
    fontSize: "13px",
    fontWeight: "800",
  },

  mobileEmployeeCode: {
    margin: "2px 0 0",
    color: "#829087",
    fontSize: "10px",
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
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  mobileProject: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "13px",
    paddingTop: "11px",
    borderTop: "1px solid #edf2ee",
    color: "#587067",
    fontSize: "10px",
    fontWeight: "700",
  },

  mobileDot: {
    color: "#a2aea7",
  },

  mobileDescription: {
    marginTop: "11px",
    color: "#43554c",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  mobileBlocker: {
    marginTop: "10px",
    padding: "10px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
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
    marginTop: "10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#17613d",
    textDecoration: "none",
    fontSize: "10px",
    fontWeight: "800",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "13px",
    padding: "13px 2px",
    flexWrap: "wrap",
  },

  paginationInfo: {
    color: "#68776f",
    fontSize: "11px",
  },

  paginationTotal: {
    marginLeft: "5px",
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
    border: "1px solid #d5e1d9",
    background: "#ffffff",
    color: "#345448",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "800",
  },

  // ===========================================================
  // MODAL
  // ===========================================================

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    background: "rgba(10, 28, 19, 0.62)",
    backdropFilter: "blur(5px)",
  },

  modal: {
    width: "min(94vw, 680px)",
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
    gap: "14px",
    padding: "17px 19px",
    background: "#f4f9f6",
    borderBottom: "1px solid #dfe9e2",
  },

  modalHeaderIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  modalIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "#dceee3",
    color: "#17613d",
  },

  modalEyebrow: {
    color: "#397254",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "3px",
  },

  modalTitle: {
    margin: 0,
    color: "#1d3027",
    fontSize: "15px",
    fontWeight: "800",
  },

  modalSub: {
    marginTop: "3px",
    color: "#7b8881",
    fontSize: "10px",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #d6e2da",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#607168",
    cursor: "pointer",
  },

  modalBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "10px",
  },

  detailCard: {
    padding: "13px",
    borderRadius: "11px",
    border: "1px solid #dfe9e2",
    background: "#fbfdfc",
  },

  detailCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#397254",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  detailMainValue: {
    marginTop: "8px",
    color: "#24382e",
    fontSize: "13px",
    fontWeight: "800",
    lineHeight: 1.4,
  },

  detailSubValue: {
    marginTop: "2px",
    color: "#85918b",
    fontSize: "10px",
  },

  contentSection: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  contentSectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#3c594a",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  contentBox: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #dfe9e2",
    background: "#f8fbf9",
    color: "#43554c",
    fontSize: "12px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },

  problemContentBox: {
    background: "#fff9eb",
    border: "1px solid #ead9aa",
    color: "#765b22",
  },

  documentButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "fit-content",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid #cfe0d5",
    background: "#f5faf7",
    color: "#17613d",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: "800",
  },

  noDocument: {
    padding: "11px 12px",
    borderRadius: "9px",
    border: "1px dashed #d8e2dc",
    color: "#89958e",
    background: "#fafcfb",
    fontSize: "11px",
  },

  modalFooter: {
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 18px",
    borderTop: "1px solid #dfe9e2",
    background: "#f8fbf9",
  },

  modalCloseButton: {
    border: "1px solid #cfe0d5",
    background: "#ffffff",
    color: "#315c46",
    borderRadius: "9px",
    padding: "8px 15px",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default HRWorkReports;