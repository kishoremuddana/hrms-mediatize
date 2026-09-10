import React, { useState, useEffect, useCallback } from "react";
import {
  Target,
  Plus,
  Edit,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  CircleDashed,
  Clock3,
  Ban,
  TrendingUp,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getAllGoals,
  createGoal,
  updateGoal,
} from "../services/performanceApi";
import { getEmployees } from "../../employee_service/services/employeeApi";
import {
  showSuccess,
  showError,
} from "../../shared/utils/toast";

function HRGoals() {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const [formStatus, setFormStatus] = useState("NOT_STARTED");
  const [submitting, setSubmitting] = useState(false);

  // Load employees list
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await getEmployees({ limit: 100 });
        setEmployees(res.data?.items || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    }

    loadEmployees();
  }, []);

  // Fetch performance goals
  const fetchGoals = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        status: selectedStatus || undefined,
        employee_id: selectedEmployeeId
          ? Number(selectedEmployeeId)
          : undefined,
      };

      const res = await getAllGoals(params);

      setGoals(res.data?.items || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch goals", err);
      showError("Unable to load performance goals.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedEmployeeId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormEmployeeId(employees[0]?.id || "");
    setFormTitle("");
    setFormDescription("");
    setFormTargetDate("");
    setFormProgress(0);
    setFormStatus("NOT_STARTED");
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormEmployeeId(goal.employee_id);
    setFormTitle(goal.title);
    setFormDescription(goal.description || "");
    setFormTargetDate(goal.target_date);
    setFormProgress(goal.progress_percentage || 0);
    setFormStatus(goal.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formEmployeeId) {
      showError("Please select an employee.");
      return;
    }

    if (!formTitle.trim()) {
      showError("Goal title is required.");
      return;
    }

    if (!formTargetDate) {
      showError("Target date is required.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          title: formTitle,
          description: formDescription,
          target_date: formTargetDate,
          progress_percentage: Number(formProgress),
          status: formStatus,
        });

        showSuccess("Goal updated successfully.");
      } else {
        await createGoal({
          employee_id: Number(formEmployeeId),
          title: formTitle,
          description: formDescription,
          target_date: formTargetDate,
          progress_percentage: Number(formProgress),
          status: formStatus,
        });

        showSuccess("Goal created successfully.");
      }

      setShowModal(false);
      fetchGoals();
    } catch (err) {
      console.error("Failed to save goal", err);

      showError(
        err.response?.data?.detail ||
          "Unable to save goal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Completed",
          color: "#17613f",
          background: "#eaf5ee",
          border: "#c6dfcf",
          icon: <CheckCircle2 size={14} />,
        };

      case "IN_PROGRESS":
        return {
          label: "In Progress",
          color: "#286247",
          background: "#eef7f2",
          border: "#cfe1d6",
          icon: <TrendingUp size={14} />,
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          color: "#68776f",
          background: "#f1f3f2",
          border: "#dce2de",
          icon: <Ban size={14} />,
        };

      default:
        return {
          label: "Not Started",
          color: "#936c18",
          background: "#fff8e8",
          border: "#ead9a7",
          icon: <CircleDashed size={14} />,
        };
    }
  };

  const getProgressState = (progress) => {
    if (progress >= 100) {
      return {
        label: "Complete",
        color: "#17613f",
      };
    }

    if (progress > 0) {
      return {
        label: "Active",
        color: "#28734d",
      };
    }

    return {
      label: "Not Started",
      color: "#8a7560",
    };
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <BackToDashboard />

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.heroIcon}>
              <Target size={27} strokeWidth={2} />
            </div>

            <div>
              <div style={styles.eyebrow}>
                PERFORMANCE MANAGEMENT
              </div>

              <h1 style={styles.heroTitle}>
                Employee Performance Goals
              </h1>

              <p style={styles.heroSubtitle}>
                Assign measurable goals, establish target dates,
                and monitor employee progress from one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            style={styles.createButton}
          >
            <Plus size={17} strokeWidth={2.2} />
            <span>Create Goal</span>
          </button>
        </section>

        {/* SUMMARY */}
        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#edf6f0",
                color: "#17613f",
              }}
            >
              <Target size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                Goals on Page
              </span>

              <strong style={styles.summaryValue}>
                {goals.length}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#eef7f2",
                color: "#286247",
              }}
            >
              <TrendingUp size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                In Progress
              </span>

              <strong style={styles.summaryValue}>
                {
                  goals.filter(
                    (goal) =>
                      goal.status === "IN_PROGRESS"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#eaf5ee",
                color: "#17613f",
              }}
            >
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                Completed
              </span>

              <strong style={styles.summaryValue}>
                {
                  goals.filter(
                    (goal) =>
                      goal.status === "COMPLETED"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                backgroundColor: "#f2f5f3",
                color: "#62766b",
              }}
            >
              <Users size={19} />
            </div>

            <div>
              <span style={styles.summaryLabel}>
                Employees
              </span>

              <strong style={styles.summaryValue}>
                {employees.length}
              </strong>
            </div>
          </div>
        </section>

        {/* FILTER / EXPLORER */}
        <section style={styles.explorer}>
          <div style={styles.explorerHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                GOAL DIRECTORY
              </div>

              <h2 style={styles.sectionTitle}>
                Performance goals
              </h2>

              <p style={styles.sectionDescription}>
                Filter and review employee objectives.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchGoals}
              style={styles.refreshButton}
              title="Refresh goals"
            >
              <RefreshCw
                size={15}
                className={loading ? "hrms-spin" : ""}
              />

              <span>Refresh</span>
            </button>
          </div>

          <div style={styles.filterArea}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                Goal Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                style={styles.select}
              >
                <option value="">
                  All Goal Statuses
                </option>

                <option value="NOT_STARTED">
                  NOT STARTED
                </option>

                <option value="IN_PROGRESS">
                  IN PROGRESS
                </option>

                <option value="COMPLETED">
                  COMPLETED
                </option>

                <option value="CANCELLED">
                  CANCELLED
                </option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                Employee
              </label>

              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setPage(1);
                }}
                style={styles.select}
              >
                <option value="">
                  All Employees
                </option>

                {employees.map((emp) => (
                  <option
                    key={emp.id}
                    value={emp.id}
                  >
                    {emp.first_name} {emp.last_name} (
                    {emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* GOALS */}
        {loading ? (
          <div style={styles.stateCard}>
            <div style={styles.stateIcon}>
              <RefreshCw
                size={23}
                className="hrms-spin"
              />
            </div>

            <h3 style={styles.stateTitle}>
              Loading performance goals
            </h3>

            <p style={styles.stateText}>
              Please wait while the latest goals are
              retrieved.
            </p>
          </div>
        ) : goals.length === 0 ? (
          <div style={styles.stateCard}>
            <div style={styles.stateIcon}>
              <Target size={25} />
            </div>

            <h3 style={styles.stateTitle}>
              No goals found
            </h3>

            <p style={styles.stateText}>
              No performance goals match the selected
              filters.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              style={styles.emptyCreateButton}
            >
              <Plus size={15} />
              Create a Goal
            </button>
          </div>
        ) : (
          <section style={styles.goalGrid}>
            {goals.map((goal) => {
              const statusConfig =
                getStatusConfig(goal.status);

              const progressState =
                getProgressState(
                  goal.progress_percentage
                );

              return (
                <article
                  key={goal.id}
                  style={{
                    ...styles.goalCard,
                    borderColor:
                      goal.status === "COMPLETED"
                        ? "#d1e3d7"
                        : "#dfe8e2",
                  }}
                >
                  {/* Card Header */}
                  <div style={styles.goalHeader}>
                    <div style={styles.employeeBlock}>
                      <div style={styles.employeeAvatar}>
                        {(goal.employee_name ||
                          "E")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <span style={styles.employeeName}>
                          {goal.employee_name}
                        </span>

                        <span
                          style={
                            styles.employeeCode
                          }
                        >
                          {goal.employee_code}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        color:
                          statusConfig.color,
                        backgroundColor:
                          statusConfig.background,
                        borderColor:
                          statusConfig.border,
                      }}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Goal Content */}
                  <div style={styles.goalContent}>
                    <h3 style={styles.goalTitle}>
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p style={styles.goalDescription}>
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Progress */}
                  <div style={styles.progressSection}>
                    <div style={styles.progressHeader}>
                      <div>
                        <span
                          style={
                            styles.progressLabel
                          }
                        >
                          Goal Progress
                        </span>

                        <span
                          style={{
                            ...styles.progressState,
                            color:
                              progressState.color,
                          }}
                        >
                          {progressState.label}
                        </span>
                      </div>

                      <strong
                        style={
                          styles.progressPercentage
                        }
                      >
                        {goal.progress_percentage}%
                      </strong>
                    </div>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              goal.progress_percentage ||
                                0
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={styles.goalFooter}>
                    <div style={styles.targetDate}>
                      <div style={styles.dateIcon}>
                        <Calendar size={14} />
                      </div>

                      <div>
                        <span style={styles.dateLabel}>
                          Target Date
                        </span>

                        <span style={styles.dateValue}>
                          {goal.target_date}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(goal)
                      }
                      style={styles.editButton}
                    >
                      <Edit size={14} />

                      <span>Edit Goal</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              style={{
                ...styles.pageButton,
                opacity: page <= 1 ? 0.45 : 1,
                cursor:
                  page <= 1
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div style={styles.pageIndicator}>
              <span style={styles.pageSmallLabel}>
                PAGE
              </span>

              <strong>{page}</strong>

              <span>of {totalPages}</span>
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              style={{
                ...styles.pageButton,
                opacity:
                  page >= totalPages ? 0.45 : 1,
                cursor:
                  page >= totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              {/* Fixed Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderLeft}>
                  <div style={styles.modalIcon}>
                    {editingGoal ? (
                      <Edit size={19} />
                    ) : (
                      <Target size={19} />
                    )}
                  </div>

                  <div>
                    <div style={styles.modalEyebrow}>
                      PERFORMANCE MANAGEMENT
                    </div>

                    <h3 style={styles.modalTitle}>
                      {editingGoal
                        ? "Edit Performance Goal"
                        : "Create Performance Goal"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  style={styles.closeButton}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <form
                onSubmit={handleSubmit}
                style={styles.modalForm}
              >
                <div style={styles.modalBody}>
                  {/* Employee */}
                  <section style={styles.formSection}>
                    <div style={styles.formSectionHeader}>
                      <span
                        style={styles.sectionNumber}
                      >
                        01
                      </span>

                      <div>
                        <h4
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Employee Assignment
                        </h4>

                        <p
                          style={
                            styles.formSectionDescription
                          }
                        >
                          Select the employee responsible
                          for this goal.
                        </p>
                      </div>
                    </div>

                    <label style={styles.fieldLabel}>
                      Employee{" "}
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <select
                      disabled={!!editingGoal}
                      value={formEmployeeId}
                      onChange={(e) =>
                        setFormEmployeeId(
                          e.target.value
                        )
                      }
                      style={{
                        ...styles.input,
                        ...(editingGoal
                          ? styles.disabledInput
                          : {}),
                      }}
                    >
                      {employees.map((emp) => (
                        <option
                          key={emp.id}
                          value={emp.id}
                        >
                          {emp.first_name}{" "}
                          {emp.last_name} (
                          {emp.employee_code})
                        </option>
                      ))}
                    </select>

                    {editingGoal && (
                      <p style={styles.helperText}>
                        Employee assignment cannot be
                        changed while editing a goal.
                      </p>
                    )}
                  </section>

                  {/* Goal Details */}
                  <section style={styles.formSection}>
                    <div style={styles.formSectionHeader}>
                      <span
                        style={styles.sectionNumber}
                      >
                        02
                      </span>

                      <div>
                        <h4
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Goal Details
                        </h4>

                        <p
                          style={
                            styles.formSectionDescription
                          }
                        >
                          Define the objective and expected
                          outcome.
                        </p>
                      </div>
                    </div>

                    <label style={styles.fieldLabel}>
                      Goal Title{" "}
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) =>
                        setFormTitle(e.target.value)
                      }
                      placeholder="e.g. Complete Leave Management APIs"
                      style={styles.input}
                    />

                    <label
                      style={{
                        ...styles.fieldLabel,
                        marginTop: "15px",
                      }}
                    >
                      Description
                    </label>

                    <textarea
                      rows={4}
                      value={formDescription}
                      onChange={(e) =>
                        setFormDescription(
                          e.target.value
                        )
                      }
                      placeholder="Details about goal scope and deliverables..."
                      style={{
                        ...styles.input,
                        resize: "vertical",
                        minHeight: "100px",
                      }}
                    />
                  </section>

                  {/* Schedule */}
                  <section style={styles.formSection}>
                    <div style={styles.formSectionHeader}>
                      <span
                        style={styles.sectionNumber}
                      >
                        03
                      </span>

                      <div>
                        <h4
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Timeline & Status
                        </h4>

                        <p
                          style={
                            styles.formSectionDescription
                          }
                        >
                          Set the target date and current
                          goal status.
                        </p>
                      </div>
                    </div>

                    <div style={styles.twoColumn}>
                      <div>
                        <label
                          style={styles.fieldLabel}
                        >
                          Target Date{" "}
                          <span
                            style={styles.required}
                          >
                            *
                          </span>
                        </label>

                        <div
                          style={
                            styles.inputWithIcon
                          }
                        >
                          <Calendar
                            size={16}
                            color="#6f8177"
                          />

                          <input
                            type="date"
                            required
                            value={
                              formTargetDate
                            }
                            onChange={(e) =>
                              setFormTargetDate(
                                e.target.value
                              )
                            }
                            style={
                              styles.iconInput
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          style={styles.fieldLabel}
                        >
                          Status
                        </label>

                        <select
                          value={formStatus}
                          onChange={(e) =>
                            setFormStatus(
                              e.target.value
                            )
                          }
                          style={styles.input}
                        >
                          <option value="NOT_STARTED">
                            NOT STARTED
                          </option>

                          <option value="IN_PROGRESS">
                            IN PROGRESS
                          </option>

                          <option value="COMPLETED">
                            COMPLETED
                          </option>

                          <option value="CANCELLED">
                            CANCELLED
                          </option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Progress */}
                  <section style={styles.formSection}>
                    <div style={styles.formSectionHeader}>
                      <span
                        style={styles.sectionNumber}
                      >
                        04
                      </span>

                      <div>
                        <h4
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Progress Tracking
                        </h4>

                        <p
                          style={
                            styles.formSectionDescription
                          }
                        >
                          Record the current completion
                          percentage.
                        </p>
                      </div>
                    </div>

                    <div style={styles.progressInputHeader}>
                      <label
                        style={styles.fieldLabel}
                      >
                        Progress Percentage
                      </label>

                      <strong
                        style={
                          styles.progressInputValue
                        }
                      >
                        {formProgress}%
                      </strong>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formProgress}
                      onChange={(e) =>
                        setFormProgress(
                          e.target.value
                        )
                      }
                      style={styles.range}
                    />

                    <div style={styles.rangeLabels}>
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formProgress}
                      onChange={(e) =>
                        setFormProgress(
                          e.target.value
                        )
                      }
                      style={{
                        ...styles.input,
                        marginTop: "12px",
                      }}
                    />
                  </section>
                </div>

                {/* Fixed Footer */}
                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      ...styles.saveButton,
                      opacity: submitting ? 0.65 : 1,
                      cursor: submitting
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw
                          size={15}
                          className="hrms-spin"
                        />

                        <span>
                          Saving...
                        </span>
                      </>
                    ) : (
                      <>
                        {editingGoal ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Plus size={15} />
                        )}

                        <span>
                          {editingGoal
                            ? "Update Goal"
                            : "Create Goal"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes hrmsGoalsSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            .hrms-spin {
              animation: hrmsGoalsSpin 1s linear infinite;
            }

            input:focus,
            select:focus,
            textarea:focus {
              outline: none;
              border-color: #28734d !important;
              box-shadow: 0 0 0 3px rgba(40, 115, 77, 0.10);
            }

            button:hover {
              transition:
                background-color 160ms ease,
                border-color 160ms ease,
                box-shadow 160ms ease,
                transform 160ms ease;
            }

            @media (max-width: 900px) {
              .hrms-goals-summary {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
            }

            @media (max-width: 700px) {
              .hrms-goals-hero {
                flex-direction: column !important;
                align-items: flex-start !important;
              }

              .hrms-goals-summary {
                grid-template-columns: 1fr;
              }

              .hrms-goals-two-column {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "0 0 45px",
  },

  hero: {
    marginTop: "18px",
    padding: "25px 27px",

    background:
      "linear-gradient(135deg, #173f2d 0%, #285e44 100%)",

    borderRadius: "18px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "20px",

    boxShadow:
      "0 10px 28px rgba(23, 63, 45, 0.14)",
  },

  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    minWidth: 0,
  },

  heroIcon: {
    width: "54px",
    height: "54px",

    borderRadius: "15px",

    backgroundColor:
      "rgba(255, 255, 255, 0.12)",

    color: "#ffffff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border:
      "1px solid rgba(255, 255, 255, 0.15)",
  },

  eyebrow: {
    color: "#b9d8c5",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.25px",
    marginBottom: "5px",
  },

  heroTitle: {
    color: "#ffffff",
    fontSize: "25px",
    lineHeight: 1.2,
    fontWeight: "800",
    margin: 0,
  },

  heroSubtitle: {
    color: "#d4e4da",
    fontSize: "12px",
    lineHeight: 1.5,
    margin: "7px 0 0",
    maxWidth: "690px",
  },

  createButton: {
    border: "1px solid rgba(255,255,255,0.18)",

    backgroundColor: "#ffffff",

    color: "#17613f",

    borderRadius: "10px",

    padding: "10px 14px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "7px",

    fontSize: "11px",
    fontWeight: "800",

    cursor: "pointer",

    whiteSpace: "nowrap",

    flexShrink: 0,
  },

  summaryGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: "12px",

    marginTop: "14px",
  },

  summaryCard: {
    backgroundColor: "#ffffff",

    border: "1px solid #dfe8e2",

    borderRadius: "13px",

    padding: "14px",

    display: "flex",
    alignItems: "center",
    gap: "11px",

    boxShadow:
      "0 2px 8px rgba(23, 63, 45, 0.04)",
  },

  summaryIcon: {
    width: "39px",
    height: "39px",

    borderRadius: "10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  summaryLabel: {
    display: "block",

    color: "#7a8981",

    fontSize: "9px",
    fontWeight: "650",

    marginBottom: "3px",
  },

  summaryValue: {
    display: "block",

    color: "#20382c",

    fontSize: "18px",
    fontWeight: "800",
  },

  explorer: {
    marginTop: "20px",

    backgroundColor: "#ffffff",

    border: "1px solid #dfe8e2",

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

  refreshButton: {
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

  filterArea: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "12px",

    padding: "15px 20px 18px",

    borderTop: "1px solid #edf1ee",

    backgroundColor: "#fbfcfb",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  filterLabel: {
    color: "#61746a",

    fontSize: "9px",
    fontWeight: "800",

    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  select: {
    width: "100%",

    minHeight: "39px",

    padding: "0 11px",

    border: "1px solid #d6e1da",

    borderRadius: "9px",

    backgroundColor: "#ffffff",

    color: "#30463b",

    fontSize: "11px",
    fontWeight: "600",

    cursor: "pointer",
  },

  stateCard: {
    marginTop: "15px",

    minHeight: "270px",

    backgroundColor: "#ffffff",

    border: "1px solid #dfe8e2",

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

    backgroundColor: "#edf6f0",
    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: "12px",
  },

  stateTitle: {
    color: "#263d32",

    fontSize: "14px",
    fontWeight: "800",

    margin: 0,
  },

  stateText: {
    color: "#7c8982",

    fontSize: "11px",
    lineHeight: 1.5,

    margin: "6px 0 0",
  },

  emptyCreateButton: {
    marginTop: "15px",

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

  goalGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "13px",

    marginTop: "15px",
  },

  goalCard: {
    position: "relative",

    backgroundColor: "#ffffff",

    border: "1px solid",

    borderRadius: "14px",

    padding: "16px",

    display: "flex",
    flexDirection: "column",

    gap: "14px",

    boxShadow:
      "0 2px 8px rgba(23, 63, 45, 0.035)",

    overflow: "hidden",
  },

  goalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",

    gap: "10px",
  },

  employeeBlock: {
    display: "flex",
    alignItems: "center",
    gap: "9px",

    minWidth: 0,
  },

  employeeAvatar: {
    width: "34px",
    height: "34px",

    borderRadius: "10px",

    backgroundColor: "#eaf5ee",

    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "12px",
    fontWeight: "850",

    flexShrink: 0,
  },

  employeeName: {
    display: "block",

    color: "#30483b",

    fontSize: "11px",
    fontWeight: "750",

    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  employeeCode: {
    display: "block",

    color: "#8a9890",

    fontSize: "9px",

    marginTop: "2px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",

    padding: "5px 8px",

    border: "1px solid",

    borderRadius: "999px",

    fontSize: "9px",
    fontWeight: "800",

    whiteSpace: "nowrap",

    flexShrink: 0,
  },

  goalContent: {
    minHeight: "72px",
  },

  goalTitle: {
    color: "#243a2f",

    fontSize: "15px",
    lineHeight: 1.35,

    fontWeight: "800",

    margin: 0,
  },

  goalDescription: {
    color: "#728178",

    fontSize: "10.5px",
    lineHeight: 1.5,

    margin: "6px 0 0",

    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",

    overflow: "hidden",
  },

  progressSection: {
    padding: "12px",

    backgroundColor: "#f8faf9",

    border: "1px solid #e7ede9",

    borderRadius: "10px",
  },

  progressHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "10px",

    marginBottom: "8px",
  },

  progressLabel: {
    display: "block",

    color: "#53685d",

    fontSize: "9px",
    fontWeight: "750",
  },

  progressState: {
    display: "block",

    fontSize: "8px",
    fontWeight: "700",

    marginTop: "2px",
  },

  progressPercentage: {
    color: "#234b37",

    fontSize: "16px",
    fontWeight: "850",
  },

  progressTrack: {
    width: "100%",

    height: "7px",

    borderRadius: "999px",

    backgroundColor: "#dfe8e2",

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    borderRadius: "999px",

    background:
      "linear-gradient(90deg, #245d42, #3d8060)",

    transition: "width 300ms ease",
  },

  goalFooter: {
    paddingTop: "12px",

    borderTop: "1px solid #edf1ee",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "10px",
  },

  targetDate: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  dateIcon: {
    width: "30px",
    height: "30px",

    borderRadius: "8px",

    backgroundColor: "#f1f6f3",
    color: "#547062",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  dateLabel: {
    display: "block",

    color: "#9aa69f",

    fontSize: "8px",
    fontWeight: "700",

    textTransform: "uppercase",
  },

  dateValue: {
    display: "block",

    color: "#4b6055",

    fontSize: "10px",
    fontWeight: "700",

    marginTop: "2px",
  },

  editButton: {
    border: "1px solid #cadbd1",

    backgroundColor: "#ffffff",

    color: "#286247",

    borderRadius: "8px",

    padding: "7px 10px",

    display: "inline-flex",
    alignItems: "center",
    gap: "5px",

    fontSize: "9px",
    fontWeight: "750",

    cursor: "pointer",
  },

  pagination: {
    marginTop: "20px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "12px",
  },

  pageButton: {
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
    minWidth: "90px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "5px",

    color: "#718078",

    fontSize: "10px",
  },

  pageSmallLabel: {
    color: "#a0aaa5",

    fontSize: "8px",
    fontWeight: "800",

    letterSpacing: "0.6px",
  },

  modalOverlay: {
    position: "fixed",

    inset: 0,

    zIndex: 2000,

    backgroundColor:
      "rgba(16, 35, 27, 0.56)",

    backdropFilter: "blur(4px)",

    padding: "20px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    width: "100%",
    maxWidth: "600px",

    maxHeight: "calc(100vh - 40px)",

    backgroundColor: "#ffffff",

    borderRadius: "17px",

    border: "1px solid #dce6df",

    boxShadow:
      "0 25px 65px rgba(17, 46, 32, 0.22)",

    display: "flex",
    flexDirection: "column",

    overflow: "hidden",
  },

  modalHeader: {
    padding: "16px 18px",

    backgroundColor: "#f8fbf9",

    borderBottom: "1px solid #e3ebe5",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    flexShrink: 0,
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",

    minWidth: 0,
  },

  modalIcon: {
    width: "38px",
    height: "38px",

    borderRadius: "10px",

    backgroundColor: "#eaf5ee",
    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  modalEyebrow: {
    color: "#6b8175",

    fontSize: "8px",
    fontWeight: "800",

    letterSpacing: "0.9px",

    marginBottom: "3px",
  },

  modalTitle: {
    margin: 0,

    color: "#20382c",

    fontSize: "15px",
    fontWeight: "800",
  },

  closeButton: {
    width: "32px",
    height: "32px",

    border: "1px solid #d7e1da",

    backgroundColor: "#ffffff",

    color: "#64766d",

    borderRadius: "8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",

    flexShrink: 0,
  },

  modalForm: {
    display: "flex",
    flexDirection: "column",

    minHeight: 0,

    flex: 1,
  },

  modalBody: {
    flex: 1,

    minHeight: 0,

    overflowY: "auto",

    padding: "20px",
  },

  formSection: {
    padding: "16px",

    backgroundColor: "#fbfcfb",

    border: "1px solid #e2eae5",

    borderRadius: "12px",

    marginBottom: "12px",
  },

  formSectionHeader: {
    display: "flex",
    alignItems: "flex-start",

    gap: "9px",

    marginBottom: "15px",
  },

  sectionNumber: {
    width: "27px",
    height: "27px",

    borderRadius: "8px",

    backgroundColor: "#eaf5ee",

    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "8px",
    fontWeight: "850",

    flexShrink: 0,
  },

  formSectionTitle: {
    margin: 0,

    color: "#294337",

    fontSize: "12px",
    fontWeight: "800",
  },

  formSectionDescription: {
    margin: "3px 0 0",

    color: "#839088",

    fontSize: "9px",
    lineHeight: 1.4,
  },

  fieldLabel: {
    display: "block",

    color: "#53675c",

    fontSize: "9px",
    fontWeight: "800",

    marginBottom: "6px",
  },

  required: {
    color: "#a34b42",
  },

  input: {
    width: "100%",

    minHeight: "39px",

    boxSizing: "border-box",

    padding: "9px 11px",

    border: "1px solid #d5e0d9",

    borderRadius: "8px",

    backgroundColor: "#ffffff",

    color: "#30463b",

    fontSize: "11px",
    fontWeight: "550",
  },

  disabledInput: {
    backgroundColor: "#f1f4f2",
    color: "#839088",
    cursor: "not-allowed",
  },

  helperText: {
    color: "#8a9890",

    fontSize: "8px",

    margin: "5px 0 0",
  },

  twoColumn: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "12px",
  },

  inputWithIcon: {
    minHeight: "39px",

    boxSizing: "border-box",

    padding: "0 10px",

    border: "1px solid #d5e0d9",

    borderRadius: "8px",

    backgroundColor: "#ffffff",

    display: "flex",
    alignItems: "center",

    gap: "7px",
  },

  iconInput: {
    width: "100%",

    minWidth: 0,

    border: "none",

    outline: "none",

    backgroundColor: "transparent",

    color: "#30463b",

    fontSize: "11px",
  },

  progressInputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressInputValue: {
    color: "#17613f",

    fontSize: "14px",
    fontWeight: "850",
  },

  range: {
    width: "100%",

    accentColor: "#28734d",

    cursor: "pointer",

    margin: "4px 0",
  },

  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",

    color: "#9aa69f",

    fontSize: "8px",
    fontWeight: "650",
  },

  modalFooter: {
    padding: "13px 18px",

    backgroundColor: "#f8fbf9",

    borderTop: "1px solid #e3ebe5",

    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",

    gap: "8px",

    flexShrink: 0,
  },

  cancelButton: {
    border: "1px solid #d3ded7",

    backgroundColor: "#ffffff",

    color: "#5e7067",

    borderRadius: "8px",

    padding: "9px 13px",

    fontSize: "10px",
    fontWeight: "700",

    cursor: "pointer",
  },

  saveButton: {
    border: "1px solid #245d42",

    backgroundColor: "#245d42",

    color: "#ffffff",

    borderRadius: "8px",

    padding: "9px 13px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "6px",

    fontSize: "10px",
    fontWeight: "750",
  },
};

export default HRGoals;