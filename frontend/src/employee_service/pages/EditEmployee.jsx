import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Save,
  Loader2,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

import {
  getEmployeeById,
  updateEmployee,
} from "../services/employeeApi";

import BackToDashboard from "../../shared/components/BackToDashboard";
import AppLayout from "../../shared/components/AppLayout";

import {
  showSuccess,
  showError,
} from "../../shared/utils/toast";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    joining_date: "",
    employment_status: "ACTIVE",
  });

  const [employeeCode, setEmployeeCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------
  // LOAD EMPLOYEE
  // --------------------------------------------------

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeById(id);
        const emp = res.data;

        setEmployeeCode(emp.employee_code);

        setFormData({
          first_name: emp.first_name || "",
          last_name: emp.last_name || "",
          email: emp.email || "",
          phone: emp.phone || "",
          date_of_birth: emp.date_of_birth || "",
          address: emp.address || "",
          joining_date: emp.joining_date || "",
          employment_status:
            emp.employment_status || "ACTIVE",
        });
      } catch (err) {
        showError(
          err.response?.data?.detail ||
            "Failed to load employee."
        );

        navigate("/hr/employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  // --------------------------------------------------
  // HANDLE CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateEmployee(id, formData);

      showSuccess(
        `Employee ${employeeCode} updated successfully!`
      );

      navigate(`/hr/employees/${id}`);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to update employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <AppLayout title="Edit Employee">
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f6b4f]" />

            <p className="text-sm font-semibold text-slate-700">
              Loading employee profile...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we retrieve the employee details.
            </p>

          </div>

        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Employee">

      <div className="w-full min-w-0 pb-10">

        {/* =====================================================
            BACK
        ====================================================== */}

        <div className="mb-5">
          <BackToDashboard
            to={`/hr/employees/${id}`}
            role="HR"
          />
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#17251F] px-5 py-7 text-white shadow-sm sm:px-7 lg:px-9 lg:py-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-emerald-300">

                <BriefcaseBusiness size={18} />

                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  People Management
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Edit Employee
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Update employee information, contact details,
                employment status, and profile records.
              </p>

            </div>

            {/* EMPLOYEE CODE */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Employee Code
              </p>

              <p className="mt-1 font-mono text-lg font-bold text-emerald-300">
                {employeeCode}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-5"
        >

          {/* ===================================================
              PERSONAL INFORMATION
          ==================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                  <UserRound size={19} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-800">
                    Personal Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Update the employee's personal details
                  </p>

                </div>

              </div>

            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              {/* FIRST NAME */}

              <FormField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                icon={<UserRound size={17} />}
              />

              {/* LAST NAME */}

              <FormField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                icon={<UserRound size={17} />}
              />

              {/* EMAIL */}

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                icon={<Mail size={17} />}
              />

              {/* PHONE */}

              <FormField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone size={17} />}
              />

              {/* DOB */}

              <FormField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                icon={<CalendarDays size={17} />}
              />

              {/* JOINING DATE */}

              <FormField
                label="Joining Date"
                name="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={handleChange}
                icon={<CalendarDays size={17} />}
              />

              {/* ADDRESS */}

              <div className="sm:col-span-2">

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Address
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                  />

                  <textarea
                    name="address"
                    rows="4"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter employee address..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ===================================================
              EMPLOYMENT STATUS
          ==================================================== */}

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                  <ShieldCheck size={19} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-800">
                    Employment Status
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Control the current employment state
                  </p>

                </div>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Status
              </label>

              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10 sm:max-w-md"
              >

                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>

                <option value="ON_NOTICE">
                  ON NOTICE
                </option>

                <option value="TERMINATED">
                  TERMINATED
                </option>

              </select>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Changing this status may affect the employee's
                access and availability within the HRMS.
              </p>

            </div>

          </section>

          {/* ===================================================
              UPDATE NOTICE
          ==================================================== */}

          <div className="mt-5 rounded-2xl border border-[#cce2d5] bg-[#f2f8f4] p-4 sm:p-5">

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcefe3] text-[#2f6b4f]">
                <Save size={15} />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#24543c]">
                  Save employee changes
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Review the information carefully before
                  saving. Your changes will update the employee
                  record immediately.
                </p>

              </div>

            </div>

          </div>

          {/* ===================================================
              ACTIONS
          ==================================================== */}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                navigate(`/hr/employees/${id}`)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24543c] disabled:cursor-not-allowed disabled:opacity-60"
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
                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </AppLayout>
  );
}

/* =============================================================
   FORM FIELD
============================================================= */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  icon,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">

        {label}

        {required && (
          <span className="ml-1 text-[#2f6b4f]">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
        />

      </div>

    </div>
  );
}