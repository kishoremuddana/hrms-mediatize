import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Users,
  CheckCircle2,
  Clock,
  Activity,
  ClipboardCheck,
  Star,
  Target,
  FileText,
  Plus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getHRPerformanceDashboard } from "../services/performanceApi";
import { showError } from "../../shared/utils/toast";

function HRPerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const res = await getHRPerformanceDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error(
        "Failed to load HR performance dashboard",
        err
      );

      showError(
        "Unable to load performance metrics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AppLayout>
      <div style={styles.page}>
        <BackToDashboard />

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <TrendingUp
                size={27}
                strokeWidth={2}
              />
            </div>

            <div>
              <div style={styles.eyebrow}>
                PERFORMANCE MANAGEMENT
              </div>

              <h1 style={styles.heroTitle}>
                Performance & Analytics
              </h1>

              <p style={styles.heroSubtitle}>
                Monitor employee evaluations, performance
                goals, ratings, and overall progress from
                one centralized dashboard.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw
              size={16}
              className={
                loading ? "hrms-performance-spin" : ""
              }
            />

            <span>Refresh Data</span>
          </button>
        </section>

        {/* OVERVIEW LABEL */}
        <div style={styles.sectionHeading}>
          <div>
            <div style={styles.sectionEyebrow}>
              PERFORMANCE OVERVIEW
            </div>

            <h2 style={styles.sectionTitle}>
              Workforce performance snapshot
            </h2>
          </div>

          {metrics && (
            <div style={styles.liveStatus}>
              <span style={styles.liveDot} />
              Live dashboard data
            </div>
          )}
        </div>

        {/* KPI CARDS */}
        {loading ? (
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>
              <RefreshCw
                size={22}
                className="hrms-performance-spin"
              />
            </div>

            <h3 style={styles.loadingTitle}>
              Loading performance metrics
            </h3>

            <p style={styles.loadingText}>
              Please wait while the latest performance
              data is retrieved.
            </p>
          </div>
        ) : metrics ? (
          <section style={styles.kpiGrid}>
            {/* Active Employees */}
            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <div>
                  <span style={styles.kpiLabel}>
                    Active Employees
                  </span>

                  <div style={styles.kpiValue}>
                    {metrics.total_employees}
                  </div>
                </div>

                <div
                  style={{
                    ...styles.kpiIcon,
                    backgroundColor: "#edf6f0",
                    color: "#17613f",
                  }}
                >
                  <Users size={21} />
                </div>
              </div>

              <div style={styles.kpiBottom}>
                <Activity size={13} />

                <span>
                  Active headcount
                </span>
              </div>
            </div>

            {/* Reviews */}
            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <div>
                  <span style={styles.kpiLabel}>
                    Reviews Completed
                  </span>

                  <div style={styles.kpiValue}>
                    {metrics.reviews_completed}
                  </div>
                </div>

                <div
                  style={{
                    ...styles.kpiIcon,
                    backgroundColor: "#eef7f2",
                    color: "#286247",
                  }}
                >
                  <ClipboardCheck size={21} />
                </div>
              </div>

              <div
                style={{
                  ...styles.kpiBottom,
                  color:
                    metrics.reviews_pending > 0
                      ? "#966f1d"
                      : "#667970",
                }}
              >
                <ClockIcon />

                <span>
                  {metrics.reviews_pending} draft review
                  {metrics.reviews_pending === 1
                    ? ""
                    : "s"}{" "}
                  pending
                </span>
              </div>
            </div>

            {/* Average Rating */}
            <div
              style={{
                ...styles.kpiCard,
                background:
                  "linear-gradient(145deg, #f8fbf9 0%, #edf6f0 100%)",
                borderColor: "#cfe0d5",
              }}
            >
              <div style={styles.kpiTop}>
                <div>
                  <span style={styles.kpiLabel}>
                    System Average Rating
                  </span>

                  <div style={styles.ratingValueRow}>
                    <span style={styles.kpiValue}>
                      {metrics.average_rating
                        ? metrics.average_rating.toFixed(
                            1
                          )
                        : "N/A"}
                    </span>

                    {metrics.average_rating && (
                      <span style={styles.ratingScale}>
                        / 5.0
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    ...styles.kpiIcon,
                    backgroundColor: "#245d42",
                    color: "#ffffff",
                  }}
                >
                  <Star
                    size={21}
                    fill="currentColor"
                  />
                </div>
              </div>

              <div style={styles.kpiBottom}>
                <Star size={13} />

                <span>
                  Across completed evaluations
                </span>
              </div>
            </div>

            {/* Goals */}
            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <div>
                  <span style={styles.kpiLabel}>
                    Goals Completed
                  </span>

                  <div style={styles.kpiValue}>
                    {metrics.goals_completed}
                  </div>
                </div>

                <div
                  style={{
                    ...styles.kpiIcon,
                    backgroundColor: "#edf6f0",
                    color: "#17613f",
                  }}
                >
                  <Target size={21} />
                </div>
              </div>

              <div style={styles.kpiBottom}>
                <TrendingUp size={13} />

                <span>
                  {metrics.goals_in_progress} in
                  progress
                </span>
              </div>
            </div>
          </section>
        ) : (
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>
              <Activity size={22} />
            </div>

            <h3 style={styles.loadingTitle}>
              Performance data unavailable
            </h3>

            <p style={styles.loadingText}>
              We couldn't retrieve the performance
              dashboard data.
            </p>

            <button
              type="button"
              onClick={fetchDashboard}
              style={styles.retryButton}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* MANAGEMENT AREA */}
        <section style={styles.managementSection}>
          <div style={styles.managementHeader}>
            <div>
              <div style={styles.sectionEyebrow}>
                PERFORMANCE MANAGEMENT
              </div>

              <h2 style={styles.sectionTitle}>
                Manage employee performance
              </h2>

              <p style={styles.sectionDescription}>
                Use the performance tools below to manage
                formal evaluations and employee goals.
              </p>
            </div>
          </div>

          <div style={styles.actionGrid}>
            {/* Reviews */}
            <Link
              to="/hr/performance/reviews"
              style={styles.actionCard}
            >
              <div style={styles.actionLeft}>
                <div
                  style={{
                    ...styles.actionIcon,
                    backgroundColor: "#edf6f0",
                    color: "#17613f",
                  }}
                >
                  <Award size={23} />
                </div>

                <div>
                  <div style={styles.actionEyebrow}>
                    EVALUATIONS
                  </div>

                  <h3 style={styles.actionTitle}>
                    Manage Performance Reviews
                  </h3>

                  <p style={styles.actionDescription}>
                    Draft evaluations, rate performance
                    categories, and complete formal
                    employee appraisals.
                  </p>

                  <div style={styles.actionLink}>
                    <span>
                      Open performance reviews
                    </span>

                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              <div style={styles.actionArrow}>
                <ArrowRight size={17} />
              </div>
            </Link>

            {/* Goals */}
            <Link
              to="/hr/performance/goals"
              style={styles.actionCard}
            >
              <div style={styles.actionLeft}>
                <div
                  style={{
                    ...styles.actionIcon,
                    backgroundColor: "#eef7f2",
                    color: "#286247",
                  }}
                >
                  <Target size={23} />
                </div>

                <div>
                  <div style={styles.actionEyebrow}>
                    GOALS & KPIs
                  </div>

                  <h3 style={styles.actionTitle}>
                    Manage Employee Goals / KPIs
                  </h3>

                  <p style={styles.actionDescription}>
                    Create goals, define progress targets,
                    and track objective execution across
                    employees.
                  </p>

                  <div style={styles.actionLink}>
                    <span>
                      Open goals management
                    </span>

                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              <div style={styles.actionArrow}>
                <ArrowRight size={17} />
              </div>
            </Link>
          </div>
        </section>

        {/* FOOTER INFORMATION */}
        <div style={styles.infoStrip}>
          <div style={styles.infoIcon}>
            <CheckCircle2 size={17} />
          </div>

          <div>
            <strong style={styles.infoTitle}>
              Performance management workspace
            </strong>

            <p style={styles.infoText}>
              Review current metrics, manage evaluations,
              and maintain employee goals from the
              performance management tools.
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes hrmsPerformanceSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .hrms-performance-spin {
            animation: hrmsPerformanceSpin 1s linear infinite;
          }

          .hrms-performance-action:hover {
            transform: translateY(-2px);
          }

          @media (max-width: 900px) {
            .hrms-performance-kpi-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .hrms-performance-hero {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .hrms-performance-kpi-grid {
              grid-template-columns: 1fr;
            }

            .hrms-performance-action-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}

function ClockIcon() {
  return <Clock size={13} />;
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

  heroContent: {
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
      "rgba(255,255,255,0.12)",

    color: "#ffffff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border:
      "1px solid rgba(255,255,255,0.15)",
  },

  eyebrow: {
    color: "#b9d8c5",

    fontSize: "9px",
    fontWeight: "800",

    letterSpacing: "1.2px",

    marginBottom: "5px",
  },

  heroTitle: {
    color: "#ffffff",

    fontSize: "25px",
    fontWeight: "800",

    lineHeight: 1.2,

    margin: 0,
  },

  heroSubtitle: {
    color: "#d4e4da",

    fontSize: "12px",
    lineHeight: 1.5,

    margin: "7px 0 0",

    maxWidth: "680px",
  },

  refreshButton: {
    border:
      "1px solid rgba(255,255,255,0.2)",

    backgroundColor: "#ffffff",

    color: "#17613f",

    borderRadius: "10px",

    padding: "10px 13px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "7px",

    fontSize: "10px",
    fontWeight: "800",

    cursor: "pointer",

    whiteSpace: "nowrap",

    flexShrink: 0,
  },

  sectionHeading: {
    marginTop: "22px",

    display: "flex",
    alignItems: "flex-end",
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

    fontSize: "17px",
    fontWeight: "800",
  },

  liveStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",

    padding: "6px 9px",

    border:
      "1px solid #d4e2d9",

    borderRadius: "999px",

    backgroundColor: "#f6faf7",

    color: "#60766a",

    fontSize: "9px",
    fontWeight: "700",

    whiteSpace: "nowrap",
  },

  liveDot: {
    width: "6px",
    height: "6px",

    borderRadius: "50%",

    backgroundColor: "#28734d",
  },

  kpiGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: "12px",

    marginTop: "12px",
  },

  kpiCard: {
    backgroundColor: "#ffffff",

    border: "1px solid #dfe8e2",

    borderRadius: "14px",

    padding: "16px",

    minHeight: "132px",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    boxShadow:
      "0 2px 9px rgba(23,63,45,0.04)",
  },

  kpiTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",

    gap: "10px",
  },

  kpiLabel: {
    display: "block",

    color: "#728279",

    fontSize: "9px",
    fontWeight: "800",

    letterSpacing: "0.45px",
    textTransform: "uppercase",

    maxWidth: "155px",
  },

  kpiValue: {
    color: "#20382c",

    fontSize: "27px",
    fontWeight: "850",

    lineHeight: 1,

    marginTop: "8px",
  },

  ratingValueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  },

  ratingScale: {
    color: "#839189",

    fontSize: "11px",
    fontWeight: "650",
  },

  kpiIcon: {
    width: "39px",
    height: "39px",

    borderRadius: "11px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  kpiBottom: {
    display: "flex",
    alignItems: "center",
    gap: "5px",

    color: "#718078",

    fontSize: "9px",
    fontWeight: "650",
  },

  loadingCard: {
    marginTop: "12px",

    minHeight: "250px",

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

  loadingIcon: {
    width: "50px",
    height: "50px",

    borderRadius: "14px",

    backgroundColor: "#edf6f0",

    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: "12px",
  },

  loadingTitle: {
    color: "#263d32",

    fontSize: "14px",
    fontWeight: "800",

    margin: 0,
  },

  loadingText: {
    color: "#7c8982",

    fontSize: "11px",
    lineHeight: 1.5,

    margin: "6px 0 0",
  },

  retryButton: {
    marginTop: "14px",

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

  managementSection: {
    marginTop: "24px",

    backgroundColor: "#ffffff",

    border:
      "1px solid #dfe8e2",

    borderRadius: "15px",

    overflow: "hidden",

    boxShadow:
      "0 2px 10px rgba(23,63,45,0.04)",
  },

  managementHeader: {
    padding: "18px 20px",

    borderBottom:
      "1px solid #e7ede9",

    backgroundColor: "#fbfcfb",
  },

  sectionDescription: {
    margin: "5px 0 0",

    color: "#7b8981",

    fontSize: "11px",
    lineHeight: 1.5,
  },

  actionGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "12px",

    padding: "15px",
  },

  actionCard: {
    position: "relative",

    textDecoration: "none",

    backgroundColor: "#ffffff",

    border:
      "1px solid #dfe8e2",

    borderRadius: "13px",

    padding: "16px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    transition:
      "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",

    color: "inherit",
  },

  actionLeft: {
    display: "flex",
    alignItems: "flex-start",

    gap: "12px",

    minWidth: 0,
  },

  actionIcon: {
    width: "43px",
    height: "43px",

    borderRadius: "11px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  actionEyebrow: {
    color: "#829087",

    fontSize: "8px",
    fontWeight: "800",

    letterSpacing: "0.9px",

    marginBottom: "3px",
  },

  actionTitle: {
    color: "#263d32",

    fontSize: "13px",
    fontWeight: "800",

    margin: 0,

    lineHeight: 1.35,
  },

  actionDescription: {
    color: "#78867f",

    fontSize: "10px",
    lineHeight: 1.5,

    margin: "5px 0 0",

    maxWidth: "390px",
  },

  actionLink: {
    marginTop: "10px",

    color: "#286247",

    display: "inline-flex",
    alignItems: "center",

    gap: "5px",

    fontSize: "9px",
    fontWeight: "800",
  },

  actionArrow: {
    width: "30px",
    height: "30px",

    borderRadius: "50%",

    backgroundColor: "#f0f6f2",

    color: "#286247",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  infoStrip: {
    marginTop: "13px",

    padding: "12px 14px",

    backgroundColor: "#f7faf8",

    border:
      "1px solid #dce7e0",

    borderRadius: "11px",

    display: "flex",
    alignItems: "flex-start",

    gap: "9px",
  },

  infoIcon: {
    width: "28px",
    height: "28px",

    borderRadius: "8px",

    backgroundColor: "#e8f3ec",

    color: "#17613f",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  infoTitle: {
    display: "block",

    color: "#355244",

    fontSize: "10px",
    fontWeight: "800",
  },

  infoText: {
    color: "#78877f",

    fontSize: "9px",
    lineHeight: 1.5,

    margin: "3px 0 0",
  },
};

export default HRPerformanceDashboard;