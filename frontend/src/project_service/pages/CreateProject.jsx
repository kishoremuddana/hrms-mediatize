import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderPlus,
  ArrowLeft,
  Save,
  X,
  CalendarDays,
  Flag,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { createProject } from "../services/projectApi";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function CreateProject() {
  const [formData, setFormData] = useState({
    name: "",
    project_code: "",
    description: "",
    start_date: "",
    end_date: "",
    priority: "MEDIUM",
  });

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --------------------------------------------------
  // CREATE PROJECT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,

        ...(formData.project_code && {
          project_code: formData.project_code.trim(),
        }),

        ...(formData.description && {
          description: formData.description.trim(),
        }),

        start_date: formData.start_date,

        ...(formData.end_date && {
          end_date: formData.end_date,
        }),

        priority: formData.priority,
      };

      const res = await createProject(payload);

      showSuccess(
        `Project '${res.data.name}' (${res.data.project_code}) created successfully!`
      );

      navigate(`/hr/projects/${res.data.id}`);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to create project."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Project">

      <div className="w-full min-w-0 pb-10">

        {/* =====================================================
            BACK
        ====================================================== */}

        <div className="mb-5">
          <BackToDashboard
            to="/hr/projects/list"
            role="HR"
          />
        </div>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#17251F] text-white shadow-sm">

          <div className="px-5 py-7 sm:px-7 lg:px-9 lg:py-8">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2f6b4f] text-emerald-100">
                <FolderPlus size={23} />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Project Management
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Create New Project
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Set up a new project with its basic information,
                  timeline, and priority level.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            FORM
        ====================================================== */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* FORM HEADER */}

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                <FolderPlus size={18} />
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-800">
                  Project Information
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Enter the details required to create the project
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 lg:p-7"
          >

            {/* =================================================
                PROJECT NAME + CODE
            ================================================== */}

            <div className="grid gap-5 md:grid-cols-2">

              {/* PROJECT NAME */}

              <FormField
                icon={<FolderPlus size={17} />}
                label="Project Name"
                required
              >

                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. HRMS Project Management"
                  className={inputClass}
                />

              </FormField>

              {/* PROJECT CODE */}

              <FormField
                icon={<Hash size={17} />}
                label="Project Code"
                hint="Optional — automatically generated if left blank"
              >

                <input
                  type="text"
                  name="project_code"
                  value={formData.project_code}
                  onChange={handleChange}
                  placeholder="e.g. PRJ001"
                  className={`${inputClass} font-mono`}
                />

              </FormField>

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <div className="mt-5">

              <FormField
                icon={<FileText size={17} />}
                label="Project Description"
                hint="Add the project goals, scope, or summary"
              >

                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter detailed project summary, goals, scope, or important notes..."
                  className={`${inputClass} min-h-[130px] resize-y py-3`}
                />

              </FormField>

            </div>

            {/* =================================================
                DATE + PRIORITY
            ================================================== */}

            <div className="mt-5 grid gap-5 md:grid-cols-3">

              {/* START DATE */}

              <FormField
                icon={<CalendarDays size={17} />}
                label="Start Date"
                required
              >

                <input
                  type="date"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                  className={inputClass}
                />

              </FormField>

              {/* END DATE */}

              <FormField
                icon={<CalendarDays size={17} />}
                label="End Date"
                hint="Optional for ongoing projects"
              >

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={inputClass}
                />

              </FormField>

              {/* PRIORITY */}

              <FormField
                icon={<Flag size={17} />}
                label="Priority Level"
                required
              >

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={inputClass}
                >

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

              </FormField>

            </div>

            {/* =================================================
                PROJECT PREVIEW
            ================================================== */}

            <div className="mt-7 rounded-2xl border border-[#cce2d5] bg-[#f2f8f4] p-4 sm:p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dcefe3] text-[#2f6b4f]">
                  <FolderPlus size={17} />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-bold text-[#24543c]">
                    Project setup
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    The project will be created with the information
                    provided above. You can manage its team,
                    roles, and other project settings after creation.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  navigate("/hr/projects/list")
                }
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={17} />
                Cancel
              </button>

              {/* CREATE */}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-6 text-sm font-semibold text-white transition hover:bg-[#24543c] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Creating Project...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    Create Project
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

      </div>

    </AppLayout>
  );
}


/* =============================================================
   FORM FIELD
============================================================= */

function FormField({
  icon,
  label,
  required = false,
  hint,
  children,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center gap-2">

        <span className="text-[#2f6b4f]">
          {icon}
        </span>

        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

      </div>

      {children}

      {hint && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      )}

    </div>
  );
}


/* =============================================================
   INPUT CLASS
============================================================= */

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10";