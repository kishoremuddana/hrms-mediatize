import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Tags,
  WalletCards,
  X,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserRound,
  ClipboardList,
  ShieldCheck,
  MessageSquareText,
  BriefcaseBusiness,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getAllLeaves,
  approveLeave,
  rejectLeave,
  revokeLeave,
} from "../services/leaveApi";
import { showSuccess, showError } from "../../shared/utils/toast";

/* =========================================================
   STATUS CONFIG
========================================================= */

function getStatusConfig(status) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        background: "#e7f5ec",
        color: "#23643b",
        border: "#b9dfc5",
        icon: CheckCircle2,
      };

    case "REJECTED":
      return {
        label: "Rejected",
        background: "#fbeaea",
        color: "#a33a3a",
        border: "#efc4c4",
        icon: XCircle,
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        background: "#f1f3f2",
        color: "#66716b",
        border: "#d7ddd9",
        icon: XCircle,
      };
      case "REVOKED":
        return {
          label: "Revoked",
          background: "#fff0e6",
          color: "#a34b1f",
          border: "#f0c7ad",
          icon: XCircle,
        };

    default:
      return {
        label: "Pending",
        background: "#fff6df",
        color: "#956c13",
        border: "#efd99d",
        icon: Clock3,
      };
  }
}

/* =========================================================
   STATUS FILTER CONFIG
========================================================= */

