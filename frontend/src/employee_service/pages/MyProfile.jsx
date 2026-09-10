import React, { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Camera,
  Trash2,
  Pencil,
  Save,
  X,
  ShieldCheck,
  BriefcaseBusiness,
  Loader2,
} from "lucide-react";

import { toast } from "react-toastify";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../services/employeeApi";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // FETCH PROFILE
  // --------------------------------------------------

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();

      const emp = res.data;

      setProfile(emp);
      setPhone(emp.phone || "");
      setAddress(emp.address || "");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to load self profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------

  const handleUpdateSelf = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await updateMyProfile({
        phone,
        address,
      });

      toast.success("Profile updated successfully!");

      setEditing(false);

      fetchProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // UPLOAD PHOTO
  // --------------------------------------------------

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image file size must be less than 5 MB."
      );

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    setUploadingPhoto(true);

    try {
      await uploadProfilePhoto(formData);

      toast.success("Profile photo updated!");

      fetchProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Photo upload failed."
      );
    } finally {
      setUploadingPhoto(false);

      // Allow selecting the same file again
      e.target.value = "";
    }
  };

  // --------------------------------------------------
  // REMOVE PHOTO
  // --------------------------------------------------

  const handleRemovePhoto = async () => {
    try {
      await deleteProfilePhoto();

      toast.info("Profile photo removed.");

      fetchProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Photo removal failed."
      );
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <AppLayout title="My Employee Profile">

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f6b4f]" />

            <p className="text-sm font-semibold text-slate-700">
              Loading your profile...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we retrieve your information.
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  if (!profile) return null;

  const initials =
    `${profile.first_name?.[0] || ""}${
      profile.last_name?.[0] || ""
    }`.toUpperCase();

  return (
    <AppLayout title="My Employee Profile">

      <div className="w-full min-w-0 pb-10">

        {/* =====================================================
            BACK
        ====================================================== */}

        <div className="mb-5">
          <BackToDashboard
            to="/employee/dashboard"
            role="EMPLOYEE"
          />
        </div>

        {/* =====================================================
            PROFILE HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#17251F] text-white shadow-sm">

          <div className="px-5 py-7 sm:px-7 lg:px-9 lg:py-8">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* PROFILE */}

              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

                {/* AVATAR */}

                <div className="flex shrink-0 flex-col items-center gap-3">

                  <div className="relative">

                    {profile.profile_photo_url ? (

                      <img
                        src={profile.profile_photo_url}
                        alt={profile.first_name}
                        className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/10 sm:h-28 sm:w-28"
                      />

                    ) : (

                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#2f6b4f] text-3xl font-bold text-white sm:h-28 sm:w-28">
                        {initials}
                      </div>

                    )}

                    {/* PHOTO UPLOAD */}

                    <label
                      className={`absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-[#17251F] bg-[#dcefe3] text-[#24543c] shadow-sm transition hover:bg-white ${
                        uploadingPhoto
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }`}
                      title="Change profile photo"
                    >

                      {uploadingPhoto ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Camera size={16} />
                      )}

                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />

                    </label>

                  </div>

                  {/* REMOVE */}

                  {profile.profile_photo_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Remove photo
                    </button>
                  )}

                </div>

                {/* NAME */}

                <div className="min-w-0 text-center sm:text-left">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Employee Profile
                  </p>

                  <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {profile.first_name}{" "}
                    {profile.last_name}
                  </h1>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">

                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
                      {profile.employee_code}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      {profile.employment_status}

                    </span>

                  </div>

                </div>

              </div>

              {/* PHOTO INFO */}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                    <Camera size={18} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Profile Photo
                    </p>

                    <p className="text-sm font-semibold text-white">
                      PNG, JPG or WEBP
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Maximum 5 MB
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* PROFILE SUMMARY */}

          <div className="grid border-t border-white/10 sm:grid-cols-3">

            <SummaryItem
              icon={<BriefcaseBusiness size={16} />}
              label="Employee Code"
              value={profile.employee_code}
            />

            <SummaryItem
              icon={<ShieldCheck size={16} />}
              label="Employment Status"
              value={profile.employment_status}
            />

            <SummaryItem
              icon={<Mail size={16} />}
              label="Account Email"
              value={profile.email}
            />

          </div>

        </section>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        {!editing ? (

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                  <UserRound size={19} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-800">
                    Personal & Contact Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Your personal and contact details
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#24543c]"
              >
                <Pencil size={16} />
                Edit Contact Details
              </button>

            </div>

            {/* INFORMATION */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                icon={<Mail size={17} />}
                label="Email Address"
                value={profile.email}
              />

              <InfoItem
                icon={<Phone size={17} />}
                label="Phone Number"
                value={
                  profile.phone || "Not Provided"
                }
              />

              <InfoItem
                icon={<CalendarDays size={17} />}
                label="Date of Birth"
                value={
                  profile.date_of_birth ||
                  "Not Provided"
                }
              />

              <InfoItem
                icon={<BriefcaseBusiness size={17} />}
                label="Joining Date"
                value={
                  profile.joining_date ||
                  "Not Provided"
                }
              />

              <InfoItem
                icon={<ShieldCheck size={17} />}
                label="Employment Status"
                value={
                  profile.employment_status ||
                  "Not Provided"
                }
              />

              <div className="border-b border-slate-100 p-5 sm:p-6">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <ShieldCheck size={17} />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      System Account
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      Active
                    </p>

                  </div>

                </div>

              </div>

              {/* ADDRESS */}

              <div className="border-b border-slate-100 p-5 sm:col-span-2 sm:p-6 lg:col-span-3">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <MapPin size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Residential Address
                    </p>

                    <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-700">
                      {profile.address ||
                        "Not Provided"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

        ) : (

          /* ===================================================
             EDIT FORM
          ==================================================== */

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                  <Pencil size={18} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-800">
                    Update Contact Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Update the information you are allowed to change
                  </p>

                </div>

              </div>

            </div>

            <form
              onSubmit={handleUpdateSelf}
              className="p-5 sm:p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="+91 9876543210"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
                    />

                  </div>

                </div>

                {/* EMAIL - READ ONLY */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-3 text-sm text-slate-500 outline-none"
                    />

                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Email address cannot be changed here.
                  </p>

                </div>

                {/* ADDRESS */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Residential Address
                  </label>

                  <div className="relative">

                    <MapPin
                      size={17}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <textarea
                      rows="4"
                      value={address}
                      onChange={(e) =>
                        setAddress(e.target.value)
                      }
                      placeholder="Enter your updated address"
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
                    />

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setPhone(profile.phone || "");
                    setAddress(profile.address || "");
                  }}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-6 text-sm font-semibold text-white transition hover:bg-[#24543c] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
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

          </section>

        )}

        {/* =====================================================
            PROFILE INFORMATION NOTE
        ====================================================== */}

        <div className="mt-5 rounded-2xl border border-[#cce2d5] bg-[#f2f8f4] p-4 sm:p-5">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dcefe3] text-[#2f6b4f]">
              <ShieldCheck size={17} />
            </div>

            <div>

              <p className="text-sm font-semibold text-[#24543c]">
                Profile information
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Your employee profile is managed by the HR
                department. You can update your phone number
                and residential address from this page.
              </p>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}

/* =============================================================
   SUMMARY ITEM
============================================================= */

function SummaryItem({ icon, label, value }) {
  return (
    <div className="border-b border-white/10 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6">

      <div className="flex items-center gap-2">

        <span className="text-emerald-300">
          {icon}
        </span>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

      </div>

      <p className="mt-1.5 truncate text-sm font-semibold text-white">
        {value || "Not Provided"}
      </p>

    </div>
  );
}

/* =============================================================
   INFORMATION ITEM
============================================================= */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="border-b border-slate-100 p-5 sm:p-6">

      <div className="flex gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value || "Not Provided"}
          </p>

        </div>

      </div>

    </div>
  );
}