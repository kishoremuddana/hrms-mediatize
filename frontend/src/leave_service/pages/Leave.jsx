import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  X,
  Plus,
  Clock3,
  CheckCircle2,
  XCircle,
  WalletCards,
  FileText,
  Paperclip,
  ChevronRight,
  Info,
  Send,
  BriefcaseBusiness,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { ConfirmDialog } from "../../shared/components/Modal";
import {
  getLeaveTypes,
  getMyLeaveBalance,
  getMyLeaves,
  applyLeave,
  cancelLeave,
} from "../services/leaveApi";
import {
  showSuccess,
  showError,
  showWarning,
} from "../../shared/utils/toast";

/* =========================================================
   STATUS CONFIG
========================================================= */

function getStatusConfig(status) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        background: "#e8f5ec",
        color: "#27613d",
        border: "#c3dfca",
        icon: CheckCircle2,
      };

    case "REJECTED":
      return {
        label: "Rejected",
        background: "#fbeaea",
        color: "#a33b3b",
        border: "#edc7c7",
        icon: XCircle,
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        background: "#f1f3f2",
        color: "#68746d",
        border: "#d9dfdb",
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
        border: "#eedda8",
        icon: Clock3,
      };
  }
}

/* =========================================================
   COMPONENT
========================================================= */

