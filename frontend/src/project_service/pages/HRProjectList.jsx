import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  Eye,
  Edit,
  FolderKanban,
  CalendarDays,
  RotateCcw,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getProjects } from "../services/projectApi";
import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
  ProjectProgress,
} from "../components/ProjectBadges";
import { showError } from "../../shared/utils/toast";

export default function HRProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  // --------------------------------------------------
  // FETCH PROJECTS
  // --------------------------------------------------

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        ...(search.trim() && {
          search: search.trim(),
        }),
        ...(statusFilter && {
          status: statusFilter,
        }),
        ...(priorityFilter && {
          priority: priorityFilter,
        }),
      };

      const res = await getProjects(params);

      setProjects(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to load project directory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter, priorityFilter]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
  };

  return (
    <AppLayout title="All Projects">

      <div className="w-full min-w-0 pb-10">

        {/* =====================================================
            BACK
        ====================================================== */}

        <div className="mb-5">
          <BackToDashboard to="/hr/dashboard" role="HR" />
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#17251F] px-5 py-7 text-white shadow-sm sm:px-7 lg:px-9 lg:py-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-emerald-300">

                <FolderKanban size={18} />

                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Project Management
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Company Projects
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Manage project lifecycles, priorities, progress,
                timelines, and teams from one place.
              </p>

            </div>

            {/* PROJECT COUNT */}

            <div className="flex items-center gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Projects
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {totalItems}
                </p>

              </div>

              <Link
                to="/hr/projects/create"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#dcefe3] px-5 text-sm font-semibold !text-[#24543c] transition hover:bg-white"
              >
                <Plus size={17} />
                Create Project
              </Link>

            </div>

          </div>

        </section>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
              <SlidersHorizontal size={18} />
            </div>

            <div>

              <h2 className="text-base font-bold text-slate-800">
                Find Projects
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Search and filter your project directory
              </p>

            </div>

          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 lg:flex-row"
          >

            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search project code, name or description..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
              />

            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-5 text-sm font-semibold text-white transition hover:bg-[#24543c]"
            >
              <Search size={16} />
              Search
            </button>

          </form>

          {/* FILTER ROW */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Project Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="PLANNED">
                  Planned
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="ON_HOLD">
                  On Hold
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

            </div>

            {/* PRIORITY */}

            <div>

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Priority
              </label>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
              >
                <option value="">
                  All Priorities
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>
              </select>

            </div>

            {/* RESET */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={15} />
                Reset Filters
              </button>

            </div>

          </div>

        </section>

        {/* =====================================================
            RESULT COUNT
        ====================================================== */}

        <div className="mt-5 flex items-center justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Project Directory
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {totalItems} project
              {totalItems === 1 ? "" : "s"} found
            </p>

          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <CalendarDays size={14} />
            Page {page} of {totalPages}
          </div>

        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f6b4f]" />

            <p className="text-sm font-semibold text-slate-700">
              Loading projects...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we retrieve the project directory.
            </p>

          </div>

        ) : projects.length === 0 ? (

          /* ===================================================
             EMPTY
          ==================================================== */

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f2ec] text-[#2f6b4f]">
              <FolderKanban size={24} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800">
              No projects found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
              No projects match your current search and filter
              criteria.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2f6b4f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24543c]"
            >
              <RotateCcw size={15} />
              Clear Filters
            </button>

          </div>

        ) : (

          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

              <table className="w-full min-w-[950px] text-left">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50">

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Project
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Timeline
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Priority
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Progress
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {projects.map((p) => (

                    <tr
                      key={p.id}
                      className="border-b border-slate-100 transition hover:bg-[#f8fbf9]"
                    >

                      {/* PROJECT */}

                      <td className="px-5 py-4">

                        <div>

                          <code className="rounded-lg bg-[#e8f2ec] px-2 py-1 font-mono text-[11px] font-semibold text-[#2f6b4f]">
                            {p.project_code}
                          </code>

                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {p.name}
                          </p>

                        </div>

                      </td>

                      {/* TIMELINE */}

                      <td className="px-5 py-4">

                        <div className="text-xs text-slate-500">

                          <p className="font-medium">
                            {p.start_date}
                          </p>

                          <p className="mt-1 text-slate-400">
                            → {p.end_date || "Ongoing"}
                          </p>

                        </div>

                      </td>

                      {/* PRIORITY */}

                      <td className="px-5 py-4">
                        <ProjectPriorityBadge
                          priority={p.priority}
                        />
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap items-center gap-2">

                          <ProjectStatusBadge
                            status={p.status}
                          />

                          {p.is_overdue && (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                              OVERDUE
                            </span>
                          )}

                        </div>

                      </td>

                      {/* PROGRESS */}

                      <td className="min-w-[150px] px-5 py-4">

                        <ProjectProgress
                          percentage={
                            p.progress_percentage
                          }
                        />

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/hr/projects/${p.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/hr/projects/${p.id}/edit`
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2f6b4f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#24543c]"
                          >
                            <Edit size={14} />
                            Edit
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE / TABLET CARDS
            ================================================== */}

            <div className="mt-4 grid gap-4 lg:hidden">

              {projects.map((p) => (

                <article
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* CARD HEADER */}

                  <div className="border-b border-slate-100 p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <code className="rounded-lg bg-[#e8f2ec] px-2 py-1 font-mono text-[11px] font-semibold text-[#2f6b4f]">
                          {p.project_code}
                        </code>

                        <h3 className="mt-2 break-words text-base font-bold text-slate-800">
                          {p.name}
                        </h3>

                      </div>

                      <ProjectStatusBadge
                        status={p.status}
                      />

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="space-y-4 p-5">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Priority
                      </span>

                      <div className="flex items-center gap-2">

                        <ProjectPriorityBadge
                          priority={p.priority}
                        />

                        {p.is_overdue && (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                            OVERDUE
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="flex items-start justify-between gap-3">

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Timeline
                      </span>

                      <span className="text-right text-xs font-medium text-slate-600">
                        {p.start_date}
                        <br />
                        <span className="text-slate-400">
                          → {p.end_date || "Ongoing"}
                        </span>
                      </span>

                    </div>

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Progress
                        </span>

                      </div>

                      <ProjectProgress
                        percentage={
                          p.progress_percentage
                        }
                      />

                    </div>

                  </div>

                  {/* CARD ACTIONS */}

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-4">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/hr/projects/${p.id}`
                        )
                      }
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Eye size={14} />
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/hr/projects/${p.id}/edit`
                        )
                      }
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#2f6b4f] text-xs font-semibold text-white transition hover:bg-[#24543c]"
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                  </div>

                </article>

              ))}

            </div>

          </>

        )}

        {/* =====================================================
            PAGINATION
        ====================================================== */}

        {totalPages > 1 && (

          <div className="mt-5 flex items-center justify-center gap-3">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((p) =>
                  Math.max(p - 1, 1)
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            <span className="rounded-xl bg-[#e8f2ec] px-4 py-2.5 text-xs font-bold text-[#2f6b4f]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    p + 1,
                    totalPages
                  )
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ArrowRight size={14} />
            </button>

          </div>

        )}

      </div>

    </AppLayout>
  );
}