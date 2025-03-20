"use client";
import { useAuth } from "./context/AuthProvider";
import Game from "./components/Game";
import Auth from "./components/Auth";
import BottomNav from "./components/BottomNav";
import styles from "./styles/page.module.css";

export default function Home() {
  const { user, loading } = useAuth();

  // Return null during loading to avoid hydration mismatch
  if (loading) {
    return null;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <Game />
      </div>
      <BottomNav />
    </div>
  );
}
