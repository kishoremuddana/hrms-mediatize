import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle2,
  Star,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  CalendarDays,
  ClipboardCheck,
  FileText,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  CircleCheck,
  Clock3,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  getAllPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  completePerformanceReview,
} from "../services/performanceApi";

import { getEmployees } from "../../employee_service/services/employeeApi";
import { showSuccess, showError } from "../../shared/utils/toast";

const DEFAULT_CATEGORIES = [
  "Technical Skills",
  "Work Quality",
  "Task Completion",
  "Problem Solving",
  "Communication",
  "Teamwork",
  "Project Contribution",
  "Initiative",
];

function HRPerformanceReviews() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formFeedback, setFormFeedback] = useState("");

  const [categoryRatings, setCategoryRatings] = useState(
    DEFAULT_CATEGORIES.map((cat) => ({
      category: cat,
      rating: 3,
      comments: "",
    }))
  );

  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------
  // LOAD EMPLOYEES
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await getEmployees({ limit: 100 });
        setEmployees(res.data?.items || []);
      } catch (err) {
        console.error("Failed to load employees list", err);
      }
    }

    loadEmployees();
  }, []);

  // ---------------------------------------------------------
  // FETCH PERFORMANCE REVIEWS
  // ---------------------------------------------------------
  const fetchReviews = useCallback(async () => {
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

      const res = await getAllPerformanceReviews(params);

      setReviews(res.data?.items || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch performance reviews", err);
      showError("Unable to load performance reviews.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedEmployeeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ---------------------------------------------------------
  // OPEN CREATE MODAL
  // ---------------------------------------------------------
  const openCreateModal = () => {
    setEditingReview(null);

    setFormEmployeeId(employees[0]?.id || "");
    setFormStartDate("");
    setFormEndDate("");
    setFormFeedback("");

    setCategoryRatings(
      DEFAULT_CATEGORIES.map((cat) => ({
        category: cat,
        rating: 3,
        comments: "",
      }))
    );

    setShowCreateModal(true);
  };

  // ---------------------------------------------------------
  // OPEN EDIT MODAL
  // ---------------------------------------------------------
  const openEditModal = (review) => {
    setEditingReview(review);

    setFormEmployeeId(review.employee_id);
    setFormStartDate(review.review_start_date);
    setFormEndDate(review.review_end_date);
    setFormFeedback(review.overall_feedback || "");

    const existingMap = new Map(
      review.ratings.map((r) => [r.category, r])
    );

    const mapped = DEFAULT_CATEGORIES.map((cat) => {
      const found = existingMap.get(cat);

      return {
        category: cat,
        rating: found ? found.rating : 3,
        comments: found ? found.comments || "" : "",
      };
    });

    setCategoryRatings(mapped);
    setShowCreateModal(true);
  };

  // ---------------------------------------------------------
  // RATING CHANGE
  // ---------------------------------------------------------
  const handleRatingChange = (idx, rating) => {
    const next = [...categoryRatings];
    next[idx].rating = rating;
    setCategoryRatings(next);
  };

  // ---------------------------------------------------------
  // COMMENT CHANGE
  // ---------------------------------------------------------
  const handleCommentChange = (idx, comments) => {
    const next = [...categoryRatings];
    next[idx].comments = comments;
    setCategoryRatings(next);
  };

  // ---------------------------------------------------------
  // SAVE REVIEW
  // ---------------------------------------------------------
  const handleSaveReview = async (shouldComplete = false) => {
    if (!formEmployeeId) {
      showError("Please select an employee.");
      return;
    }

    if (!formStartDate || !formEndDate) {
      showError("Please select review start and end dates.");
      return;
    }

    if (new Date(formStartDate) > new Date(formEndDate)) {
      showError("Review start date must be on or before end date.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employee_id: Number(formEmployeeId),
        review_start_date: formStartDate,
        review_end_date: formEndDate,
        overall_feedback: formFeedback,
        ratings: categoryRatings,
      };

      let savedReview;

      if (editingReview) {
        const res = await updatePerformanceReview(editingReview.id, {
          review_start_date: formStartDate,
          review_end_date: formEndDate,
          overall_feedback: formFeedback,
          ratings: categoryRatings,
        });

        savedReview = res.data;

        showSuccess("Draft performance review updated.");
      } else {
        const res = await createPerformanceReview(payload);

        savedReview = res.data;

        showSuccess("Draft performance review created.");
      }

      if (shouldComplete && savedReview) {
        await completePerformanceReview(savedReview.id);

        showSuccess("Performance evaluation completed successfully!");
      }

      setShowCreateModal(false);

      fetchReviews();
    } catch (err) {
      console.error("Failed to save performance review", err);

      showError(
        err.response?.data?.detail ||
          "Unable to save performance review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // DIRECT COMPLETE ACTION
  // ---------------------------------------------------------
  const handleCompleteReviewDirect = async (reviewId) => {
    try {
      await completePerformanceReview(reviewId);

      showSuccess("Performance review completed successfully!");

      fetchReviews();
    } catch (err) {
      console.error("Failed to complete review", err);

      showError(
        err.response?.data?.detail ||
          "Unable to complete performance review."
      );
    }
  };

  // ---------------------------------------------------------
  // STATUS
  // ---------------------------------------------------------
  const getStatusConfig = (status) => {
    if (status === "COMPLETED") {
      return {
        label: "Completed",
        background: "#e8f5ee",
        color: "#17663d",
        border: "#b9dfc8",
        icon: CircleCheck,
      };
    }

    return {
      label: "Draft",
      background: "#fff7df",
      color: "#8a6116",
      border: "#ead59a",
      icon: Clock3,
    };
  };

  // ---------------------------------------------------------
  // CALCULATE CURRENT PAGE SUMMARY
  // ---------------------------------------------------------
  const completedCount = reviews.filter(
    (review) => review.status === "COMPLETED"
  ).length;

  const draftCount = reviews.filter(
    (review) => review.status === "DRAFT"
  ).length;

  const ratedReviews = reviews.filter(
    (review) =>
      typeof review.overall_rating === "number"
  );

  const averageRating =
    ratedReviews.length > 0
      ? (
          ratedReviews.reduce(
            (sum, review) => sum + review.overall_rating,
            0
          ) / ratedReviews.length
        ).toFixed(1)
      : "—";

  return (
    <AppLayout>
      <div style={styles.page}>
        <BackToDashboard />

        {/* =====================================================
            HERO
        ====================================================== */}
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.eyebrow}>
              <Award size={15} />
              PERFORMANCE MANAGEMENT
            </div>

            <h1 style={styles.heroTitle}>
              Employee Performance Reviews
            </h1>

            <p style={styles.heroDescription}>
              Create, evaluate, manage and complete structured
              employee performance reviews from one workspace.
            </p>

            <div style={styles.heroMeta}>
              <div style={styles.heroMetaItem}>
                <ClipboardCheck size={16} />
                <span>8 evaluation categories</span>
              </div>

              <div style={styles.heroMetaItem}>
                <Star size={16} />
                <span>1–5 rating scale</span>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroIconBox}>
              <BarChart3 size={34} />
            </div>

            <button
              onClick={openCreateModal}
              style={styles.primaryButton}
            >
              <Plus size={18} />
              Create Performance Review
            </button>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}
        <section style={styles.summaryGrid}>
          <SummaryCard
            icon={<FileText size={20} />}
            label="Reviews on Page"
            value={reviews.length}
            description="Current results"
          />

          <SummaryCard
            icon={<CircleCheck size={20} />}
            label="Completed"
            value={completedCount}
            description="Completed evaluations"
            tone="green"
          />

          <SummaryCard
            icon={<Clock3 size={20} />}
            label="Draft Reviews"
            value={draftCount}
            description="Awaiting completion"
            tone="amber"
          />

          <SummaryCard
            icon={<Star size={20} />}
            label="Average Rating"
            value={averageRating}
            description="Rated reviews on page"
            tone="green"
          />
        </section>

        {/* =====================================================
            FILTER / EXPLORER
        ====================================================== */}
        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                REVIEW DIRECTORY
              </div>

              <h2 style={styles.sectionTitle}>
                Performance Review Explorer
              </h2>

              <p style={styles.sectionDescription}>
                Filter performance reviews by status or employee.
              </p>
            </div>

            <button
              onClick={fetchReviews}
              style={styles.refreshButton}
              title="Refresh reviews"
            >
              <RefreshCw
                size={17}
                style={
                  loading
                    ? { animation: "spin 1s linear infinite" }
                    : undefined
                }
              />
              Refresh
            </button>
          </div>

          <div style={styles.filterGrid}>
            <div style={styles.field}>
              <label style={styles.label}>
                <Filter size={14} />
                Review Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                style={styles.input}
              >
                <option value="">All Review Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <Users size={14} />
                Employee
              </label>

              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setPage(1);
                }}
                style={styles.input}
              >
                <option value="">All Employees</option>

                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} (
                    {emp.employee_code})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterInfo}>
              <Search size={18} />

              <div>
                <strong style={styles.filterInfoTitle}>
                  Review workspace
                </strong>

                <span style={styles.filterInfoText}>
                  Manage draft and completed evaluations.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            REVIEW DIRECTORY
        ====================================================== */}
        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                EVALUATION RECORDS
              </div>

              <h2 style={styles.sectionTitle}>
                Review Directory
              </h2>
            </div>

            <div style={styles.recordCount}>
              {reviews.length} records
            </div>
          </div>

          {loading ? (
            <div style={styles.stateBox}>
              <RefreshCw
                size={28}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "#17663d",
                }}
              />

              <strong>Loading performance reviews...</strong>

              <span>
                Please wait while the review records are loaded.
              </span>
            </div>
          ) : reviews.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FileText size={26} />
              </div>

              <h3 style={styles.emptyTitle}>
                No performance reviews found
              </h3>

              <p style={styles.emptyText}>
                No reviews match the selected filters.
              </p>

              <button
                onClick={openCreateModal}
                style={styles.secondaryGreenButton}
              >
                <Plus size={16} />
                Create First Review
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee</th>
                      <th style={styles.th}>Review Period</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Overall Rating</th>
                      <th style={styles.th}>Completed Date</th>
                      <th
                        style={{
                          ...styles.th,
                          textAlign: "right",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {reviews.map((rev) => {
                      const statusConfig = getStatusConfig(
                        rev.status
                      );

                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr
                          key={rev.id}
                          style={styles.tableRow}
                        >
                          <td style={styles.td}>
                            <div style={styles.employeeCell}>
                              <div style={styles.employeeAvatar}>
                                {rev.employee_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "E"}
                              </div>

                              <div>
                                <strong
                                  style={styles.employeeName}
                                >
                                  {rev.employee_name}
                                </strong>

                                <span
                                  style={styles.employeeCode}
                                >
                                  {rev.employee_code}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={styles.td}>
                            <div style={styles.periodCell}>
                              <CalendarDays size={15} />

                              <span>
                                {rev.review_start_date}
                              </span>

                              <span style={styles.periodSeparator}>
                                →
                              </span>

                              <span>
                                {rev.review_end_date}
                              </span>
                            </div>
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                background:
                                  statusConfig.background,
                                color: statusConfig.color,
                                borderColor:
                                  statusConfig.border,
                              }}
                            >
                              <StatusIcon size={13} />
                              {statusConfig.label}
                            </span>
                          </td>

                          <td style={styles.td}>
                            {rev.overall_rating ? (
                              <div style={styles.ratingDisplay}>
                                <Star
                                  size={16}
                                  fill="currentColor"
                                />

                                <strong>
                                  {rev.overall_rating.toFixed(1)}
                                </strong>

                                <span>/ 5.0</span>
                              </div>
                            ) : (
                              <span style={styles.draftRating}>
                                Draft
                              </span>
                            )}
                          </td>

                          <td style={styles.td}>
                            <span style={styles.dateText}>
                              {rev.completed_at
                                ? new Date(
                                    rev.completed_at
                                  ).toLocaleDateString()
                                : "—"}
                            </span>
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              textAlign: "right",
                            }}
                          >
                            <div style={styles.actionGroup}>
                              <button
                                onClick={() =>
                                  setViewingReview(rev)
                                }
                                style={styles.viewButton}
                              >
                                <Eye size={14} />
                                View
                              </button>

                              {rev.status === "DRAFT" && (
                                <>
                                  <button
                                    onClick={() =>
                                      openEditModal(rev)
                                    }
                                    style={styles.editButton}
                                  >
                                    <Edit size={14} />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleCompleteReviewDirect(
                                        rev.id
                                      )
                                    }
                                    style={styles.completeButton}
                                  >
                                    <CheckCircle2 size={14} />
                                    Complete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div style={styles.mobileCards}>
                {reviews.map((rev) => {
                  const statusConfig = getStatusConfig(
                    rev.status
                  );

                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={rev.id}
                      style={styles.mobileReviewCard}
                    >
                      <div style={styles.mobileCardTop}>
                        <div style={styles.employeeCell}>
                          <div style={styles.employeeAvatar}>
                            {rev.employee_name
                              ?.charAt(0)
                              ?.toUpperCase() || "E"}
                          </div>

                          <div>
                            <strong style={styles.employeeName}>
                              {rev.employee_name}
                            </strong>

                            <span style={styles.employeeCode}>
                              {rev.employee_code}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            background:
                              statusConfig.background,
                            color: statusConfig.color,
                            borderColor:
                              statusConfig.border,
                          }}
                        >
                          <StatusIcon size={13} />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div style={styles.mobileInfoGrid}>
                        <div>
                          <span style={styles.mobileLabel}>
                            Review Period
                          </span>

                          <strong style={styles.mobileValue}>
                            {rev.review_start_date} →{" "}
                            {rev.review_end_date}
                          </strong>
                        </div>

                        <div>
                          <span style={styles.mobileLabel}>
                            Rating
                          </span>

                          <strong style={styles.mobileValue}>
                            {rev.overall_rating
                              ? `${rev.overall_rating.toFixed(
                                  1
                                )} / 5.0`
                              : "Draft"}
                          </strong>
                        </div>
                      </div>

                      <div style={styles.mobileActions}>
                        <button
                          onClick={() =>
                            setViewingReview(rev)
                          }
                          style={styles.viewButton}
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {rev.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() =>
                                openEditModal(rev)
                              }
                              style={styles.editButton}
                            >
                              <Edit size={14} />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleCompleteReviewDirect(
                                  rev.id
                                )
                              }
                              style={styles.completeButton}
                            >
                              <CheckCircle2 size={14} />
                              Complete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <span style={styles.paginationText}>
                Page {page} of {totalPages}
              </span>

              <div style={styles.paginationButtons}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    ...styles.paginationButton,
                    opacity: page <= 1 ? 0.45 : 1,
                  }}
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    ...styles.paginationButton,
                    opacity:
                      page >= totalPages ? 0.45 : 1,
                  }}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================
            INFORMATION STRIP
        ====================================================== */}
        <section style={styles.infoStrip}>
          <div style={styles.infoIcon}>
            <ShieldCheck size={20} />
          </div>

          <div>
            <strong style={styles.infoTitle}>
              Structured performance evaluation
            </strong>

            <p style={styles.infoText}>
              Each review uses eight standard evaluation
              categories with a 1–5 rating scale, helping HR
              maintain consistent performance records.
            </p>
          </div>
        </section>

        {/* =====================================================
            CREATE / EDIT MODAL
        ====================================================== */}
        {showCreateModal && (
          <div style={styles.overlay}>
            <div style={styles.formModal}>
              {/* FIXED HEADER */}
              <div style={styles.modalHeader}>
                <div>
                  <div style={styles.modalEyebrow}>
                    PERFORMANCE EVALUATION
                  </div>

                  <h3 style={styles.modalTitle}>
                    {editingReview
                      ? "Edit Draft Performance Review"
                      : "Create Performance Review"}
                  </h3>

                  <p style={styles.modalSubtitle}>
                    Configure the review period and evaluate
                    performance categories.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  style={styles.closeButton}
                >
                  <X size={19} />
                </button>
              </div>

              {/* SCROLLABLE BODY */}
              <div style={styles.modalBody}>
                {/* REVIEW DETAILS */}
                <div style={styles.formSection}>
                  <div style={styles.formSectionHeader}>
                    <div style={styles.formNumber}>01</div>

                    <div>
                      <h4 style={styles.formSectionTitle}>
                        Review Details
                      </h4>

                      <p style={styles.formSectionDescription}>
                        Select the employee and define the
                        evaluation period.
                      </p>
                    </div>
                  </div>

                  <div style={styles.formGridThree}>
                    <div style={styles.field}>
                      <label style={styles.label}>
                        Employee *
                      </label>

                      <select
                        disabled={!!editingReview}
                        value={formEmployeeId}
                        onChange={(e) =>
                          setFormEmployeeId(e.target.value)
                        }
                        style={{
                          ...styles.input,
                          opacity: editingReview ? 0.65 : 1,
                        }}
                      >
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

                    <div style={styles.field}>
                      <label style={styles.label}>
                        <CalendarDays size={14} />
                        Start Date *
                      </label>

                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) =>
                          setFormStartDate(e.target.value)
                        }
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>
                        <CalendarDays size={14} />
                        End Date *
                      </label>

                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) =>
                          setFormEndDate(e.target.value)
                        }
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORIES */}
                <div style={styles.formSection}>
                  <div style={styles.formSectionHeader}>
                    <div style={styles.formNumber}>02</div>

                    <div>
                      <h4 style={styles.formSectionTitle}>
                        Evaluation Categories
                      </h4>

                      <p style={styles.formSectionDescription}>
                        Rate each performance area from 1 to 5.
                      </p>
                    </div>
                  </div>

                  <div style={styles.ratingScale}>
                    <div>
                      <strong>Rating scale</strong>
                      <span>
                        1 = Needs improvement · 5 = Excellent
                      </span>
                    </div>

                    <Star size={20} />
                  </div>

                  <div style={styles.ratingList}>
                    {categoryRatings.map((item, idx) => (
                      <div
                        key={item.category}
                        style={styles.ratingCard}
                      >
                        <div style={styles.ratingCategory}>
                          <div style={styles.categoryIcon}>
                            <CheckCircle2 size={16} />
                          </div>

                          <div>
                            <strong>
                              {item.category}
                            </strong>

                            <span>
                              Performance assessment
                            </span>
                          </div>
                        </div>

                        <div style={styles.scoreButtons}>
                          {[1, 2, 3, 4, 5].map(
                            (score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() =>
                                  handleRatingChange(
                                    idx,
                                    score
                                  )
                                }
                                style={{
                                  ...styles.scoreButton,
                                  ...(item.rating === score
                                    ? styles.scoreButtonActive
                                    : {}),
                                }}
                              >
                                {score}
                              </button>
                            )
                          )}
                        </div>

                        <div style={styles.commentWrapper}>
                          <MessageSquare
                            size={14}
                          />

                          <input
                            type="text"
                            placeholder="Optional comments"
                            value={item.comments}
                            onChange={(e) =>
                              handleCommentChange(
                                idx,
                                e.target.value
                              )
                            }
                            style={styles.commentInput}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FEEDBACK */}
                <div style={styles.formSection}>
                  <div style={styles.formSectionHeader}>
                    <div style={styles.formNumber}>03</div>

                    <div>
                      <h4 style={styles.formSectionTitle}>
                        Overall HR Feedback
                      </h4>

                      <p style={styles.formSectionDescription}>
                        Add a summary of the employee's overall
                        performance.
                      </p>
                    </div>
                  </div>

                  <textarea
                    rows={5}
                    value={formFeedback}
                    onChange={(e) =>
                      setFormFeedback(e.target.value)
                    }
                    placeholder="Enter comprehensive evaluation summary, achievements, improvement areas and recommendations..."
                    style={styles.textarea}
                  />
                </div>
              </div>

              {/* FIXED FOOTER */}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveReview(false)}
                  style={{
                    ...styles.draftButton,
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  <FileText size={16} />
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveReview(true)}
                  style={{
                    ...styles.primaryButton,
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  <CheckCircle2 size={16} />

                  {submitting
                    ? "Saving..."
                    : "Save & Complete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            VIEW REVIEW MODAL
        ====================================================== */}
        {viewingReview && (
          <div style={styles.overlay}>
            <div style={styles.viewModal}>
              {/* HEADER */}
              <div style={styles.modalHeader}>
                <div style={styles.viewEmployeeHeader}>
                  <div style={styles.largeAvatar}>
                    {viewingReview.employee_name
                      ?.charAt(0)
                      ?.toUpperCase() || "E"}
                  </div>

                  <div>
                    <div style={styles.modalEyebrow}>
                      PERFORMANCE REVIEW
                    </div>

                    <h3 style={styles.modalTitle}>
                      {viewingReview.employee_name} (
                      {viewingReview.employee_code})
                    </h3>

                    <p style={styles.modalSubtitle}>
                      Period:{" "}
                      {viewingReview.review_start_date}{" "}
                      → {viewingReview.review_end_date}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingReview(null)}
                  style={styles.closeButton}
                >
                  <X size={19} />
                </button>
              </div>

              {/* BODY */}
              <div style={styles.modalBody}>
                {/* OVERALL RESULT */}
                <div style={styles.overallResult}>
                  <div>
                    <span style={styles.overallLabel}>
                      Overall Rating
                    </span>

                    <div style={styles.overallRating}>
                      <Star
                        size={24}
                        fill="currentColor"
                      />

                      {viewingReview.overall_rating
                        ? `${viewingReview.overall_rating.toFixed(
                            1
                          )} / 5.0`
                        : "Draft (Pending)"}
                    </div>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(() => {
                        const config =
                          getStatusConfig(
                            viewingReview.status
                          );

                        return {
                          background:
                            config.background,
                          color: config.color,
                          borderColor:
                            config.border,
                        };
                      })(),
                    }}
                  >
                    {viewingReview.status}
                  </span>
                </div>

                {/* RATINGS */}
                <div style={styles.viewSection}>
                  <div style={styles.viewSectionTitle}>
                    <ClipboardCheck size={18} />
                    Category Ratings
                  </div>

                  <div style={styles.viewRatingGrid}>
                    {viewingReview.ratings.map((r) => (
                      <div
                        key={r.id}
                        style={styles.viewRatingCard}
                      >
                        <div
                          style={
                            styles.viewRatingTop
                          }
                        >
                          <strong>
                            {r.category}
                          </strong>

                          <span
                            style={
                              styles.ratingValue
                            }
                          >
                            <Star
                              size={13}
                              fill="currentColor"
                            />
                            {r.rating} / 5
                          </span>
                        </div>

                        {r.comments && (
                          <p
                            style={
                              styles.ratingComment
                            }
                          >
                            "{r.comments}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* FEEDBACK */}
                {viewingReview.overall_feedback && (
                  <div style={styles.viewSection}>
                    <div style={styles.viewSectionTitle}>
                      <MessageSquare size={18} />
                      HR Feedback
                    </div>

                    <div style={styles.feedbackBox}>
                      {viewingReview.overall_feedback}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div style={styles.modalFooter}>
                <button
                  onClick={() => setViewingReview(null)}
                  style={styles.cancelButton}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

          @media (max-width: 900px) {
            .performance-table-wrapper {
              display: none !important;
            }

            .performance-mobile-cards {
              display: flex !important;
            }
          }

          @media (min-width: 901px) {
            .performance-table-wrapper {
              display: block;
            }

            .performance-mobile-cards {
              display: none !important;
            }
          }

          @media (max-width: 760px) {
            .performance-hero {
              flex-direction: column !important;
            }

            .performance-hero-right {
              width: 100% !important;
              align-items: stretch !important;
            }

            .performance-filter-grid {
              grid-template-columns: 1fr !important;
            }

            .performance-form-grid {
              grid-template-columns: 1fr !important;
            }

            .performance-rating-card {
              grid-template-columns: 1fr !important;
            }

            .performance-modal {
              max-height: 95vh !important;
            }

            .performance-modal-footer {
              flex-wrap: wrap !important;
            }

            .performance-modal-footer button {
              flex: 1 1 auto !important;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({
  icon,
  label,
  value,
  description,
  tone = "default",
}) {
  const tones = {
    default: {
      iconBackground: "#edf7f1",
      iconColor: "#17663d",
    },

    green: {
      iconBackground: "#e8f5ee",
      iconColor: "#17663d",
    },

    amber: {
      iconBackground: "#fff7df",
      iconColor: "#8a6116",
    },
  };

  const currentTone = tones[tone] || tones.default;

  return (
    <div style={styles.summaryCard}>
      <div
        style={{
          ...styles.summaryIcon,
          background: currentTone.iconBackground,
          color: currentTone.iconColor,
        }}
      >
        {icon}
      </div>

      <div style={styles.summaryContent}>
        <span style={styles.summaryLabel}>
          {label}
        </span>

        <strong style={styles.summaryValue}>
          {value}
        </strong>

        <span style={styles.summaryDescription}>
          {description}
        </span>
      </div>
    </div>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = {
  page: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px",
    color: "#17231c",
  },

  hero: {
    marginTop: "18px",
    background:
      "linear-gradient(135deg, #123f29 0%, #17663d 58%, #248653 100%)",
    borderRadius: "22px",
    padding: "32px",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    boxShadow: "0 14px 34px rgba(18, 63, 41, 0.16)",
  },

  heroLeft: {
    maxWidth: "760px",
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    opacity: 0.78,
    marginBottom: "12px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(26px, 4vw, 38px)",
    lineHeight: 1.12,
    fontWeight: 800,
    letterSpacing: "-0.7px",
  },

  heroDescription: {
    margin: "13px 0 0",
    fontSize: "14px",
    lineHeight: 1.7,
    opacity: 0.86,
    maxWidth: "680px",
  },

  heroMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    marginTop: "22px",
  },

  heroMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    opacity: 0.9,
  },

  heroRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "22px",
    minWidth: "220px",
  },

  heroIconBox: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    border: "none",
    background: "#ffffff",
    color: "#17663d",
    borderRadius: "10px",
    padding: "11px 15px",
    fontWeight: 800,
    fontSize: "13px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,0.12)",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginTop: "18px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e2e9e4",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    boxShadow: "0 4px 16px rgba(25, 55, 38, 0.045)",
  },

  summaryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  summaryLabel: {
    fontSize: "11px",
    color: "#6a756e",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  },

  summaryValue: {
    fontSize: "25px",
    lineHeight: 1.2,
    color: "#17231c",
  },

  summaryDescription: {
    fontSize: "11px",
    color: "#89938d",
  },

  sectionCard: {
    marginTop: "18px",
    background: "#ffffff",
    border: "1px solid #e2e9e4",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(25, 55, 38, 0.045)",
  },

  sectionHeader: {
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom: "1px solid #edf1ee",
  },

  sectionEyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.3px",
    color: "#17663d",
    marginBottom: "5px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#17231c",
  },

  sectionDescription: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#7a847e",
  },

  refreshButton: {
    border: "1px solid #d7e2db",
    background: "#ffffff",
    color: "#315141",
    borderRadius: "9px",
    padding: "9px 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },

  filterGrid: {
    padding: "20px 22px",
    display: "grid",
    gridTemplateColumns:
      "minmax(190px, 1fr) minmax(250px, 1.2fr) minmax(240px, 1fr)",
    gap: "14px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#435049",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "42px",
    border: "1px solid #d8e2dc",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#24342a",
    padding: "0 12px",
    fontSize: "13px",
    outline: "none",
  },

  filterInfo: {
    background: "#f3f8f5",
    border: "1px solid #dbeae1",
    borderRadius: "11px",
    padding: "13px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    color: "#17663d",
  },

  filterInfoTitle: {
    display: "block",
    fontSize: "12px",
    color: "#254535",
  },

  filterInfoText: {
    display: "block",
    marginTop: "2px",
    fontSize: "11px",
    color: "#718078",
  },

  recordCount: {
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#edf7f1",
    color: "#17663d",
    fontSize: "11px",
    fontWeight: 800,
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
  },

  th: {
    textAlign: "left",
    padding: "12px 16px",
    background: "#f7f9f7",
    color: "#68746d",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    borderBottom: "1px solid #e8eee9",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 16px",
    borderBottom: "1px solid #edf1ee",
    verticalAlign: "middle",
  },

  tableRow: {
    transition: "background 0.2s ease",
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  employeeAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#e8f5ee",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
    flexShrink: 0,
  },

  employeeName: {
    display: "block",
    fontSize: "13px",
    color: "#1e2b23",
  },

  employeeCode: {
    display: "block",
    marginTop: "2px",
    fontSize: "10px",
    color: "#89938d",
    fontWeight: 600,
  },

  periodCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#59665e",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },

  periodSeparator: {
    color: "#9ba49e",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 8px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "10px",
    fontWeight: 800,
  },

  ratingDisplay: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: "#8a6116",
    fontSize: "12px",
  },

  draftRating: {
    color: "#929b95",
    fontSize: "11px",
    fontStyle: "italic",
  },

  dateText: {
    color: "#68746d",
    fontSize: "11px",
  },

  actionGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },

  viewButton: {
    border: "1px solid #d7e2db",
    background: "#f5f9f6",
    color: "#17663d",
    borderRadius: "7px",
    padding: "6px 8px",
    fontSize: "10px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },

  editButton: {
    border: "1px solid #dce1dd",
    background: "#f7f8f7",
    color: "#4c5a52",
    borderRadius: "7px",
    padding: "6px 8px",
    fontSize: "10px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },

  completeButton: {
    border: "none",
    background: "#17663d",
    color: "#ffffff",
    borderRadius: "7px",
    padding: "7px 9px",
    fontSize: "10px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },

  stateBox: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    color: "#536158",
    fontSize: "13px",
  },

  emptyState: {
    minHeight: "270px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "15px",
    background: "#edf7f1",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    margin: "13px 0 4px",
    fontSize: "16px",
    color: "#26362c",
  },

  emptyText: {
    margin: "0 0 15px",
    color: "#7b857f",
    fontSize: "12px",
  },

  secondaryGreenButton: {
    border: "1px solid #bcd9c8",
    background: "#edf7f1",
    color: "#17663d",
    borderRadius: "8px",
    padding: "9px 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  mobileCards: {
    display: "none",
    flexDirection: "column",
    gap: "10px",
    padding: "15px",
  },

  mobileReviewCard: {
    border: "1px solid #e2e9e4",
    borderRadius: "13px",
    padding: "14px",
    background: "#ffffff",
  },

  mobileCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },

  mobileInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "15px",
    paddingTop: "13px",
    borderTop: "1px solid #edf1ee",
  },

  mobileLabel: {
    display: "block",
    color: "#89938d",
    fontSize: "9px",
    textTransform: "uppercase",
    fontWeight: 800,
    marginBottom: "4px",
  },

  mobileValue: {
    fontSize: "11px",
    color: "#35463b",
  },

  mobileActions: {
    display: "flex",
    gap: "6px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #edf1ee",
  },

  pagination: {
    padding: "14px 18px",
    borderTop: "1px solid #edf1ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paginationText: {
    color: "#7a857e",
    fontSize: "11px",
    fontWeight: 700,
  },

  paginationButtons: {
    display: "flex",
    gap: "6px",
  },

  paginationButton: {
    width: "34px",
    height: "34px",
    border: "1px solid #d8e2dc",
    background: "#ffffff",
    color: "#3f5147",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  infoStrip: {
    marginTop: "18px",
    background: "#f3f8f5",
    border: "1px solid #dbeae1",
    borderRadius: "15px",
    padding: "16px 18px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#dceee3",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoTitle: {
    display: "block",
    fontSize: "12px",
    color: "#254535",
  },

  infoText: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#68776e",
    lineHeight: 1.5,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 30, 21, 0.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },

  formModal: {
    width: "100%",
    maxWidth: "980px",
    maxHeight: "92vh",
    background: "#ffffff",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 25px 70px rgba(10, 30, 18, 0.22)",
  },

  viewModal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "92vh",
    background: "#ffffff",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 25px 70px rgba(10, 30, 18, 0.22)",
  },

  modalHeader: {
    flexShrink: 0,
    padding: "20px 22px",
    borderBottom: "1px solid #e7ede9",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    background: "#ffffff",
  },

  modalEyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.2px",
    color: "#17663d",
    marginBottom: "5px",
  },

  modalTitle: {
    margin: 0,
    color: "#1b2b21",
    fontSize: "19px",
    fontWeight: 800,
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#7b857f",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  closeButton: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid #dfe6e1",
    background: "#ffffff",
    color: "#627068",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  modalBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "22px",
    background: "#fbfcfb",
  },

  modalFooter: {
    flexShrink: 0,
    padding: "14px 20px",
    borderTop: "1px solid #e7ede9",
    background: "#ffffff",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
  },

  formSection: {
    background: "#ffffff",
    border: "1px solid #e1e9e4",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "15px",
  },

  formSectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    marginBottom: "17px",
  },

  formNumber: {
    width: "31px",
    height: "31px",
    borderRadius: "9px",
    background: "#e8f5ee",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 900,
    flexShrink: 0,
  },

  formSectionTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: "#26362c",
  },

  formSectionDescription: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#818c85",
  },

  formGridThree: {
    display: "grid",
    gridTemplateColumns:
      "1.4fr 1fr 1fr",
    gap: "12px",
  },

  ratingScale: {
    background: "#f3f8f5",
    border: "1px solid #dcebe2",
    borderRadius: "10px",
    padding: "11px 13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#17663d",
    marginBottom: "12px",
  },

  ratingScale: {
    background: "#f3f8f5",
    border: "1px solid #dcebe2",
    borderRadius: "10px",
    padding: "11px 13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#17663d",
    marginBottom: "12px",
  },

  ratingList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  ratingCard: {
    display: "grid",
    gridTemplateColumns:
      "1.25fr auto 1fr",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    border: "1px solid #e5ebe7",
    borderRadius: "11px",
    background: "#ffffff",
  },

  ratingCategory: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  categoryIcon: {
    width: "29px",
    height: "29px",
    borderRadius: "8px",
    background: "#edf7f1",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  scoreButtons: {
    display: "flex",
    gap: "4px",
  },

  scoreButton: {
    width: "31px",
    height: "31px",
    border: "1px solid #d4dfd8",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#526057",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  scoreButtonActive: {
    background: "#17663d",
    color: "#ffffff",
    borderColor: "#17663d",
    boxShadow: "0 3px 8px rgba(23,102,61,0.18)",
  },

  commentWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "1px solid #dce4df",
    borderRadius: "8px",
    padding: "0 9px",
    color: "#89948d",
  },

  commentInput: {
    width: "100%",
    height: "34px",
    border: "none",
    outline: "none",
    fontSize: "10px",
    color: "#35463b",
    background: "transparent",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7e2db",
    borderRadius: "10px",
    padding: "12px",
    resize: "vertical",
    minHeight: "120px",
    fontSize: "12px",
    lineHeight: 1.6,
    outline: "none",
    color: "#2b3b31",
    background: "#ffffff",
  },

  cancelButton: {
    border: "1px solid #d7e0da",
    background: "#ffffff",
    color: "#5d6a62",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },

  draftButton: {
    border: "1px solid #cfdad3",
    background: "#f5f7f5",
    color: "#405148",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
  },

  viewEmployeeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  largeAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#e8f5ee",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "16px",
    flexShrink: 0,
  },

  overallResult: {
    background:
      "linear-gradient(135deg, #f1f8f4, #f8fbf9)",
    border: "1px solid #dbe9e1",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  overallLabel: {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 800,
    color: "#718078",
  },

  overallRating: {
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#17663d",
    fontSize: "23px",
    fontWeight: 900,
  },

  viewSection: {
    marginTop: "18px",
  },

  viewSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: 800,
    color: "#293a30",
    marginBottom: "10px",
  },

  viewRatingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "9px",
  },

  viewRatingCard: {
    background: "#ffffff",
    border: "1px solid #e2e9e4",
    borderRadius: "11px",
    padding: "12px",
  },

  viewRatingTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "11px",
    color: "#34443a",
  },

  ratingValue: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    color: "#8a6116",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  ratingComment: {
    margin: "8px 0 0",
    paddingTop: "7px",
    borderTop: "1px solid #edf1ee",
    fontSize: "10px",
    lineHeight: 1.5,
    color: "#758078",
    fontStyle: "italic",
  },

  feedbackBox: {
    background: "#ffffff",
    border: "1px solid #e1e8e3",
    borderRadius: "11px",
    padding: "14px",
    fontSize: "12px",
    lineHeight: 1.7,
    color: "#536158",
    whiteSpace: "pre-line",
  },
};

export default HRPerformanceReviews;