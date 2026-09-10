import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Target,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Star,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Activity,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  getMyPerformanceSummary,
  getMyPerformanceReviews,
  getMyGoals,
  updateMyGoalStatus,
} from "../services/performanceApi";

import { showSuccess, showError } from "../../shared/utils/toast";

function MyPerformance() {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalStatusInput, setGoalStatusInput] =
    useState("IN_PROGRESS");
  const [goalProgressInput, setGoalProgressInput] =
    useState(0);
  const [updatingGoal, setUpdatingGoal] = useState(false);

  // Pagination
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);

  // =========================================================
  // FETCH PERFORMANCE DATA
  // =========================================================

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [sumRes, revRes, goalRes] = await Promise.all([
        getMyPerformanceSummary(),
        getMyPerformanceReviews({
          page: reviewPage,
          limit: 5,
        }),
        getMyGoals({
          page: 1,
          limit: 10,
        }),
      ]);

      setSummary(sumRes.data);
      setReviews(revRes.data?.items || []);
      setReviewTotalPages(
        revRes.data?.total_pages || 1
      );
      setGoals(goalRes.data?.items || []);
    } catch (err) {
      console.error(
        "Failed to fetch performance data",
        err
      );

      showError(
        "Unable to load performance overview."
      );
    } finally {
      setLoading(false);
    }
  }, [reviewPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================================
  // UPDATE GOAL STATUS
  // =========================================================

  const handleUpdateGoalStatus = async (e) => {
    e.preventDefault();

    if (!selectedGoal) return;

    setUpdatingGoal(true);

    try {
      await updateMyGoalStatus(selectedGoal.id, {
        status: goalStatusInput,
        progress_percentage: Number(
          goalProgressInput
        ),
      });

      showSuccess(
        "Goal status updated successfully."
      );

      setSelectedGoal(null);

      fetchData();
    } catch (err) {
      console.error(
        "Failed to update goal status",
        err
      );

      showError(
        "Unable to update goal status."
      );
    } finally {
      setUpdatingGoal(false);
    }
  };

  // =========================================================
  // OPEN GOAL MODAL
  // =========================================================

  const openGoalModal = (goal) => {
    setSelectedGoal(goal);
    setGoalStatusInput(goal.status);
    setGoalProgressInput(
      goal.progress_percentage || 0
    );
  };

  // =========================================================
  // STATUS CONFIG
  // =========================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Completed",
          background: "#e8f5ee",
          color: "#17663d",
          border: "#b9dfc8",
          icon: CheckCircle2,
        };

      case "IN_PROGRESS":
        return {
          label: "In Progress",
          background: "#edf7f1",
          color: "#17663d",
          border: "#c8e3d2",
          icon: Activity,
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          background: "#f1f3f2",
          color: "#69746e",
          border: "#dce2de",
          icon: XCircle,
        };

      default:
        return {
          label: status || "Pending",
          background: "#fff7df",
          color: "#8a6116",
          border: "#ead59a",
          icon: Clock,
        };
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading && !summary) {
    return (
      <AppLayout>
        <div style={styles.page}>
          <BackToDashboard />

          <div style={styles.loadingContainer}>
            <div style={styles.loadingIcon}>
              <RefreshCw
                size={28}
                style={{
                  animation:
                    "performanceSpin 1s linear infinite",
                }}
              />
            </div>

            <h2 style={styles.loadingTitle}>
              Loading your performance
            </h2>

            <p style={styles.loadingText}>
              Preparing your performance analytics,
              reviews and goals...
            </p>
          </div>

          <style>
            {`
              @keyframes performanceSpin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={styles.page}>
        <BackToDashboard />

        {/* =====================================================
            HERO
        ====================================================== */}

        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroEyebrow}>
              <Award size={15} />
              EMPLOYEE PERFORMANCE CENTER
            </div>

            <h1 style={styles.heroTitle}>
              My Performance & Analytics
            </h1>

            <p style={styles.heroDescription}>
              Review your performance ratings, assigned
              goals, project contribution and operational
              context from one workspace.
            </p>

            <div style={styles.heroMeta}>
              <div style={styles.heroMetaItem}>
                <ClipboardCheck size={15} />
                Performance Reviews
              </div>

              <div style={styles.heroMetaItem}>
                <Target size={15} />
                Goals & KPIs
              </div>

              <div style={styles.heroMetaItem}>
                <TrendingUp size={15} />
                Performance Context
              </div>
            </div>
          </div>

          <div style={styles.heroActions}>
            <div style={styles.heroIconBox}>
              <BarChartIcon />
            </div>

            <button
              onClick={fetchData}
              style={styles.heroRefreshButton}
            >
              <RefreshCw
                size={16}
                style={
                  loading
                    ? {
                        animation:
                          "performanceSpin 1s linear infinite",
                      }
                    : undefined
                }
              />
              Refresh
            </button>
          </div>
        </section>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        {summary && (
          <section style={styles.kpiGrid}>
            {/* Latest Rating */}

            <KpiCard
              icon={<Star size={20} />}
              label="Latest Rating"
              value={
                summary.latest_rating
                  ? summary.latest_rating.toFixed(1)
                  : "N/A"
              }
              suffix={
                summary.latest_rating
                  ? "/ 5.0"
                  : ""
              }
              description={`${summary.completed_reviews_count} completed HR evaluation(s)`}
              tone="green"
            />

            {/* Goals */}

            <KpiCard
              icon={<Target size={20} />}
              label="Active Goals"
              value={summary.active_goals_count}
              suffix="active"
              description={`${summary.completed_goals_count} goals completed`}
              tone="green"
            />

            {/* Projects */}

            <KpiCard
              icon={<Briefcase size={20} />}
              label="Projects Assigned"
              value={summary.projects.assigned}
              suffix="total"
              description={`${summary.projects.active} active · ${summary.projects.completed} completed`}
              tone="neutral"
            />

            {/* Work Reports */}

            <KpiCard
              icon={<FileText size={20} />}
              label="Work Reports"
              value={summary.work_reports.submitted}
              suffix="submitted"
              description={`${summary.work_reports.submitted_this_month} submitted this month`}
              tone="amber"
            />
          </section>
        )}

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <section style={styles.tabContainer}>
          <button
            onClick={() =>
              setActiveTab("overview")
            }
            style={{
              ...styles.tab,
              ...(activeTab === "overview"
                ? styles.activeTab
                : {}),
            }}
          >
            <Activity size={15} />
            Overview
          </button>

          <button
            onClick={() =>
              setActiveTab("reviews")
            }
            style={{
              ...styles.tab,
              ...(activeTab === "reviews"
                ? styles.activeTab
                : {}),
            }}
          >
            <ClipboardCheck size={15} />
            Performance Reviews
            <span style={styles.tabCount}>
              {reviews.length}
            </span>
          </button>

          <button
            onClick={() =>
              setActiveTab("goals")
            }
            style={{
              ...styles.tab,
              ...(activeTab === "goals"
                ? styles.activeTab
                : {}),
            }}
          >
            <Target size={15} />
            Goals & KPIs
            <span style={styles.tabCount}>
              {goals.length}
            </span>
          </button>
        </section>

        {/* =====================================================
            OVERVIEW
        ====================================================== */}

        {activeTab === "overview" &&
          summary && (
            <section style={styles.overviewGrid}>
              {/* Attendance & Leave */}

              <div style={styles.contextCard}>
                <ContextHeader
                  icon={<Calendar size={18} />}
                  eyebrow="OPERATIONAL CONTEXT"
                  title="Attendance & Leave"
                />

                <p style={styles.contextDescription}>
                  Operational data shown strictly as
                  context. Approved leave does not reduce
                  performance ratings.
                </p>

                <div style={styles.contextGrid}>
                  <div style={styles.contextMetric}>
                    <div style={styles.contextMetricIcon}>
                      <Calendar size={16} />
                    </div>

                    <span style={styles.metricLabel}>
                      Present Days
                    </span>

                    {summary.attendance
                      .working_days > 0 ? (
                      <strong
                        style={styles.metricValue}
                      >
                        {
                          summary.attendance
                            .present_days
                        }{" "}
                        /{" "}
                        {
                          summary.attendance
                            .working_days
                        }
                      </strong>
                    ) : (
                      <span
                        style={
                          styles.noDataText
                        }
                      >
                        No attendance data
                      </span>
                    )}

                    <span
                      style={
                        styles.warningText
                      }
                    >
                      {
                        summary.attendance
                          .late_days
                      }{" "}
                      late punch(es)
                    </span>
                  </div>

                  <div style={styles.contextMetric}>
                    <div style={styles.contextMetricIcon}>
                      <Calendar size={16} />
                    </div>

                    <span style={styles.metricLabel}>
                      Approved Leave
                    </span>

                    <strong
                      style={styles.metricValue}
                    >
                      {summary.leave.approved_days}{" "}
                      days
                    </strong>

                    <span
                      style={
                        styles.secondaryMetricText
                      }
                    >
                      {
                        summary.leave
                          .pending_requests
                      }{" "}
                      pending request(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects & Work Reports */}

              <div style={styles.contextCard}>
                <ContextHeader
                  icon={<Briefcase size={18} />}
                  eyebrow="WORK OUTPUT"
                  title="Projects & Work Reports"
                />

                <p style={styles.contextDescription}>
                  Summary of active projects and daily
                  work report submissions.
                </p>

                <div style={styles.contextGrid}>
                  <div style={styles.contextMetric}>
                    <div style={styles.contextMetricIcon}>
                      <Briefcase size={16} />
                    </div>

                    <span style={styles.metricLabel}>
                      Active Projects
                    </span>

                    <strong
                      style={styles.metricValue}
                    >
                      {summary.projects.active}
                    </strong>

                    <span
                      style={
                        styles.secondaryMetricText
                      }
                    >
                      {summary.projects.completed}{" "}
                      completed project(s)
                    </span>
                  </div>

                  <div style={styles.contextMetric}>
                    <div style={styles.contextMetricIcon}>
                      <FileText size={16} />
                    </div>

                    <span style={styles.metricLabel}>
                      Work Reports
                    </span>

                    <strong
                      style={styles.metricValue}
                    >
                      {
                        summary.work_reports
                          .submitted_this_month
                      }
                    </strong>

                    <span
                      style={
                        styles.secondaryMetricText
                      }
                    >
                      submitted this month
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* =====================================================
            PERFORMANCE REVIEWS
        ====================================================== */}

        {activeTab === "reviews" && (
          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.sectionEyebrow}>
                  FORMAL EVALUATIONS
                </div>

                <h2 style={styles.sectionTitle}>
                  Performance Reviews
                </h2>

                <p style={styles.sectionDescription}>
                  Review your completed HR performance
                  evaluations and category ratings.
                </p>
              </div>

              <div style={styles.sectionBadge}>
                {reviews.length} reviews
              </div>
            </div>

            {loading ? (
              <LoadingState text="Loading performance reviews..." />
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck size={26} />}
                title="No completed performance reviews"
                text="Your completed HR performance evaluations will appear here."
              />
            ) : (
              <>
                <div style={styles.reviewList}>
                  {reviews.map((rev) => {
                    const statusConfig =
                      getStatusConfig(
                        rev.status
                      );

                    const StatusIcon =
                      statusConfig.icon;

                    return (
                      <div
                        key={rev.id}
                        style={styles.reviewCard}
                      >
                        <div
                          style={
                            styles.reviewMain
                          }
                        >
                          <div
                            style={
                              styles.reviewIcon
                            }
                          >
                            <ClipboardCheck
                              size={19}
                            />
                          </div>

                          <div
                            style={
                              styles.reviewInfo
                            }
                          >
                            <strong
                              style={
                                styles.reviewTitle
                              }
                            >
                              Performance Evaluation
                            </strong>

                            <div
                              style={
                                styles.reviewPeriod
                              }
                            >
                              <Calendar size={13} />
                              {
                                rev.review_start_date
                              }
                              <span>→</span>
                              {
                                rev.review_end_date
                              }
                            </div>
                          </div>
                        </div>

                        <div
                          style={
                            styles.reviewRating
                          }
                        >
                          <span
                            style={
                              styles.reviewRatingLabel
                            }
                          >
                            Overall Rating
                          </span>

                          <strong
                            style={
                              styles.reviewRatingValue
                            }
                          >
                            {rev.overall_rating
                              ? `${rev.overall_rating.toFixed(
                                  1
                                )} / 5.0`
                              : "N/A"}
                          </strong>
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            background:
                              statusConfig.background,
                            color:
                              statusConfig.color,
                            borderColor:
                              statusConfig.border,
                          }}
                        >
                          <StatusIcon
                            size={13}
                          />
                          {statusConfig.label}
                        </span>

                        <div
                          style={
                            styles.reviewDate
                          }
                        >
                          <span
                            style={
                              styles.reviewRatingLabel
                            }
                          >
                            Completed
                          </span>

                          <strong
                            style={
                              styles.dateValue
                            }
                          >
                            {rev.completed_at
                              ? new Date(
                                  rev.completed_at
                                ).toLocaleDateString()
                              : "—"}
                          </strong>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedReview(
                              rev
                            )
                          }
                          style={
                            styles.outlineButton
                          }
                        >
                          <Eye size={14} />
                          View Breakdown
                          <ArrowRight
                            size={13}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}

                {reviewTotalPages > 1 && (
                  <Pagination
                    page={reviewPage}
                    totalPages={
                      reviewTotalPages
                    }
                    onPrevious={() =>
                      setReviewPage(
                        (p) => p - 1
                      )
                    }
                    onNext={() =>
                      setReviewPage(
                        (p) => p + 1
                      )
                    }
                  />
                )}
              </>
            )}
          </section>
        )}

        {/* =====================================================
            GOALS
        ====================================================== */}

        {activeTab === "goals" && (
          <section>
            <div style={styles.goalsHeader}>
              <div>
                <div style={styles.sectionEyebrow}>
                  OBJECTIVES & KPIs
                </div>

                <h2 style={styles.sectionTitle}>
                  Assigned Goals
                </h2>

                <p style={styles.sectionDescription}>
                  Track your assigned objectives and
                  update their current progress.
                </p>
              </div>

              <div style={styles.goalSummary}>
                <Target size={15} />
                {goals.length} goals
              </div>
            </div>

            {goals.length === 0 ? (
              <div style={styles.sectionCard}>
                <EmptyState
                  icon={<Target size={26} />}
                  title="No performance goals assigned"
                  text="Goals assigned to you by HR will appear here."
                />
              </div>
            ) : (
              <div style={styles.goalsGrid}>
                {goals.map((g) => {
                  const statusConfig =
                    getStatusConfig(g.status);

                  const StatusIcon =
                    statusConfig.icon;

                  const progress = Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        g.progress_percentage || 0
                      )
                    )
                  );

                  return (
                    <div
                      key={g.id}
                      style={styles.goalCard}
                    >
                      <div
                        style={
                          styles.goalCardHeader
                        }
                      >
                        <div
                          style={
                            styles.goalIcon
                          }
                        >
                          <Target size={19} />
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            background:
                              statusConfig.background,
                            color:
                              statusConfig.color,
                            borderColor:
                              statusConfig.border,
                          }}
                        >
                          <StatusIcon
                            size={12}
                          />
                          {statusConfig.label}
                        </span>
                      </div>

                      <h3
                        style={
                          styles.goalTitle
                        }
                      >
                        {g.title}
                      </h3>

                      {g.description && (
                        <p
                          style={
                            styles.goalDescription
                          }
                        >
                          {g.description}
                        </p>
                      )}

                      <div
                        style={
                          styles.progressSection
                        }
                      >
                        <div
                          style={
                            styles.progressHeader
                          }
                        >
                          <span>
                            Progress
                          </span>

                          <strong>
                            {progress}%
                          </strong>
                        </div>

                        <div
                          style={
                            styles.progressTrack
                          }
                        >
                          <div
                            style={{
                              ...styles.progressBar,
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={
                          styles.goalFooter
                        }
                      >
                        <div
                          style={
                            styles.targetDate
                          }
                        >
                          <Calendar
                            size={14}
                          />

                          <div>
                            <span
                              style={
                                styles.targetLabel
                              }
                            >
                              Target Date
                            </span>

                            <strong>
                              {g.target_date}
                            </strong>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            openGoalModal(g)
                          }
                          style={
                            styles.updateButton
                          }
                        >
                          Update Progress
                          <ArrowRight
                            size={13}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            PERFORMANCE REVIEW DETAIL MODAL
        ====================================================== */}

        {selectedReview && (
          <div style={styles.overlay}>
            <div style={styles.detailModal}>
              {/* FIXED HEADER */}

              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderContent}>
                  <div style={styles.modalIcon}>
                    <ClipboardCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <div
                      style={
                        styles.modalEyebrow
                      }
                    >
                      PERFORMANCE REVIEW
                    </div>

                    <h3
                      style={
                        styles.modalTitle
                      }
                    >
                      Performance Review
                      Breakdown
                    </h3>

                    <p
                      style={
                        styles.modalSubtitle
                      }
                    >
                      Period:{" "}
                      {
                        selectedReview.review_start_date
                      }{" "}
                      →{" "}
                      {
                        selectedReview.review_end_date
                      }
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedReview(null)
                  }
                  style={styles.closeButton}
                >
                  <X size={18} />
                </button>
              </div>

              {/* SCROLLABLE BODY */}

              <div style={styles.modalBody}>
                {/* Overall */}

                <div
                  style={
                    styles.overallRatingBanner
                  }
                >
                  <div>
                    <span
                      style={
                        styles.overallLabel
                      }
                    >
                      Official Overall Rating
                    </span>

                    <div
                      style={
                        styles.overallValue
                      }
                    >
                      <Star
                        size={23}
                        fill="currentColor"
                      />

                      {selectedReview.overall_rating
                        ? `${selectedReview.overall_rating.toFixed(
                            1
                          )} / 5.0`
                        : "N/A"}
                    </div>
                  </div>

                  <div
                    style={
                      styles.completedIndicator
                    }
                  >
                    <CheckCircle2
                      size={16}
                    />
                    {selectedReview.status}
                  </div>
                </div>

                {/* Categories */}

                <div
                  style={
                    styles.detailSection
                  }
                >
                  <div
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    <ClipboardCheck
                      size={17}
                    />
                    Category Breakdown
                  </div>

                  <div
                    style={
                      styles.categoryGrid
                    }
                  >
                    {selectedReview.ratings.map(
                      (r) => (
                        <div
                          key={r.id}
                          style={
                            styles.categoryCard
                          }
                        >
                          <div
                            style={
                              styles.categoryTop
                            }
                          >
                            <strong>
                              {r.category}
                            </strong>

                            <span
                              style={
                                styles.categoryRating
                              }
                            >
                              <Star
                                size={12}
                                fill="currentColor"
                              />
                              {r.rating} / 5
                            </span>
                          </div>

                          {r.comments && (
                            <p
                              style={
                                styles.categoryComment
                              }
                            >
                              "{r.comments}"
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Feedback */}

                {selectedReview.overall_feedback && (
                  <div
                    style={
                      styles.detailSection
                    }
                  >
                    <div
                      style={
                        styles.detailSectionTitle
                      }
                    >
                      <MessageSquare
                        size={17}
                      />
                      HR Feedback
                    </div>

                    <div
                      style={
                        styles.feedbackBox
                      }
                    >
                      {
                        selectedReview.overall_feedback
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED FOOTER */}

              <div style={styles.modalFooter}>
                <button
                  onClick={() =>
                    setSelectedReview(null)
                  }
                  style={
                    styles.modalCloseButton
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            UPDATE GOAL MODAL
        ====================================================== */}

        {selectedGoal && (
          <div style={styles.overlay}>
            <div style={styles.goalModal}>
              {/* HEADER */}

              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderContent}>
                  <div style={styles.modalIcon}>
                    <Target size={20} />
                  </div>

                  <div>
                    <div
                      style={
                        styles.modalEyebrow
                      }
                    >
                      GOAL MANAGEMENT
                    </div>

                    <h3
                      style={
                        styles.modalTitle
                      }
                    >
                      Update Goal Progress
                    </h3>

                    <p
                      style={
                        styles.modalSubtitle
                      }
                    >
                      Update the current status and
                      progress of your goal.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedGoal(null)
                  }
                  style={styles.closeButton}
                >
                  <X size={18} />
                </button>
              </div>

              {/* BODY */}

              <form
                onSubmit={
                  handleUpdateGoalStatus
                }
                style={styles.goalModalBody}
              >
                <div
                  style={
                    styles.goalModalGoal
                  }
                >
                  <span
                    style={
                      styles.modalFieldLabel
                    }
                  >
                    GOAL
                  </span>

                  <strong
                    style={
                      styles.selectedGoalTitle
                    }
                  >
                    {selectedGoal.title}
                  </strong>

                  {selectedGoal.description && (
                    <p
                      style={
                        styles.selectedGoalDescription
                      }
                    >
                      {selectedGoal.description}
                    </p>
                  )}
                </div>

                {/* Status */}

                <div style={styles.formField}>
                  <label
                    style={
                      styles.modalFieldLabel
                    }
                  >
                    Goal Status *
                  </label>

                  <select
                    value={goalStatusInput}
                    onChange={(e) =>
                      setGoalStatusInput(
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

                {/* Progress */}

                <div style={styles.formField}>
                  <div
                    style={
                      styles.progressInputHeader
                    }
                  >
                    <label
                      style={
                        styles.modalFieldLabel
                      }
                    >
                      Progress Percentage
                    </label>

                    <strong
                      style={
                        styles.progressNumber
                      }
                    >
                      {goalProgressInput}%
                    </strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goalProgressInput}
                    onChange={(e) =>
                      setGoalProgressInput(
                        e.target.value
                      )
                    }
                    style={
                      styles.rangeInput
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goalProgressInput}
                    onChange={(e) =>
                      setGoalProgressInput(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>

                {/* FOOTER */}

                <div
                  style={
                    styles.modalFooter
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedGoal(null)
                    }
                    style={
                      styles.modalCancelButton
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updatingGoal}
                    style={{
                      ...styles.modalSaveButton,
                      opacity:
                        updatingGoal
                          ? 0.6
                          : 1,
                    }}
                  >
                    <CheckCircle2
                      size={16}
                    />

                    {updatingGoal
                      ? "Saving..."
                      : "Save Progress"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes performanceSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .performance-review-card {
              grid-template-columns: 1fr 1fr !important;
            }
          }

          @media (max-width: 650px) {
            .performance-page {
              padding: 16px !important;
            }

            .performance-hero {
              flex-direction: column !important;
              padding: 24px !important;
            }

            .performance-hero-actions {
              align-items: flex-start !important;
            }

            .performance-review-card {
              grid-template-columns: 1fr !important;
            }

            .performance-context-grid {
              grid-template-columns: 1fr !important;
            }

            .performance-goal-footer {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .performance-modal-footer {
              flex-wrap: wrap !important;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}

// =============================================================
// KPI CARD
// =============================================================

function KpiCard({
  icon,
  label,
  value,
  suffix,
  description,
  tone = "neutral",
}) {
  const toneStyles = {
    green: {
      iconBackground: "#e8f5ee",
      iconColor: "#17663d",
    },

    amber: {
      iconBackground: "#fff7df",
      iconColor: "#8a6116",
    },

    neutral: {
      iconBackground: "#f0f4f1",
      iconColor: "#506058",
    },
  };

  const current =
    toneStyles[tone] ||
    toneStyles.neutral;

  return (
    <div style={styles.kpiCard}>
      <div
        style={{
          ...styles.kpiIcon,
          background:
            current.iconBackground,
          color: current.iconColor,
        }}
      >
        {icon}
      </div>

      <div style={styles.kpiContent}>
        <span style={styles.kpiLabel}>
          {label}
        </span>

        <div style={styles.kpiValueRow}>
          <strong style={styles.kpiValue}>
            {value}
          </strong>

          {suffix && (
            <span style={styles.kpiSuffix}>
              {suffix}
            </span>
          )}
        </div>

        <span style={styles.kpiDescription}>
          {description}
        </span>
      </div>
    </div>
  );
}

// =============================================================
// CONTEXT HEADER
// =============================================================

function ContextHeader({
  icon,
  eyebrow,
  title,
}) {
  return (
    <div style={styles.contextHeader}>
      <div style={styles.contextHeaderIcon}>
        {icon}
      </div>

      <div>
        <div style={styles.contextEyebrow}>
          {eyebrow}
        </div>

        <h2 style={styles.contextTitle}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// =============================================================
// BAR CHART ICON
// =============================================================

function BarChartIcon() {
  return (
    <div style={styles.chartIcon}>
      <span style={styles.chartBarOne} />
      <span style={styles.chartBarTwo} />
      <span style={styles.chartBarThree} />
      <span style={styles.chartBarFour} />
    </div>
  );
}

// =============================================================
// LOADING STATE
// =============================================================

function LoadingState({ text }) {
  return (
    <div style={styles.inlineLoading}>
      <RefreshCw
        size={24}
        style={{
          animation:
            "performanceSpin 1s linear infinite",
          color: "#17663d",
        }}
      />

      <strong>{text}</strong>
    </div>
  );
}

// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>
        {icon}
      </div>

      <h3 style={styles.emptyTitle}>
        {title}
      </h3>

      <p style={styles.emptyText}>
        {text}
      </p>
    </div>
  );
}

// =============================================================
// PAGINATION
// =============================================================

function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div style={styles.pagination}>
      <span style={styles.paginationText}>
        Page {page} of {totalPages}
      </span>

      <div style={styles.paginationActions}>
        <button
          disabled={page <= 1}
          onClick={onPrevious}
          style={{
            ...styles.paginationButton,
            opacity: page <= 1 ? 0.45 : 1,
          }}
        >
          <ChevronLeft size={17} />
        </button>

        <button
          disabled={page >= totalPages}
          onClick={onNext}
          style={{
            ...styles.paginationButton,
            opacity:
              page >= totalPages
                ? 0.45
                : 1,
          }}
        >
          <ChevronRight size={17} />
        </button>
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
    color: "#1d2a22",
  },

  hero: {
    marginTop: "18px",
    padding: "32px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, #123f29 0%, #17663d 58%, #248653 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    boxShadow:
      "0 14px 34px rgba(18, 63, 41, 0.16)",
  },

  heroContent: {
    maxWidth: "760px",
  },

  heroEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    opacity: 0.78,
    marginBottom: "12px",
  },

  heroTitle: {
    margin: 0,
    fontSize:
      "clamp(26px, 4vw, 38px)",
    lineHeight: 1.12,
    fontWeight: 850,
    letterSpacing: "-0.8px",
  },

  heroDescription: {
    margin: "13px 0 0",
    fontSize: "13px",
    lineHeight: 1.7,
    opacity: 0.86,
    maxWidth: "680px",
  },

  heroMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "22px",
  },

  heroMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    opacity: 0.88,
  },

  heroActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
  },

  heroIconBox: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.12)",
    border:
      "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  chartIcon: {
    height: "32px",
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
  },

  chartBarOne: {
    width: "5px",
    height: "13px",
    background: "#ffffff",
    borderRadius: "3px",
    opacity: 0.65,
  },

  chartBarTwo: {
    width: "5px",
    height: "20px",
    background: "#ffffff",
    borderRadius: "3px",
    opacity: 0.78,
  },

  chartBarThree: {
    width: "5px",
    height: "27px",
    background: "#ffffff",
    borderRadius: "3px",
    opacity: 0.9,
  },

  chartBarFour: {
    width: "5px",
    height: "32px",
    background: "#ffffff",
    borderRadius: "3px",
  },

  heroRefreshButton: {
    border:
      "1px solid rgba(255,255,255,0.25)",
    background:
      "rgba(255,255,255,0.1)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "9px 13px",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginTop: "18px",
  },

  kpiCard: {
    background: "#ffffff",
    border: "1px solid #e2e9e4",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 4px 16px rgba(25,55,38,0.045)",
  },

  kpiIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  kpiContent: {
    minWidth: 0,
  },

  kpiLabel: {
    display: "block",
    fontSize: "10px",
    color: "#718078",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 800,
  },

  kpiValueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginTop: "3px",
  },

  kpiValue: {
    fontSize: "25px",
    lineHeight: 1.2,
    color: "#1d2a22",
  },

  kpiSuffix: {
    fontSize: "10px",
    color: "#7e8982",
  },

  kpiDescription: {
    display: "block",
    marginTop: "3px",
    color: "#8b958f",
    fontSize: "10px",
  },

  tabContainer: {
    marginTop: "20px",
    display: "flex",
    gap: "5px",
    borderBottom:
      "1px solid #dfe7e2",
    overflowX: "auto",
  },

  tab: {
    border: "none",
    borderBottom:
      "2px solid transparent",
    background: "transparent",
    color: "#7b867f",
    padding: "12px 14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },

  activeTab: {
    color: "#17663d",
    borderBottom:
      "2px solid #17663d",
  },

  tabCount: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "10px",
    background: "#edf7f1",
    color: "#17663d",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
  },

  overviewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },

  contextCard: {
    background: "#ffffff",
    border: "1px solid #e2e9e4",
    borderRadius: "17px",
    padding: "20px",
    boxShadow:
      "0 4px 16px rgba(25,55,38,0.045)",
  },

  contextHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  contextHeaderIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#edf7f1",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  contextEyebrow: {
    fontSize: "9px",
    letterSpacing: "1px",
    color: "#17663d",
    fontWeight: 800,
  },

  contextTitle: {
    margin: "3px 0 0",
    fontSize: "16px",
    color: "#25352b",
  },

  contextDescription: {
    margin:
      "13px 0 15px 48px",
    fontSize: "11px",
    lineHeight: 1.55,
    color: "#7d8881",
  },

  contextGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  contextMetric: {
    padding: "14px",
    borderRadius: "12px",
    background: "#f7f9f7",
    border:
      "1px solid #e7ece8",
  },

  contextMetricIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "#e8f5ee",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "9px",
  },

  metricLabel: {
    display: "block",
    fontSize: "10px",
    color: "#78847c",
    fontWeight: 700,
  },

  metricValue: {
    display: "block",
    marginTop: "3px",
    fontSize: "20px",
    color: "#24362b",
  },

  warningText: {
    display: "block",
    marginTop: "4px",
    fontSize: "9px",
    color: "#9a6b18",
  },

  secondaryMetricText: {
    display: "block",
    marginTop: "4px",
    fontSize: "9px",
    color: "#87918b",
  },

  noDataText: {
    display: "block",
    marginTop: "5px",
    fontSize: "10px",
    color: "#9aa39e",
    fontStyle: "italic",
  },

  sectionCard: {
    marginTop: "18px",
    background: "#ffffff",
    border:
      "1px solid #e2e9e4",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 4px 16px rgba(25,55,38,0.045)",
  },

  sectionHeader: {
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom:
      "1px solid #edf1ee",
  },

  sectionEyebrow: {
    fontSize: "9px",
    color: "#17663d",
    fontWeight: 800,
    letterSpacing: "1.2px",
    marginBottom: "4px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#26372d",
    fontWeight: 800,
  },

  sectionDescription: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#7f8983",
    lineHeight: 1.5,
  },

  sectionBadge: {
    padding: "6px 10px",
    background: "#edf7f1",
    color: "#17663d",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  reviewList: {
    display: "flex",
    flexDirection: "column",
  },

  reviewCard: {
    display: "grid",
    gridTemplateColumns:
      "1.5fr 0.8fr auto 0.7fr auto",
    alignItems: "center",
    gap: "16px",
    padding: "17px 20px",
    borderBottom:
      "1px solid #edf1ee",
  },

  reviewMain: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  reviewIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#edf7f1",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  reviewInfo: {
    minWidth: 0,
  },

  reviewTitle: {
    display: "block",
    fontSize: "12px",
    color: "#29392f",
  },

  reviewPeriod: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "5px",
    fontSize: "10px",
    color: "#818c85",
  },

  reviewRating: {
    display: "flex",
    flexDirection: "column",
  },

  reviewRatingLabel: {
    fontSize: "9px",
    color: "#929b95",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  reviewRatingValue: {
    marginTop: "3px",
    color: "#8a6116",
    fontSize: "13px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 8px",
    border: "1px solid",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  reviewDate: {
    display: "flex",
    flexDirection: "column",
  },

  dateValue: {
    marginTop: "3px",
    fontSize: "11px",
    color: "#45544b",
  },

  outlineButton: {
    border:
      "1px solid #cbdcd1",
    background: "#f5f9f6",
    color: "#17663d",
    borderRadius: "8px",
    padding: "8px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  pagination: {
    padding: "13px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop:
      "1px solid #edf1ee",
  },

  paginationText: {
    fontSize: "10px",
    color: "#7d8881",
    fontWeight: 700,
  },

  paginationActions: {
    display: "flex",
    gap: "6px",
  },

  paginationButton: {
    width: "33px",
    height: "33px",
    border:
      "1px solid #d7e1da",
    background: "#ffffff",
    color: "#526158",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  goalsHeader: {
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  goalSummary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 10px",
    borderRadius: "20px",
    background: "#edf7f1",
    color: "#17663d",
    fontSize: "10px",
    fontWeight: 800,
  },

  goalsGrid: {
    marginTop: "15px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(310px, 1fr))",
    gap: "15px",
  },

  goalCard: {
    background: "#ffffff",
    border:
      "1px solid #e2e9e4",
    borderRadius: "16px",
    padding: "18px",
    boxShadow:
      "0 4px 16px rgba(25,55,38,0.045)",
  },

  goalCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  goalIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#edf7f1",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  goalTitle: {
    margin: "14px 0 0",
    fontSize: "15px",
    color: "#293a30",
    fontWeight: 800,
  },

  goalDescription: {
    margin: "6px 0 0",
    fontSize: "11px",
    lineHeight: 1.6,
    color: "#7d8881",
    minHeight: "34px",
  },

  progressSection: {
    marginTop: "17px",
  },

  progressHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#69766e",
    fontWeight: 700,
    marginBottom: "6px",
  },

  progressTrack: {
    height: "7px",
    background: "#e8eee9",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#17663d",
    borderRadius: "20px",
    transition:
      "width 0.3s ease",
  },

  goalFooter: {
    marginTop: "17px",
    paddingTop: "13px",
    borderTop:
      "1px solid #edf1ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  targetDate: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#17663d",
  },

  targetLabel: {
    display: "block",
    fontSize: "8px",
    textTransform: "uppercase",
    color: "#929c95",
    letterSpacing: "0.5px",
  },

  updateButton: {
    border: "none",
    background: "#17663d",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background:
      "rgba(15,30,21,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },

  detailModal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "92vh",
    background: "#ffffff",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow:
      "0 25px 70px rgba(10,30,18,0.22)",
  },

  goalModal: {
    width: "100%",
    maxWidth: "520px",
    maxHeight: "92vh",
    background: "#ffffff",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow:
      "0 25px 70px rgba(10,30,18,0.22)",
  },

  modalHeader: {
    flexShrink: 0,
    padding: "19px 21px",
    borderBottom:
      "1px solid #e6ece8",
    background: "#ffffff",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
  },

  modalHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  modalIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    background: "#e8f5ee",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalEyebrow: {
    fontSize: "9px",
    fontWeight: 800,
    color: "#17663d",
    letterSpacing: "1.1px",
  },

  modalTitle: {
    margin: "3px 0 0",
    fontSize: "17px",
    color: "#24342a",
    fontWeight: 800,
  },

  modalSubtitle: {
    margin: "3px 0 0",
    fontSize: "10px",
    color: "#808b84",
  },

  closeButton: {
    width: "33px",
    height: "33px",
    border:
      "1px solid #dce4df",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#657169",
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
    padding: "20px",
    background: "#fbfcfb",
  },

  overallRatingBanner: {
    background:
      "linear-gradient(135deg, #eff8f3, #f8fbf9)",
    border:
      "1px solid #dbe9e1",
    borderRadius: "14px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  overallLabel: {
    display: "block",
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    fontWeight: 800,
    color: "#718078",
  },

  overallValue: {
    marginTop: "5px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#17663d",
    fontSize: "22px",
    fontWeight: 900,
  },

  completedIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#e8f5ee",
    color: "#17663d",
    fontSize: "9px",
    fontWeight: 800,
  },

  detailSection: {
    marginTop: "18px",
  },

  detailSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#293a30",
  },

  categoryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "9px",
  },

  categoryCard: {
    background: "#ffffff",
    border:
      "1px solid #e2e9e4",
    borderRadius: "11px",
    padding: "11px",
  },

  categoryTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "10px",
    color: "#35463b",
  },

  categoryRating: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    color: "#8a6116",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  categoryComment: {
    margin: "7px 0 0",
    paddingTop: "6px",
    borderTop:
      "1px solid #edf1ee",
    color: "#78837c",
    fontSize: "9px",
    lineHeight: 1.5,
    fontStyle: "italic",
  },

  feedbackBox: {
    background: "#ffffff",
    border:
      "1px solid #e0e8e3",
    borderRadius: "11px",
    padding: "13px",
    fontSize: "11px",
    color: "#56635b",
    lineHeight: 1.65,
    whiteSpace: "pre-line",
  },

  modalFooter: {
    flexShrink: 0,
    padding: "13px 18px",
    borderTop:
      "1px solid #e6ece8",
    background: "#ffffff",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },

  modalCloseButton: {
    border:
      "1px solid #d5dfd9",
    background: "#ffffff",
    color: "#536158",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  goalModalBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "20px",
    background: "#fbfcfb",
  },

  goalModalGoal: {
    background: "#f1f8f4",
    border:
      "1px solid #dceae2",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "17px",
  },

  modalFieldLabel: {
    display: "block",
    fontSize: "9px",
    color: "#6f7b73",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "6px",
  },

  selectedGoalTitle: {
    display: "block",
    fontSize: "14px",
    color: "#26382d",
  },

  selectedGoalDescription: {
    margin: "5px 0 0",
    color: "#77837b",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  formField: {
    marginBottom: "17px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "41px",
    border:
      "1px solid #d7e1db",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#2c3c32",
    padding: "0 11px",
    fontSize: "11px",
    outline: "none",
  },

  progressInputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressNumber: {
    color: "#17663d",
    fontSize: "13px",
  },

  rangeInput: {
    width: "100%",
    accentColor: "#17663d",
    margin: "3px 0 10px",
    cursor: "pointer",
  },

  modalCancelButton: {
    border:
      "1px solid #d5dfd9",
    background: "#ffffff",
    color: "#59665e",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  modalSaveButton: {
    border: "none",
    background: "#17663d",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },

  loadingContainer: {
    minHeight: "480px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  loadingIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#edf7f1",
    color: "#17663d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    margin: "14px 0 5px",
    fontSize: "17px",
    color: "#29392f",
  },

  loadingText: {
    margin: 0,
    fontSize: "11px",
    color: "#818c85",
  },

  inlineLoading: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    color: "#637067",
    fontSize: "11px",
  },

  emptyState: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "25px",
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
    margin: "12px 0 4px",
    fontSize: "15px",
    color: "#2b3a31",
  },

  emptyText: {
    margin: 0,
    maxWidth: "400px",
    fontSize: "11px",
    color: "#818c85",
    lineHeight: 1.5,
  },
};

export default MyPerformance;