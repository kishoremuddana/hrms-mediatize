import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  RefreshCw,
  Activity,
  CircleDot,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getHRProjectMetrics,
  getProjects,
} from "../services/projectApi";
import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
  ProjectProgress,
} from "../components/ProjectBadges";
import { showError } from "../../shared/utils/toast";

export default function HRProjectDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    on_hold_projects: 0,
    overdue_projects: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const [metricsResponse, projectsResponse] = await Promise.all([
        getHRProjectMetrics(),
        getProjects({
          page: 1,
          limit: 5,
        }),
      ]);

      setMetrics(metricsResponse.data);
      setRecentProjects(projectsResponse.data.items || []);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to load project dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completionRate = useMemo(() => {
    if (!metrics.total_projects) return 0;

    return Math.round(
      (metrics.completed_projects / metrics.total_projects) * 100
    );
  }, [metrics]);

  const attentionCount =
    metrics.on_hold_projects + metrics.overdue_projects;

  return (
    <AppLayout title="Project Management Overview">
      <div className="min-h-full bg-[#f6f8f6] px-4 pb-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl pt-2">
          <BackToDashboard to="/hr/dashboard" role="HR" />

          {/* =====================================================
              HERO
          ====================================================== */}
          <section className="relative mt-4 overflow-hidden rounded-[28px] bg-[#17251f] px-6 py-8 text-white shadow-[0_18px_45px_rgba(23,37,31,0.16)] sm:px-8 lg:px-10 lg:py-10">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#2f6b4f]/30 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#6f9d7f]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#dcefe3]">
                  <Activity size={14} />
                  PROJECT OPERATIONS
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Project Management
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Monitor your project portfolio, track delivery progress,
                  identify projects that need attention, and manage project
                  operations from one workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/hr/project-roles"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <SlidersHorizontal size={17} />
                  Manage Roles
                </Link>

                <Link
                  to="/hr/projects/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#dcefe3] px-4 py-2.5 text-sm font-bold text-[#244d38] transition hover:bg-white"
                >
                  <Plus size={17} />
                  Create Project
                </Link>
              </div>
            </div>
          </section>

          {/* =====================================================
              PORTFOLIO SNAPSHOT
          ====================================================== */}
          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7c72]">
                  Portfolio Snapshot
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#17251f]">
                  Current project health
                </h2>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] bg-white px-3.5 py-2 text-sm font-semibold text-[#365444] shadow-sm transition hover:border-[#b9cec0] hover:bg-[#f8fbf9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

              {/* Total */}
              <MetricCard
                icon={<FolderKanban size={19} />}
                label="Total Projects"
                value={metrics.total_projects}
                description="Portfolio"
                iconClass="bg-[#e8f2ec] text-[#2f6b4f]"
              />

              {/* Active */}
              <MetricCard
                icon={<TrendingUp size={19} />}
                label="Active"
                value={metrics.active_projects}
                description="In progress"
                iconClass="bg-[#e8f2ec] text-[#2f6b4f]"
              />

              {/* Completed */}
              <MetricCard
                icon={<CheckCircle2 size={19} />}
                label="Completed"
                value={metrics.completed_projects}
                description="Delivered"
                iconClass="bg-[#edf5ef] text-[#3f7756]"
              />

              {/* On Hold */}
              <MetricCard
                icon={<Clock3 size={19} />}
                label="On Hold"
                value={metrics.on_hold_projects}
                description="Paused"
                iconClass="bg-[#fff6df] text-[#9a6a16]"
              />

              {/* Overdue */}
              <MetricCard
                icon={<AlertCircle size={19} />}
                label="Overdue"
                value={metrics.overdue_projects}
                description="Needs attention"
                iconClass="bg-[#fff0ed] text-[#b34d3d]"
              />

            </div>
          </section>

          {/* =====================================================
              HEALTH OVERVIEW
          ====================================================== */}
          <section className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">

            {/* Portfolio health */}
            <div className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-[0_8px_30px_rgba(23,37,31,0.05)] sm:p-7">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#2f6b4f]">
                    <CircleDot size={17} />
                    <span className="text-xs font-bold uppercase tracking-[0.14em]">
                      Portfolio Health
                    </span>
                  </div>

                  <h3 className="mt-2 text-xl font-bold text-[#17251f]">
                    Delivery overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    A quick view of project completion and active workload.
                  </p>
                </div>

                <div className="hidden rounded-2xl bg-[#f3f7f4] px-4 py-3 text-right sm:block">
                  <p className="text-2xl font-bold text-[#2f6b4f]">
                    {completionRate}%
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Completion
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-3">

                <HealthItem
                  icon={<TrendingUp size={18} />}
                  label="Active workload"
                  value={metrics.active_projects}
                  description="Projects currently running"
                />

                <HealthItem
                  icon={<CheckCircle2 size={18} />}
                  label="Delivered"
                  value={metrics.completed_projects}
                  description="Projects completed"
                />

                <HealthItem
                  icon={<AlertCircle size={18} />}
                  label="Attention"
                  value={attentionCount}
                  description="On hold or overdue"
                />

              </div>

              {/* Completion progress */}
              <div className="mt-7 border-t border-[#edf1ee] pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#31463a]">
                    Portfolio completion
                  </span>

                  <span className="text-sm font-bold text-[#2f6b4f]">
                    {completionRate}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2ee]">
                  <div
                    className="h-full rounded-full bg-[#2f6b4f] transition-all duration-500"
                    style={{
                      width: `${completionRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-[24px] border border-[#dfe7e1] bg-[#eef5f0] p-6 shadow-[0_8px_30px_rgba(23,37,31,0.04)]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f6b4f] text-white">
                <BriefcaseBusiness size={19} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#17251f]">
                Project workspace
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Jump directly into the areas you use most for project
                administration.
              </p>

              <div className="mt-5 space-y-2.5">

                <QuickAction
                  to="/hr/projects/list"
                  icon={<FolderKanban size={16} />}
                  label="View all projects"
                />

                <QuickAction
                  to="/hr/projects/create"
                  icon={<Plus size={16} />}
                  label="Create a new project"
                />

                <QuickAction
                  to="/hr/project-roles"
                  icon={<SlidersHorizontal size={16} />}
                  label="Configure project roles"
                />

              </div>
            </div>
          </section>

          {/* =====================================================
              RECENT PROJECTS
          ====================================================== */}
          <section className="mt-8">

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7c72]">
                  Workspace
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#17251f]">
                  Recent Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The latest projects in your portfolio.
                </p>
              </div>

              <Link
                to="/hr/projects/list"
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#2f6b4f] transition hover:text-[#244d38]"
              >
                View all projects
                <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <LoadingProjects />
            ) : recentProjects.length === 0 ? (
              <EmptyProjects />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() =>
                      navigate(`/hr/projects/${project.id}`)
                    }
                  />
                ))}

              </div>
            )}
          </section>

          {/* =====================================================
              BOTTOM ACTION AREA
          ====================================================== */}
          <section className="mt-8 overflow-hidden rounded-[24px] border border-[#dce5df] bg-white">

            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7c72]">
                  Project Administration
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#17251f]">
                  Keep your project workspace organized
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create projects, manage assignments, and maintain project
                  roles.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">

                <Link
                  to="/hr/projects/list"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] px-4 py-2.5 text-sm font-semibold text-[#365444] transition hover:bg-[#f5f8f6]"
                >
                  <FolderKanban size={16} />
                  Projects
                </Link>

                <Link
                  to="/hr/project-roles"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] px-4 py-2.5 text-sm font-semibold text-[#365444] transition hover:bg-[#f5f8f6]"
                >
                  <SlidersHorizontal size={16} />
                  Roles
                </Link>

                <Link
                  to="/hr/projects/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2f6b4f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#244d38]"
                >
                  <Plus size={16} />
                  New Project
                </Link>

              </div>
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}

/* ================================================================
   METRIC CARD
================================================================ */

function MetricCard({
  icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="group rounded-[20px] border border-[#dfe7e1] bg-white p-4 shadow-[0_6px_22px_rgba(23,37,31,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,37,31,0.07)] sm:p-5">

      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          HR
        </span>
      </div>

      <div className="mt-5">
        <p className="text-2xl font-extrabold tracking-tight text-[#17251f]">
          {value}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#33483c]">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   HEALTH ITEM
================================================================ */

function HealthItem({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl bg-[#f7faf8] p-4">

      <div className="flex items-center gap-2 text-[#2f6b4f]">
        {icon}

        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-extrabold text-[#17251f]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ================================================================
   QUICK ACTION
================================================================ */

function QuickAction({
  to,
  icon,
  label,
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-[#dce8df] bg-white px-3.5 py-3 text-sm font-semibold text-[#365444] transition hover:border-[#b8ccbe] hover:bg-[#f8fbf9]"
    >
      <span className="flex items-center gap-3">
        <span className="text-[#2f6b4f]">
          {icon}
        </span>

        {label}
      </span>

      <ArrowRight size={15} className="text-slate-400" />
    </Link>
  );
}

/* ================================================================
   PROJECT CARD
================================================================ */

function ProjectCard({
  project,
  onOpen,
}) {
  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-[#dfe7e1] bg-white shadow-[0_7px_25px_rgba(23,37,31,0.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(23,37,31,0.08)]">

      {/* Top accent */}
      <div className="h-1.5 bg-[#2f6b4f]" />

      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">
            <span className="inline-flex rounded-lg bg-[#f1f5f2] px-2.5 py-1 font-mono text-[11px] font-bold text-[#527062]">
              {project.project_code}
            </span>

            <h3 className="mt-3 truncate text-lg font-bold text-[#17251f]">
              {project.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce5df] text-[#547062] transition hover:bg-[#eef5f0] hover:text-[#2f6b4f]"
            aria-label={`Open ${project.name}`}
          >
            <ExternalLink size={15} />
          </button>
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ProjectPriorityBadge priority={project.priority} />
          <ProjectStatusBadge status={project.status} />

          {project.is_overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0ed] px-2.5 py-1 text-[10px] font-bold text-[#b34d3d]">
              <AlertCircle size={11} />
              OVERDUE
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={14} className="text-[#6a8174]" />

          <span>
            Started {project.start_date || "—"}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-5 rounded-2xl bg-[#f7faf8] p-4">

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Progress
            </span>

            <span className="text-sm font-extrabold text-[#2f6b4f]">
              {project.progress_percentage || 0}%
            </span>
          </div>

          <ProjectProgress
            percentage={project.progress_percentage}
          />
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce5df] bg-white px-4 py-2.5 text-sm font-bold text-[#365444] transition hover:border-[#b7cbbc] hover:bg-[#f4f8f5] hover:text-[#2f6b4f]"
        >
          Open Project Workspace
          <ArrowRight size={15} />
        </button>

      </div>
    </article>
  );
}

/* ================================================================
   LOADING
================================================================ */

function LoadingProjects() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[22px] border border-[#e2e9e4] bg-white p-5"
        >
          <div className="h-1.5 w-16 rounded-full bg-[#e7eee9]" />

          <div className="mt-5 h-6 w-24 rounded bg-[#edf2ee]" />

          <div className="mt-4 h-5 w-3/4 rounded bg-[#edf2ee]" />

          <div className="mt-5 h-5 w-1/2 rounded bg-[#edf2ee]" />

          <div className="mt-5 h-16 rounded-2xl bg-[#f1f5f2]" />

          <div className="mt-5 h-10 rounded-xl bg-[#edf2ee]" />
        </div>
      ))}

    </div>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyProjects() {
  return (
    <div className="rounded-[24px] border border-dashed border-[#cbd9cf] bg-white px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f2ec] text-[#2f6b4f]">
        <FolderKanban size={24} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#17251f]">
        No projects yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your project portfolio is currently empty. Create your first project
        to start managing project delivery and assignments.
      </p>

      <Link
        to="/hr/projects/create"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2f6b4f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#244d38]"
      >
        <Plus size={16} />
        Create Project
      </Link>

    </div>
  );
}