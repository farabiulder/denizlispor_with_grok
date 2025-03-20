"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import styles from "../styles/Auth.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { data: authData, error: signUpError } = await signUp(
          email,
          password
        );
        if (signUpError) throw signUpError;

        if (authData.user) {
          // Update the users table with name and surname
          const { error: updateError } = await supabase
            .from("users")
            .update({ first_name: firstName, last_name: lastName })
            .eq("id", authData.user.id);

          if (updateError) throw updateError;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/reset-password/request");
  };

  return (
    <motion.div
      className={styles.authContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.authCard}>
        <motion.h1
          className={styles.authTitle}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {isLogin ? "Denizlispor Menajerlik Giriş" : "Yeni Hesap Oluştur"}
        </motion.h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {!isLogin && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">Ad</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Soyad</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                  className={styles.input}
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {isLogin && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className={styles.forgotPasswordButton}
            >
              Şifremi Unuttum
            </button>
          )}

          <motion.button
            type="submit"
            className={styles.authButton}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "İşleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </motion.button>
        </form>

        <p className={styles.toggleText}>
          {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className={styles.toggleButton}
          >
            {isLogin ? "Kayıt ol" : "Giriş yap"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
