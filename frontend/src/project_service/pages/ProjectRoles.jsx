import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  Loader2,
  RefreshCw,
  UsersRound,
  ShieldCheck,
  ShieldOff,
  ArrowUpRight,
  X,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Modal from "../../shared/components/Modal";
import Input, { TextArea } from "../../shared/components/Input";

import {
  getProjectRoles,
  createProjectRole,
  updateProjectRole,
} from "../services/projectApi";

export default function ProjectRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // CREATE
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  // EDIT
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const fetchRoles = async () => {
    setLoading(true);

    try {
      const res = await getProjectRoles();
      setRoles(res.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to load project roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    setCreateErrors({});

    if (!createForm.name.trim()) {
      setCreateErrors({
        name: "Role name is required",
      });
      return;
    }

    setSubmittingCreate(true);

    try {
      await createProjectRole({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
      });

      toast.success(
        "Project role created successfully!"
      );

      setIsCreateOpen(false);

      setCreateForm({
        name: "",
        description: "",
      });

      fetchRoles();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to create project role";

      toast.error(msg);

      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("name")
      ) {
        setCreateErrors({
          name: msg,
        });
      }
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);

    setEditForm({
      name: role.name,
      description: role.description || "",
      is_active: role.is_active,
    });

    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) return;

    setEditErrors({});

    if (!editForm.name.trim()) {
      setEditErrors({
        name: "Role name is required",
      });
      return;
    }

    setSubmittingEdit(true);

    try {
      await updateProjectRole(
        selectedRole.id,
        {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          is_active: editForm.is_active,
        }
      );

      toast.success(
        "Project role updated successfully!"
      );

      setIsEditOpen(false);
      setSelectedRole(null);

      fetchRoles();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to update project role";

      toast.error(msg);

      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("name")
      ) {
        setEditErrors({
          name: msg,
        });
      }
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleStatus = async (role) => {
    const nextStatus = !role.is_active;

    try {
      await updateProjectRole(role.id, {
        is_active: nextStatus,
      });

      toast.success(
        `Role ${
          nextStatus ? "activated" : "deactivated"
        } successfully`
      );

      fetchRoles();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to change role status"
      );
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        role.name
          ?.toLowerCase()
          .includes(searchValue) ||
        role.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          role.is_active) ||
        (statusFilter === "INACTIVE" &&
          !role.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  const activeCount = roles.filter(
    (role) => role.is_active
  ).length;

  const inactiveCount = roles.filter(
    (role) => !role.is_active
  ).length;

  return (
    <AppLayout title="Project Roles">
      <div className="w-full max-w-7xl mx-auto pb-10">
        <BackToDashboard />

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-[#17251F] text-white mb-6">
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-[#2f6b4f]/20 translate-x-1/3 -translate-y-1/3" />

          <div className="absolute bottom-0 left-1/2 w-[260px] h-[260px] rounded-full bg-[#6da27f]/10 translate-y-1/2" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <BriefcaseBusiness size={21} />
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#a9c8b4] font-bold">
                      Project Administration
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Workforce configuration
                    </p>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight">
                  Project Roles
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-300 leading-7 max-w-xl">
                  Create and manage standardized roles
                  used when assigning employees to
                  projects across the organization.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={fetchRoles}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-sm font-semibold hover:bg-white/15 transition disabled:opacity-50"
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

                <button
                  type="button"
                  onClick={() => {
                    setCreateForm({
                      name: "",
                      description: "",
                    });

                    setCreateErrors({});
                    setIsCreateOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2f6b4f] text-white text-sm font-bold hover:bg-[#3b795b] transition shadow-lg"
                >
                  <Plus size={17} />
                  Create New Role
                </button>
              </div>
            </div>

            {/* =================================================
                STATS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-9">
              <StatCard
                icon={BriefcaseBusiness}
                label="Total Roles"
                value={roles.length}
              />

              <StatCard
                icon={ShieldCheck}
                label="Active Roles"
                value={activeCount}
              />

              <StatCard
                icon={ShieldOff}
                label="Inactive Roles"
                value={inactiveCount}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            TOOLBAR
        ====================================================== */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* SEARCH */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search role name or description..."
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10 transition"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                {
                  key: "ALL",
                  label: "All Roles",
                },
                {
                  key: "ACTIVE",
                  label: "Active",
                },
                {
                  key: "INACTIVE",
                  label: "Inactive",
                },
              ].map((filter) => {
                const active =
                  statusFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() =>
                      setStatusFilter(filter.key)
                    }
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                      active
                        ? "bg-[#17251F] border-[#17251F] text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-[#b9d1c1] hover:text-[#2f6b4f]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                {filteredRoles.length}
              </span>{" "}
              roles displayed
            </p>

            {(search ||
              statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="text-xs font-bold text-[#2f6b4f] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f2ec] text-[#2f6b4f] flex items-center justify-center mx-auto">
              <Loader2
                size={26}
                className="animate-spin"
              />
            </div>

            <h3 className="mt-5 font-bold text-slate-900">
              Loading project roles
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Fetching your organization's role
              configuration.
            </p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <EmptyState
            search={search}
            onCreate={() => {
              setCreateForm({
                name: "",
                description: "",
              });

              setCreateErrors({});
              setIsCreateOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() =>
                  handleOpenEdit(role)
                }
                onToggle={() =>
                  handleToggleStatus(role)
                }
              />
            ))}
          </div>
        )}

        {/* =====================================================
            CREATE MODAL
        ====================================================== */}

        <Modal
          isOpen={isCreateOpen}
          onClose={() =>
            !submittingCreate &&
            setIsCreateOpen(false)
          }
          title="Create Project Role"
        >
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-5">
              <div className="rounded-xl bg-[#e8f2ec] border border-[#d4e5da] p-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white text-[#2f6b4f] flex items-center justify-center shrink-0">
                    <BriefcaseBusiness size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#234d38]">
                      Define a reusable role
                    </p>

                    <p className="text-xs text-[#527461] mt-1 leading-5">
                      This role can later be assigned
                      to employees when they join a
                      project.
                    </p>
                  </div>
                </div>
              </div>

              <Input
                label="Role Name *"
                placeholder="e.g. Lead Developer"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    name: e.target.value,
                  })
                }
                error={createErrors.name}
                required
              />

              <TextArea
                label="Description"
                rows={4}
                placeholder="Describe the responsibilities of this role..."
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    description:
                      e.target.value,
                  })
                }
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsCreateOpen(false)
                  }
                  disabled={submittingCreate}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2f6b4f] text-white text-sm font-bold hover:bg-[#3b795b] transition disabled:opacity-60"
                >
                  {submittingCreate ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus size={15} />
                  )}

                  {submittingCreate
                    ? "Creating..."
                    : "Create Role"}
                </button>
              </div>
            </div>
          </form>
        </Modal>

        {/* =====================================================
            EDIT MODAL
        ====================================================== */}

        <Modal
          isOpen={isEditOpen}
          onClose={() =>
            !submittingEdit &&
            setIsEditOpen(false)
          }
          title="Edit Project Role"
        >
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-5">
              {/* ROLE HEADER */}
              {selectedRole && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f2ec] text-[#2f6b4f] flex items-center justify-center">
                    <BriefcaseBusiness size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                      Editing Role
                    </p>

                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedRole.name}
                    </p>
                  </div>
                </div>
              )}

              <Input
                label="Role Name *"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
                error={editErrors.name}
                required
              />

              <TextArea
                label="Description"
                rows={4}
                placeholder="Describe the responsibilities..."
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description:
                      e.target.value,
                  })
                }
              />

              {/* ACTIVE TOGGLE */}
              <div
                className={`rounded-xl border p-4 transition ${
                  editForm.is_active
                    ? "border-[#c9ddcf] bg-[#f3f8f4]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        editForm.is_active
                          ? "bg-[#e8f2ec] text-[#2f6b4f]"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {editForm.is_active ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <XCircle size={17} />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Role Availability
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {editForm.is_active
                          ? "This role can be assigned to projects."
                          : "This role is hidden from new assignments."}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        is_active:
                          e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#2f6b4f] shrink-0"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsEditOpen(false)
                  }
                  disabled={submittingEdit}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2f6b4f] text-white text-sm font-bold hover:bg-[#3b795b] transition disabled:opacity-60"
                >
                  {submittingEdit && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {submittingEdit
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
            {label}
          </p>

          <p className="text-2xl font-extrabold mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   ROLE CARD
========================================================= */

function RoleCard({
  role,
  onEdit,
  onToggle,
}) {
  return (
    <article className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* TOP ACCENT */}
      <div
        className={`h-1 ${
          role.is_active
            ? "bg-[#2f6b4f]"
            : "bg-slate-300"
        }`}
      />

      <div className="p-5">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#e8f2ec] text-[#2f6b4f] flex items-center justify-center shrink-0">
            <BriefcaseBusiness size={19} />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              role.is_active
                ? "bg-[#e8f2ec] text-[#2f6b4f]"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                role.is_active
                  ? "bg-[#2f6b4f]"
                  : "bg-slate-400"
              }`}
            />

            {role.is_active
              ? "ACTIVE"
              : "INACTIVE"}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="mt-5 text-lg font-extrabold text-slate-900 break-words">
          {role.name}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 text-sm text-slate-500 leading-6 min-h-[48px] line-clamp-2">
          {role.description ||
            "No description has been added for this role."}
        </p>

        {/* CREATED */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
              Created
            </p>

            <p className="text-xs font-semibold text-slate-600 mt-1">
              {role.created_at
                ? new Date(
                    role.created_at
                  ).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "N/A"}
            </p>
          </div>

          <ArrowUpRight
            size={17}
            className="text-slate-300 group-hover:text-[#2f6b4f] transition"
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#b9d1c1] hover:text-[#2f6b4f] hover:bg-[#f7faf8] transition"
          >
            <Edit2 size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              role.is_active
                ? "border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-[#2f6b4f] text-white hover:bg-[#3b795b]"
            }`}
          >
            {role.is_active ? (
              <>
                <XCircle size={14} />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Activate
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  search,
  onCreate,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 sm:p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#e8f2ec] text-[#2f6b4f] flex items-center justify-center mx-auto">
        <BriefcaseBusiness size={28} />
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-slate-900">
        {search
          ? "No roles found"
          : "Your role library is empty"}
      </h3>

      <p className="max-w-md mx-auto mt-2 text-sm text-slate-500 leading-6">
        {search
          ? "Try a different search term or reset your filters."
          : "Create your first project role to start organizing employee responsibilities."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2f6b4f] text-white text-sm font-bold hover:bg-[#3b795b] transition"
        >
          <Plus size={16} />
          Create First Role
        </button>
      )}
    </div>
  );
}