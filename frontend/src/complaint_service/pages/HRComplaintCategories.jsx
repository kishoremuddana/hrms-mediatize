import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  ArrowLeft,
  RefreshCw,
  X,
  Power,
  Tags,
  FileText,
  CheckCircle2,
  XCircle,
  Layers3,
  Settings2,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  getAllComplaintCategories,
  createComplaintCategory,
  updateComplaintCategory,
  toggleComplaintCategoryStatus,
} from "../services/complaintApi";

import { showSuccess, showError } from "../../shared/utils/toast";

function HRComplaintCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAllComplaintCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch complaint categories", err);
      showError("Failed to load complaint categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setNameInput("");
    setDescriptionInput("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setDescriptionInput(cat.description || "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!nameInput || !nameInput.trim()) {
      showError("Category name is required.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingCategory) {
        await updateComplaintCategory(editingCategory.id, {
          name: nameInput.trim(),
          description: descriptionInput.trim() || undefined,
        });

        showSuccess("Category updated successfully.");
      } else {
        await createComplaintCategory({
          name: nameInput.trim(),
          description: descriptionInput.trim() || undefined,
        });

        showSuccess("New complaint category created.");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category", err);
      showError(
        err.response?.data?.detail || "Failed to save category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const actionText = cat.is_active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} category '${cat.name}'?`
      )
    ) {
      return;
    }

    try {
      await toggleComplaintCategoryStatus(cat.id);

      showSuccess(
        `Category '${cat.name}' ${
          cat.is_active ? "deactivated" : "activated"
        }.`
      );

      fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category status", err);

      showError(
        err.response?.data?.detail ||
          "Failed to update category status."
      );
    }
  };

  const activeCategories = categories.filter(
    (category) => category.is_active
  ).length;

  const inactiveCategories = categories.filter(
    (category) => !category.is_active
  ).length;

  return (
    <AppLayout title="Complaint Categories">

      <div className="min-h-screen bg-[#f7faf8] px-4 py-5 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              BACK
          ===================================================== */}
          <div className="mb-5">
            <BackToDashboard
              to="/hr/complaints"
              role="HR"
              icon={ArrowLeft}
            />
          </div>

          {/* =====================================================
              HERO HEADER
          ===================================================== */}
          <section className="relative overflow-hidden rounded-2xl border border-[#dce8e0] bg-white shadow-[0_10px_35px_rgba(20,60,39,0.06)]">

            {/* Decorative shapes */}
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#e3f2e9] blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-[35%] h-64 w-64 rounded-full bg-[#f0f7f2] blur-3xl" />

            <div className="relative grid grid-cols-1 gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">

              {/* Heading */}
              <div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#cfe3d6] bg-[#f5faf7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f5132]">
                  <Settings2 size={13} />
                  HR Configuration
                </div>

                <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#173525] sm:text-3xl">
                  Complaint Categories
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66756d]">
                  Organize workplace complaints into clear categories
                  so HR teams can manage employee grievances consistently.
                </p>

              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={fetchCategories}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d5e1d9] bg-white px-4 py-2.5 text-sm font-bold text-[#40544a] transition-all duration-200 hover:border-[#0f5132] hover:text-[#0f5132] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f5132] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,81,50,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b4229]"
                >
                  <Plus size={17} />
                  Add Category
                </button>

              </div>
            </div>
          </section>

          {/* =====================================================
              SUMMARY
          ===================================================== */}
          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Total */}
            <div className="rounded-2xl border border-[#dfe9e3] bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#849189]">
                    Total Categories
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#183a28]">
                    {categories.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f4ed] text-[#0f5132]">
                  <Layers3 size={21} />
                </div>

              </div>

              <p className="mt-3 text-xs text-[#718078]">
                Configured complaint topics
              </p>

            </div>

            {/* Active */}
            <div className="rounded-2xl border border-[#dfe9e3] bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#849189]">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#16804b]">
                    {activeCategories}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#16804b]">
                  <CheckCircle2 size={21} />
                </div>

              </div>

              <p className="mt-3 text-xs text-[#718078]">
                Currently available categories
              </p>

            </div>

            {/* Inactive */}
            <div className="rounded-2xl border border-[#dfe9e3] bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#849189]">
                    Inactive
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#c24b4b]">
                    {inactiveCategories}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1f1] text-[#c24b4b]">
                  <XCircle size={21} />
                </div>

              </div>

              <p className="mt-3 text-xs text-[#718078]">
                Soft-deactivated categories
              </p>

            </div>

          </section>

          {/* =====================================================
              MANAGEMENT AREA
          ===================================================== */}
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#dfe9e3] bg-white shadow-sm">

            {/* Section header */}
            <div className="border-b border-[#e6eee9] bg-[#fbfdfb] px-5 py-5 sm:px-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4ed] text-[#0f5132]">
                    <Tags size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-extrabold text-[#1c3829]">
                      Category Directory
                    </h2>

                    <p className="mt-0.5 text-xs text-[#7b8882]">
                      Create, update and control complaint categories
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-lg border border-[#dce8e0] bg-white px-3 py-2">
                  <ShieldCheck
                    size={15}
                    className="text-[#198754]"
                  />

                  <span className="text-[10px] font-semibold text-[#66766d]">
                    HR configuration
                  </span>
                </div>

              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}
            {loading ? (

              <div className="flex min-h-[320px] flex-col items-center justify-center px-6">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f4ed] text-[#0f5132]">
                  <RefreshCw
                    size={24}
                    className="animate-spin"
                  />
                </div>

                <h3 className="mt-5 text-sm font-bold text-[#263e31]">
                  Loading categories
                </h3>

                <p className="mt-1 text-xs text-[#7a8780]">
                  Fetching complaint category configuration...
                </p>

              </div>

            ) : categories.length === 0 ? (

              /* =================================================
                 EMPTY STATE
              ================================================= */
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f4ed] text-[#0f5132]">
                  <Tags size={29} />
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-[#213c2d]">
                  No complaint categories yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#718078]">
                  Create your first complaint category to start organizing
                  workplace grievances.
                </p>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0f5132] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0b4229]"
                >
                  <Plus size={16} />
                  Create First Category
                </button>

              </div>

            ) : (

              /* =================================================
                 CATEGORY LIST
              ================================================= */
              <div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">

                  <table className="w-full border-collapse">

                    <thead>
                      <tr className="border-b border-[#e5ece8] bg-[#f8faf9]">

                        <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#75827b]">
                          Category
                        </th>

                        <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#75827b]">
                          Description
                        </th>

                        <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#75827b]">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#75827b]">
                          Created
                        </th>

                        <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#75827b]">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {categories.map((category) => (

                        <tr
                          key={category.id}
                          className="group border-b border-[#edf1ee] transition-colors hover:bg-[#f9fcfa]"
                        >

                          {/* Category */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ed] text-[#0f5132] transition-colors group-hover:bg-[#dcefe4]">
                                <Tags size={17} />
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-extrabold text-[#203b2c]">
                                  {category.name}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#87928c]">
                                  Complaint category
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Description */}
                          <td className="max-w-[360px] px-6 py-5">

                            <div className="flex items-start gap-2">

                              <FileText
                                size={14}
                                className="mt-0.5 shrink-0 text-[#9aa69f]"
                              />

                              <p className="line-clamp-2 text-xs leading-5 text-[#68766e]">
                                {category.description || "No description provided"}
                              </p>

                            </div>

                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">

                            {category.is_active ? (

                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9e5d2] bg-[#edf8f1] px-2.5 py-1 text-[10px] font-bold text-[#167746]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#198754]" />
                                Active
                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d1d1] bg-[#fff3f3] px-2.5 py-1 text-[10px] font-bold text-[#bd4b4b]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#dc5a5a]" />
                                Inactive
                              </span>

                            )}

                          </td>

                          {/* Created */}
                          <td className="px-6 py-5">

                            <span className="text-xs font-medium text-[#6f7c74]">
                              {new Date(
                                category.created_at
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>

                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditModal(category)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce6e0] bg-white px-3 py-2 text-[11px] font-bold text-[#3d5147] transition-all hover:border-[#0f5132] hover:bg-[#f4faf6] hover:text-[#0f5132]"
                              >
                                <Edit2 size={13} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(category)
                                }
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-all ${
                                  category.is_active
                                    ? "border-[#efd0d0] bg-white text-[#c04c4c] hover:bg-[#fff4f4]"
                                    : "border-[#cce4d4] bg-white text-[#16804b] hover:bg-[#f2faf5]"
                                }`}
                              >
                                <Power size={13} />

                                {category.is_active
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

                {/* =================================================
                    MOBILE CARDS
                ================================================= */}
                <div className="space-y-3 p-4 md:hidden">

                  {categories.map((category) => (

                    <article
                      key={category.id}
                      className="rounded-xl border border-[#e2ebe5] bg-[#fbfcfb] p-4"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ed] text-[#0f5132]">
                          <Tags size={17} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div>
                              <h3 className="text-sm font-extrabold text-[#203b2c]">
                                {category.name}
                              </h3>

                              <p className="mt-1 text-[10px] text-[#87928c]">
                                Created{" "}
                                {new Date(
                                  category.created_at
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>

                            {category.is_active ? (

                              <span className="shrink-0 rounded-full bg-[#edf8f1] px-2 py-1 text-[9px] font-bold text-[#167746]">
                                Active
                              </span>

                            ) : (

                              <span className="shrink-0 rounded-full bg-[#fff3f3] px-2 py-1 text-[9px] font-bold text-[#bd4b4b]">
                                Inactive
                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                      <div className="mt-4 rounded-lg border border-[#e8eeea] bg-white p-3">

                        <div className="flex items-start gap-2">

                          <FileText
                            size={14}
                            className="mt-0.5 shrink-0 text-[#8b9890]"
                          />

                          <p className="text-xs leading-5 text-[#68766e]">
                            {category.description ||
                              "No description provided"}
                          </p>

                        </div>

                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEditModal(category)
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#dce6e0] bg-white px-3 py-2.5 text-[11px] font-bold text-[#3d5147]"
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(category)
                          }
                          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-[11px] font-bold ${
                            category.is_active
                              ? "border-[#efd0d0] bg-white text-[#c04c4c]"
                              : "border-[#cce4d4] bg-white text-[#16804b]"
                          }`}
                        >
                          <Power size={13} />

                          {category.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </article>

                  ))}

                </div>

              </div>

            )}

          </section>

          {/* =====================================================
              INFORMATION STRIP
          ===================================================== */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#dce8e0] bg-[#f1f8f4] px-4 py-3.5">

            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-[#0f5132]"
            />

            <div>

              <p className="text-xs font-bold text-[#294738]">
                Category configuration
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#6b7a71]">
                Deactivating a category keeps the existing category
                record while preventing it from being treated as an
                active complaint category.
              </p>

            </div>

          </div>

        </div>

        {/* =======================================================
            CREATE / EDIT MODAL
        ======================================================= */}
        {isModalOpen && (

          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#10251a]/45 p-4 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >

            <div
              className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#dce7e0] bg-white shadow-[0_30px_80px_rgba(12,45,28,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Modal Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#e4ebe7] bg-[#f7faf8] px-5 py-5 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f5132] text-white">
                    {editingCategory ? (
                      <Edit2 size={17} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </div>

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#0f5132]">
                      {editingCategory
                        ? "Category Management"
                        : "New Configuration"}
                    </p>

                    <h2 className="mt-0.5 text-base font-extrabold text-[#19382a]">
                      {editingCategory
                        ? "Edit Complaint Category"
                        : "Create Complaint Category"}
                    </h2>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce5df] bg-white text-[#718078] transition-colors hover:border-[#c5d4ca] hover:text-[#243b2e]"
                  aria-label="Close modal"
                >
                  <X size={17} />
                </button>

              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleFormSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >

                <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">

                  {/* Intro */}
                  <div className="mb-6 rounded-xl border border-[#dce9e1] bg-[#f4f9f6] p-4">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0f5132] shadow-sm">
                        <Tags size={16} />
                      </div>

                      <div>

                        <p className="text-xs font-bold text-[#294738]">
                          Complaint classification
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-[#718078]">
                          Define a clear name and optional description
                          for this workplace complaint category.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Category Name */}
                  <div className="mb-5">

                    <label
                      htmlFor="category-name"
                      className="mb-2 block text-xs font-bold text-[#30483b]"
                    >
                      Category Name
                      <span className="ml-1 text-[#c64d4d]">*</span>
                    </label>

                    <input
                      id="category-name"
                      type="text"
                      value={nameInput}
                      onChange={(e) =>
                        setNameInput(e.target.value)
                      }
                      placeholder="e.g. Workplace, Payroll, Facilities"
                      required
                      className="w-full rounded-xl border border-[#d8e3dc] bg-white px-3.5 py-3 text-sm text-[#1f392b] outline-none transition-all placeholder:text-[#a0aaa4] focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10"
                    />

                    <p className="mt-1.5 text-[10px] text-[#87938c]">
                      Use a short and recognizable category name.
                    </p>

                  </div>

                  {/* Description */}
                  <div>

                    <label
                      htmlFor="category-description"
                      className="mb-2 block text-xs font-bold text-[#30483b]"
                    >
                      Description
                      <span className="ml-1 font-medium text-[#87938c]">
                        Optional
                      </span>
                    </label>

                    <textarea
                      id="category-description"
                      value={descriptionInput}
                      onChange={(e) =>
                        setDescriptionInput(e.target.value)
                      }
                      rows={5}
                      placeholder="Describe the types of workplace complaints that belong to this category..."
                      className="w-full resize-none rounded-xl border border-[#d8e3dc] bg-white px-3.5 py-3 text-sm leading-6 text-[#1f392b] outline-none transition-all placeholder:text-[#a0aaa4] focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10"
                    />

                    <div className="mt-2 flex items-center justify-between">

                      <span className="text-[10px] text-[#87938c]">
                        Help HR identify the appropriate category.
                      </span>

                      <span className="text-[10px] font-medium text-[#8b9690]">
                        {descriptionInput.length} characters
                      </span>

                    </div>

                  </div>

                </div>

                {/* Modal Footer */}
                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e4ebe7] bg-[#f9fbfa] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#d6e1da] bg-white px-5 py-2.5 text-sm font-bold text-[#4b5d53] transition-colors hover:border-[#bdcec3] hover:bg-[#f8faf9]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f5132] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0b4229] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {submitting ? (
                      <>
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingCategory ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Plus size={16} />
                        )}

                        {editingCategory
                          ? "Save Changes"
                          : "Create Category"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </AppLayout>
  );
}

export default HRComplaintCategories;