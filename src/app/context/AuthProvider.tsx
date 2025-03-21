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
  first_name: string;
  last_name: string;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ data: { user: User } | null; error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (first_name: string, last_name: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      let { data: profile, error } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", userId)
        .single();

      if (error) {
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
            first_name: newProfile.first_name || "",
            last_name: newProfile.last_name || "",
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
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
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

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return { data: null, error: new Error("Failed to create user") };
      }

      // Create the profile immediately without waiting for trigger
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Profile creation error:", insertError);
        // If profile creation fails, we'll still return success
        // The profile can be created when the user logs in
        return {
          data: { user: authData.user },
          error: null,
        };
      }

      // Create initial user_points record
      await supabase
        .from("user_points")
        .insert([
          {
            user_id: authData.user.id,
            total_points: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .single();

      // Create initial game_state record
      await supabase
        .from("game_states")
        .insert([
          {
            user_id: authData.user.id,
            progress_bars: {
              Finance: 50,
              TechnicalTeam: 50,
              Sponsors: 50,
              Fans: 50,
            },
            completed_categories: [],
            points: 0,
            estimated_scores: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .single();

      return { data: { user: authData.user }, error: null };
    } catch (error) {
      console.error("Error in signUp:", error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error("An unexpected error occurred during registration"),
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (first_name: string, last_name: string) => {
    if (!user?.id) throw new Error("No user logged in");

    const { error } = await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

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
