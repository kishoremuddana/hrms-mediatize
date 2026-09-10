import React, { useEffect, useState } from "react";
import {
  UserRound,
  UserPlus,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Modal } from "../../shared/components/Modal";
import Button from "../../shared/components/Button";

import { getEmployees } from "../../employee_service/services/employeeApi";
import {
  getProjectRoles,
  assignEmployee,
} from "../services/projectApi";

import {
  showSuccess,
  showError,
} from "../../shared/utils/toast";

export default function AssignEmployeeModal({
  isOpen,
  onClose,
  projectId,
  onAssignmentSuccess,
}) {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("");

  const [selectedRoleId, setSelectedRoleId] =
    useState("");

  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [empRes, roleRes] = await Promise.all([
        getEmployees({
          limit: 100,
          employment_status: "ACTIVE",
        }),

        getProjectRoles({
          active_only: true,
        }),
      ]);

      const employeeList = empRes.data.items || [];
      const roleList = roleRes.data || [];

      setEmployees(employeeList);
      setRoles(roleList);

      if (roleList.length > 0) {
        setSelectedRoleId(String(roleList[0].id));
      }
    } catch (err) {
      showError(
        "Failed to load options for employee assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployeeObj = employees.find(
    (employee) =>
      String(employee.id) ===
      String(selectedEmployeeId)
  );

  const selectedRoleObj = roles.find(
    (role) =>
      String(role.id) ===
      String(selectedRoleId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      showError("Please select an employee to assign.");
      return;
    }

    if (!selectedRoleId) {
      showError("Please select a project role.");
      return;
    }

    setSubmitting(true);

    try {
      await assignEmployee(projectId, {
        employee_id: parseInt(
          selectedEmployeeId,
          10
        ),

        project_role_id: parseInt(
          selectedRoleId,
          10
        ),

        assigned_date: assignedDate,
      });

      showSuccess(
        "Employee assigned to project successfully!"
      );

      onClose();

      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to assign employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Employee"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            Assign Employee
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* =====================================================
            INTRO
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#dce7df] bg-[#f2f7f3]">

          <div className="flex items-start gap-4 p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2f6b4f] text-white shadow-sm">
              <UserPlus size={20} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17251f]">
                Add a project team member
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select an active employee, assign a project
                role, and specify when the assignment begins.
              </p>
            </div>

          </div>
        </div>


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f2ec] text-[#2f6b4f]">
              <Loader2
                size={22}
                className="animate-spin"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-[#34483c]">
              Loading assignment options
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Fetching active employees and project roles...
            </p>

          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* =================================================
                EMPLOYEE
            ================================================== */}

            <div>
              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm font-bold text-[#26382f]">
                  Employee
                  <span className="ml-1 text-[#b34d3d]">
                    *
                  </span>
                </label>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active only
                </span>

              </div>

              <div className="relative">

                <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-[#5f7769]">
                  <UserRound size={17} />
                </div>

                <select
                  value={selectedEmployeeId}
                  onChange={(e) =>
                    setSelectedEmployeeId(
                      e.target.value
                    )
                  }
                  required
                  className="w-full appearance-none rounded-xl border border-[#d8e2db] bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#26382f] outline-none transition focus:border-[#2f6b4f] focus:ring-4 focus:ring-[#2f6b4f]/10"
                >
                  <option value="">
                    Choose an active employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.first_name}{" "}
                      {employee.last_name}{" "}
                      ({employee.employee_code})
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

              {selectedEmployeeObj && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#dce7df] bg-[#f7faf8] p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f2ec] text-sm font-bold text-[#2f6b4f]">
                    {selectedEmployeeObj.first_name
                      ?.charAt(0)
                      ?.toUpperCase()}
                    {selectedEmployeeObj.last_name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-[#26382f]">
                      {selectedEmployeeObj.first_name}{" "}
                      {selectedEmployeeObj.last_name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Employee Code:{" "}
                      {selectedEmployeeObj.employee_code}
                    </p>

                  </div>

                  <CheckCircle2
                    size={17}
                    className="ml-auto shrink-0 text-[#2f6b4f]"
                  />

                </div>
              )}
            </div>


            {/* =================================================
                ROLE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-bold text-[#26382f]">
                Project Role
                <span className="ml-1 text-[#b34d3d]">
                  *
                </span>
              </label>

              <div className="relative">

                <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-[#5f7769]">
                  <BriefcaseBusiness size={17} />
                </div>

                <select
                  value={selectedRoleId}
                  onChange={(e) =>
                    setSelectedRoleId(
                      e.target.value
                    )
                  }
                  required
                  className="w-full appearance-none rounded-xl border border-[#d8e2db] bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#26382f] outline-none transition focus:border-[#2f6b4f] focus:ring-4 focus:ring-[#2f6b4f]/10"
                >
                  {roles.length === 0 && (
                    <option value="">
                      No active project roles available
                    </option>
                  )}

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

              {selectedRoleObj?.description && (
                <div className="mt-3 rounded-xl bg-[#f7faf8] px-3.5 py-3">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7d72]">
                    Role Description
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {selectedRoleObj.description}
                  </p>

                </div>
              )}

            </div>


            {/* =================================================
                DATE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-bold text-[#26382f]">
                Assignment Date
                <span className="ml-1 text-[#b34d3d]">
                  *
                </span>
              </label>

              <div className="relative">

                <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-[#5f7769]">
                  <CalendarDays size={17} />
                </div>

                <input
                  type="date"
                  value={assignedDate}
                  onChange={(e) =>
                    setAssignedDate(
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-[#d8e2db] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26382f] outline-none transition focus:border-[#2f6b4f] focus:ring-4 focus:ring-[#2f6b4f]/10"
                />

              </div>

              <p className="mt-2 text-xs text-slate-400">
                The employee will be considered assigned to
                this project from this date.
              </p>

            </div>


            {/* =================================================
                SUMMARY
            ================================================== */}

            {selectedEmployeeObj &&
              selectedRoleObj && (
                <div className="rounded-2xl border border-[#dce7df] bg-[#17251f] p-4 text-white">

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#bfe0ca]"
                    />

                    <span className="text-xs font-bold uppercase tracking-wider text-[#dcefe3]">
                      Assignment Summary
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">

                    <SummaryItem
                      label="Employee"
                      value={`${selectedEmployeeObj.first_name} ${selectedEmployeeObj.last_name}`}
                    />

                    <SummaryItem
                      label="Role"
                      value={selectedRoleObj.name}
                    />

                    <SummaryItem
                      label="Start Date"
                      value={assignedDate}
                    />

                  </div>

                </div>
              )}

          </form>
        )}

      </div>
    </Modal>
  );
}


/* ================================================================
   SUMMARY ITEM
================================================================ */

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-white">
        {value || "—"}
      </p>

    </div>
  );
}