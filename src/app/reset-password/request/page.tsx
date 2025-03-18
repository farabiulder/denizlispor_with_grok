"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../../styles/Auth.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      });

      if (error) {
        throw error;
      }

      setMessage({
        text: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        type: "success",
      });
    } catch (error: any) {
      setMessage({
        text:
          error.message ||
          "Şifre sıfırlama isteği gönderilirken bir hata oluştu.",
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
        <h1 className={styles.authTitle}>Şifre Sıfırlama</h1>
        <p className={styles.authDescription}>
          Şifrenizi sıfırlamak için e-posta adresinizi girin.
        </p>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetRequest} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              placeholder="E-posta adresiniz"
            />
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        <div className={styles.authLinks}>
          <Link href="/" className={styles.authLink}>
            Giriş sayfasına dön
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
