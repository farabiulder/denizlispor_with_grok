"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../../styles/Auth.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have the access token in the URL (from the email link)
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage({
          text: "Geçersiz veya süresi dolmuş oturum. Lütfen tekrar şifre sıfırlama isteği gönderin.",
          type: "error",
        });
      }
    };

    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({
        text: "Şifreler eşleşmiyor.",
        type: "error",
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        text: "Şifre en az 6 karakter olmalıdır.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage({
        text: "Şifreniz başarıyla güncellendi.",
        type: "success",
      });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      setMessage({
        text: error.message || "Şifre güncellenirken bir hata oluştu.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={styles.authContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={styles.authCard}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className={styles.authTitle}>Yeni Şifre Belirle</h1>
        <p className={styles.authDescription}>Lütfen yeni şifrenizi girin.</p>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Yeni Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              placeholder="Yeni şifreniz"
              minLength={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
              placeholder="Şifrenizi tekrar girin"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>

        <div className={styles.authLinks}>
          <Link href="/login" className={styles.authLink}>
            Giriş sayfasına dön
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
