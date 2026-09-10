import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  UserPlus,
  Edit,
  UserX,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  BriefcaseBusiness,
  Target,
  CircleDot,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { ConfirmDialog } from "../../shared/components/Modal";

import {
  getProjectById,
  getProjectTeam,
  updateProjectStatus,
  updateProjectProgress,
  removeEmployee,
} from "../services/projectApi";

import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
  ProjectProgress,
} from "../components/ProjectBadges";

import AssignEmployeeModal from "../components/AssignEmployeeModal";
import { showSuccess, showError } from "../../shared/utils/toast";


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#e8f2ec] text-[#2f6b4f] flex items-center justify-center shrink-0">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-800 mt-1 break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}


function TeamMemberCard({ member, onRemove }) {
  const isActive = member.assignment_status === "ACTIVE";

  return (
    <div
      className="
        group relative
        bg-white
        border border-slate-200
        rounded-2xl
        p-5
        hover:border-[#c4d9ca]
        hover:shadow-[0_12px_30px_rgba(23,37,31,0.07)]
        transition-all duration-200
      "
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {member.profile_photo_url ? (
            <img
              src={member.profile_photo_url}
              alt={member.employee_name}
              className="
                w-12 h-12
                rounded-2xl
                object-cover
                border border-slate-200
                shrink-0
              "
            />
          ) : (
            <div
              className="
                w-12 h-12
                rounded-2xl
                bg-[#e8f2ec]
                text-[#2f6b4f]
                flex items-center justify-center
                font-extrabold
                text-lg
                shrink-0
              "
            >
              {member.employee_name?.[0]?.toUpperCase() || "E"}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">
              {member.employee_name}
            </h3>

            <p className="text-xs text-[#2f6b4f] font-semibold mt-1">
              {member.employee_code}
            </p>
          </div>
        </div>

        {isActive ? (
          <span
            className="
              inline-flex items-center gap-1.5
              px-2.5 py-1
              rounded-full
              bg-[#e8f2ec]
              text-[#2f6b4f]
              text-[10px]
              font-extrabold
              uppercase
              shrink-0
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d8b65]" />
            Active
          </span>
        ) : (
          <span
            className="
              px-2.5 py-1
              rounded-full
              bg-slate-100
              text-slate-400
              text-[10px]
              font-extrabold
              uppercase
            "
          >
            Removed
          </span>
        )}
      </div>

      {/* Details */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
            Project Role
          </p>

          <span
            className="
              inline-flex
              mt-1.5
              px-2.5 py-1.5
              rounded-lg
              bg-[#f1f7f3]
              text-[#2f6b4f]
              text-xs
              font-bold
              border border-[#dce9df]
            "
          >
            {member.project_role_name || "Team Member"}
          </span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
            Assigned
          </p>

          <p className="text-sm font-semibold text-slate-700 mt-2">
            {member.assigned_date || "—"}
          </p>
        </div>
      </div>

      {/* Removed date */}
      {!isActive && member.removed_date && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Removed on{" "}
            <span className="font-semibold text-slate-600">
              {member.removed_date}
            </span>
          </p>
        </div>
      )}

      {/* Action */}
      {isActive && (
        <button
          onClick={() => onRemove(member)}
          className="
            w-full
            mt-5
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-xl
            bg-red-50
            border border-red-100
            text-red-600
            text-xs
            font-bold
            hover:bg-red-100
            transition
          "
        >
          <UserX size={14} />
          Remove from Project
        </button>
      )}
    </div>
  );
}


/* =========================================================
   STATUS WORKFLOW
========================================================= */

function StatusWorkflow({
  currentStatus,
  updatingStatus,
  onStatusChange,
}) {
  const statuses = [
    {
      value: "PLANNED",
      label: "Planned",
      description: "Not started",
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      description: "Currently active",
    },
    {
      value: "ON_HOLD",
      label: "On Hold",
      description: "Temporarily paused",
    },
    {
      value: "COMPLETED",
      label: "Completed",
      description: "Successfully finished",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      description: "Project stopped",
    },
  ];

  return (
    <div className="space-y-2">
      {statuses.map((status) => {
        const active = currentStatus === status.value;

        return (
          <button
            key={status.value}
            disabled={active || updatingStatus}
            onClick={() => onStatusChange(status.value)}
            className={`
              w-full
              flex items-center gap-3
              p-3
              rounded-xl
              border
              text-left
              transition-all
              ${
                active
                  ? "bg-[#e8f2ec] border-[#bcd4c4]"
                  : "bg-white border-slate-200 hover:border-[#c7dace] hover:bg-[#f8fbf9]"
              }
              ${
                updatingStatus
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }
            `}
          >
            <div
              className={`
                w-8 h-8 rounded-lg
                flex items-center justify-center
                shrink-0
                ${
                  active
                    ? "bg-[#2f6b4f] text-white"
                    : "bg-slate-100 text-slate-400"
                }
              `}
            >
              {active ? (
                <CheckCircle2 size={16} />
              ) : (
                <CircleDot size={16} />
              )}
            </div>

            <div className="min-w-0">
              <p
                className={`
                  text-xs font-bold
                  ${
                    active
                      ? "text-[#2f6b4f]"
                      : "text-slate-700"
                  }
                `}
              >
                {status.label}
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                {status.description}
              </p>
            </div>

            {active && (
              <span className="ml-auto text-[10px] font-extrabold text-[#2f6b4f] uppercase">
                Current
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HRProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [editingProgress, setEditingProgress] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);


  /* =====================================================
     LOAD PROJECT
  ===================================================== */

  const loadProjectData = async () => {
    setLoading(true);

    try {
      const [pRes, tRes] = await Promise.all([
        getProjectById(id),
        getProjectTeam(id),
      ]);

      setProject(pRes.data);
      setProgressVal(pRes.data.progress_percentage || 0);
      setTeam(tRes.data || []);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to load project details."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProjectData();
  }, [id]);


  /* =====================================================
     STATUS UPDATE
  ===================================================== */

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);

    try {
      const res = await updateProjectStatus(id, newStatus);

      setProject(res.data);

      showSuccess(
        `Project status updated to ${newStatus.replace(
          "_",
          " "
        )}`
      );
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to update status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  /* =====================================================
     PROGRESS SAVE
  ===================================================== */

  const handleProgressSave = async () => {
    setSavingProgress(true);

    try {
      const res = await updateProjectProgress(
        id,
        progressVal
      );

      setProject(res.data);
      setEditingProgress(false);

      showSuccess(
        "Project progress updated successfully!"
      );
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to update progress."
      );
    } finally {
      setSavingProgress(false);
    }
  };


  /* =====================================================
     REMOVE EMPLOYEE
  ===================================================== */

  const confirmRemoveEmployee = async () => {
    if (!removeTarget) return;

    setRemoving(true);

    try {
      await removeEmployee(
        id,
        removeTarget.assignment_id
      );

      showSuccess(
        `Removed ${removeTarget.employee_name} from project.`
      );

      setRemoveTarget(null);

      await loadProjectData();
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to remove employee."
      );
    } finally {
      setRemoving(false);
    }
  };


  const activeMembers = team.filter(
    (member) =>
      member.assignment_status === "ACTIVE"
  ).length;


  const progress = Math.min(
    Math.max(project?.progress_percentage || 0, 0),
    100
  );


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <AppLayout title="Project Details">
        <div className="min-h-[65vh] flex items-center justify-center">
          <div className="text-center">
            <div
              className="
                w-12 h-12
                border-4
                border-[#dce7df]
                border-t-[#2f6b4f]
                rounded-full
                animate-spin
                mx-auto
                mb-4
              "
            />

            <p className="text-sm font-semibold text-slate-500">
              Loading project workspace...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }


  /* =====================================================
     PROJECT NOT FOUND
  ===================================================== */

  if (!project) {
    return (
      <AppLayout title="Project Details">
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <div
              className="
                w-16 h-16
                rounded-2xl
                bg-red-50
                text-red-500
                flex items-center justify-center
                mx-auto
              "
            >
              <AlertCircle size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              Project not found
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              We couldn't load the requested project.
            </p>

            <button
              onClick={() =>
                navigate("/hr/projects/list")
              }
              className="
                mt-6
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-xl
                bg-[#2f6b4f]
                text-white
                text-sm
                font-bold
                hover:bg-[#3b795b]
                transition
              "
            >
              <ArrowLeft size={15} />
              Back to Projects
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }


  /* =====================================================
     UI
  ===================================================== */

  return (
    <AppLayout title="Project Details">

      <div className="w-full max-w-7xl mx-auto pb-12">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-5">
          <BackToDashboard
            to="/hr/projects/list"
            role="HR"
          />
        </div>


        {/* =================================================
            PROJECT HEADER
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-[#17251F]
            text-white
            shadow-[0_20px_50px_rgba(23,37,31,0.14)]
            mb-6
          "
        >
          {/* Decorative shapes */}

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
              right-20
              -bottom-32
              w-80
              h-80
              rounded-full
              bg-[#6da27f]/10
            "
          />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">

            {/* Header top */}

            <div className="flex flex-col xl:flex-row xl:justify-between gap-7">

              <div className="min-w-0">

                {/* Code / Status */}

                <div className="flex flex-wrap items-center gap-2 mb-5">

                  <span
                    className="
                      px-3 py-1.5
                      rounded-lg
                      bg-white/10
                      border border-white/10
                      text-xs
                      font-bold
                    "
                  >
                    {project.project_code}
                  </span>

                  <ProjectStatusBadge
                    status={project.status}
                  />

                  <ProjectPriorityBadge
                    priority={project.priority}
                  />

                  {project.is_overdue && (
                    <span
                      className="
                        inline-flex items-center gap-1.5
                        px-3 py-1.5
                        rounded-lg
                        bg-red-500/15
                        border border-red-400/20
                        text-red-300
                        text-xs
                        font-bold
                      "
                    >
                      <AlertCircle size={13} />
                      OVERDUE
                    </span>
                  )}
                </div>


                <div className="flex items-center gap-2 text-[#a9c8b4] mb-2">
                  <BriefcaseBusiness size={15} />

                  <span className="text-xs font-bold uppercase tracking-[0.16em]">
                    Project Workspace
                  </span>
                </div>


                <h1
                  className="
                    text-3xl
                    sm:text-4xl
                    lg:text-5xl
                    font-extrabold
                    tracking-tight
                    break-words
                  "
                >
                  {project.name}
                </h1>


                {project.description && (
                  <p
                    className="
                      mt-4
                      max-w-3xl
                      text-sm
                      sm:text-base
                      leading-7
                      text-slate-300
                    "
                  >
                    {project.description}
                  </p>
                )}
              </div>


              {/* Actions */}

              <div className="flex flex-wrap gap-3 shrink-0">

                <button
                  onClick={() =>
                    navigate(
                      `/hr/projects/${id}/edit`
                    )
                  }
                  className="
                    inline-flex items-center justify-center gap-2
                    px-4 py-2.5
                    rounded-xl
                    bg-white/10
                    border border-white/10
                    text-sm
                    font-semibold
                    hover:bg-white/15
                    transition
                  "
                >
                  <Edit size={16} />
                  Edit Project
                </button>


                <button
                  onClick={() =>
                    setAssignModalOpen(true)
                  }
                  className="
                    inline-flex items-center justify-center gap-2
                    px-4 py-2.5
                    rounded-xl
                    bg-[#2f6b4f]
                    text-white
                    text-sm
                    font-bold
                    shadow-lg
                    hover:bg-[#3b795b]
                    transition
                  "
                >
                  <UserPlus size={16} />
                  Assign Employee
                </button>

              </div>
            </div>


            {/* =================================================
                SNAPSHOT
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-3
                mt-9
              "
            >

              {/* Progress */}

              <div
                className="
                  rounded-2xl
                  bg-white/[0.06]
                  border border-white/[0.08]
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
                    Progress
                  </p>

                  <Target
                    size={16}
                    className="text-[#a9c8b4]"
                  />
                </div>

                <p className="text-3xl font-extrabold mt-2">
                  {progress}%
                </p>
              </div>


              {/* Team */}

              <div
                className="
                  rounded-2xl
                  bg-white/[0.06]
                  border border-white/[0.08]
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
                    Active Team
                  </p>

                  <Users
                    size={16}
                    className="text-[#a9c8b4]"
                  />
                </div>

                <p className="text-3xl font-extrabold mt-2">
                  {activeMembers}
                </p>
              </div>


              {/* Start */}

              <div
                className="
                  rounded-2xl
                  bg-white/[0.06]
                  border border-white/[0.08]
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
                    Start Date
                  </p>

                  <Calendar
                    size={16}
                    className="text-[#a9c8b4]"
                  />
                </div>

                <p className="text-sm font-bold mt-3">
                  {project.start_date || "—"}
                </p>
              </div>


              {/* End */}

              <div
                className="
                  rounded-2xl
                  bg-white/[0.06]
                  border border-white/[0.08]
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
                    End Date
                  </p>

                  <Clock
                    size={16}
                    className="text-[#a9c8b4]"
                  />
                </div>

                <p className="text-sm font-bold mt-3">
                  {project.end_date || "Ongoing"}
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* =================================================
            MAIN WORKSPACE
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-[1.35fr_0.85fr]
            gap-6
            mb-6
          "
        >

          {/* =================================================
              PROGRESS PANEL
          ================================================= */}

          <section
            className="
              bg-white
              border border-slate-200
              rounded-3xl
              p-6
              sm:p-7
              shadow-sm
            "
          >

            <div className="flex items-start justify-between gap-4">

              <div>
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.14em]
                    text-[#2f6b4f]
                    font-bold
                  "
                >
                  Project Health
                </p>

                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Project Progress
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Track how much of the project has been completed.
                </p>
              </div>

              <div
                className="
                  w-12 h-12
                  rounded-2xl
                  bg-[#e8f2ec]
                  text-[#2f6b4f]
                  flex items-center justify-center
                  shrink-0
                "
              >
                <Target size={22} />
              </div>

            </div>


            {/* Progress visual */}

            <div
              className="
                mt-7
                rounded-2xl
                bg-[#f7faf8]
                border border-[#e3ece6]
                p-5
              "
            >

              <div className="flex items-end justify-between gap-4 mb-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Completion
                  </p>

                  <p className="text-4xl font-extrabold text-[#2f6b4f] mt-1">
                    {progress}%
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Current status
                  </p>

                  <p className="text-sm font-bold text-slate-700 mt-1">
                    {project.status?.replace(
                      "_",
                      " "
                    )}
                  </p>
                </div>

              </div>


              <div className="h-4 bg-slate-200 rounded-full overflow-hidden">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-[#2f6b4f]
                    transition-all
                    duration-500
                  "
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>


            {/* Adjustment */}

            <div className="mt-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Adjust completion
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Update the project's current completion percentage.
                  </p>
                </div>


                <button
                  onClick={() =>
                    setEditingProgress(
                      !editingProgress
                    )
                  }
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2
                    rounded-xl
                    bg-[#e8f2ec]
                    text-[#2f6b4f]
                    text-xs
                    font-bold
                    hover:bg-[#dcefe3]
                    transition
                  "
                >
                  {editingProgress
                    ? "Cancel"
                    : "Adjust Progress"}
                </button>

              </div>


              {editingProgress && (
                <div
                  className="
                    mt-4
                    p-5
                    rounded-2xl
                    bg-slate-50
                    border border-slate-200
                  "
                >

                  <div className="flex flex-col gap-5">

                    <div className="flex items-center gap-4">

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressVal}
                        onChange={(e) =>
                          setProgressVal(
                            parseInt(
                              e.target.value,
                              10
                            )
                          )
                        }
                        className="
                          flex-1
                          accent-[#2f6b4f]
                        "
                      />

                      <span
                        className="
                          min-w-[52px]
                          text-center
                          px-2 py-2
                          rounded-lg
                          bg-[#e8f2ec]
                          text-[#2f6b4f]
                          text-sm
                          font-extrabold
                        "
                      >
                        {progressVal}%
                      </span>

                    </div>


                    <button
                      onClick={
                        handleProgressSave
                      }
                      disabled={savingProgress}
                      className="
                        self-start
                        inline-flex items-center gap-2
                        px-4 py-2.5
                        rounded-xl
                        bg-[#2f6b4f]
                        text-white
                        text-xs
                        font-bold
                        hover:bg-[#3b795b]
                        transition
                        disabled:opacity-60
                      "
                    >
                      <Save size={14} />

                      {savingProgress
                        ? "Saving..."
                        : "Save Progress"}
                    </button>

                  </div>

                </div>
              )}

            </div>

          </section>


          {/* =================================================
              PROJECT INFORMATION
          ================================================= */}

          <section
            className="
              bg-white
              border border-slate-200
              rounded-3xl
              p-6
              sm:p-7
              shadow-sm
            "
          >

            <div className="mb-6">

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.14em]
                  text-[#2f6b4f]
                  font-bold
                "
              >
                Project Information
              </p>

              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Project Details
              </h2>

            </div>


            <div className="space-y-5">

              <InfoItem
                icon={Calendar}
                label="Start Date"
                value={project.start_date}
              />

              <InfoItem
                icon={Clock}
                label="End Date"
                value={
                  project.end_date || "Ongoing"
                }
              />

              <InfoItem
                icon={Target}
                label="Priority"
                value={project.priority}
              />

              <InfoItem
                icon={CircleDot}
                label="Current Status"
                value={project.status?.replace(
                  "_",
                  " "
                )}
              />

            </div>

          </section>

        </div>


        {/* =================================================
            STATUS WORKFLOW
        ================================================= */}

        <section
          className="
            bg-white
            border border-slate-200
            rounded-3xl
            p-6
            sm:p-7
            shadow-sm
            mb-6
          "
        >

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            <div className="lg:max-w-sm">

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.14em]
                  text-[#2f6b4f]
                  font-bold
                "
              >
                Workflow
              </p>

              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Project Status
              </h2>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Move the project through its current operational stage.
              </p>

            </div>


            <div className="w-full lg:max-w-3xl">
              <StatusWorkflow
                currentStatus={project.status}
                updatingStatus={updatingStatus}
                onStatusChange={handleStatusChange}
              />
            </div>

          </div>

        </section>


        {/* =================================================
            TEAM
        ================================================= */}

        <section
          className="
            bg-slate-50
            border border-slate-200
            rounded-3xl
            p-5
            sm:p-7
          "
        >

          {/* Team header */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mb-6
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  w-12 h-12
                  rounded-2xl
                  bg-[#2f6b4f]
                  text-white
                  flex items-center justify-center
                  shadow-sm
                "
              >
                <Users size={21} />
              </div>

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.14em]
                    text-[#2f6b4f]
                    font-bold
                  "
                >
                  People
                </p>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Project Team
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {activeMembers} active{" "}
                  {activeMembers === 1
                    ? "member"
                    : "members"}{" "}
                  assigned
                </p>

              </div>

            </div>


            <button
              onClick={() =>
                setAssignModalOpen(true)
              }
              className="
                inline-flex
                items-center
                justify-center
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
              <UserPlus size={16} />
              Add Team Member
            </button>

          </div>


          {/* No team */}

          {team.length === 0 ? (
            <div
              className="
                bg-white
                border border-dashed
                border-slate-300
                rounded-3xl
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
                  flex items-center justify-center
                  mx-auto
                "
              >
                <Users size={27} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No team members yet
              </h3>

              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Start building this project by assigning employees to the team.
              </p>

              <button
                onClick={() =>
                  setAssignModalOpen(true)
                }
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
                <UserPlus size={15} />
                Assign Employee
              </button>

            </div>
          ) : (

            /* Team cards */

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-4
              "
            >

              {team.map((member) => (
                <TeamMemberCard
                  key={member.assignment_id}
                  member={member}
                  onRemove={setRemoveTarget}
                />
              ))}

            </div>

          )}

        </section>


        {/* =================================================
            MODALS
        ================================================= */}

        <AssignEmployeeModal
          isOpen={assignModalOpen}
          onClose={() =>
            setAssignModalOpen(false)
          }
          projectId={id}
          onAssignmentSuccess={
            loadProjectData
          }
        />


        <ConfirmDialog
          isOpen={Boolean(removeTarget)}
          onClose={() =>
            setRemoveTarget(null)
          }
          onConfirm={
            confirmRemoveEmployee
          }
          title="Remove Employee from Project"
          message={`Are you sure you want to remove ${removeTarget?.employee_name} from project '${project.name}'?`}
          confirmText="Remove Employee"
          confirmVariant="danger"
          loading={removing}
        />

      </div>

    </AppLayout>
  );
}