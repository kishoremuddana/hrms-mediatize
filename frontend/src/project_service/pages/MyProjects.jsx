import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FolderGit2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Eye,
  UserCheck,
  AlertTriangle,
  X,
  ArrowRight,
  BriefcaseBusiness,
  Target,
  CircleDot,
  ChevronRight,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Modal from "../../shared/components/Modal";

import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
  ProgressBar,
} from "../components/ProjectBadges";

import {
  getMyProjects,
  getMyProjectDetails,
} from "../services/projectApi";


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);


  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    try {
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        return dateStr;
      }

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };


  /* =======================================================
     FETCH PROJECTS
  ======================================================= */

  const fetchMyProjects = async () => {
    setLoading(true);

    try {
      const res = await getMyProjects();

      setProjects(res.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to load assigned projects"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMyProjects();
  }, []);


  /* =======================================================
     OPEN PROJECT DETAILS
  ======================================================= */

  const handleOpenDetail = async (projectId) => {
    setCurrentProjectId(projectId);
    setIsDetailOpen(true);
    setLoadingDetails(true);
    setDetailError(null);
    setSelectedProject(null);

    try {
      const res = await getMyProjectDetails(projectId);

      setSelectedProject(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to load project details";

      setDetailError(msg);

      toast.error(msg);
    } finally {
      setLoadingDetails(false);
    }
  };


  /* =======================================================
     FILTER PROJECTS
  ======================================================= */

  const filteredProjects = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return projects.filter((project) => {
      const matchesSearch =
        project.name
          ?.toLowerCase()
          .includes(searchValue) ||
        project.project_code
          ?.toLowerCase()
          .includes(searchValue) ||
        project.project_role_name
          ?.toLowerCase()
          .includes(searchValue);

      if (statusFilter === "ALL") {
        return matchesSearch;
      }

      return (
        matchesSearch &&
        project.status === statusFilter
      );
    });
  }, [projects, search, statusFilter]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const activeProjects = projects.filter(
    (project) =>
      project.status === "IN_PROGRESS"
  ).length;

  const completedProjects = projects.filter(
    (project) =>
      project.status === "COMPLETED"
  ).length;

  const overdueProjects = projects.filter(
    (project) => project.is_overdue
  ).length;


  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (sum, project) =>
              sum +
              (project.progress_percentage || 0),
            0
          ) / projects.length
        )
      : 0;


  /* =======================================================
     UI
  ======================================================= */

  return (
    <AppLayout title="My Projects">

      <div className="w-full max-w-7xl mx-auto pb-12">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-5">
          <BackToDashboard role="EMPLOYEE" />
        </div>


        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[30px]
            bg-[#17251F]
            text-white
            shadow-[0_20px_50px_rgba(23,37,31,0.14)]
            mb-6
          "
        >

          {/* Decorative background */}

          <div
            className="
              absolute
              -right-24
              -top-24
              w-80
              h-80
              rounded-full
              bg-[#2f6b4f]/20
            "
          />

          <div
            className="
              absolute
              right-32
              -bottom-40
              w-96
              h-96
              rounded-full
              bg-[#6da27f]/10
            "
          />


          <div className="relative z-10 p-6 sm:p-8 lg:p-10">

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-end
                lg:justify-between
                gap-7
              "
            >

              {/* LEFT */}

              <div className="min-w-0">

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    rounded-lg
                    bg-white/10
                    border border-white/10
                    text-xs
                    font-bold
                    text-[#c7dfcf]
                    mb-4
                  "
                >
                  <BriefcaseBusiness size={14} />

                  Employee Workspace
                </div>


                <h1
                  className="
                    text-3xl
                    sm:text-4xl
                    lg:text-5xl
                    font-extrabold
                    tracking-tight
                  "
                >
                  My Projects
                </h1>


                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    sm:text-base
                    text-slate-300
                    leading-7
                  "
                >
                  Everything you're working on,
                  organized in one place. Track
                  assignments, responsibilities and
                  project progress.
                </p>

              </div>


              {/* REFRESH */}

              <button
                type="button"
                onClick={fetchMyProjects}
                disabled={loading}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  bg-white/10
                  border border-white/10
                  text-sm
                  font-semibold
                  hover:bg-white/15
                  transition
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

            </div>


            {/* =================================================
                HERO STATISTICS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                lg:grid-cols-4
                gap-3
                mt-9
              "
            >

              <HeroStat
                icon={FolderGit2}
                label="Assigned"
                value={projects.length}
              />

              <HeroStat
                icon={Clock}
                label="In Progress"
                value={activeProjects}
              />

              <HeroStat
                icon={CheckCircle2}
                label="Completed"
                value={completedProjects}
              />

              <HeroStat
                icon={Target}
                label="Avg. Progress"
                value={`${averageProgress}%`}
              />

            </div>

          </div>
        </section>


        {/* =================================================
            WORKSPACE TOOLBAR
        ================================================= */}

        <section
          className="
            bg-white
            border border-slate-200
            rounded-3xl
            shadow-sm
            p-4
            sm:p-5
            mb-6
          "
        >

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              gap-4
            "
          >

            {/* SEARCH */}

            <div className="relative flex-1 min-w-0">

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />

              <input
                type="text"
                placeholder="Search projects, codes or roles..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  w-full
                  h-12
                  pl-11
                  pr-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  transition
                  focus:border-[#2f6b4f]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#2f6b4f]/10
                "
              />


              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    w-7
                    h-7
                    rounded-lg
                    bg-slate-100
                    text-slate-400
                    flex
                    items-center
                    justify-center
                    hover:bg-slate-200
                    hover:text-slate-700
                  "
                >
                  <X size={14} />
                </button>
              )}

            </div>


            {/* STATUS */}

            <div
              className="
                flex
                items-center
                gap-2
                overflow-x-auto
                pb-1
                lg:pb-0
              "
            >

              {[
                "ALL",
                "IN_PROGRESS",
                "COMPLETED",
                "ON_HOLD",
                "PLANNED",
              ].map((status) => {

                const active =
                  statusFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status)
                    }
                    className={`
                      shrink-0
                      px-3.5
                      py-2.5
                      rounded-xl
                      border
                      text-xs
                      font-bold
                      transition
                      ${
                        active
                          ? "bg-[#2f6b4f] border-[#2f6b4f] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-[#b9d1c1] hover:text-[#2f6b4f]"
                      }
                    `}
                  >
                    {status === "ALL"
                      ? "All"
                      : status.replace(
                          "_",
                          " "
                        )}
                  </button>
                );
              })}

            </div>

          </div>


          {/* RESULT BAR */}

          <div
            className="
              mt-4
              pt-4
              border-t
              border-slate-100
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-3
            "
          >

            <div className="flex items-center gap-2">

              <div
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-[#4d8b65]
                "
              />

              <p className="text-xs text-slate-500">

                Showing{" "}

                <span className="font-extrabold text-slate-700">
                  {filteredProjects.length}
                </span>

                {" "}of{" "}

                <span className="font-extrabold text-slate-700">
                  {projects.length}
                </span>

                {" "}projects

              </p>

            </div>


            {(search ||
              statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="
                  self-start
                  sm:self-auto
                  text-xs
                  font-bold
                  text-[#2f6b4f]
                  hover:underline
                "
              >
                Clear filters
              </button>
            )}

          </div>

        </section>


        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (

          <LoadingState />

        ) : filteredProjects.length === 0 ? (

          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "ALL"
            }
            onClear={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          />

        ) : (

          <div>

            {/* Section heading */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                mb-4
              "
            >

              <div>

                <p
                  className="
                    text-[11px]
                    uppercase
                    tracking-[0.14em]
                    text-[#2f6b4f]
                    font-extrabold
                  "
                >
                  Your Workspace
                </p>

                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Assigned Projects
                </h2>

              </div>


              {overdueProjects > 0 && (
                <div
                  className="
                    hidden
                    sm:flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    rounded-xl
                    bg-red-50
                    border border-red-100
                    text-red-600
                    text-xs
                    font-bold
                  "
                >
                  <AlertTriangle size={14} />

                  {overdueProjects} overdue
                </div>
              )}

            </div>


            {/* PROJECT GRID */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-5
              "
            >

              {filteredProjects.map(
                (project) => (
                  <ProjectCard
                    key={project.project_id}
                    project={project}
                    onView={() =>
                      handleOpenDetail(
                        project.project_id
                      )
                    }
                    formatDate={formatDate}
                  />
                )
              )}

            </div>

          </div>
        )}

      </div>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProject(null);
          setDetailError(null);
        }}
        title="Project Workspace"
        maxWidth="620px"
      >

        {loadingDetails ? (

          <div className="py-14 text-center">

            <div
              className="
                w-12 h-12
                rounded-2xl
                bg-[#e8f2ec]
                text-[#2f6b4f]
                flex
                items-center
                justify-center
                mx-auto
              "
            >
              <Loader2
                size={24}
                className="animate-spin"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading project details...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Retrieving your assignment information
            </p>

          </div>

        ) : detailError ? (

          <div className="py-12 text-center">

            <div
              className="
                w-14 h-14
                rounded-2xl
                bg-red-50
                text-red-500
                flex
                items-center
                justify-center
                mx-auto
              "
            >
              <AlertTriangle size={25} />
            </div>

            <h3 className="mt-5 font-extrabold text-slate-900">
              Unable to load project
            </h3>

            <p className="mt-2 text-sm text-slate-500 leading-6">
              {detailError}
            </p>

            <button
              type="button"
              onClick={() =>
                handleOpenDetail(
                  currentProjectId
                )
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-[#2f6b4f]
                text-white
                text-sm
                font-bold
                hover:bg-[#3b795b]
                transition
              "
            >
              <RefreshCw size={15} />
              Retry
            </button>

          </div>

        ) : selectedProject ? (

          <ProjectDetail
            selectedProject={selectedProject}
            formatDate={formatDate}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedProject(null);
            }}
          />

        ) : null}

      </Modal>

    </AppLayout>
  );
}


/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        bg-white/[0.06]
        border border-white/[0.08]
        p-4
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            w-9 h-9
            rounded-xl
            bg-[#2f6b4f]/30
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">

          <p
            className="
              text-[10px]
              sm:text-[11px]
              uppercase
              tracking-wide
              text-slate-400
              font-bold
            "
          >
            {label}
          </p>

          <p className="text-xl font-extrabold mt-1">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  onView,
  formatDate,
}) {
  const progress = Math.min(
    Math.max(
      project.progress_percentage || 0,
      0
    ),
    100
  );

  return (
    <article
      className="
        group
        bg-white
        border border-slate-200
        rounded-3xl
        shadow-sm
        overflow-hidden
        flex
        flex-col
        min-w-0
        hover:border-[#c4d9ca]
        hover:shadow-[0_18px_40px_rgba(23,37,31,0.08)]
        transition-all
        duration-200
      "
    >

      {/* TOP ACCENT */}

      <div
        className="
          h-1.5
          bg-[#2f6b4f]
        "
      />


      <div className="p-5 flex-1">

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >

          <span
            className="
              inline-flex
              max-w-[58%]
              px-2.5
              py-1.5
              rounded-lg
              bg-[#f1f7f3]
              border border-[#dce9df]
              text-[#2f6b4f]
              text-[10px]
              font-extrabold
              font-mono
              break-all
            "
          >
            {project.project_code}
          </span>

          <ProjectStatusBadge
            status={project.status}
          />

        </div>


        {/* PROJECT NAME */}

        <h3
          className="
            mt-5
            text-xl
            font-extrabold
            text-slate-900
            leading-6
            break-words
          "
        >
          {project.name}
        </h3>


        {/* DESCRIPTION */}

        <p
          className="
            mt-2
            text-sm
            text-slate-500
            leading-6
            line-clamp-2
            min-h-[48px]
          "
        >
          {project.description ||
            "No project description provided."}
        </p>


        {/* ROLE */}

        <div
          className="
            mt-5
            rounded-2xl
            bg-[#f7faf8]
            border border-[#e2ebe5]
            p-4
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                w-9 h-9
                rounded-xl
                bg-[#e8f2ec]
                text-[#2f6b4f]
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <UserCheck size={16} />
            </div>

            <div className="min-w-0">

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wide
                  font-bold
                  text-slate-400
                "
              >
                Your Role
              </p>

              <p
                className="
                  text-sm
                  font-extrabold
                  text-slate-800
                  mt-0.5
                  truncate
                "
              >
                {project.project_role_name ||
                  "Not specified"}
              </p>

            </div>

          </div>

        </div>


        {/* INFORMATION */}

        <div className="mt-5 space-y-3">

          <ProjectMeta
            icon={Calendar}
            label="Start Date"
            value={formatDate(
              project.start_date
            )}
          />

          <ProjectMeta
            icon={Clock}
            label="Target End"
            value={
              project.end_date
                ? formatDate(
                    project.end_date
                  )
                : "Ongoing"
            }
            danger={project.is_overdue}
          />

          <ProjectMeta
            icon={Users}
            label="Team"
            value={`${project.team_members_count || 0} members`}
          />

        </div>


        {/* PRIORITY */}

        <div className="mt-5">

          <ProjectPriorityBadge
            priority={project.priority}
          />

        </div>


        {/* PROGRESS */}

        <div className="mt-5">

          <div
            className="
              flex
              items-center
              justify-between
              mb-2
            "
          >

            <div className="flex items-center gap-2">

              <Target
                size={14}
                className="text-[#2f6b4f]"
              />

              <span className="text-xs font-bold text-slate-500">
                Progress
              </span>

            </div>

            <span
              className="
                text-xs
                font-extrabold
                text-[#2f6b4f]
              "
            >
              {progress}%
            </span>

          </div>


          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="
                h-full
                bg-[#2f6b4f]
                rounded-full
                transition-all
              "
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <div
        className="
          border-t
          border-slate-100
          bg-[#fafcfb]
          p-4
        "
      >

        <button
          type="button"
          onClick={onView}
          className="
            w-full
            inline-flex
            items-center
            justify-between
            gap-3
            px-4
            py-3
            rounded-xl
            bg-white
            border border-slate-200
            text-slate-700
            text-sm
            font-bold
            hover:border-[#b9d1c1]
            hover:text-[#2f6b4f]
            transition
          "
        >

          <span className="flex items-center gap-2">
            <Eye size={15} />
            View Workspace
          </span>

          <ArrowRight
            size={16}
            className="
              group-hover:translate-x-1
              transition-transform
            "
          />

        </button>

      </div>

    </article>
  );
}


/* =========================================================
   PROJECT META
========================================================= */

function ProjectMeta({
  icon: Icon,
  label,
  value,
  danger = false,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
      "
    >

      <span
        className="
          flex
          items-center
          gap-2
          text-xs
          text-slate-500
          min-w-0
        "
      >
        <Icon
          size={14}
          className="text-[#2f6b4f] shrink-0"
        />

        {label}
      </span>

      <strong
        className={`
          text-xs
          text-right
          break-words
          ${
            danger
              ? "text-red-600"
              : "text-slate-700"
          }
        `}
      >
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   PROJECT DETAIL
========================================================= */

function ProjectDetail({
  selectedProject,
  formatDate,
  onClose,
}) {
  const project = selectedProject.project;

  const progress =
    typeof project?.progress_percentage ===
    "number"
      ? Math.min(
          Math.max(
            project.progress_percentage,
            0
          ),
          100
        )
      : 0;

  return (
    <div className="space-y-5">

      {/* HERO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          bg-[#17251F]
          text-white
          p-6
        "
      >

        <div
          className="
            absolute
            -right-16
            -top-16
            w-44
            h-44
            rounded-full
            bg-[#2f6b4f]/20
          "
        />

        <div className="relative z-10">

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <span
              className="
                px-2.5
                py-1
                rounded-lg
                bg-white/10
                text-xs
                font-bold
                font-mono
              "
            >
              {project?.project_code}
            </span>

            <ProjectStatusBadge
              status={project?.status}
            />

            {project?.priority && (
              <ProjectPriorityBadge
                priority={project.priority}
              />
            )}

          </div>


          <h2
            className="
              text-2xl
              font-extrabold
              mt-4
              break-words
            "
          >
            {project?.name}
          </h2>


          <p className="text-sm text-slate-400 mt-2">
            Your project assignment
          </p>

        </div>

      </div>


      {/* MY ROLE */}

      <div
        className="
          rounded-2xl
          bg-[#f1f7f3]
          border border-[#dce9df]
          p-5
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              w-11 h-11
              rounded-xl
              bg-[#2f6b4f]
              text-white
              flex
              items-center
              justify-center
            "
          >
            <UserCheck size={18} />
          </div>

          <div>

            <p
              className="
                text-[10px]
                uppercase
                tracking-wide
                font-extrabold
                text-slate-400
              "
            >
              Your Project Role
            </p>

            <p className="text-lg font-extrabold text-[#2f6b4f] mt-1">
              {selectedProject.my_role ||
                "Not specified"}
            </p>

          </div>

        </div>

      </div>


      {/* DESCRIPTION */}

      <div>

        <p
          className="
            text-[11px]
            uppercase
            tracking-wide
            font-extrabold
            text-slate-400
          "
        >
          About this project
        </p>

        <p
          className="
            mt-2
            text-sm
            text-slate-600
            leading-7
            break-words
          "
        >
          {project?.description ||
            "No description provided for this project."}
        </p>

      </div>


      {/* INFORMATION GRID */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-3
        "
      >

        <DetailItem
          icon={Calendar}
          label="Assigned On"
          value={formatDate(
            selectedProject.assigned_date
          )}
        />

        <DetailItem
          icon={Calendar}
          label="Start Date"
          value={formatDate(
            project?.start_date
          )}
        />

        <DetailItem
          icon={Clock}
          label="Target Completion"
          value={
            formatDate(project?.end_date)
          }
          danger={project?.is_overdue}
        />

        <DetailItem
          icon={CircleDot}
          label="Status"
          value={
            project?.status?.replace(
              "_",
              " "
            ) || "N/A"
          }
        />

      </div>


      {/* PROGRESS */}

      <div
        className="
          rounded-2xl
          bg-slate-50
          border border-slate-200
          p-5
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            mb-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wide
                font-extrabold
                text-slate-400
              "
            >
              Project Progress
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Overall completion
            </p>

          </div>

          <span
            className="
              text-2xl
              font-extrabold
              text-[#2f6b4f]
            "
          >
            {progress}%
          </span>

        </div>


        <ProgressBar
          percentage={progress}
          height={9}
        />

      </div>


      {/* CLOSE */}

      <button
        type="button"
        onClick={onClose}
        className="
          w-full
          py-3
          rounded-xl
          border border-slate-200
          bg-white
          text-slate-700
          text-sm
          font-bold
          hover:bg-slate-50
          transition
        "
      >
        Close
      </button>

    </div>
  );
}


/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
  danger = false,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-slate-200
        bg-slate-50
        p-4
      "
    >

      <div className="flex items-start gap-3">

        <div
          className="
            w-9 h-9
            rounded-xl
            bg-[#e8f2ec]
            text-[#2f6b4f]
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon size={15} />
        </div>

        <div className="min-w-0">

          <p
            className="
              text-[10px]
              uppercase
              tracking-wide
              font-bold
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              text-sm
              font-extrabold
              break-words
              ${
                danger
                  ? "text-red-600"
                  : "text-slate-800"
              }
            `}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-3xl
        shadow-sm
        p-14
        text-center
      "
    >

      <div
        className="
          w-14 h-14
          rounded-2xl
          bg-[#e8f2ec]
          text-[#2f6b4f]
          flex
          items-center
          justify-center
          mx-auto
        "
      >
        <Loader2
          size={25}
          className="animate-spin"
        />
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">
        Loading your workspace
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Fetching your assigned projects...
      </p>

    </div>
  );
}


/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  hasFilters,
  onClear,
}) {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-3xl
        shadow-sm
        p-12
        text-center
      "
    >

      <div
        className="
          w-16 h-16
          rounded-2xl
          bg-[#e8f2ec]
          text-[#2f6b4f]
          flex
          items-center
          justify-center
          mx-auto
        "
      >
        <FolderGit2 size={28} />
      </div>


      <h3 className="mt-5 text-xl font-extrabold text-slate-900">
        {hasFilters
          ? "No projects found"
          : "No assigned projects"}
      </h3>


      <p
        className="
          max-w-md
          mx-auto
          mt-2
          text-sm
          text-slate-500
          leading-6
        "
      >
        {hasFilters
          ? "Nothing matches your current search or status filter. Try changing your filters."
          : "You are currently not assigned to any project. Contact HR or your project manager for assignments."}
      </p>


      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-[#2f6b4f]
            text-white
            text-sm
            font-bold
            hover:bg-[#3b795b]
            transition
          "
        >
          Clear Filters
          <ChevronRight size={15} />
        </button>
      )}

    </div>
  );
}