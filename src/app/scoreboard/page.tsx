"use client";
import { useEffect, useState } from "react";
import styles from "../styles/Scoreboard.module.css";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabaseClient";

interface UserScore {
  id: string;
  displayName: string;
  total_games: number;
  total_points: number;
}

export default function Scoreboard() {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserScores();
  }, []);

  const formatName = (name: string): string => {
    if (!name) return "";
    return name.length > 2
      ? `${name.slice(0, 2)}${"*".repeat(name.length - 2)}`
      : name;
  };

  const fetchUserScores = async () => {
    try {
      const { data: userPoints, error: pointsError } = await supabase
        .from("user_points")
        .select("user_id, total_points");

      if (pointsError) throw pointsError;

      const { data: userGames, error: gamesError } = await supabase
        .from("game_states")
        .select("user_id, completed_categories");

      if (gamesError) throw gamesError;

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, first_name, last_name");

      if (usersError) throw usersError;

      // Combine the data
      const combinedScores = users.map((user) => {
        const userPoint = userPoints.find((p) => p.user_id === user.id);
        const userGame = userGames.find((g) => g.user_id === user.id);

        // Format name with first 2 letters and asterisks
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
      combinedScores.sort((a, b) => b.total_points - a.total_points);

      setScores(combinedScores);
    } catch (error) {
      console.error("Error fetching user scores:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Yükleniyor...</p>
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
