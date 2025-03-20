"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type UserProfile = {
  name: string;
  surname: string;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, surname: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First, check if the user exists in the users table
      let { data: profile, error } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", userId)
        .single();

      if (error) {
        // If user doesn't exist, create a new profile
        if (error.code === "PGRST116") {
          const { data: newProfile, error: insertError } = await supabase
            .from("users")
            .insert([
              {
                id: userId,
                first_name: "",
                last_name: "",
                email: user?.email || "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select("first_name, last_name")
            .single();

          if (insertError || !newProfile) {
            console.error("Error creating user profile:", insertError);
            return;
          }

          setUserProfile({
            name: newProfile.first_name || "",
            surname: newProfile.last_name || "",
          });
        } else {
          console.error("Error fetching user profile:", error);
        }
        return;
      }

      if (!profile) {
        console.error("No profile data found");
        return;
      }

      setUserProfile({
        name: profile.first_name || "",
        surname: profile.last_name || "",
      });
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  useEffect(() => {
    const setData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error in setData:", error);
      } finally {
        setLoading(false);
      }
    };

    setData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (name: string, surname: string) => {
    if (!user?.id) throw new Error("No user logged in");

    const { error } = await supabase
      .from("users")
      .update({
        first_name: name,
        last_name: surname,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    // Refresh user profile
    await fetchUserProfile(user.id);
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
