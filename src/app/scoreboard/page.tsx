"use client";
import { useEffect, useState } from "react";
import styles from "../styles/Scoreboard.module.css";
import BottomNav from "../components/BottomNav";
import { supabase, checkSupabaseConnection } from "../lib/supabaseClient";

interface UserScore {
  id: string;
  displayName: string;
  total_games: number;
  total_points: number;
}

export default function Scoreboard() {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  const fetchUserScores = async () => {
    // Reset the retry button state
    setShowRetry(false);

    // First check the Supabase connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error(
        "Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin."
      );
    }

    try {
      // Fetch all data in parallel for better performance
      const [pointsResponse, gamesResponse, usersResponse] = await Promise.all([
        supabase.from("user_points").select("user_id, total_points"),
        supabase.from("game_states").select("user_id, completed_categories"),
        supabase.from("users").select("id, email, first_name, last_name"),
      ]);

      // Check for errors
      if (pointsResponse.error) throw pointsResponse.error;
      if (gamesResponse.error) throw gamesResponse.error;
      if (usersResponse.error) throw usersResponse.error;

      const userPoints = pointsResponse.data;
      const userGames = gamesResponse.data;
      const users = usersResponse.data;

      if (!users || !userPoints || !userGames) {
        throw new Error("Veri alınamadı. Lütfen daha sonra tekrar deneyin.");
      }

      // Combine the data
      const combinedScores = users.map((user) => {
        const userPoint = userPoints.find((p) => p.user_id === user.id);
        const userGame = userGames.find((g) => g.user_id === user.id);

        let displayName;
        if (user.first_name && user.last_name) {
          const formattedFirstName = formatName(user.first_name);
          const formattedLastName = formatName(user.last_name);
          displayName = `${formattedFirstName} ${formattedLastName}`;
        } else {
          const emailName = user.email.split("@")[0];
          displayName = formatName(emailName);
        }

        return {
          id: user.id,
          displayName,
          total_games: userGame?.completed_categories?.length || 0,
          total_points: userPoint?.total_points || 0,
        };
      });

      // Sort by total points in descending order
      return combinedScores.sort((a, b) => b.total_points - a.total_points);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      throw new Error(error.message || "Veri yüklenirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set a timeout to show retry button after 5 seconds
        timeoutId = setTimeout(() => {
          if (mounted) {
            setShowRetry(true);
          }
        }, 5000);

        const data = await fetchUserScores();
        if (mounted) {
          setScores(data);
        }
      } catch (err: any) {
        console.error("Error loading scoreboard:", err);
        if (mounted) {
          setError(
            err.message ||
              "Skorlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const formatName = (name: string): string => {
    if (!name) return "";
    return name.length > 2
      ? `${name.slice(0, 2)}${"*".repeat(name.length - 2)}`
      : name;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Yükleniyor...</p>
          {showRetry && (
            <button onClick={handleRetry} className={styles.retryButton}>
              Yeniden Dene
            </button>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Yeniden Dene
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Skor Tablosu</h1>
        <div className={styles.scoreboard}>
          <div className={styles.header}>
            <div className={styles.rank}>#</div>
            <div className={styles.initials}>Kullanıcı</div>
            <div className={styles.games}>Oyun</div>
            <div className={styles.points}>Puan</div>
          </div>
          {scores.map((score, index) => (
            <div key={score.id} className={styles.row}>
              <div className={styles.rank}>{index + 1}</div>
              <div className={styles.initials}>{score.displayName}</div>
              <div className={styles.games}>{score.total_games}</div>
              <div className={styles.points}>{score.total_points}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