const statusFilters = [
  { value: "", label: "All Requests" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REVOKED", label: "Revoked" },
];

/* =========================================================
   COMPONENT
========================================================= */

function HRLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState("");
  const [hrRemarks, setHrRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* =======================================================
     FETCH LEAVE REQUESTS
  ======================================================= */

  const fetchLeaves = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAllLeaves({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });

      setLeaves(res.data?.items || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  /* =======================================================
     OPEN REVIEW MODAL
  ======================================================= */

  const openActionModal = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setHrRemarks("");
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    if (submitting) return;

    setSelectedLeave(null);
    setActionType("");
    setHrRemarks("");
  };

  /* =======================================================
     APPROVE / REJECT / REVOKE
  ======================================================= */

  const handleActionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLeave) return;

    setSubmitting(true);

    try {
      if (actionType === "APPROVE") {
        await approveLeave(selectedLeave.id, {
          hr_remarks: hrRemarks,
        });

        showSuccess("Leave request approved successfully!");
      } else if (actionType === "REJECT") {
        await rejectLeave(selectedLeave.id, {
          hr_remarks: hrRemarks,
        });

        showSuccess("Leave request rejected successfully.");
      } else if (actionType === "REVOKE") {
        await revokeLeave(selectedLeave.id, {
          hr_remarks: hrRemarks,
        });

        showSuccess("Leave request revoked successfully.");
      }

      setSelectedLeave(null);
      setActionType("");
      setHrRemarks("");

      fetchLeaves();
    } catch (err) {
      console.error("Failed to update leave request", err);

      const errText =
        err.response?.data?.detail || "Action failed.";

      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     PAGE CHANGE
  ======================================================= */

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SUMMARY COUNTS
     These are based on currently loaded requests only.
  ======================================================= */

  const pendingCount = leaves.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approvedCount = leaves.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejectedCount = leaves.filter(
    (item) => item.status === "REJECTED"
  ).length;

  return (
    <AppLayout title="HR Leave Management">
      <div style={styles.container}>
        {/* ===================================================
            BACK NAVIGATION
        =================================================== */}

        <BackToDashboard
          to="/hr/dashboard"
          role="HR"
        />

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          style={styles.hero}
          className="hr-leave-hero"
        >
          <div style={styles.heroContent}>
            <div style={styles.heroEyebrow}>
              <span style={styles.heroEyebrowLine} />
              HR OPERATIONS
            </div>

            <h1 style={styles.heroTitle}>
              Leave Management
            </h1>

            <p style={styles.heroSubtitle}>
              Review employee leave applications, make decisions,
              and maintain an organized leave approval workflow.
            </p>

            <div style={styles.heroMeta}>
              <div style={styles.heroMetaItem}>
                <CalendarDays size={16} />
                <span>Leave Requests</span>
              </div>

              <div style={styles.heroMetaDivider} />

              <div style={styles.heroMetaItem}>
                <ShieldCheck size={16} />
                <span>HR Review Center</span>
              </div>
            </div>
          </div>

          <div
            style={styles.heroSide}
            className="hr-leave-hero-side"
          >
            <div style={styles.heroIconBox}>
              <ClipboardList size={30} />
            </div>

            <span style={styles.heroSideLabel}>
              CURRENT PAGE
            </span>

            <strong style={styles.heroSideValue}>
              {leaves.length}
            </strong>

            <span style={styles.heroSideText}>
              leave requests loaded
            </span>
          </div>
        </section>

        {/* ===================================================
            QUICK NAVIGATION
        =================================================== */}

        <section style={styles.quickNavSection}>
          <div style={styles.quickNavHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                LEAVE CONFIGURATION
              </span>

              <h2 style={styles.sectionTitle}>
                Supporting Leave Tools
              </h2>
            </div>

            <p style={styles.sectionDescription}>
              Configure leave types and review employee balances.
            </p>
          </div>

          <div
            style={styles.quickNavGrid}
            className="hr-leave-quick-grid"
          >
            <Link
              to="/hr/leave-types"
              style={styles.quickNavCard}
            >
              <div
                style={{
                  ...styles.quickNavIcon,
                  backgroundColor: "#e8f4ec",
                  color: "#28613d",
                }}
              >
                <Tags size={22} />
              </div>

              <div style={styles.quickNavContent}>
                <span style={styles.quickNavLabel}>
                  CONFIGURATION
                </span>

                <strong style={styles.quickNavTitle}>
                  Leave Types
                </strong>

                <span style={styles.quickNavText}>
                  Manage available leave categories
                </span>
              </div>

              <span style={styles.quickNavArrow}>
                →
              </span>
            </Link>

            <Link
              to="/hr/leave-balances"
              style={styles.quickNavCard}
            >
              <div
                style={{
                  ...styles.quickNavIcon,
                  backgroundColor: "#f3f0e5",
                  color: "#75622e",
                }}
              >
                <WalletCards size={22} />
              </div>

              <div style={styles.quickNavContent}>
                <span style={styles.quickNavLabel}>
                  EMPLOYEE DATA
                </span>

                <strong style={styles.quickNavTitle}>
                  Leave Balances
                </strong>

                <span style={styles.quickNavText}>
                  Review employee leave balances
                </span>
              </div>

              <span style={styles.quickNavArrow}>
                →
              </span>
            </Link>
          </div>
        </section>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section
          style={styles.summaryGrid}
          className="hr-leave-summary-grid"
        >
          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#e8f4ec",
                color: "#28613d",
              }}
            >
              <ClipboardList size={21} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                REQUESTS IN VIEW
              </span>

              <strong style={styles.summaryValue}>
                {leaves.length}
              </strong>

              <span style={styles.summaryHint}>
                Current page
              </span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#fff6df",
                color: "#956c13",
              }}
            >
              <Clock3 size={21} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                PENDING
              </span>

              <strong style={styles.summaryValue}>
                {pendingCount}
              </strong>

              <span style={styles.summaryHint}>
                Awaiting HR decision
              </span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#e8f4ec",
                color: "#28613d",
              }}
            >
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                APPROVED
              </span>

              <strong style={styles.summaryValue}>
                {approvedCount}
              </strong>

              <span style={styles.summaryHint}>
                Current page
              </span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#fbeaea",
                color: "#a33a3a",
              }}
            >
              <XCircle size={21} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                REJECTED
              </span>

              <strong style={styles.summaryValue}>
                {rejectedCount}
              </strong>

              <span style={styles.summaryHint}>
                Current page
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            FILTER SECTION
        =================================================== */}

        <section style={styles.filterSection}>
          <div style={styles.filterHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                REQUEST DIRECTORY
              </span>

              <h2 style={styles.sectionTitle}>
                Review Leave Applications
              </h2>
            </div>

            <span style={styles.filterCount}>
              {statusFilter
                ? `${statusFilter} requests`
                : "All requests"}
            </span>
          </div>

          <div
            style={styles.filterBody}
            className="hr-leave-filter-body"
          >
            <div style={styles.filterLabelBlock}>
              <span style={styles.filterSmallLabel}>
                FILTER BY STATUS
              </span>

              <span style={styles.filterDescription}>
                Select a status to narrow the requests shown below.
              </span>
            </div>

            <div
              style={styles.filterOptions}
              className="hr-leave-filter-options"
            >
              {statusFilters.map((filter) => {
                const active = statusFilter === filter.value;

                return (
                  <button
                    key={filter.value || "ALL"}
                    type="button"
                    onClick={() => {
                      setStatusFilter(filter.value);
                      setPage(1);
                    }}
                    style={{
                      ...styles.filterButton,
                      ...(active
                        ? styles.filterButtonActive
                        : {}),
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================
            REQUEST LIST
        =================================================== */}

        <section style={styles.directorySection}>
          <div style={styles.directoryHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                LEAVE REQUESTS
              </span>

              <h2 style={styles.sectionTitle}>
                Employee Applications
              </h2>
            </div>

            <span style={styles.directoryPage}>
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div style={styles.stateCard}>
              <div style={styles.loadingCircle}>
                <Clock3 size={22} />
              </div>

              <h3 style={styles.stateTitle}>
                Loading leave requests
              </h3>

              <p style={styles.stateText}>
                Please wait while the leave directory is being loaded.
              </p>
            </div>
          ) : leaves.length === 0 ? (
            <div style={styles.stateCard}>
              <div
                style={{
                  ...styles.loadingCircle,
                  backgroundColor: "#f1f3f2",
                  color: "#66716b",
                }}
              >
                <CalendarDays size={22} />
              </div>

              <h3 style={styles.stateTitle}>
                No leave requests found
              </h3>

              <p style={styles.stateText}>
                There are no leave requests matching the selected
                status.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div
                style={styles.tableWrapper}
                className="hr-leave-table-wrapper"
              >
                <table
                  style={styles.table}
                  className="hr-leave-table"
                >
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Employee
                      </th>

                      <th style={styles.th}>
                        Leave
                      </th>

                      <th style={styles.th}>
                        Dates
                      </th>

                      <th style={styles.th}>
                        Duration
                      </th>

                      <th style={styles.th}>
                        Reason
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                      <th style={styles.th}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaves.map((req) => {
                      const status =
                        getStatusConfig(req.status);

                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={req.id}
                          style={styles.tr}
                        >
                          <td style={styles.td}>
                            <div style={styles.employeeCell}>
                              <div style={styles.employeeAvatar}>
                                <UserRound size={17} />
                              </div>

                              <div>
                                <strong
                                  style={styles.employeeName}
                                >
                                  {req.employee_name}
                                </strong>

                                <span
                                  style={styles.employeeCode}
                                >
                                  {req.employee_code}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={styles.td}>
                            <div style={styles.leaveTypeCell}>
                              <BriefcaseBusiness
                                size={16}
                              />

                              <span>
                                {req.leave_type_name}
                              </span>
                            </div>
                          </td>

                          <td style={styles.td}>
                            <div style={styles.dateCell}>
                              <span>
                                {req.start_date}
                              </span>

                              <span style={styles.dateArrow}>
                                →
                              </span>

                              <span>
                                {req.end_date}
                              </span>
                            </div>
                          </td>

                          <td style={styles.td}>
                            <span style={styles.durationBadge}>
                              {req.duration} day(s)
                            </span>
                          </td>

                          <td style={styles.td}>
                            <span style={styles.reasonText}>
                              {req.reason ||
                                "No reason provided"}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor:
                                  status.background,
                                color: status.color,
                                borderColor: status.border,
                              }}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </td>

                          {/* ACTION */}
                          <td style={styles.td}>
                            {req.status === "PENDING" ? (
                              <div style={styles.actionGroup}>
                                <button
                                  type="button"
                                  style={styles.approveButton}
                                  onClick={() =>
                                    openActionModal(
                                      req,
                                      "APPROVE"
                                    )
                                  }
                                >
                                  <CheckCircle2 size={14} />
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  style={styles.rejectButton}
                                  onClick={() =>
                                    openActionModal(
                                      req,
                                      "REJECT"
                                    )
                                  }
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </div>
                            ) : req.status === "APPROVED" ||
                              req.status === "REJECTED" ? (
                              <button
                                type="button"
                                style={styles.revokeButton}
                                onClick={() =>
                                  openActionModal(
                                    req,
                                    "REVOKE"
                                  )
                                }
                              >
                                <XCircle size={14} />
                                Revoke
                              </button>
                            ) : (
                              <span
                                style={styles.noActionText}
                              >
                                No action
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div
                style={styles.mobileList}
                className="hr-leave-mobile-list"
              >
                {leaves.map((req) => {
                  const status =
                    getStatusConfig(req.status);

                  const StatusIcon = status.icon;

                  return (
                    <article
                      key={req.id}
                      style={styles.mobileCard}
                      className="hr-leave-mobile-card"
                    >
                      <div
                        style={styles.mobileCardTop}
                        className="hr-leave-mobile-card-top"
                      >
                        <div style={styles.employeeCell}>
                          <div style={styles.employeeAvatar}>
                            <UserRound size={17} />
                          </div>

                          <div>
                            <strong
                              style={styles.employeeName}
                            >
                              {req.employee_name}
                            </strong>

                            <span
                              style={styles.employeeCode}
                            >
                              {req.employee_code}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              status.background,
                            color: status.color,
                            borderColor: status.border,
                          }}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>

                      <div style={styles.mobileDivider} />

                      <div style={styles.mobileInfoGrid}>
                        <div>
                          <span style={styles.mobileLabel}>
                            LEAVE TYPE
                          </span>

                          <strong
                            style={styles.mobileValue}
                          >
                            {req.leave_type_name}
                          </strong>
                        </div>

                        <div>
                          <span style={styles.mobileLabel}>
                            DURATION
                          </span>

                          <strong
                            style={styles.mobileValue}
                          >
                            {req.duration} day(s)
                          </strong>
                        </div>

                        <div style={styles.mobileFullWidth}>
                          <span style={styles.mobileLabel}>
                            DATES
                          </span>

                          <strong
                            style={styles.mobileValue}
                          >
                            {req.start_date} → {req.end_date}
                          </strong>
                        </div>

                        <div style={styles.mobileFullWidth}>
                          <span style={styles.mobileLabel}>
                            REASON
                          </span>

                          <p style={styles.mobileReason}>
                            {req.reason ||
                              "No reason provided"}
                          </p>
                        </div>
                      </div>

                      {/* MOBILE ACTIONS */}
                      {req.status === "PENDING" ? (
                        <div style={styles.mobileActions}>
                          <button
                            type="button"
                            style={styles.approveButton}
                            onClick={() =>
                              openActionModal(
                                req,
                                "APPROVE"
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            Approve
                          </button>

                          <button
                            type="button"
                            style={styles.rejectButton}
                            onClick={() =>
                              openActionModal(
                                req,
                                "REJECT"
                              )
                            }
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        </div>
                      ) : req.status === "APPROVED" ||
                        req.status === "REJECTED" ? (
                        <div
                          style={{
                            ...styles.mobileActions,
                            gridTemplateColumns: "1fr",
                          }}
                        >
                          <button
                            type="button"
                            style={styles.revokeButton}
                            onClick={() =>
                              openActionModal(
                                req,
                                "REVOKE"
                              )
                            }
                          >
                            <XCircle size={15} />
                            Revoke
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        {!loading &&
          leaves.length > 0 &&
          totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  handlePageChange(page - 1)
                }
                style={{
                  ...styles.paginationButton,
                  ...(page <= 1
                    ? styles.paginationDisabled
                    : {}),
                }}
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <div style={styles.pageIndicator}>
                <span>PAGE</span>
                <strong>{page}</strong>
                <span>OF</span>
                <strong>{totalPages}</strong>
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  handlePageChange(page + 1)
                }
                style={{
                  ...styles.paginationButton,
                  ...(page >= totalPages
                    ? styles.paginationDisabled
                    : {}),
                }}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          )}

        {/* ===================================================
            INFORMATION STRIP
        =================================================== */}

        <section style={styles.infoStrip}>
          <div style={styles.infoStripIcon}>
            <MessageSquareText size={21} />
          </div>

          <div>
            <strong style={styles.infoStripTitle}>
              HR review workflow
            </strong>

            <p style={styles.infoStripText}>
              Pending leave requests can be approved or rejected.
              Approved or rejected requests can be revoked when
              required. HR remarks can be included with the selected
              decision.
            </p>
          </div>
        </section>

        {/* ===================================================
            REVIEW MODAL
        =================================================== */}

        {selectedLeave && (
          <div
            style={styles.modalOverlay}
            onClick={closeModal}
          >
            <div
              style={styles.modal}
              className="hr-leave-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderLeft}>
                  <div
                    style={{
                      ...styles.modalIcon,
                      backgroundColor:
                        actionType === "APPROVE"
                          ? "#e7f5ec"
                          : actionType === "REVOKE"
                          ? "#fff6df"
                          : "#fbeaea",
                      color:
                        actionType === "APPROVE"
                          ? "#28613d"
                          : actionType === "REVOKE"
                          ? "#8a641d"
                          : "#a33a3a",
                    }}
                  >
                    {actionType === "APPROVE" ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <XCircle size={22} />
                    )}
                  </div>

                  <div>
                    <span style={styles.modalEyebrow}>
                      HR DECISION
                    </span>

                    <h3 style={styles.modalTitle}>
                      {actionType === "APPROVE"
                        ? "Approve Leave Request"
                        : actionType === "REJECT"
                        ? "Reject Leave Request"
                        : "Revoke Leave Request"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  className="hr-leave-close-button"
                  onClick={closeModal}
                  aria-label="Close modal"
                  disabled={submitting}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleActionSubmit}
                style={styles.formContent}
              >
                <div style={styles.modalBody}>
                  {/* Request Summary */}
                  <div style={styles.requestSummary}>
                    <div style={styles.summaryHeader}>
                      <ClipboardList size={17} />

                      <span>
                        Leave Request Details
                      </span>
                    </div>

                    <div style={styles.requestDetails}>
                      <div style={styles.requestDetailItem}>
                        <span style={styles.detailLabel}>
                          EMPLOYEE
                        </span>

                        <strong style={styles.detailValue}>
                          {selectedLeave.employee_name}
                        </strong>

                        <span style={styles.detailSecondary}>
                          {selectedLeave.employee_code}
                        </span>
                      </div>

                      <div style={styles.requestDetailItem}>
                        <span style={styles.detailLabel}>
                          LEAVE TYPE
                        </span>

                        <strong style={styles.detailValue}>
                          {selectedLeave.leave_type_name}
                        </strong>
                      </div>

                      <div style={styles.requestDetailItem}>
                        <span style={styles.detailLabel}>
                          DATES
                        </span>

                        <strong style={styles.detailValue}>
                          {selectedLeave.start_date}
                        </strong>

                        <span style={styles.detailSecondary}>
                          to {selectedLeave.end_date}
                        </span>
                      </div>

                      <div style={styles.requestDetailItem}>
                        <span style={styles.detailLabel}>
                          DURATION
                        </span>

                        <strong style={styles.detailValue}>
                          {selectedLeave.duration} day(s)
                        </strong>
                      </div>
                    </div>

                    <div style={styles.reasonBox}>
                      <span style={styles.detailLabel}>
                        EMPLOYEE REASON
                      </span>

                      <p style={styles.reasonBoxText}>
                        {selectedLeave.reason ||
                          "No reason provided."}
                      </p>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div style={styles.formGroup}>
                    <div style={styles.labelRow}>
                      <label style={styles.label}>
                        HR Remarks
                      </label>

                      <span style={styles.optionalLabel}>
                        OPTIONAL
                      </span>
                    </div>

                    <textarea
                      style={styles.textarea}
                      className="hr-leave-textarea"
                      value={hrRemarks}
                      onChange={(e) =>
                        setHrRemarks(e.target.value)
                      }
                      placeholder={
                        actionType === "REVOKE"
                          ? "Enter reason for revoking this leave..."
                          : "Enter remarks for the employee..."
                      }
                      maxLength={1000}
                    />

                    <div style={styles.characterCount}>
                      {hrRemarks.length}/1000
                    </div>
                  </div>

                  {/* Decision Notice */}
                  <div
                    style={{
                      ...styles.decisionNotice,
                      backgroundColor:
                        actionType === "APPROVE"
                          ? "#eef8f1"
                          : actionType === "REVOKE"
                          ? "#fff9e9"
                          : "#fdf0f0",
                      borderColor:
                        actionType === "APPROVE"
                          ? "#c8e4d0"
                          : actionType === "REVOKE"
                          ? "#ead9a7"
                          : "#efcccc",
                    }}
                  >
                    <AlertCircle
                      size={18}
                      color={
                        actionType === "APPROVE"
                          ? "#28613d"
                          : actionType === "REVOKE"
                          ? "#8a641d"
                          : "#a33a3a"
                      }
                    />

                    <p
                      style={{
                        ...styles.decisionNoticeText,
                        color:
                          actionType === "APPROVE"
                            ? "#28613d"
                            : actionType === "REVOKE"
                            ? "#7c5b1d"
                            : "#8e3636",
                      }}
                    >
                      {actionType === "APPROVE"
                        ? "You are about to approve this leave request."
                        : actionType === "REJECT"
                        ? "You are about to reject this leave request."
                        : "You are about to revoke this leave request."}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div
                  style={styles.modalFooter}
                  className="hr-leave-modal-footer"
                >
                  <button
                    type="button"
                    style={styles.cancelButton}
                    className="hr-leave-cancel-button"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      ...styles.confirmButton,
                      backgroundColor:
                        actionType === "APPROVE"
                          ? "#28613d"
                          : actionType === "REVOKE"
                          ? "#8a641d"
                          : "#a33a3a",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? (
                      <>
                        <span
                          style={styles.buttonSpinner}
                        />
                        Processing...
                      </>
                    ) : actionType === "APPROVE" ? (
                      <>
                        <CheckCircle2 size={17} />
                        Confirm Approval
                      </>
                    ) : actionType === "REJECT" ? (
                      <>
                        <XCircle size={17} />
                        Confirm Rejection
                      </>
                    ) : (
                      <>
                        <XCircle size={17} />
                        Confirm Revoke
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================
            RESPONSIVE CSS
        =================================================== */}

        <style>
          {`
            .hr-leave-mobile-list {
              display: none;
            }

            @media (max-width: 1100px) {
              .hr-leave-table-wrapper {
                overflow-x: auto;
              }

              .hr-leave-table {
                min-width: 1050px;
              }
            }

            @media (max-width: 850px) {
              .hr-leave-quick-grid {
                grid-template-columns: 1fr !important;
              }

              .hr-leave-summary-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }

              .hr-leave-hero {
                flex-direction: column !important;
                align-items: flex-start !important;
              }

              .hr-leave-hero-side {
                width: 100% !important;
              }

              .hr-leave-filter-body {
                flex-direction: column !important;
                align-items: flex-start !important;
              }
            }

            @media (max-width: 650px) {
              .hr-leave-summary-grid {
                grid-template-columns: 1fr !important;
              }

              .hr-leave-table-wrapper {
                display: none !important;
              }

              .hr-leave-mobile-list {
                display: flex !important;
              }

              .hr-leave-hero-title {
                font-size: 2rem !important;
              }

              .hr-leave-modal {
                width: calc(100vw - 24px) !important;
                max-height: calc(100vh - 24px) !important;
              }

              .hr-leave-modal-footer {
                flex-direction: column-reverse !important;
              }

              .hr-leave-modal-footer button {
                width: 100% !important;
              }

              .hr-leave-filter-options {
                width: 100% !important;
              }
            }

            @media (max-width: 460px) {
              .hr-leave-filter-options {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
              }

              .hr-leave-mobile-card {
                padding: 1rem !important;
              }

              .hr-leave-mobile-card-top {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 0.75rem !important;
              }
            }

            .hr-leave-action-button:hover {
              transform: translateY(-1px);
            }

            .hr-leave-quick-card:hover {
              transform: translateY(-2px);
              border-color: #b8cfc0 !important;
              box-shadow: 0 10px 25px rgba(35, 72, 50, 0.08);
            }

            .hr-leave-filter-button:hover {
              border-color: #9ab9a5 !important;
            }

            .hr-leave-pagination-button:hover:not(:disabled) {
              border-color: #8eae9a !important;
              background: #f4f8f5 !important;
            }

            .hr-leave-close-button:hover {
              background: #f1f3f2 !important;
            }

            .hr-leave-cancel-button:hover {
              background: #f5f6f5 !important;
            }

            .hr-leave-textarea:focus {
              border-color: #5b896c !important;
              box-shadow: 0 0 0 3px rgba(54, 105, 69, 0.10);
            }
          `}
        </style>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  container: {
    padding: "0 0 3rem 0",
    color: "#243229",
  },

  /* HERO */

  hero: {
    marginTop: "1rem",
    marginBottom: "1.5rem",
    padding: "2rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #173d28 0%, #285d3d 58%, #376f4d 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "2rem",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 14px 35px rgba(26, 66, 42, 0.16)",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "720px",
  },

  heroEyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.13em",
    color: "#c7e3cf",
    marginBottom: "0.75rem",
  },

  heroEyebrowLine: {
    width: "24px",
    height: "2px",
    backgroundColor: "#b8d9c2",
    borderRadius: "999px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "2.4rem",
    lineHeight: 1.1,
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  heroSubtitle: {
    margin: "0.85rem 0 0",
    color: "#d8e9dd",
    fontSize: "0.96rem",
    lineHeight: 1.7,
    maxWidth: "680px",
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    marginTop: "1.35rem",
  },

  heroMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#dcece1",
    fontSize: "0.78rem",
    fontWeight: "600",
  },

  heroMetaDivider: {
    width: "1px",
    height: "16px",
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  heroSide: {
    minWidth: "180px",
    backgroundColor: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "16px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    backdropFilter: "blur(8px)",
    position: "relative",
    zIndex: 1,
  },

  heroIconBox: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.9rem",
  },

  heroSideLabel: {
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    color: "#c9dfd0",
  },

  heroSideValue: {
    fontSize: "2rem",
    lineHeight: 1,
    marginTop: "0.25rem",
  },

  heroSideText: {
    fontSize: "0.72rem",
    color: "#c9dfd0",
    marginTop: "0.35rem",
  },

  /* QUICK NAV */

  quickNavSection: {
    marginBottom: "1.5rem",
  },

  quickNavHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1rem",
    marginBottom: "0.85rem",
  },

  sectionEyebrow: {
    display: "block",
    fontSize: "0.66rem",
    fontWeight: "800",
    letterSpacing: "0.13em",
    color: "#6b7b70",
    marginBottom: "0.3rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#243229",
    fontSize: "1.2rem",
    fontWeight: "800",
    letterSpacing: "-0.015em",
  },

  sectionDescription: {
    margin: 0,
    color: "#728077",
    fontSize: "0.78rem",
  },

  quickNavGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "1rem",
  },

  quickNavCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    padding: "1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe6e1",
    borderRadius: "14px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },

  quickNavIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  quickNavContent: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  quickNavLabel: {
    fontSize: "0.6rem",
    fontWeight: "800",
    letterSpacing: "0.11em",
    color: "#7a877f",
  },

  quickNavTitle: {
    fontSize: "0.95rem",
    color: "#26372c",
    marginTop: "0.1rem",
  },

  quickNavText: {
    fontSize: "0.73rem",
    color: "#7a877f",
    marginTop: "0.15rem",
  },

  quickNavArrow: {
    marginLeft: "auto",
    fontSize: "1.15rem",
    color: "#477457",
    fontWeight: "700",
  },

  /* SUMMARY */

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe6e1",
    borderRadius: "14px",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },

  summaryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryLabel: {
    display: "block",
    fontSize: "0.6rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "#7a877f",
  },

  summaryValue: {
    display: "block",
    fontSize: "1.55rem",
    lineHeight: 1.15,
    color: "#26372c",
    marginTop: "0.1rem",
  },

  summaryHint: {
    display: "block",
    fontSize: "0.68rem",
    color: "#89948e",
    marginTop: "0.15rem",
  },

  /* FILTER */

  filterSection: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe6e1",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    overflow: "hidden",
  },

  filterHeader: {
    padding: "1.1rem 1.25rem",
    borderBottom: "1px solid #e5eae7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },

  filterCount: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#55705e",
    backgroundColor: "#edf5ef",
    border: "1px solid #d2e5d7",
    padding: "0.35rem 0.7rem",
    borderRadius: "999px",
  },

  filterBody: {
    padding: "1rem 1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
  },

  filterLabelBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: "210px",
  },

  filterSmallLabel: {
    fontSize: "0.66rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "#4e6255",
  },

  filterDescription: {
    fontSize: "0.72rem",
    color: "#89948e",
  },

  filterOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    justifyContent: "flex-end",
  },

  filterButton: {
    border: "1px solid #d8e1db",
    backgroundColor: "#ffffff",
    color: "#637168",
    padding: "0.55rem 0.85rem",
    borderRadius: "9px",
    fontSize: "0.74rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  filterButtonActive: {
    backgroundColor: "#285d3d",
    borderColor: "#285d3d",
    color: "#ffffff",
  },

  /* DIRECTORY */

  directorySection: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe6e1",
    borderRadius: "16px",
    overflow: "hidden",
  },

  directoryHeader: {
    padding: "1.1rem 1.25rem",
    borderBottom: "1px solid #e5eae7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },

  directoryPage: {
    fontSize: "0.7rem",
    color: "#718078",
    backgroundColor: "#f4f6f5",
    border: "1px solid #e1e6e3",
    padding: "0.35rem 0.65rem",
    borderRadius: "7px",
    fontWeight: "700",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.82rem",
  },

  th: {
    padding: "0.85rem 1rem",
    backgroundColor: "#f7f9f7",
    color: "#6d7a72",
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #e2e8e4",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #edf0ee",
  },

  td: {
    padding: "0.95rem 1rem",
    color: "#34443a",
    verticalAlign: "middle",
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
  },

  employeeAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#e8f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  employeeName: {
    display: "block",
    color: "#29392f",
    fontSize: "0.82rem",
    fontWeight: "750",
  },

  employeeCode: {
    display: "block",
    color: "#8a958f",
    fontSize: "0.66rem",
    marginTop: "0.12rem",
  },

  leaveTypeCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "#405248",
    fontWeight: "650",
    whiteSpace: "nowrap",
  },

  dateCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    whiteSpace: "nowrap",
    color: "#56645b",
    fontSize: "0.74rem",
  },

  dateArrow: {
    color: "#9aa49e",
  },

  durationBadge: {
    display: "inline-block",
    padding: "0.35rem 0.55rem",
    borderRadius: "7px",
    backgroundColor: "#f3f6f3",
    border: "1px solid #e0e6e1",
    color: "#526258",
    fontSize: "0.68rem",
    fontWeight: "750",
    whiteSpace: "nowrap",
  },

  reasonText: {
    display: "block",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#657269",
    fontSize: "0.74rem",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.35rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "0.64rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },

  approveButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    border: "none",
    backgroundColor: "#28613d",
    color: "#ffffff",
    padding: "0.48rem 0.7rem",
    borderRadius: "8px",
    fontSize: "0.67rem",
    fontWeight: "750",
    cursor: "pointer",
    transition: "all 0.18s ease",
    whiteSpace: "nowrap",
  },

  rejectButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    border: "1px solid #e6c5c5",
    backgroundColor: "#fff7f7",
    color: "#a33a3a",
    padding: "0.48rem 0.7rem",
    borderRadius: "8px",
    fontSize: "0.67rem",
    fontWeight: "750",
    cursor: "pointer",
    transition: "all 0.18s ease",
    whiteSpace: "nowrap",
  },

  /* REVOKE */

  revokeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    border: "1px solid #e5d3a8",
    backgroundColor: "#fffaf0",
    color: "#8a641d",
    padding: "0.48rem 0.7rem",
    borderRadius: "8px",
    fontSize: "0.67rem",
    fontWeight: "750",
    cursor: "pointer",
    transition: "all 0.18s ease",
    whiteSpace: "nowrap",
  },

  noActionText: {
    color: "#a0aaa4",
    fontSize: "0.68rem",
    fontStyle: "italic",
  },

  /* STATES */

  stateCard: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    textAlign: "center",
  },

  loadingCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#e8f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.9rem",
  },

  stateTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "750",
    color: "#33443a",
  },

  stateText: {
    margin: "0.4rem 0 0",
    color: "#87928b",
    fontSize: "0.78rem",
    maxWidth: "420px",
    lineHeight: 1.5,
  },

  /* MOBILE */

  mobileList: {
    display: "none",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "0.9rem",
  },

  mobileCard: {
    border: "1px solid #e1e7e3",
    borderRadius: "13px",
    padding: "1rem",
    backgroundColor: "#ffffff",
  },

  mobileCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },

  mobileDivider: {
    height: "1px",
    backgroundColor: "#edf0ee",
    margin: "0.9rem 0",
  },

  mobileInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.9rem",
  },

  mobileFullWidth: {
    gridColumn: "1 / -1",
  },

  mobileLabel: {
    display: "block",
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "#89948e",
    marginBottom: "0.25rem",
  },

  mobileValue: {
    display: "block",
    fontSize: "0.77rem",
    color: "#34443a",
    lineHeight: 1.4,
  },

  mobileReason: {
    margin: 0,
    color: "#66736b",
    fontSize: "0.75rem",
    lineHeight: 1.5,
  },

  mobileActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    marginTop: "1rem",
    paddingTop: "0.9rem",
    borderTop: "1px solid #edf0ee",
  },

  /* PAGINATION */

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 0",
  },

  paginationButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "#ffffff",
    border: "1px solid #d9e2dc",
    color: "#496052",
    padding: "0.55rem 0.8rem",
    borderRadius: "9px",
    fontSize: "0.72rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  paginationDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  pageIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "#8a958f",
    fontSize: "0.63rem",
    fontWeight: "700",
  },

  /* INFO */

  infoStrip: {
    marginTop: "1.5rem",
    padding: "1rem 1.15rem",
    backgroundColor: "#f1f7f3",
    border: "1px solid #d5e7da",
    borderRadius: "13px",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8rem",
  },

  infoStripIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#e0f0e4",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoStripTitle: {
    display: "block",
    fontSize: "0.76rem",
    color: "#31513d",
  },

  infoStripText: {
    margin: "0.25rem 0 0",
    color: "#66786d",
    fontSize: "0.72rem",
    lineHeight: 1.55,
  },

  /* MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(20, 34, 25, 0.64)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 1200,
  },

  modal: {
    width: "min(94vw, 620px)",
    maxHeight: "calc(100vh - 32px)",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #dce4df",
    boxShadow: "0 25px 70px rgba(20, 45, 29, 0.22)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  modalHeader: {
    padding: "1.15rem 1.3rem",
    borderBottom: "1px solid #e4e9e6",
    backgroundColor: "#f8faf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    flexShrink: 0,
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    minWidth: 0,
  },

  modalIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalEyebrow: {
    display: "block",
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
    color: "#849088",
    marginBottom: "0.2rem",
  },

  modalTitle: {
    margin: 0,
    fontSize: "1.08rem",
    fontWeight: "800",
    color: "#29392f",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "transparent",
    color: "#718078",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  formContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },

  modalBody: {
    padding: "1.25rem",
    overflowY: "auto",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  requestSummary: {
    border: "1px solid #dfe7e2",
    borderRadius: "13px",
    overflow: "hidden",
  },

  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.75rem 0.9rem",
    backgroundColor: "#f5f8f5",
    borderBottom: "1px solid #e1e8e3",
    color: "#4d6254",
    fontSize: "0.7rem",
    fontWeight: "800",
  },

  requestDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "1rem",
    padding: "1rem",
  },

  requestDetailItem: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  detailLabel: {
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "#8a958f",
    marginBottom: "0.25rem",
  },

  detailValue: {
    fontSize: "0.78rem",
    color: "#34443a",
    fontWeight: "750",
  },

  detailSecondary: {
    fontSize: "0.68rem",
    color: "#87928b",
    marginTop: "0.12rem",
  },

  reasonBox: {
    padding: "0.85rem 1rem",
    backgroundColor: "#fafbfa",
    borderTop: "1px solid #e5eae7",
  },

  reasonBoxText: {
    margin: 0,
    color: "#5e6c63",
    fontSize: "0.76rem",
    lineHeight: 1.55,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },

  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: "0.74rem",
    color: "#405248",
    fontWeight: "750",
  },

  optionalLabel: {
    fontSize: "0.58rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "#87928b",
  },

  textarea: {
    width: "100%",
    minHeight: "110px",
    boxSizing: "border-box",
    border: "1px solid #d6dfd9",
    borderRadius: "10px",
    padding: "0.75rem 0.85rem",
    fontFamily: "inherit",
    fontSize: "0.78rem",
    color: "#34443a",
    backgroundColor: "#ffffff",
    outline: "none",
    resize: "vertical",
    transition: "all 0.18s ease",
  },

  characterCount: {
    textAlign: "right",
    fontSize: "0.6rem",
    color: "#9aa39e",
  },

  decisionNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.55rem",
    padding: "0.75rem 0.85rem",
    border: "1px solid",
    borderRadius: "10px",
  },

  decisionNoticeText: {
    margin: 0,
    fontSize: "0.7rem",
    lineHeight: 1.45,
    fontWeight: "650",
  },

  modalFooter: {
    padding: "0.95rem 1.25rem",
    borderTop: "1px solid #e4e9e6",
    backgroundColor: "#f8faf8",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.55rem",
    flexShrink: 0,
  },

  cancelButton: {
    border: "1px solid #d4ddd7",
    backgroundColor: "#ffffff",
    color: "#596960",
    padding: "0.62rem 1rem",
    borderRadius: "9px",
    fontSize: "0.72rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  confirmButton: {
    minWidth: "155px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    border: "none",
    color: "#ffffff",
    padding: "0.62rem 1rem",
    borderRadius: "9px",
    fontSize: "0.72rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  buttonSpinner: {
    width: "13px",
    height: "13px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "hrmsSpin 0.7s linear infinite",
  },
};

export default HRLeave;