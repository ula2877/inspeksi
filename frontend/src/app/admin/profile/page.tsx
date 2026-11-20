"use client";

import { useEffect, useState } from "react";
import { UserCircle, Mail, Fingerprint, Shield, FlaskConical, Pencil, X, Check, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { getProfile, updateProfile, changePassword } from "@/services/profile";
import type { Profile } from "@/types/admin";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getProfile()
      .then((d) => {
        setProfile(d);
        if (d) {
          setEditName(d.name);
          setEditEmail(d.email);
        }
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    if (profile) {
      setEditName(profile.name);
      setEditEmail(profile.email);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      setProfile(updated);
      setEditing(false);
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const openPasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    setPasswordErrors({});
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (changingPassword) return;
    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    setPasswordErrors({});
  };

  const handleChangePassword = async () => {
    const errs: Record<string, string> = {};
    if (!oldPassword) errs.oldPassword = "Password lama wajib diisi";
    if (!newPassword) errs.newPassword = "Password baru wajib diisi";
    else if (newPassword.length < 6) errs.newPassword = "Password baru minimal 6 karakter";
    if (!confirmPassword) errs.confirmPassword = "Konfirmasi password wajib diisi";
    else if (newPassword && confirmPassword !== newPassword) errs.confirmPassword = "Konfirmasi password tidak sesuai";
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setChangingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword, confirmPassword });
      toast.success("Password berhasil diubah");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setPasswordErrors({});
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal mengubah password";
      toast.error(message);
      if (message.toLowerCase().includes("lama")) {
        setPasswordErrors({ oldPassword: message });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
        Profil tidak ditemukan
      </div>
    );
  }

  const fields: { icon: typeof UserCircle; label: string; value: React.ReactNode }[] = [
    { icon: UserCircle, label: "Nama", value: profile.name },
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Fingerprint, label: "NIP", value: profile.nip || "—" },
    { icon: Shield, label: "Role", value: <StatusBadge status={profile.role} /> },
    { icon: FlaskConical, label: "Laboratory", value: profile.lab_name || "—" },
  ];

  return (
    <div>
      <AdminPageHeader title="Profile" description="Informasi akun Anda" />

      <div className="max-w-2xl rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8">
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-[#0F172A]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
              <p className="text-sm text-white/50">{profile.email}</p>
            </div>
          </div>
          {!editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={openPasswordModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <KeyRound className="w-4 h-4" /> Ubah Password
              </button>
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all border border-emerald-500/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">{f.label}</p>
                {editing && (f.label === "Nama" || f.label === "Email") ? (
                  <input
                    value={f.label === "Nama" ? editName : editEmail}
                    onChange={(e) => f.label === "Nama" ? setEditName(e.target.value) : setEditEmail(e.target.value)}
                    className="mt-0.5 w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  />
                ) : (
                  <div className="text-sm font-medium text-white mt-0.5">{f.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closePasswordModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#FBBF24]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Ubah Password</h3>
                </div>
                <button
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Password Lama</label>
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                        if (passwordErrors.oldPassword) setPasswordErrors((p) => ({ ...p, oldPassword: "" }));
                      }}
                      disabled={changingPassword}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 pr-10 disabled:opacity-50"
                      placeholder="Masukkan password lama"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      tabIndex={-1}
                    >
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && <p className="text-xs text-red-400 mt-1">{passwordErrors.oldPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrors.newPassword) setPasswordErrors((p) => ({ ...p, newPassword: "" }));
                      }}
                      disabled={changingPassword}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 pr-10 disabled:opacity-50"
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && <p className="text-xs text-red-400 mt-1">{passwordErrors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordErrors.confirmPassword) setPasswordErrors((p) => ({ ...p, confirmPassword: "" }));
                      }}
                      disabled={changingPassword}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 pr-10 disabled:opacity-50"
                      placeholder="Konfirmasi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all border border-emerald-500/20 disabled:opacity-50"
                >
                  {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  {changingPassword ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
