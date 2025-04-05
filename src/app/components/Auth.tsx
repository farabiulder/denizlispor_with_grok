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
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null
  );
  const { signIn, signUp, updateProfile, user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password);
        router.push("/");
      } else {
        // Validate input fields
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error("Ad ve soyad alanları boş bırakılamaz");
        }

        const { data, error } = await signUp(
          email,
          password,
          firstName,
          lastName
        );
        if (error) throw error;

        if (data?.user) {
          // Registration successful, update profile
          try {
            const { error: updateError } = await supabase
              .from("users")
              .update({
                email: email,
                first_name: firstName,
                last_name: lastName,
              })
              .eq("id", data.user.id);

            if (updateError) {
              console.error("Error updating profile:", updateError);
            }
          } catch (updateErr) {
            console.error("Profile update error:", updateErr);
          }

          // Show success message and redirect to login
          setError(null);
          setMessage({
            text: "Kayıt başarılı! Giriş yapabilirsiniz.",
            type: "success",
          });
          setIsLogin(true);
        }
      }
    } catch (err) {
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (err instanceof Error) {
        if (err.message.includes("Email not confirmed")) {
          errorMessage = "Email adresinizi onaylamanız gerekmektedir";
        } else if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Geçersiz email veya şifre";
        } else if (err.message.includes("User already registered")) {
          errorMessage = "Bu email adresi zaten kayıtlı";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/reset-password/request");
  };

  const handleFirstNameChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);
    if (!isLogin && user) {
      try {
        await updateProfile(newFirstName, lastName);
      } catch (err) {
        console.error("Error updating first name:", err);
      }
    }
  };

  const handleLastNameChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLastName = e.target.value;
    setLastName(newLastName);
    if (!isLogin && user) {
      try {
        await updateProfile(firstName, newLastName);
      } catch (err) {
        console.error("Error updating last name:", err);
      }
    }
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
                  onChange={handleFirstNameChange}
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
                  onChange={handleLastNameChange}
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
