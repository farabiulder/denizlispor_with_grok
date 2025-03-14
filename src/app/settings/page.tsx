"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Settings.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setEmail(user.email || "");
    }
  }, [user, loading, router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({
        text: "Yeni şifreler eşleşmiyor.",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        text: "Şifre en az 6 karakter olmalıdır.",
        type: "error",
      });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      // First verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Mevcut şifre yanlış.");
      }

      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage({
        text: "Şifreniz başarıyla güncellendi.",
        type: "success",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({
        text: error.message || "Şifre güncellenirken bir hata oluştu.",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <motion.div
      className={styles.settingsContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={styles.settingsCard}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className={styles.settingsHeader}>
          <h1 className={styles.settingsTitle}>Hesap Ayarları</h1>
          <Link href="/" className={styles.backLink}>
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.userEmail}>
            <strong>E-posta:</strong> {email}
          </div>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Şifre Değiştir</h2>
          <form onSubmit={handleUpdatePassword} className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>
                Mevcut Şifre
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                required
                placeholder="Mevcut şifreniz"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
                placeholder="Yeni şifreniz"
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Yeni Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                placeholder="Yeni şifrenizi tekrar girin"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={styles.updateButton}
              disabled={isUpdating}
            >
              {isUpdating ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        </div>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Diğer Seçenekler</h2>
          <Link href="/reset-password/request" className={styles.optionLink}>
            Şifremi Unuttum
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
