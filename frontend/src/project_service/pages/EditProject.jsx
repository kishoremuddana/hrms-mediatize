import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FolderPen,
  CalendarDays,
  Flag,
  FileText,
  Save,
  X,
  Loader2,
  Gauge,
  ArrowLeft,
  CircleDot,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  getProjectById,
  updateProject,
} from "../services/projectApi";

import {
  showSuccess,
  showError,
} from "../../shared/utils/toast";


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    priority: "MEDIUM",
    progress_percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  /* =======================================================
     LOAD PROJECT
  ======================================================= */

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);

      try {
        const res = await getProjectById(id);
        const p = res.data;

        setFormData({
          name: p.name || "",
          description: p.description || "",
          start_date: p.start_date || "",
          end_date: p.end_date || "",
          priority: p.priority || "MEDIUM",
          progress_percentage:
            p.progress_percentage || 0,
        });
      } catch (err) {
        showError(
          err.response?.data?.detail ||
            "Failed to load project details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);


  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =======================================================
     UPDATE PROJECT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,

        description: formData.description
          ? formData.description.trim()
          : null,

        start_date: formData.start_date,

        end_date: formData.end_date
          ? formData.end_date
          : null,

        priority: formData.priority,

        progress_percentage: parseInt(
          formData.progress_percentage,
          10
        ),
      };

      await updateProject(id, payload);

      showSuccess(
        "Project updated successfully!"
      );

      navigate(`/hr/projects/${id}`);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to update project."
      );
    } finally {
      setSubmitting(false);
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <AppLayout title="Edit Project">
        <div className="min-h-[65vh] flex items-center justify-center">
          <div className="text-center">

            <div
              className="
                w-12 h-12
                rounded-full
                border-4
                border-slate-200
                border-t-[#2f6b4f]
                animate-spin
                mx-auto
                mb-4
              "
            />

            <p className="text-sm font-bold text-slate-700">
              Loading project...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Preparing the project editor
            </p>

          </div>
        </div>
      </AppLayout>
    );
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <AppLayout title="Edit Project">

      <div className="w-full max-w-7xl mx-auto pb-12">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-5">
          <BackToDashboard
            to={`/hr/projects/${id}`}
            role="HR"
          />
        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[30px]
            bg-[#17251F]
            text-white
            shadow-[0_20px_50px_rgba(23,37,31,0.13)]
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
              right-28
              -bottom-32
              w-72
              h-72
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
                lg:items-center
                lg:justify-between
                gap-7
              "
            >

              {/* LEFT */}

              <div className="flex items-start gap-4 min-w-0">

                <div
                  className="
                    w-14 h-14
                    rounded-2xl
                    bg-[#2f6b4f]
                    text-white
                    flex
                    items-center
                    justify-center
                    shrink-0
                    shadow-lg
                  "
                >
                  <FolderPen size={25} />
                </div>

                <div className="min-w-0">

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-[#a9c8b4]
                      mb-2
                    "
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">
                      Project Workspace
                    </span>
                  </div>

                  <h1
                    className="
                      text-3xl
                      sm:text-4xl
                      font-extrabold
                      tracking-tight
                    "
                  >
                    Edit Project
                  </h1>

                  <p
                    className="
                      mt-2
                      text-sm
                      sm:text-base
                      text-slate-300
                      max-w-2xl
                      leading-6
                    "
                  >
                    Update project information, timeline,
                    priority and completion progress.
                  </p>

                </div>
              </div>


              {/* CURRENT PROGRESS */}

              <div
                className="
                  min-w-[190px]
                  rounded-2xl
                  bg-white/[0.06]
                  border border-white/[0.08]
                  p-5
                "
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Gauge
                      size={16}
                      className="text-[#a9c8b4]"
                    />

                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.12em]
                        font-bold
                        text-slate-400
                      "
                    >
                      Completion
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    100%
                  </span>

                </div>


                <p
                  className="
                    text-4xl
                    font-extrabold
                    text-[#a9c8b4]
                    mt-2
                  "
                >
                  {formData.progress_percentage}%
                </p>


                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">

                  <div
                    className="
                      h-full
                      bg-[#6da27f]
                      rounded-full
                      transition-all
                    "
                    style={{
                      width: `${Math.min(
                        Math.max(
                          formData.progress_percentage,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =================================================
            EDITOR LAYOUT
        ================================================= */}

        <form onSubmit={handleSubmit}>

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-[1fr_360px]
              gap-6
              items-start
            "
          >

            {/* =================================================
                LEFT — EDITOR
            ================================================= */}

            <div className="space-y-6">

              {/* PROJECT BASICS */}

              <section
                className="
                  bg-white
                  border border-slate-200
                  rounded-3xl
                  shadow-sm
                  overflow-hidden
                "
              >

                <div
                  className="
                    px-6
                    py-5
                    border-b
                    border-slate-100
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-[#e8f2ec]
                      text-[#2f6b4f]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <FolderPen size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Project Basics
                    </h2>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Core information about the project
                    </p>
                  </div>

                </div>


                <div className="p-6">

                  {/* NAME */}

                  <FormField
                    label="Project Name"
                    required
                    icon={<FolderPen size={15} />}
                  >

                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className={inputClass}
                    />

                  </FormField>


                  {/* DESCRIPTION */}

                  <div className="mt-6">

                    <FormField
                      label="Description"
                      icon={<FileText size={15} />}
                      hint="Describe the project's purpose, goals and scope."
                    >

                      <textarea
                        name="description"
                        rows={7}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe this project..."
                        className="
                          w-full
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-3
                          text-sm
                          text-slate-800
                          outline-none
                          resize-y
                          min-h-[160px]
                          transition
                          placeholder:text-slate-400
                          focus:border-[#2f6b4f]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#2f6b4f]/10
                        "
                      />

                    </FormField>

                  </div>

                </div>

              </section>


              {/* TIMELINE */}

              <section
                className="
                  bg-white
                  border border-slate-200
                  rounded-3xl
                  shadow-sm
                  overflow-hidden
                "
              >

                <div
                  className="
                    px-6
                    py-5
                    border-b
                    border-slate-100
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10 h-10
                        rounded-xl
                        bg-[#e8f2ec]
                        text-[#2f6b4f]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <CalendarDays size={18} />
                    </div>

                    <div>

                      <h2 className="text-base font-extrabold text-slate-900">
                        Project Timeline
                      </h2>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Define when the project starts and ends
                      </p>

                    </div>

                  </div>

                </div>


                <div className="p-6">

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >

                    <FormField
                      label="Start Date"
                      required
                    >

                      <div className="relative">

                        <CalendarDays
                          size={16}
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            pointer-events-none
                          "
                        />

                        <input
                          type="date"
                          name="start_date"
                          required
                          value={formData.start_date}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                        />

                      </div>

                    </FormField>


                    <FormField
                      label="End Date"
                      hint="Leave empty if this is an ongoing project."
                    >

                      <div className="relative">

                        <Clock3
                          size={16}
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            pointer-events-none
                          "
                        />

                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                        />

                      </div>

                    </FormField>

                  </div>


                  {/* TIMELINE NOTE */}

                  <div
                    className="
                      mt-5
                      flex
                      items-start
                      gap-3
                      rounded-2xl
                      bg-[#f5f9f6]
                      border border-[#e1ece4]
                      p-4
                    "
                  >

                    <CalendarDays
                      size={17}
                      className="text-[#2f6b4f] mt-0.5 shrink-0"
                    />

                    <div>

                      <p className="text-xs font-bold text-[#24543c]">
                        Timeline reminder
                      </p>

                      <p className="text-[11px] text-slate-500 mt-1 leading-5">
                        Make sure the dates accurately represent
                        the expected project duration.
                      </p>

                    </div>

                  </div>

                </div>

              </section>


              {/* PRIORITY + PROGRESS */}

              <section
                className="
                  bg-white
                  border border-slate-200
                  rounded-3xl
                  shadow-sm
                  overflow-hidden
                "
              >

                <div
                  className="
                    px-6
                    py-5
                    border-b
                    border-slate-100
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10 h-10
                        rounded-xl
                        bg-[#e8f2ec]
                        text-[#2f6b4f]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Flag size={18} />
                    </div>

                    <div>

                      <h2 className="text-base font-extrabold text-slate-900">
                        Priority & Progress
                      </h2>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Control project importance and completion
                      </p>

                    </div>

                  </div>

                </div>


                <div className="p-6">

                  <div
                    className="
                      grid
                      grid-cols-1
                      lg:grid-cols-2
                      gap-7
                    "
                  >

                    {/* PRIORITY */}

                    <FormField
                      label="Priority Level"
                      required
                      icon={<Flag size={15} />}
                    >

                      <div className="grid grid-cols-2 gap-2">

                        {[
                          {
                            value: "LOW",
                            label: "Low",
                            description: "Normal workload",
                          },
                          {
                            value: "MEDIUM",
                            label: "Medium",
                            description: "Standard priority",
                          },
                          {
                            value: "HIGH",
                            label: "High",
                            description: "Needs attention",
                          },
                          {
                            value: "CRITICAL",
                            label: "Critical",
                            description: "Urgent",
                          },
                        ].map((item) => {

                          const active =
                            formData.priority ===
                            item.value;

                          return (
                            <button
                              type="button"
                              key={item.value}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  priority: item.value,
                                }))
                              }
                              className={`
                                text-left
                                p-3
                                rounded-xl
                                border
                                transition
                                ${
                                  active
                                    ? "border-[#a9c8b4] bg-[#e8f2ec]"
                                    : "border-slate-200 bg-white hover:border-[#c8d9ce] hover:bg-slate-50"
                                }
                              `}
                            >

                              <div className="flex items-center justify-between">

                                <span
                                  className={`
                                    text-xs
                                    font-extrabold
                                    ${
                                      active
                                        ? "text-[#2f6b4f]"
                                        : "text-slate-700"
                                    }
                                  `}
                                >
                                  {item.label}
                                </span>

                                {active && (
                                  <CheckCircle2
                                    size={15}
                                    className="text-[#2f6b4f]"
                                  />
                                )}

                              </div>

                              <p className="text-[10px] text-slate-400 mt-1">
                                {item.description}
                              </p>

                            </button>
                          );
                        })}

                      </div>

                    </FormField>


                    {/* PROGRESS */}

                    <div>

                      <div className="flex items-center justify-between mb-3">

                        <div className="flex items-center gap-2">

                          <Gauge
                            size={15}
                            className="text-[#2f6b4f]"
                          />

                          <label
                            className="
                              text-xs
                              font-bold
                              uppercase
                              tracking-wider
                              text-slate-600
                            "
                          >
                            Progress
                          </label>

                        </div>

                        <span
                          className="
                            px-3
                            py-1.5
                            rounded-lg
                            bg-[#e8f2ec]
                            text-[#2f6b4f]
                            text-sm
                            font-extrabold
                          "
                        >
                          {formData.progress_percentage}%
                        </span>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          p-5
                        "
                      >

                        <input
                          type="range"
                          name="progress_percentage"
                          min="0"
                          max="100"
                          value={formData.progress_percentage}
                          onChange={handleChange}
                          className="
                            w-full
                            cursor-pointer
                            accent-[#2f6b4f]
                          "
                        />


                        <div
                          className="
                            mt-3
                            flex
                            justify-between
                            text-[10px]
                            font-bold
                            text-slate-400
                          "
                        >
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>


                        <div className="mt-5">

                          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">

                            <div
                              className="
                                h-full
                                bg-[#2f6b4f]
                                rounded-full
                                transition-all
                              "
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    formData.progress_percentage,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT — SUMMARY
            ================================================= */}

            <aside className="xl:sticky xl:top-6 space-y-5">

              {/* LIVE PREVIEW */}

              <section
                className="
                  rounded-3xl
                  bg-[#17251F]
                  text-white
                  p-6
                  shadow-[0_16px_40px_rgba(23,37,31,0.12)]
                "
              >

                <div className="flex items-center gap-2 text-[#a9c8b4]">

                  <CircleDot size={15} />

                  <p className="text-[10px] uppercase tracking-[0.14em] font-bold">
                    Live Preview
                  </p>

                </div>


                <h3 className="text-xl font-extrabold mt-3 break-words">
                  {formData.name || "Untitled Project"}
                </h3>


                <p className="text-xs text-slate-400 mt-2">
                  Project workspace
                </p>


                <div className="mt-6">

                  <div className="flex justify-between items-center mb-2">

                    <span className="text-[11px] text-slate-400 font-bold">
                      Progress
                    </span>

                    <span className="text-sm font-extrabold text-[#a9c8b4]">
                      {formData.progress_percentage}%
                    </span>

                  </div>

                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">

                    <div
                      className="
                        h-full
                        bg-[#6da27f]
                        rounded-full
                        transition-all
                      "
                      style={{
                        width: `${Math.min(
                          Math.max(
                            formData.progress_percentage,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                <div className="mt-6 grid grid-cols-2 gap-3">

                  <PreviewItem
                    label="Priority"
                    value={formData.priority}
                  />

                  <PreviewItem
                    label="Start"
                    value={formData.start_date || "—"}
                  />

                  <PreviewItem
                    label="End"
                    value={formData.end_date || "Ongoing"}
                  />

                  <PreviewItem
                    label="State"
                    value={
                      formData.progress_percentage >=
                      100
                        ? "Completed"
                        : "Active"
                    }
                  />

                </div>

              </section>


              {/* UPDATE GUIDE */}

              <section
                className="
                  bg-white
                  border border-slate-200
                  rounded-3xl
                  p-6
                  shadow-sm
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-[#e8f2ec]
                      text-[#2f6b4f]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Save size={18} />
                  </div>

                  <div>

                    <h3 className="text-sm font-extrabold text-slate-900">
                      Before saving
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Quick checklist
                    </p>

                  </div>

                </div>


                <div className="mt-5 space-y-3">

                  <ChecklistItem
                    text="Project name is filled"
                    done={Boolean(
                      formData.name.trim()
                    )}
                  />

                  <ChecklistItem
                    text="Start date is selected"
                    done={Boolean(
                      formData.start_date
                    )}
                  />

                  <ChecklistItem
                    text="Priority is selected"
                    done={Boolean(
                      formData.priority
                    )}
                  />

                </div>

              </section>


              {/* WARNING */}

              <div
                className="
                  rounded-2xl
                  border border-[#eadfc5]
                  bg-[#fffaf0]
                  p-4
                "
              >

                <div className="flex gap-3">

                  <AlertTriangle
                    size={17}
                    className="text-amber-600 mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="text-xs font-bold text-amber-800">
                      Changes are immediate
                    </p>

                    <p className="text-[11px] leading-5 text-amber-700/80 mt-1">
                      Saving this form will update the project
                      information in the system.
                    </p>

                  </div>

                </div>

              </div>

            </aside>

          </div>


          {/* =================================================
              BOTTOM ACTION BAR
          ================================================= */}

          <div
            className="
              mt-6
              bg-white
              border border-slate-200
              rounded-3xl
              p-4
              sm:p-5
              shadow-sm
              flex
              flex-col-reverse
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <button
              type="button"
              onClick={() =>
                navigate(`/hr/projects/${id}`)
              }
              disabled={submitting}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                h-11
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                text-sm
                font-bold
                hover:bg-slate-50
                transition
                disabled:opacity-50
              "
            >
              <ArrowLeft size={16} />
              Cancel
            </button>


            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(`/hr/projects/${id}`)
                }
                disabled={submitting}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  h-11
                  rounded-xl
                  bg-[#f1f5f2]
                  text-[#2f6b4f]
                  text-sm
                  font-bold
                  hover:bg-[#e8f2ec]
                  transition
                  disabled:opacity-50
                "
              >
                <X size={16} />
                Discard
              </button>


              <button
                type="submit"
                disabled={submitting}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-6
                  h-11
                  rounded-xl
                  bg-[#2f6b4f]
                  text-white
                  text-sm
                  font-bold
                  shadow-sm
                  hover:bg-[#24543c]
                  transition
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Project
                  </>
                )}

              </button>

            </div>

          </div>

        </form>

      </div>

    </AppLayout>
  );
}


/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  icon,
  label,
  required = false,
  hint,
  children,
}) {
  return (
    <div>

      <div className="flex items-center gap-2 mb-2">

        {icon && (
          <span className="text-[#2f6b4f]">
            {icon}
          </span>
        )}

        <label
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-600
          "
        >
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


/* =========================================================
   PREVIEW ITEM
========================================================= */

function PreviewItem({ label, value }) {
  return (
    <div
      className="
        rounded-xl
        bg-white/[0.06]
        border border-white/[0.08]
        p-3
      "
    >

      <p className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">
        {label}
      </p>

      <p className="text-xs font-bold text-slate-200 mt-1 truncate">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   CHECKLIST
========================================================= */

function ChecklistItem({ text, done }) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`
          w-6 h-6
          rounded-full
          flex
          items-center
          justify-center
          shrink-0
          ${
            done
              ? "bg-[#e8f2ec] text-[#2f6b4f]"
              : "bg-slate-100 text-slate-300"
          }
        `}
      >
        <CheckCircle2 size={14} />
      </div>

      <span
        className={`
          text-xs font-semibold
          ${
            done
              ? "text-slate-700"
              : "text-slate-400"
          }
        `}
      >
        {text}
      </span>

    </div>
  );
}


/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass = `
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-slate-50
  px-4
  text-sm
  font-medium
  text-slate-800
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-[#2f6b4f]
  focus:bg-white
  focus:ring-4
  focus:ring-[#2f6b4f]/10
`;