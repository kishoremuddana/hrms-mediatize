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
  updateHRProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../services/employeeApi";

export default function HRProfile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");

  // --------------------------------------------------
  // FETCH PROFILE
  // --------------------------------------------------

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      const data = res.data;

      setProfile(data);

      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setPhone(data.phone || "");
      setDateOfBirth(data.date_of_birth || "");
      setAddress(data.address || "");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to load HR profile."
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

  const handleUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await updateHRProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        date_of_birth: dateOfBirth || null,
        address: address,
      });

      toast.success("HR profile updated successfully!");

      setEditing(false);

      await fetchProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to update HR profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------

  const handleCancel = () => {
    setFirstName(profile?.first_name || "");
    setLastName(profile?.last_name || "");
    setPhone(profile?.phone || "");
    setDateOfBirth(profile?.date_of_birth || "");
    setAddress(profile?.address || "");

    setEditing(false);
  };

  // --------------------------------------------------
  // UPLOAD PHOTO
  // --------------------------------------------------

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);

    try {
      await uploadProfilePhoto(formData);

      toast.success("Profile photo updated!");

      await fetchProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Photo upload failed."
      );
    } finally {
      setUploadingPhoto(false);

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

      await fetchProfile();
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
      <AppLayout title="My HR Profile">
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

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  const displayName = fullName || "HR Administrator";

  const initials =
    `${profile.first_name?.[0] || ""}${
      profile.last_name?.[0] || ""
    }`.toUpperCase() || "HR";

  return (
    <AppLayout title="My HR Profile">
      <div className="w-full min-w-0 bg-[#f6f7f4] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
        
        {/* BACK */}

        <div className="mb-5">
          <BackToDashboard
            to="/hr/dashboard"
            role="HR"
          />
        </div>

        {/* HERO */}

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
                        alt={displayName}
                        className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/10 sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#2f6b4f] text-3xl font-bold text-white sm:h-28 sm:w-28">
                        {initials}
                      </div>
                    )}

                    {/* PHOTO UPLOAD */}

                    <label
                      className={`absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#17251F] bg-[#dcefe3] text-[#24543c] shadow-sm transition hover:bg-white ${
                        uploadingPhoto
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
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
                    HR Profile
                  </p>

                  <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {displayName}
                  </h1>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">

                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
                      {profile.employee_code}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      HR
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
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

          {/* SUMMARY */}

          <div className="grid border-t border-white/10 sm:grid-cols-3">

            <SummaryItem
              icon={<BriefcaseBusiness size={16} />}
              label="Employee Code"
              value={profile.employee_code}
            />

            <SummaryItem
              icon={<ShieldCheck size={16} />}
              label="Role"
              value="HR"
            />

            <SummaryItem
              icon={<Mail size={16} />}
              label="Account Email"
              value={profile.email}
            />

          </div>

        </section>

        {/* PERSONAL INFORMATION */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

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
                  Manage your HR profile information
                </p>
              </div>

            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#24543c]"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}

          </div>

          {!editing ? (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                icon={<UserRound size={17} />}
                label="First Name"
                value={profile.first_name || "Not provided"}
              />

              <InfoItem
                icon={<UserRound size={17} />}
                label="Last Name"
                value={profile.last_name || "Not provided"}
              />

              <InfoItem
                icon={<Mail size={17} />}
                label="Email"
                value={profile.email}
              />

              <InfoItem
                icon={<Phone size={17} />}
                label="Phone"
                value={profile.phone || "Not provided"}
              />

              <InfoItem
                icon={<CalendarDays size={17} />}
                label="Date of Birth"
                value={profile.date_of_birth || "Not provided"}
              />

              <InfoItem
                icon={<ShieldCheck size={17} />}
                label="Role"
                value="HR"
              />

              <InfoItem
                icon={<BriefcaseBusiness size={17} />}
                label="Employee Code"
                value={profile.employee_code}
              />

              <InfoItem
                icon={<ShieldCheck size={17} />}
                label="Employment Status"
                value={profile.employment_status}
              />

              <InfoItem
                icon={<MapPin size={17} />}
                label="Address"
                value={profile.address || "Not provided"}
                fullWidth
              />

            </div>

          ) : (

            <form onSubmit={handleUpdate}>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

                {/* FIRST NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    maxLength={100}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10"
                  />
                </div>

                {/* LAST NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    maxLength={100}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Email cannot be changed.
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10"
                  />
                </div>

                {/* DOB */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10"
                  />
                </div>

                {/* EMPLOYEE CODE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Employee Code
                  </label>

                  <input
                    type="text"
                    value={profile.employee_code}
                    disabled
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Employee code cannot be changed.
                  </p>
                </div>

                {/* ADDRESS */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={255}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10"
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2f6b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#24543c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </form>

          )}

        </section>

      </div>
    </AppLayout>
  );
}


// ============================================================
// SUMMARY ITEM
// ============================================================

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-white/10 px-5 py-4 sm:border-r last:border-r-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-emerald-300">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}


// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  icon,
  label,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={`border-b border-slate-100 p-5 ${
        fullWidth ? "sm:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value}
          </p>
        </div>

      </div>
    </div>
  );
}