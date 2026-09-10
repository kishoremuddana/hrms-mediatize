import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  UserPlus,
  Loader2,
} from "lucide-react";

import BackToDashboard from "../../shared/components/BackToDashboard";
import AppLayout from "../../shared/components/AppLayout";
import { createEmployee } from "../services/employeeApi";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function CreateEmployee() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    joining_date: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        joining_date: formData.joining_date || null,
      };

      const res = await createEmployee(payload);

      showSuccess(
        `Employee ${res.data.employee_code} created successfully! Welcome email sent.`
      );

      navigate("/hr/employees");
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to create employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Employee">
      <div className="w-full min-w-0 pb-10">

        {/* =====================================================
            BACK NAVIGATION
        ====================================================== */}

        <div className="mb-5">
          <BackToDashboard
            to="/hr/employees"
            role="HR"
          />
        </div>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#17251F] px-5 py-7 text-white shadow-sm sm:px-7 lg:px-9 lg:py-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-emerald-300">

                <UserPlus size={18} />

                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  People Management
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Create Employee
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Add a new employee to your organization and
                create their employee profile.
              </p>

            </div>

            <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefe3] text-[#2f6b4f]">
                  <UserRound size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Employee Setup
                  </p>

                  <p className="text-sm font-semibold text-white">
                    New Profile
                  </p>
                </div>

              </div>

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
                    Basic information about the employee
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
                placeholder="e.g. John"
                required
                icon={<UserRound size={17} />}
              />

              {/* LAST NAME */}

              <FormField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Doe"
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
                placeholder="john.doe@mediatize.com"
                required
                icon={<Mail size={17} />}
              />

              {/* PHONE */}

              <FormField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
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
                    className="absolute left-3 top-3.5 text-slate-400"
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
              INFORMATION NOTE
          ==================================================== */}

          <div className="mt-5 rounded-2xl border border-[#cce2d5] bg-[#f2f8f4] p-4 sm:p-5">

            <div className="flex gap-3">

              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcefe3] text-[#2f6b4f]">
                <Mail size={15} />
              </div>

              <div>

                <p className="text-sm font-semibold text-[#24543c]">
                  Account notification
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  After the employee is created, the system
                  will send the employee their welcome email
                  with the required account information.
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
              onClick={() =>
                navigate("/hr/employees")
              }
              disabled={submitting}
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

                  Creating Employee...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Create Employee
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
   FORM FIELD COMPONENT
============================================================= */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
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
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
        />

      </div>

    </div>
  );
}