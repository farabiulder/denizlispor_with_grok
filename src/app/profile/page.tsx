"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import styles from "../styles/Profile.module.css";
import BottomNav from "../components/BottomNav";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

interface WeeklyScore {
  id?: number;
  user_id: string;
  points_earned: number;
  prediction: {
    denizlisporGoals: number;
    opponentGoals: number;
  };
  actual_score: {
    denizlisporGoals: number;
    opponentGoals: number;
  };
  created_at: string;
}

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
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [latestPrediction, setLatestPrediction] = useState<WeeklyScore | null>(
    null
  );
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (user) {
      setEmail(user.email || "");
      fetchUserData();
    }
  }, [user, loading, router]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch total points
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      if (pointsError) throw pointsError;
      setTotalPoints(pointsData?.total_points || 0);

      // Fetch latest game state with completed categories
      const { data: gameStateData, error: gameStateError } = await supabase
        .from("game_states")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .single();

      if (gameStateError) throw gameStateError;

      // Fetch real score from real_dp_score table
      const { data: realScoreData, error: realScoreError } = await supabase
        .from("real_dp_score")
        .select("dp_score, rival")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (realScoreError) throw realScoreError;

      if (gameStateData?.match_prediction) {
        const prediction = {
          id: gameStateData.id,
          user_id: user.id,
          points_earned: totalPoints,
          prediction: gameStateData.match_prediction,
          actual_score: {
            denizlisporGoals: Number(realScoreData.dp_score),
            opponentGoals: Number(realScoreData.rival),
          },
          created_at: gameStateData.updated_at,
        };
        setLatestPrediction(prediction);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingPredictions(false);
    }
  };

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
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {userProfile?.first_name?.[0]?.toUpperCase() || "👤"}
          </div>
          <h1 className={styles.name}>
            {userProfile?.first_name || "Kullanıcı"}
            {userProfile?.last_name && ` ${userProfile.last_name}`}
          </h1>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalPoints}</span>
            <span className={styles.statLabel}>Toplam Puan</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Maç Sonucu</h2>
          <div className={styles.predictionsList}>
            {loadingPredictions ? (
              <p className={styles.loadingText}>Yükleniyor...</p>
            ) : latestPrediction ? (
              <div className={styles.predictionItem}>
                <h3 className={styles.predictionTitle}>Tahmin Edilen Skor</h3>
                <div className={styles.scoreDisplay}>
                  <span className={styles.teamName}>Denizlispor</span>
                  <span className={styles.score}>
                    {latestPrediction.prediction.denizlisporGoals} -{" "}
                    {latestPrediction.prediction.opponentGoals}
                  </span>
                  <span className={styles.teamName}>Rakip</span>
                </div>

                <h3 className={styles.predictionTitle}>Gerçek Skor</h3>
                <div className={styles.scoreDisplay}>
                  <span className={styles.teamName}>Denizlispor</span>
                  <span className={styles.score}>
                    {latestPrediction.actual_score.denizlisporGoals} -{" "}
                    {latestPrediction.actual_score.opponentGoals}
                  </span>
                  <span className={styles.teamName}>Rakip</span>
                </div>

                <div
                  className={`${styles.predictionResult} ${
                    latestPrediction.prediction.denizlisporGoals ===
                      latestPrediction.actual_score.denizlisporGoals &&
                    latestPrediction.prediction.opponentGoals ===
                      latestPrediction.actual_score.opponentGoals
                      ? styles.correctPrediction
                      : styles.incorrectPrediction
                  }`}
                >
                  {latestPrediction.prediction.denizlisporGoals ===
                    latestPrediction.actual_score.denizlisporGoals &&
                  latestPrediction.prediction.opponentGoals ===
                    latestPrediction.actual_score.opponentGoals
                    ? "Doğru Tahmin"
                    : "Yanlış Tahmin"}
                </div>
              </div>
            ) : (
              <p className={styles.emptyText}>Henüz tahmin yapılmadı</p>
            )}
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
