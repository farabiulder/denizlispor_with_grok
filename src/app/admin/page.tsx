"use client";
import Game from "../components/Game";
import { useAuth } from "../context/AuthProvider";
import styles from "../styles/Admin.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdminStatus, setLoadingAdminStatus] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

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
          fetchUsers(); // Fetch users if admin
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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, created_at, first_name, last_name");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      if (data) {
        setUsers(
          data.map((user) => ({
            id: user.id,
            email: user.email,
            name:
              user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.first_name || "İsimsiz Kullanıcı",
            created_at: user.created_at,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUserToDelete(userId);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Call our API endpoint to delete the user
      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userToDelete }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setDeleteSuccess("User successfully deleted");
      setUserToDelete(null);
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      setDeleteError(err.message || "Error deleting user");
      console.error("Delete error:", err);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

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
        <div className={styles.section}>
          <h2>User Management</h2>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <div className={styles.userList}>
              {users.map((user) => (
                <div key={user.id} className={styles.userItem}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {user.name || "User"}
                    </span>
                    <span className={styles.userEmail}>{user.email}</span>
                    <span className={styles.userId}>ID: {user.id}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {userToDelete && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              {deleteError && <p className={styles.error}>{deleteError}</p>}
              {deleteSuccess && (
                <p className={styles.success}>{deleteSuccess}</p>
              )}
              <div className={styles.modalButtons}>
                <button
                  onClick={confirmDeleteUser}
                  className={styles.confirmButton}
                >
                  Delete
                </button>
                <button onClick={cancelDelete} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2>Game Management</h2>
          <Game />
        </div>
      </div>
    </div>
  );
}