function Leave() {
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [leaveDuration, setLeaveDuration] =
    useState("SINGLE");

  const [singleDate, setSingleDate] = useState("");
  const [singleDayType, setSingleDayType] =
    useState("FULL_DAY");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [startDayType, setStartDayType] =
    useState("FULL_DAY");

  const [endDayType, setEndDayType] =
    useState("FULL_DAY");

  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        typesRes,
        balanceRes,
        leavesRes,
      ] = await Promise.allSettled([
        getLeaveTypes(),
        getMyLeaveBalance(),
        getMyLeaves({
          page: 1,
          limit: 20,
        }),
      ]);

      if (typesRes.status === "fulfilled") {
        setLeaveTypes(
          typesRes.value?.data || []
        );
      }

      if (balanceRes.status === "fulfilled") {
        setBalances(
          balanceRes.value?.data || []
        );
      }

      if (leavesRes.status === "fulfilled") {
        setLeaveRequests(
          leavesRes.value?.data?.items || []
        );
      }
    } catch (err) {
      console.error(
        "Failed to fetch leave data",
        err
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  fetchData();

  const handleLeaveUpdate = () => {
    fetchData();
  };

  window.addEventListener(
    "hrms:notification_update",
    handleLeaveUpdate
  );

  return () => {
    window.removeEventListener(
      "hrms:notification_update",
      handleLeaveUpdate
    );
  };
}, [fetchData]);
  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setLeaveTypeId("");
    setLeaveDuration("SINGLE");

    setSingleDate("");
    setSingleDayType("FULL_DAY");

    setStartDate("");
    setEndDate("");

    setStartDayType("FULL_DAY");
    setEndDayType("FULL_DAY");

    setReason("");
    setFile(null);
  };

  /* =======================================================
     CHANGE SINGLE / MULTI DAY
  ======================================================= */

  const handleDurationChange = (mode) => {
    setLeaveDuration(mode);

    if (mode === "SINGLE") {
      if (startDate) {
        setSingleDate(startDate);
      }

      setSingleDayType("FULL_DAY");

      setStartDate("");
      setEndDate("");

      setStartDayType("FULL_DAY");
      setEndDayType("FULL_DAY");
    } else {
      if (singleDate) {
        setStartDate(singleDate);
      }

      setSingleDate("");
      setSingleDayType("FULL_DAY");

      setStartDayType("FULL_DAY");
      setEndDayType("FULL_DAY");
    }
  };

  /* =======================================================
     APPLY LEAVE
  ======================================================= */

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!leaveTypeId || !reason) {
      showWarning(
        "Please fill in all required fields."
      );
      return;
    }

    let finalStartDate = "";
    let finalEndDate = "";
    let finalStartDayType = "FULL_DAY";
    let finalEndDayType = "FULL_DAY";

    if (leaveDuration === "SINGLE") {
      if (!singleDate) {
        showWarning(
          "Please select a date."
        );
        return;
      }

      finalStartDate = singleDate;
      finalEndDate = singleDate;

      finalStartDayType = singleDayType;
      finalEndDayType = singleDayType;
    } else {
      if (!startDate || !endDate) {
        showWarning(
          "Please select both start and end dates."
        );
        return;
      }

      if (endDate < startDate) {
        showWarning(
          "End Date cannot be before Start Date."
        );
        return;
      }

      finalStartDate = startDate;
      finalEndDate = endDate;

      finalStartDayType = startDayType;
      finalEndDayType = endDayType;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        "leave_type_id",
        leaveTypeId
      );

      formData.append(
        "start_date",
        finalStartDate
      );

      formData.append(
        "end_date",
        finalEndDate
      );

      formData.append(
        "start_day_type",
        finalStartDayType
      );

      formData.append(
        "end_day_type",
        finalEndDayType
      );

      formData.append(
        "reason",
        reason
      );

      if (file) {
        formData.append(
          "document",
          file
        );
      }

      await applyLeave(formData);

      showSuccess(
        "Leave request submitted successfully!"
      );

      setShowApplyModal(false);

      resetForm();

      fetchData();

      window.dispatchEvent(
        new Event(
          "hrms:notification_update"
        )
      );
    } catch (err) {
      console.error(
        "Failed to apply for leave",
        err
      );

      const errText =
        err.response?.data?.detail ||
        "Failed to submit leave request. Please check inputs.";

      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     CANCEL LEAVE
  ======================================================= */

  const confirmCancelRequest = async () => {
    if (!cancelTargetId) return;

    setCancelling(true);

    try {
      await cancelLeave(cancelTargetId);

      showSuccess(
        "Leave request cancelled successfully."
      );

      setCancelTargetId(null);

      fetchData();
    } catch (err) {
      console.error(
        "Failed to cancel leave request",
        err
      );

      const errText =
        err.response?.data?.detail ||
        "Unable to cancel leave request.";

      showError(errText);
    } finally {
      setCancelling(false);
    }
  };

  /* =======================================================
     OPEN APPLY MODAL
  ======================================================= */

  const openApplyModal = () => {
    resetForm();
    setShowApplyModal(true);
  };

  return (
    <AppLayout title="Apply for Leave">
      <div style={styles.container}>
        {/* =================================================
            BACK
        ================================================= */}

        <BackToDashboard
          to="/employee/dashboard"
          role="EMPLOYEE"
        />

        {/* =================================================
            HERO
        ================================================= */}

        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowLine} />
              EMPLOYEE SELF SERVICE
            </div>

            <h1 style={styles.heroTitle}>
              Leave Management
            </h1>

            <p style={styles.heroSubtitle}>
              Manage your leave balance, submit new
              requests, and track the status of your
              applications from one place.
            </p>

            <div style={styles.heroMeta}>
              <div style={styles.heroMetaItem}>
                <WalletCards size={16} />
                Leave Balance
              </div>

              <span style={styles.heroDivider} />

              <div style={styles.heroMetaItem}>
                <CalendarDays size={16} />
                Request History
              </div>
            </div>
          </div>

          <div style={styles.heroAction}>
            <div style={styles.heroActionIcon}>
              <CalendarDays size={25} />
            </div>

            <span style={styles.heroActionLabel}>
              NEED TIME OFF?
            </span>

            <strong style={styles.heroActionTitle}>
              Submit a Leave Request
            </strong>

            <button
              type="button"
              style={styles.heroApplyButton}
              onClick={openApplyModal}
            >
              <Plus size={17} />
              Apply for Leave
            </button>
          </div>
        </section>

        {/* =================================================
            BALANCE SECTION
        ================================================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                YOUR TIME OFF
              </span>

              <h2 style={styles.sectionTitle}>
                Leave Balance
              </h2>
            </div>

            <span style={styles.sectionHint}>
              Available balances
            </span>
          </div>

          {balances.length === 0 ? (
            <div style={styles.noBalanceCard}>
              <div style={styles.noBalanceIcon}>
                <WalletCards size={22} />
              </div>

              <div>
                <h3 style={styles.noBalanceTitle}>
                  No Leave Balances Assigned
                </h3>

                <p style={styles.noBalanceText}>
                  No active leave balance is allocated
                  for this year. Please contact HR if
                  your balances need to be initialized.
                </p>
              </div>
            </div>
          ) : (
            <div style={styles.balanceGrid}>
              {balances.map((b) => {
                const remaining =
                  Number(
                    b.allocated_days -
                      b.used_days -
                      b.pending_days
                  ).toFixed(1);

                return (
                  <div
                    key={
                      b.id ||
                      b.leave_type_id
                    }
                    style={styles.balanceCard}
                  >
                    <div style={styles.balanceCardTop}>
                      <div style={styles.balanceIcon}>
                        <BriefcaseBusiness
                          size={18}
                        />
                      </div>

                      <span style={styles.balanceYear}>
                        {b.year}
                      </span>
                    </div>

                    <h3 style={styles.balanceTitle}>
                      {b.leave_type_name ||
                        "Leave Balance"}
                    </h3>

                    <div style={styles.remainingBlock}>
                      <strong
                        style={styles.remainingNumber}
                      >
                        {remaining}
                      </strong>

                      <span
                        style={styles.remainingText}
                      >
                        days remaining
                      </span>
                    </div>

                    <div style={styles.balanceStats}>
                      <div style={styles.balanceStatItem}>
                        <span style={styles.balanceStatLabel}>
                          Allocated
                        </span>

                        <strong style={styles.balanceStatValue}>
                          {b.allocated_days}
                        </strong>
                      </div>

                      <div style={styles.balanceStatItem}>
                        <span style={styles.balanceStatLabel}>
                          Used
                        </span>

                        <strong style={styles.balanceStatValue}>
                          {b.used_days}
                        </strong>
                      </div>

                      <div style={styles.balanceStatItem}>
                        <span style={styles.balanceStatLabel}>
                          Pending
                        </span>

                        <strong style={styles.balanceStatValue}>
                          {b.pending_days}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            REQUEST HISTORY
        ================================================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                REQUEST HISTORY
              </span>

              <h2 style={styles.sectionTitle}>
                My Leave Requests
              </h2>
            </div>

            <button
              type="button"
              style={styles.smallApplyButton}
              onClick={openApplyModal}
            >
              <Plus size={15} />
              New Request
            </button>
          </div>

          {loading ? (
            <div style={styles.stateCard}>
              <div style={styles.stateIcon}>
                <Clock3 size={22} />
              </div>

              <h3 style={styles.stateTitle}>
                Loading leave history
              </h3>

              <p style={styles.stateText}>
                Please wait while your leave requests
                are being loaded.
              </p>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div style={styles.stateCard}>
              <div style={styles.stateIcon}>
                <CalendarDays size={22} />
              </div>

              <h3 style={styles.stateTitle}>
                No leave requests yet
              </h3>

              <p style={styles.stateText}>
                You haven't submitted any leave
                requests yet.
              </p>

              <button
                type="button"
                style={styles.emptyApplyButton}
                onClick={openApplyModal}
              >
                <Plus size={16} />
                Apply for Leave
              </button>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Leave Type
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
                    {leaveRequests.map(
                      (req) => {
                        const status =
                          getStatusConfig(
                            req.status
                          );

                        const StatusIcon =
                          status.icon;

                        return (
                          <tr
                            key={req.id}
                            style={styles.tr}
                          >
                            <td
                              style={styles.td}
                            >
                              <div
                                style={
                                  styles.leaveTypeCell
                                }
                              >
                                <div
                                  style={
                                    styles.tableIcon
                                  }
                                >
                                  <BriefcaseBusiness
                                    size={16}
                                  />
                                </div>

                                <div>
                                  <strong
                                    style={
                                      styles.leaveTypeName
                                    }
                                  >
                                    {req.leave_type_name ||
                                      "Leave"}
                                  </strong>
                                </div>
                              </div>
                            </td>

                            <td
                              style={styles.td}
                            >
                              <div
                                style={
                                  styles.dateCell
                                }
                              >
                                <CalendarDays
                                  size={15}
                                />

                                <span>
                                  {req.start_date}
                                </span>

                                <span
                                  style={
                                    styles.dateArrow
                                  }
                                >
                                  →
                                </span>

                                <span>
                                  {req.end_date}
                                </span>
                              </div>
                            </td>

                            <td
                              style={styles.td}
                            >
                              <span
                                style={
                                  styles.durationBadge
                                }
                              >
                                {req.duration}{" "}
                                day(s)
                              </span>
                            </td>

                            <td
                              style={styles.td}
                            >
                              <span
                                style={
                                  styles.reasonText
                                }
                              >
                                {req.reason ||
                                  "No reason provided"}
                              </span>
                            </td>

                            <td
                              style={styles.td}
                            >
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor:
                                    status.background,
                                  color:
                                    status.color,
                                  borderColor:
                                    status.border,
                                }}
                              >
                                <StatusIcon
                                  size={13}
                                />

                                {status.label}
                              </span>
                            </td>

                            <td
                              style={styles.td}
                            >
                              {req.status ===
                                "PENDING" && (
                                <button
                                  type="button"
                                  style={
                                    styles.cancelButton
                                  }
                                  onClick={() =>
                                    setCancelTargetId(
                                      req.id
                                    )
                                  }
                                >
                                  Cancel
                                </button>
                              )}

                              {req.status !==
                                "PENDING" && (
                                <span
                                  style={
                                    styles.noAction
                                  }
                                >
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div style={styles.mobileList}>
                {leaveRequests.map(
                  (req) => {
                    const status =
                      getStatusConfig(
                        req.status
                      );

                    const StatusIcon =
                      status.icon;

                    return (
                      <article
                        key={req.id}
                        style={styles.mobileCard}
                      >
                        <div
                          style={
                            styles.mobileTop
                          }
                        >
                          <div
                            style={
                              styles.mobileLeaveTitle
                            }
                          >
                            <div
                              style={
                                styles.tableIcon
                              }
                            >
                              <BriefcaseBusiness
                                size={16}
                              />
                            </div>

                            <strong>
                              {req.leave_type_name ||
                                "Leave"}
                            </strong>
                          </div>

                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor:
                                status.background,
                              color:
                                status.color,
                              borderColor:
                                status.border,
                            }}
                          >
                            <StatusIcon
                              size={13}
                            />
                            {status.label}
                          </span>
                        </div>

                        <div
                          style={
                            styles.mobileDivider
                          }
                        />

                        <div
                          style={
                            styles.mobileInfo
                          }
                        >
                          <div>
                            <span
                              style={
                                styles.mobileLabel
                              }
                            >
                              DATES
                            </span>

                            <strong
                              style={
                                styles.mobileValue
                              }
                            >
                              {req.start_date} →{" "}
                              {req.end_date}
                            </strong>
                          </div>

                          <div>
                            <span
                              style={
                                styles.mobileLabel
                              }
                            >
                              DURATION
                            </span>

                            <strong
                              style={
                                styles.mobileValue
                              }
                            >
                              {req.duration} day(s)
                            </strong>
                          </div>

                          <div
                            style={
                              styles.mobileFull
                            }
                          >
                            <span
                              style={
                                styles.mobileLabel
                              }
                            >
                              REASON
                            </span>

                            <p
                              style={
                                styles.mobileReason
                              }
                            >
                              {req.reason ||
                                "No reason provided"}
                            </p>
                          </div>
                        </div>

                        {req.status ===
                          "PENDING" && (
                          <button
                            type="button"
                            style={
                              styles.mobileCancelButton
                            }
                            onClick={() =>
                              setCancelTargetId(
                                req.id
                              )
                            }
                          >
                            Cancel Request
                          </button>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>

        {/* =================================================
            INFORMATION STRIP
        ================================================= */}

        <section style={styles.infoStrip}>
          <div style={styles.infoIcon}>
            <Info size={20} />
          </div>

          <div>
            <strong style={styles.infoTitle}>
              Leave request workflow
            </strong>

            <p style={styles.infoText}>
              Submit your request with the required
              dates and reason. Pending requests can
              be cancelled before HR completes the
              review.
            </p>
          </div>
        </section>

        {/* =================================================
            APPLY MODAL
        ================================================= */}

        {showApplyModal && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              !submitting &&
              setShowApplyModal(false)
            }
          >
            <div
              className="hr-leave-modal"
              style={styles.modal}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div
                  style={
                    styles.modalHeaderLeft
                  }
                >
                  <div style={styles.modalIcon}>
                    <CalendarDays size={21} />
                  </div>

                  <div>
                    <span
                      style={
                        styles.modalEyebrow
                      }
                    >
                      EMPLOYEE SELF SERVICE
                    </span>

                    <h2
                      style={
                        styles.modalTitle
                      }
                    >
                      Apply for Leave
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  style={styles.closeBtn}
                  onClick={() =>
                    !submitting &&
                    setShowApplyModal(false)
                  }
                  disabled={submitting}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleApplySubmit}
                style={styles.formContent}
              >
                <div style={styles.modalBody}>
                  {/* Leave Type */}
                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeading
                      }
                    >
                      <span
                        style={
                          styles.sectionNumber
                        }
                      >
                        01
                      </span>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Leave Details
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Select the type of leave
                          you want to request.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={styles.label}
                      >
                        Leave Type
                        <span
                          style={
                            styles.required
                          }
                        >
                          *
                        </span>
                      </label>

                      <select
                        style={
                          styles.input
                        }
                        value={leaveTypeId}
                        onChange={(e) =>
                          setLeaveTypeId(
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Select Leave Type
                        </option>

                        {leaveTypes
                          .filter(
                            (t) =>
                              t.is_active
                          )
                          .map((t) => (
                            <option
                              key={t.id}
                              value={t.id}
                            >
                              {t.name} (
                              {t.code}) -{" "}
                              {
                                t.max_days_per_year
                              }{" "}
                              days/yr
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Duration */}
                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeading
                      }
                    >
                      <span
                        style={
                          styles.sectionNumber
                        }
                      >
                        02
                      </span>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Duration
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Choose whether this is a
                          single or multi-day request.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.durationChoices
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleDurationChange(
                            "SINGLE"
                          )
                        }
                        style={{
                          ...styles.durationChoice,
                          ...(leaveDuration ===
                          "SINGLE"
                            ? styles.durationChoiceActive
                            : {}),
                        }}
                      >
                        <CalendarDays
                          size={18}
                        />

                        <span>
                          <strong>
                            Single Day
                          </strong>

                          <small>
                            One working day
                          </small>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDurationChange(
                            "MULTI"
                          )
                        }
                        style={{
                          ...styles.durationChoice,
                          ...(leaveDuration ===
                          "MULTI"
                            ? styles.durationChoiceActive
                            : {}),
                        }}
                      >
                        <CalendarDays
                          size={18}
                        />

                        <span>
                          <strong>
                            Multiple Days
                          </strong>

                          <small>
                            More than one day
                          </small>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Dates */}
                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeading
                      }
                    >
                      <span
                        style={
                          styles.sectionNumber
                        }
                      >
                        03
                      </span>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Dates & Day Type
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Select when you will be
                          away from work.
                        </span>
                      </div>
                    </div>

                    {leaveDuration ===
                    "SINGLE" ? (
                      <div
                        className="hrms-form-grid-2"
                        style={
                          styles.dateGrid
                        }
                      >
                        <div
                          style={
                            styles.formGroup
                          }
                        >
                          <label
                            style={
                              styles.label
                            }
                          >
                            Date
                            <span
                              style={
                                styles.required
                              }
                            >
                              *
                            </span>
                          </label>

                          <input
                            type="date"
                            style={
                              styles.input
                            }
                            value={singleDate}
                            onChange={(e) =>
                              setSingleDate(
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div
                          style={
                            styles.formGroup
                          }
                        >
                          <label
                            style={
                              styles.label
                            }
                          >
                            Day Type
                            <span
                              style={
                                styles.required
                              }
                            >
                              *
                            </span>
                          </label>

                          <select
                            style={
                              styles.input
                            }
                            value={
                              singleDayType
                            }
                            onChange={(e) =>
                              setSingleDayType(
                                e.target.value
                              )
                            }
                          >
                            <option value="FULL_DAY">
                              Full Day
                            </option>

                            <option value="FIRST_HALF">
                              First Half
                              (Morning)
                            </option>

                            <option value="SECOND_HALF">
                              Second Half
                              (Afternoon)
                            </option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={
                          styles.multiDateStack
                        }
                      >
                        <div
                          className="hrms-form-grid-2"
                          style={
                            styles.dateGrid
                          }
                        >
                          <div
                            style={
                              styles.formGroup
                            }
                          >
                            <label
                              style={
                                styles.label
                              }
                            >
                              Start Date
                              <span
                                style={
                                  styles.required
                                }
                              >
                                *
                              </span>
                            </label>

                            <input
                              type="date"
                              style={
                                styles.input
                              }
                              value={startDate}
                              onChange={(e) =>
                                setStartDate(
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          <div
                            style={
                              styles.formGroup
                            }
                          >
                            <label
                              style={
                                styles.label
                              }
                            >
                              Start Day Type
                            </label>

                            <select
                              style={
                                styles.input
                              }
                              value={
                                startDayType
                              }
                              onChange={(e) =>
                                setStartDayType(
                                  e.target.value
                                )
                              }
                            >
                              <option value="FULL_DAY">
                                Full Day
                              </option>

                              <option value="FIRST_HALF">
                                First Half
                                (Morning)
                              </option>

                              <option value="SECOND_HALF">
                                Second Half
                                (Afternoon)
                              </option>
                            </select>
                          </div>
                        </div>

                        <div
                          className="hrms-form-grid-2"
                          style={
                            styles.dateGrid
                          }
                        >
                          <div
                            style={
                              styles.formGroup
                            }
                          >
                            <label
                              style={
                                styles.label
                              }
                            >
                              End Date
                              <span
                                style={
                                  styles.required
                                }
                              >
                                *
                              </span>
                            </label>

                            <input
                              type="date"
                              style={
                                styles.input
                              }
                              value={endDate}
                              onChange={(e) =>
                                setEndDate(
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          <div
                            style={
                              styles.formGroup
                            }
                          >
                            <label
                              style={
                                styles.label
                              }
                            >
                              End Day Type
                            </label>

                            <select
                              style={
                                styles.input
                              }
                              value={
                                endDayType
                              }
                              onChange={(e) =>
                                setEndDayType(
                                  e.target.value
                                )
                              }
                            >
                              <option value="FULL_DAY">
                                Full Day
                              </option>

                              <option value="FIRST_HALF">
                                First Half
                                (Morning)
                              </option>

                              <option value="SECOND_HALF">
                                Second Half
                                (Afternoon)
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeading
                      }
                    >
                      <span
                        style={
                          styles.sectionNumber
                        }
                      >
                        04
                      </span>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Reason
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Explain the reason for your
                          leave request.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={styles.label}
                      >
                        Reason
                        <span
                          style={
                            styles.required
                          }
                        >
                          *
                        </span>
                      </label>

                      <textarea
                        style={
                          styles.textarea
                        }
                        value={reason}
                        onChange={(e) =>
                          setReason(
                            e.target.value
                          )
                        }
                        placeholder="Provide a detailed reason for your leave..."
                        required
                      />

                      <span
                        style={
                          styles.helperText
                        }
                      >
                        Please provide enough
                        information for HR to review
                        your request.
                      </span>
                    </div>
                  </div>

                  {/* Document */}
                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeading
                      }
                    >
                      <span
                        style={
                          styles.sectionNumber
                        }
                      >
                        05
                      </span>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Supporting Document
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Attach a document if required.
                        </span>
                      </div>
                    </div>

                    <label
                      style={
                        styles.uploadBox
                      }
                    >
                      <Paperclip size={20} />

                      <div>
                        <strong
                          style={
                            styles.uploadTitle
                          }
                        >
                          Choose a file
                        </strong>

                        <span
                          style={
                            styles.uploadText
                          }
                        >
                          PDF, PNG, JPG or JPEG
                        </span>
                      </div>

                      <input
                        type="file"
                        style={
                          styles.hiddenFile
                        }
                        onChange={(e) =>
                          setFile(
                            e.target.files[0] ||
                              null
                          )
                        }
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                    </label>

                    {file && (
                      <div
                        style={
                          styles.selectedFile
                        }
                      >
                        <FileText size={17} />

                        <span>
                          {file.name}
                        </span>

                        <button
                          type="button"
                          style={
                            styles.removeFile
                          }
                          onClick={() =>
                            setFile(null)
                          }
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="hr-leave-modal-footer"
                  style={
                    styles.modalFooter
                  }
                >
                  <div
                    style={
                      styles.footerNote
                    }
                  >
                    <ShieldIcon />

                    <span>
                      Your request will be sent
                      securely to HR for review.
                    </span>
                  </div>

                  <div
                    style={
                      styles.footerActions
                    }
                  >
                    <button
                      type="button"
                      style={
                        styles.cancelModalButton
                      }
                      onClick={() =>
                        setShowApplyModal(
                          false
                        )
                      }
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      style={
                        styles.submitButton
                      }
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            style={
                              styles.spinner
                            }
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Leave Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================
            CANCEL CONFIRMATION
        ================================================= */}

        <ConfirmDialog
          isOpen={Boolean(
            cancelTargetId
          )}
          onClose={() =>
            setCancelTargetId(null)
          }
          onConfirm={
            confirmCancelRequest
          }
          title="Cancel Leave Request"
          message="Are you sure you want to cancel this leave request? This action cannot be undone."
          confirmText="Yes, Cancel Leave"
          confirmVariant="danger"
          loading={cancelling}
        />

        {/* =================================================
            RESPONSIVE STYLES
        ================================================= */}

        <style>
          {`
            .hr-leave-modal {
              width: min(94vw, 760px);
            }

            .hr-leave-modal-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 1rem;
            }

            .hr-leave-table-wrapper {
              display: block;
            }

            .hr-leave-mobile-list {
              display: none;
            }

            .hr-leave-duration-choice:hover {
              border-color: #9ab9a5;
            }

            .hr-leave-upload:hover {
              border-color: #8eae9a;
              background: #f5f9f6;
            }

            @media (max-width: 1050px) {
              .hr-leave-summary-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }

            @media (max-width: 850px) {
              .hr-leave-hero {
                flex-direction: column !important;
              }

              .hr-leave-hero-action {
                width: 100% !important;
              }

              .hr-leave-hero-button {
                width: 100% !important;
              }

              .hr-leave-modal-footer {
                flex-direction: column !important;
                align-items: stretch !important;
              }

              .hr-leave-footer-actions {
                justify-content: flex-end !important;
              }
            }

            @media (max-width: 680px) {
              .hr-leave-table-wrapper {
                display: none !important;
              }

              .hr-leave-mobile-list {
                display: flex !important;
                flex-direction: column;
                gap: 0.75rem;
                padding: 0.85rem;
              }

              .hr-leave-summary-grid {
                grid-template-columns: 1fr !important;
              }

              .hr-leave-hero-title {
                font-size: 2rem !important;
              }

              .hr-leave-modal {
                width: calc(100vw - 20px) !important;
                max-height: calc(100vh - 20px) !important;
              }

              .hr-leave-modal-footer {
                padding: 0.9rem !important;
              }

              .hr-leave-footer-actions {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
              }

              .hr-leave-footer-actions button {
                width: 100% !important;
              }

              .hr-leave-request-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 480px) {
              .hr-leave-footer-actions {
                grid-template-columns: 1fr !important;
              }

              .hr-leave-duration-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   SMALL ICON COMPONENT
========================================================= */

function ShieldIcon() {
  return (
    <span
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "6px",
        backgroundColor: "#e3f1e7",
        color: "#28613d",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "800",
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  container: {
    padding: "0 0 3rem",
    color: "#26372c",
  },

  /* HERO */

  hero: {
    marginTop: "1rem",
    marginBottom: "1.7rem",
    padding: "2rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #173d28 0%, #285d3d 58%, #376f4d 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "2rem",
    boxShadow:
      "0 15px 38px rgba(29, 70, 45, 0.17)",
  },

  heroContent: {
    maxWidth: "700px",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    color: "#c7e1ce",
    fontSize: "0.68rem",
    fontWeight: "800",
    letterSpacing: "0.13em",
    marginBottom: "0.7rem",
  },

  eyebrowLine: {
    width: "24px",
    height: "2px",
    borderRadius: "999px",
    backgroundColor: "#b6d7bf",
  },

  heroTitle: {
    margin: 0,
    fontSize: "2.45rem",
    lineHeight: 1.1,
    fontWeight: "800",
    letterSpacing: "-0.035em",
  },

  heroSubtitle: {
    margin: "0.85rem 0 0",
    color: "#d8e9dc",
    fontSize: "0.94rem",
    lineHeight: 1.7,
    maxWidth: "650px",
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    marginTop: "1.3rem",
  },

  heroMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#d7e8dc",
    fontSize: "0.72rem",
    fontWeight: "650",
  },

  heroDivider: {
    width: "1px",
    height: "16px",
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  heroAction: {
    minWidth: "225px",
    padding: "1.15rem",
    borderRadius: "16px",
    backgroundColor:
      "rgba(255,255,255,0.10)",
    border:
      "1px solid rgba(255,255,255,0.15)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  heroActionIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "11px",
    backgroundColor:
      "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.8rem",
  },

  heroActionLabel: {
    fontSize: "0.58rem",
    letterSpacing: "0.11em",
    fontWeight: "800",
    color: "#c6dfcd",
  },

  heroActionTitle: {
    fontSize: "0.85rem",
    marginTop: "0.2rem",
    marginBottom: "0.8rem",
  },

  heroApplyButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#285d3d",
    padding: "0.65rem 0.85rem",
    fontSize: "0.73rem",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* SECTIONS */

  section: {
    marginBottom: "1.7rem",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1rem",
    marginBottom: "0.9rem",
  },

  sectionEyebrow: {
    display: "block",
    fontSize: "0.62rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    color: "#77857c",
    marginBottom: "0.25rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#293a30",
    fontSize: "1.25rem",
    fontWeight: "800",
  },

  sectionHint: {
    fontSize: "0.7rem",
    color: "#89948e",
  },

  /* BALANCE */

  balanceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 245px), 1fr))",
    gap: "1rem",
  },

  balanceCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "15px",
    padding: "1.1rem",
    boxShadow:
      "0 5px 18px rgba(31, 59, 41, 0.035)",
  },

  balanceCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },

  balanceIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#e8f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  balanceYear: {
    fontSize: "0.65rem",
    fontWeight: "750",
    color: "#7f8b84",
    backgroundColor: "#f4f6f4",
    padding: "0.3rem 0.5rem",
    borderRadius: "6px",
  },

  balanceTitle: {
    margin: 0,
    color: "#34453b",
    fontSize: "0.88rem",
    fontWeight: "750",
  },

  remainingBlock: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.45rem",
    marginTop: "0.75rem",
  },

  remainingNumber: {
    color: "#28613d",
    fontSize: "2rem",
    lineHeight: 1,
    fontWeight: "800",
  },

  remainingText: {
    color: "#7c8981",
    fontSize: "0.68rem",
  },

  balanceStats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "0.4rem",
    borderTop: "1px solid #e9eeeb",
    marginTop: "0.85rem",
    paddingTop: "0.75rem",
  },

  balanceStatItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    minWidth: 0,
  },

  balanceStatLabel: {
    color: "#7c8981",
    fontSize: "0.62rem",
    fontWeight: "650",
    whiteSpace: "nowrap",
  },

  balanceStatValue: {
    color: "#34453b",
    fontSize: "0.72rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  /* NO BALANCE */

  noBalanceCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "14px",
    padding: "1.1rem",
  },

  noBalanceIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#f3f5f3",
    color: "#6d7b72",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  noBalanceTitle: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#35463b",
  },

  noBalanceText: {
    margin: "0.3rem 0 0",
    fontSize: "0.74rem",
    color: "#7d8982",
    lineHeight: 1.5,
  },

  /* QUICK ACTION */

  smallApplyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    border: "1px solid #c8dccd",
    backgroundColor: "#f0f7f2",
    color: "#28613d",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.68rem",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* TABLE */

  tableWrapper: {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "15px",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.8rem",
    textAlign: "left",
  },

  th: {
    backgroundColor: "#f7f9f7",
    color: "#6f7d74",
    padding: "0.85rem 1rem",
    borderBottom: "1px solid #e2e8e4",
    fontSize: "0.61rem",
    fontWeight: "800",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #edf1ee",
  },

  td: {
    padding: "0.95rem 1rem",
    color: "#46554c",
    verticalAlign: "middle",
  },

  leaveTypeCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
  },

  tableIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    backgroundColor: "#eaf4ed",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  leaveTypeName: {
    color: "#34453b",
    fontSize: "0.78rem",
  },

  dateCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "#637168",
    fontSize: "0.7rem",
    whiteSpace: "nowrap",
  },

  dateArrow: {
    color: "#9ba59f",
  },

  durationBadge: {
    display: "inline-block",
    padding: "0.32rem 0.5rem",
    borderRadius: "7px",
    backgroundColor: "#f3f6f3",
    border: "1px solid #e1e7e2",
    color: "#56655c",
    fontSize: "0.66rem",
    fontWeight: "750",
    whiteSpace: "nowrap",
  },

  reasonText: {
    display: "block",
    maxWidth: "210px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#6c7971",
    fontSize: "0.7rem",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.32rem",
    border: "1px solid",
    borderRadius: "999px",
    padding: "0.34rem 0.55rem",
    fontSize: "0.62rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  cancelButton: {
    backgroundColor: "#fff7f7",
    color: "#a33b3b",
    border: "1px solid #e8c5c5",
    padding: "0.4rem 0.65rem",
    borderRadius: "7px",
    fontSize: "0.66rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  noAction: {
    color: "#a1aaa5",
    fontSize: "0.75rem",
  },

  /* MOBILE */

  mobileList: {
    display: "none",
  },

  mobileCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "13px",
    padding: "1rem",
  },

  mobileTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },

  mobileLeaveTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    color: "#34453b",
    fontSize: "0.78rem",
  },

  mobileDivider: {
    height: "1px",
    backgroundColor: "#edf1ee",
    margin: "0.8rem 0",
  },

  mobileInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.85rem",
  },

  mobileFull: {
    gridColumn: "1 / -1",
  },

  mobileLabel: {
    display: "block",
    color: "#89948e",
    fontSize: "0.58rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "0.25rem",
  },

  mobileValue: {
    display: "block",
    color: "#43534a",
    fontSize: "0.73rem",
    lineHeight: 1.4,
  },

  mobileReason: {
    margin: 0,
    color: "#6c7971",
    fontSize: "0.72rem",
    lineHeight: 1.5,
  },

  mobileCancelButton: {
    width: "100%",
    marginTop: "0.9rem",
    padding: "0.58rem",
    borderRadius: "8px",
    border: "1px solid #e8c5c5",
    backgroundColor: "#fff7f7",
    color: "#a33b3b",
    fontSize: "0.68rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  /* STATE */

  stateCard: {
    minHeight: "260px",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },

  stateIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#e9f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.8rem",
  },

  stateTitle: {
    margin: 0,
    color: "#34453b",
    fontSize: "0.95rem",
    fontWeight: "750",
  },

  stateText: {
    margin: "0.35rem 0 0",
    maxWidth: "400px",
    color: "#87928c",
    fontSize: "0.74rem",
    lineHeight: 1.5,
  },

  emptyApplyButton: {
    marginTop: "1rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    border: "none",
    backgroundColor: "#28613d",
    color: "#ffffff",
    padding: "0.58rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.7rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  /* INFO */

  infoStrip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "1rem",
    backgroundColor: "#f0f7f2",
    border: "1px solid #d6e7da",
    borderRadius: "13px",
  },

  infoIcon: {
    width: "37px",
    height: "37px",
    borderRadius: "10px",
    backgroundColor: "#e0f0e4",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoTitle: {
    display: "block",
    color: "#35533f",
    fontSize: "0.75rem",
  },

  infoText: {
    margin: "0.25rem 0 0",
    color: "#6d7d73",
    fontSize: "0.7rem",
    lineHeight: 1.5,
  },

  /* MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor:
      "rgba(19, 35, 25, 0.66)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 1200,
  },

  modal: {
    maxHeight: "calc(100vh - 32px)",
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow:
      "0 28px 75px rgba(20, 45, 29, 0.24)",
  },

  modalHeader: {
    padding: "1.1rem 1.25rem",
    backgroundColor: "#f7faf8",
    borderBottom: "1px solid #e3e9e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    flexShrink: 0,
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    minWidth: 0,
  },

  modalIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    backgroundColor: "#e5f2e8",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalEyebrow: {
    display: "block",
    fontSize: "0.58rem",
    color: "#849088",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "0.2rem",
  },

  modalTitle: {
    margin: 0,
    color: "#2e3f35",
    fontSize: "1.08rem",
    fontWeight: "800",
  },

  closeBtn: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#738078",
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
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  /* FORM SECTIONS */

  formSection: {
    border: "1px solid #e0e7e2",
    borderRadius: "13px",
    padding: "1rem",
    backgroundColor: "#ffffff",
  },

  formSectionHeading: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.65rem",
    marginBottom: "0.9rem",
  },

  sectionNumber: {
    width: "29px",
    height: "29px",
    borderRadius: "8px",
    backgroundColor: "#e8f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.61rem",
    fontWeight: "800",
    flexShrink: 0,
  },

  formSectionTitle: {
    display: "block",
    color: "#35463c",
    fontSize: "0.78rem",
    fontWeight: "800",
  },

  formSectionText: {
    display: "block",
    color: "#87928c",
    fontSize: "0.67rem",
    marginTop: "0.16rem",
    lineHeight: 1.4,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },

  label: {
    color: "#536259",
    fontSize: "0.69rem",
    fontWeight: "750",
  },

  required: {
    color: "#a33b3b",
    marginLeft: "0.18rem",
  },

  input: {
    width: "100%",
    height: "42px",
    boxSizing: "border-box",
    border: "1px solid #d5dfd8",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#3d4d43",
    padding: "0.6rem 0.75rem",
    fontFamily: "inherit",
    fontSize: "0.74rem",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "105px",
    boxSizing: "border-box",
    border: "1px solid #d5dfd8",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#3d4d43",
    padding: "0.7rem 0.75rem",
    fontFamily: "inherit",
    fontSize: "0.74rem",
    outline: "none",
    resize: "vertical",
  },

  helperText: {
    color: "#919b95",
    fontSize: "0.62rem",
  },

  dateGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "0.75rem",
  },

  multiDateStack: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },

  /* DURATION */

  durationChoices: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "0.65rem",
  },

  durationChoice: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    textAlign: "left",
    border: "1px solid #dbe4de",
    backgroundColor: "#ffffff",
    color: "#627068",
    borderRadius: "10px",
    padding: "0.75rem",
    cursor: "pointer",
  },

  durationChoiceActive: {
    borderColor: "#5d8b6b",
    backgroundColor: "#eef7f0",
    color: "#28613d",
    boxShadow:
      "0 0 0 2px rgba(53, 104, 69, 0.08)",
  },

  /* UPLOAD */

  uploadBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    border: "1px dashed #b9cabe",
    backgroundColor: "#f8faf8",
    borderRadius: "10px",
    padding: "0.85rem",
    color: "#477057",
    cursor: "pointer",
  },

  uploadTitle: {
    display: "block",
    color: "#42574a",
    fontSize: "0.72rem",
  },

  uploadText: {
    display: "block",
    color: "#929c96",
    fontSize: "0.61rem",
    marginTop: "0.1rem",
  },

  hiddenFile: {
    display: "none",
  },

  selectedFile: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    marginTop: "0.55rem",
    padding: "0.55rem 0.65rem",
    borderRadius: "8px",
    backgroundColor: "#edf6ef",
    border: "1px solid #d5e8d9",
    color: "#41604b",
    fontSize: "0.67rem",
  },

  removeFile: {
    marginLeft: "auto",
    width: "25px",
    height: "25px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#8b9690",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  /* MODAL FOOTER */

  modalFooter: {
    padding: "0.9rem 1.25rem",
    borderTop: "1px solid #e2e8e4",
    backgroundColor: "#f8faf8",
    flexShrink: 0,
  },

  footerNote: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "#7b8981",
    fontSize: "0.63rem",
  },

  footerActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "0.75rem",
  },

  cancelModalButton: {
    border: "1px solid #d5ded8",
    backgroundColor: "#ffffff",
    color: "#617068",
    padding: "0.62rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.7rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    minWidth: "175px",
    border: "none",
    backgroundColor: "#28613d",
    color: "#ffffff",
    padding: "0.62rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.7rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  spinner: {
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    border:
      "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    display: "inline-block",
    animation:
      "hrmsLeaveSpin 0.7s linear infinite",
  },
};

export default Leave;