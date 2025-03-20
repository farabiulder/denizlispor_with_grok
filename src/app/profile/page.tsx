"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import styles from "../styles/Profile.module.css";
import BottomNav from "../components/BottomNav";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const { userProfile, user, signOut, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || "");
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
    }
    if (user) {
      setEmail(user.email || "");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

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

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {userProfile?.name?.[0]?.toUpperCase() || "👤"}
          </div>
          <h1 className={styles.name}>
            {userProfile?.name || "Kullanıcı"}
            {userProfile?.surname && ` ${userProfile.surname}`}
          </h1>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Toplam Puan</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Tahmin Sayısı</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Doğru Tahmin</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Son Tahminler</h2>
          <div className={styles.predictionsList}>
            <p className={styles.emptyText}>Henüz tahmin yapılmadı</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Hesap Ayarları</h2>
          <div className={styles.settingsList}>
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

            <form
              onSubmit={handleUpdatePassword}
              className={styles.settingsForm}
            >
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

            <div className={styles.settingsSection}>
              <Link
                href="/reset-password/request"
                className={styles.optionLink}
              >
                Şifremi Unuttum
              </Link>
            </div>

            <button onClick={handleLogout} className={styles.logoutButton}>
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
