"use client";
import Game from "../components/Game";
import { useAuth } from "../context/AuthProvider";
import styles from "../styles/Admin.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdminStatus, setLoadingAdminStatus] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // Check if user is in admin list
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      } finally {
        setLoadingAdminStatus(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  if (loading || loadingAdminStatus) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={styles.unauthorized}>
        Please log in to access this page
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorized}>
        You don't have permission to access this page
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.email}</p>
      </div>

      <div className={styles.adminContent}>
        <Game />
      </div>
    </div>
  );
}
