"use client";
import { useState, useEffect } from "react";
import { getStory, stories } from "../data/stories";
import styles from "../styles/Game.module.css";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import {
  generatePrediction,
  generatePredictionFromProgressBars,
  PredictionData,
} from "../services/sportmonksService";

interface ProgressBars {
  Finance: number;
  TechnicalTeam: number;
  Sponsors: number;
  Fans: number;
}

interface Score {
  denizlisporGoals: number;
  opponentGoals: number;
}

interface Story {
  text: string;
  options: Option[];
}

interface Option {
  text: string;
  effects: Partial<ProgressBars>;
  nextStory: Story;
}

interface GameState {
  user_id: string;
  progress_bars: ProgressBars;
  completed_categories: string[];
  points: number;
  estimated_scores: Record<string, number>;
  updated_at: Date;
  last_completion_time?: number | null;
}

interface PredictionDetails extends PredictionData {
  isLoading: boolean;
  error: string | null;
  nextOpponent?: string;
  dataSource: string;
}

interface WeeklyScore {
  id?: number;
  user_id: string;
  week: number;
  year: number;
  points_earned: number;
  prediction: Score;
  actual_score: Score;
  created_at: string;
}

const initialProgressBars: ProgressBars = {
  Finance: 50,
  TechnicalTeam: 50,
  Sponsors: 50,
  Fans: 50,
};

export default function Game() {
  const { user, loading: authLoading } = useAuth();
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [storyCount, setStoryCount] = useState<number>(0);
  const [progressBars, setProgressBars] =
    useState<ProgressBars>(initialProgressBars);
  const [matchPrediction, setMatchPrediction] = useState<Score | null>(null);
  const [actualScore, setActualScore] = useState<Score | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [estimatedScores, setEstimatedScores] = useState<
    Record<string, number>
  >({});
  const [gameLoaded, setGameLoaded] = useState(false);
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastScoreUpdate, setLastScoreUpdate] = useState<number>(0);
  const [scoreCalculated, setScoreCalculated] = useState<boolean>(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.includes("/admin") || false;
  const [lastCompletionTime, setLastCompletionTime] = useState<number | null>(
    null
  );
  const [canPlay, setCanPlay] = useState<boolean>(true);
  const [predictionDetails, setPredictionDetails] = useState<PredictionDetails>(
    {
      predictedScore: { denizlisporGoals: 0, opponentGoals: 0 },
      recentMatches: [],
      form: { wins: 0, draws: 0, losses: 0 },
      isLoading: false,
      error: null,
      dataSource: "Başlangıç",
    }
  );
  const [showOptionEffects, setShowOptionEffects] = useState<boolean>(false);
  const [newStoriesAvailable, setNewStoriesAvailable] =
    useState<boolean>(false);
  const [currentStoryWeek, setCurrentStoryWeek] = useState<number>(0);
  const [lastPlayedStoryWeek, setLastPlayedStoryWeek] = useState<number>(0);
  const [canPlayNewStory, setCanPlayNewStory] = useState<boolean>(false);
  const [lastStoryCompletionDate, setLastStoryCompletionDate] =
    useState<Date | null>(null);
  const [canStartNewStory, setCanStartNewStory] = useState<boolean>(false);

  // Load game state from Supabase
  useEffect(() => {
    if (!authLoading && user) {
      loadGameState();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading && user) {
      // Load the last completion time
      const loadLastCompletionTime = async () => {
        try {
          const { data, error } = await supabase
            .from("game_states")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (!error && data && data.last_completion_time) {
            setLastCompletionTime(data.last_completion_time);

            // Check if it's a new week since last completion
            const lastCompletion = new Date(data.last_completion_time);
            const now = new Date();

            // Get the week number for both dates
            const getWeekNumber = (d: Date) => {
              const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
              const pastDaysOfYear =
                (d.getTime() - firstDayOfYear.getTime()) / 86400000;
              return Math.ceil(
                (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
              );
            };

            const lastCompletionWeek = getWeekNumber(lastCompletion);
            const currentWeek = getWeekNumber(now);
            const lastCompletionYear = lastCompletion.getFullYear();
            const currentYear = now.getFullYear();

            // Allow play if it's a new week or year, or if on admin page
            const isNewWeekOrYear =
              currentYear > lastCompletionYear ||
              (currentYear === lastCompletionYear &&
                currentWeek > lastCompletionWeek);

            setCanPlay(isNewWeekOrYear || isAdminPage);
          }
        } catch (err) {
          console.error("Failed to load last completion time:", err);
        }
      };

      loadLastCompletionTime();
    }
  }, [authLoading, user, isAdminPage]);

  useEffect(() => {
    checkForNewStories();
  }, []);

  const checkForNewStories = () => {
    const newStoriesFlag = stories.newStories as string;
    if (newStoriesFlag) {
      const weekMatch = newStoriesFlag.match(/true(\d+)/);
      if (weekMatch && weekMatch[1]) {
        const storyWeek = parseInt(weekMatch[1], 10);
        setCurrentStoryWeek(storyWeek);

        // Check if this is a new story compared to what the user has played
        if (lastPlayedStoryWeek < storyWeek) {
          setNewStoriesAvailable(true);
        } else {
          setNewStoriesAvailable(false);
        }
      }
    }
  };

  const loadGameState = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_states")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        // Handle PGRST116 (not found) error silently, but log other errors
        if (error.code !== "PGRST116") {
          console.error("Error fetching game state:", error);
        }

        // If the table doesn't exist, create a new game state
        if (error.code === "42P01") {
          console.log(
            "Game states table doesn't exist yet. Using default state."
          );
          setGameLoaded(true); // Consider the game loaded with defaults
        }
      }

      if (data) {
        setProgressBars(data.progress_bars);
        setCompletedCategories(data.completed_categories);
        setPoints(data.points);
        setEstimatedScores(data.estimated_scores || {});

        // Load the last played story week
        if (data.last_played_story_week) {
          setLastPlayedStoryWeek(data.last_played_story_week);
        }

        // Load last story completion date
        if (data.last_story_completion_date) {
          const completionDate = new Date(data.last_story_completion_date);
          setLastStoryCompletionDate(completionDate);
          // Always allow new story for admin
          setCanPlayNewStory(
            isAdminPage ? true : checkNewStoryAvailability(completionDate)
          );
        }

        setGameLoaded(true);
      } else {
        // If no data but also no error, consider the game loaded with defaults
        setGameLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load game state:", err);
    } finally {
      setLoading(false);

      // Check for new stories after loading game state
      checkForNewStories();
    }
  };

  // Save game state to Supabase
  const saveGameState = async () => {
    if (!user) return;

    try {
      // Save game state
      const gameState = {
        user_id: user.id,
        progress_bars: progressBars,
        completed_categories: completedCategories,
        points: points,
        estimated_scores: estimatedScores,
        updated_at: new Date().toISOString(),
      };

      const { error: gameStateError } = await supabase
        .from("game_states")
        .upsert(gameState, { onConflict: "user_id" });

      if (gameStateError) throw gameStateError;

      // Update user points
      const { error: pointsError } = await supabase.from("user_points").upsert(
        {
          user_id: user.id,
          total_points: points,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (pointsError) throw pointsError;
    } catch (err) {
      console.error("Failed to save game state:", err);
    }
  };

  // Save game state whenever relevant state changes
  useEffect(() => {
    if (user && gameLoaded) {
      // Clear any existing timer
      if (saveTimer) {
        clearTimeout(saveTimer);
      }

      // Set a new timer to save after a delay
      const timer = setTimeout(() => {
        saveGameState();
      }, 1000); // Wait 1 second before saving

      setSaveTimer(timer);

      // Cleanup
      return () => {
        if (saveTimer) clearTimeout(saveTimer);
      };
    }
  }, [progressBars, completedCategories, points, estimatedScores, gameLoaded]);

  useEffect(() => {
    if (completedCategories.length === 4) {
      calculateMatchPrediction();
    }
  }, [completedCategories]);

  // Replace your existing useEffect for real-time subscription with this
  useEffect(() => {
    if (completedCategories.length === 4) {
      console.log("Setting up realtime subscription for score updates");

      // First fetch initial score
      fetchActualScore().then((initialScore) => {
        if (initialScore) {
          console.log("Initial score loaded:", initialScore);
          setActualScore(initialScore);
          setLastScoreUpdate(Date.now());
        }
      });

      // Create a more robust channel connection
      const channel = supabase
        .channel("db-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "real_dp_score",
          },
          async (payload) => {
            console.log("🔴 REALTIME UPDATE RECEIVED:", payload);

            // Immediately fetch fresh data when a change is detected
            const freshScore = await fetchActualScore();
            console.log("📊 Fresh score after update:", freshScore);

            if (freshScore) {
              console.log("Updating displayed score");
              setActualScore(freshScore);
              setLastScoreUpdate(Date.now());
            }
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      return () => {
        console.log("Cleaning up subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [completedCategories.length]);

  const selectCategory = (category: string) => {
    if (!completedCategories.includes(category)) {
      setCurrentCategory(category);
      setCurrentStory(getStory(category));
      setStoryCount(1);
    }
  };

  // Add this function to calculate a more realistic score based on progress bars
  const calculateRealisticScore = (
    category: string,
    progressBars: ProgressBars
  ): number => {
    // Different weights for different categories
    const weights = {
      "Finansal Yönetim": {
        Finance: 0.6,
        Sponsors: 0.3,
        TechnicalTeam: 0.05,
        Fans: 0.05,
      },
      "Teknik Ekip": {
        TechnicalTeam: 0.7,
        Finance: 0.1,
        Sponsors: 0.1,
        Fans: 0.1,
      },
      Sponsorlar: {
        Sponsors: 0.6,
        Finance: 0.2,
        TechnicalTeam: 0.1,
        Fans: 0.1,
      },
      "Taraftar İlişkileri": {
        Fans: 0.7,
        Finance: 0.1,
        TechnicalTeam: 0.1,
        Sponsors: 0.1,
      },
    };

    // Default weights if category not found
    const defaultWeights = {
      Finance: 0.25,
      TechnicalTeam: 0.25,
      Sponsors: 0.25,
      Fans: 0.25,
    };

    // Get the appropriate weights for this category
    const categoryWeights =
      weights[category as keyof typeof weights] || defaultWeights;

    // Calculate weighted score (0-100 scale)
    let weightedScore = 0;
    Object.entries(progressBars).forEach(([key, value]) => {
      const weight = categoryWeights[key as keyof typeof categoryWeights];
      weightedScore += value * weight;
    });

    // Convert to 0-10 scale and add some randomness (±0.5)
    const randomFactor = Math.random() - 0.5;
    const finalScore = Math.min(
      10,
      Math.max(0, weightedScore / 10 + randomFactor)
    );

    // Round to one decimal place
    return Math.round(finalScore * 10) / 10;
  };

  // Then modify the completeCategory function to use this new calculation
  const completeCategory = async (category: string) => {
    if (!user) return;

    // Mark the category as completed
    const updatedCompletedCategories = [...completedCategories, category];
    setCompletedCategories(updatedCompletedCategories);

    // Calculate a realistic score based on progress bars
    const score = calculateRealisticScore(category, progressBars);

    // Update estimated scores
    const updatedEstimatedScores = { ...estimatedScores, [category]: score };
    setEstimatedScores(updatedEstimatedScores);

    // Update points
    const newPoints = points + Math.round(score * 10);
    setPoints(newPoints);

    // Update last played story week
    setLastPlayedStoryWeek(currentStoryWeek);

    // Save the game state
    const gameState = {
      user_id: user.id,
      progress_bars: progressBars,
      completed_categories: updatedCompletedCategories,
      points: newPoints,
      estimated_scores: updatedEstimatedScores,
      updated_at: new Date().toISOString(),
      last_played_story_week: currentStoryWeek,
    };

    try {
      await supabase.from("game_states").upsert(gameState, {
        onConflict: "user_id",
      });
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const chooseOption = (option: Option) => {
    // Update progress bars based on option effects
    setProgressBars((prevBars) => {
      const newBars = { ...prevBars };
      Object.entries(option.effects).forEach(([key, value]) => {
        // Use type assertion to handle dynamic key
        const barKey = key as keyof ProgressBars;
        newBars[barKey] = Math.min(Math.max(newBars[barKey] + value, 0), 100);
      });
      return newBars;
    });

    // Move to next story or complete category
    if (storyCount < 5) {
      setStoryCount(storyCount + 1);

      // Ensure the next story has options
      if (!option.nextStory.options || option.nextStory.options.length === 0) {
        // Generate fallback options for the next story
        const fallbackOptions = generateFallbackOptions(currentCategory || "");
        option.nextStory.options = fallbackOptions;
      }

      setCurrentStory(option.nextStory);
    } else {
      // Category completed
      if (currentCategory) {
        completeCategory(currentCategory);
      }
      setCurrentCategory(null);
      setCurrentStory(null);
    }
  };

  const checkScoreMatch = async (category: string, estimatedScore: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("real_scores")
        .select("score")
        .eq("category", category)
        .single();

      if (error) {
        console.error("Error fetching real score:", error);
        return;
      }

      if (data && data.score === estimatedScore) {
        // Award points for matching the real score
        setPoints((prevPoints) => prevPoints + 10);
      }
    } catch (err) {
      console.error("Failed to check score match:", err);
    }
  };

  // Modify fetchActualScore to directly access newest data with trace logs
  const fetchActualScore = async (): Promise<Score | null> => {
    try {
      console.log(
        "🔍 Attempting to fetch score data from real_dp_score table..."
      );

      // Get the most recent score from the real_dp_score table
      const { data, error } = await supabase
        .from("real_dp_score")
        .select("dp_score, rival, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      console.log("Query result:", { data, error });

      // If we got data, use it
      if (!error && data && data.length > 0) {
        console.log("✅ Found existing score record:", data[0]);

        // Parse the scores as numbers to ensure correct type
        const score = {
          denizlisporGoals: Number(data[0].dp_score),
          opponentGoals: Number(data[0].rival),
        };

        console.log("🏆 Parsed score:", score);
        return score;
      }

      // If no data found or there was an error, log and use default values
      console.log(
        "⚠️ No score data found or access denied. Using default score."
      );
      return { denizlisporGoals: 0, opponentGoals: 0 };
    } catch (err) {
      console.error("💥 Exception in fetchActualScore:", err);
      return { denizlisporGoals: 0, opponentGoals: 0 };
    }
  };

  const calculateMatchPrediction = async () => {
    if (!user) return;

    try {
      setPredictionDetails((prev) => ({ ...prev, isLoading: true }));

      // Calculate average performance from progress bars
      const avgPerformance =
        Object.values(progressBars).reduce((a, b) => a + b, 0) / 4;

      // Calculate average score from completed categories
      const avgCategoryScore =
        Object.values(estimatedScores).reduce((a, b) => a + b, 0) / 4;

      // Get prediction from API based on past matches
      const apiPrediction = await generatePrediction();

      // Combine API prediction with performance metrics
      const combinedPrediction = generatePredictionFromProgressBars({
        progressBars,
        categoryScores: estimatedScores,
        apiPrediction,
        avgPerformance,
        avgCategoryScore,
      });

      setMatchPrediction(combinedPrediction.predictedScore);
      setPredictionDetails({
        ...combinedPrediction,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error calculating match prediction:", error);
      setPredictionDetails((prev) => ({
        ...prev,
        isLoading: false,
        error: "Tahmin hesaplanırken bir hata oluştu.",
      }));
    }
  };

  const resetGame = async () => {
    if (!user || !isAdminPage) return;

    try {
      // Reset everything to initial state
      const initialState = {
        user_id: user.id,
        progress_bars: {
          Finance: 50,
          TechnicalTeam: 50,
          Sponsors: 50,
          Fans: 50,
        },
        completed_categories: [],
        points: 0,
        estimated_scores: {},
        last_story_completion_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("game_states")
        .upsert(initialState, { onConflict: "user_id" });

      if (error) throw error;

      // Reset all local state
      setProgressBars(initialState.progress_bars);
      setCompletedCategories([]);
      setCurrentCategory(null);
      setCurrentStory(getStory("Finansal Yönetim")); // Start with first story
      setStoryCount(1);
      setPoints(0);
      setEstimatedScores({});
      setLastStoryCompletionDate(new Date());
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset game:", err);
    }
  };

  const fetchRealScore = async (category: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from("real_scores")
        .select("score")
        .eq("category", category)
        .single();

      if (error) {
        // If the table doesn't exist, return a default score based on the category
        if (error.code === "42P01") {
          console.error(
            "Real scores table doesn't exist. Using default score."
          );
          // Return a default score based on the category
          const defaultScores: Record<string, number> = {
            "Finansal Yönetim": 7,
            "Teknik Ekip": 8,
            Sponsorlar: 6,
            "Taraftar İlişkileri": 9,
          };
          return defaultScores[category] || 5;
        } else {
          console.error("Error fetching real score:", error);
          return null;
        }
      }

      return data?.score || null;
    } catch (err) {
      console.error("Failed to fetch real score:", err);
      return null;
    }
  };

  // Function to generate fallback options when none are provided in the story
  const generateFallbackOptions = (category: string): Option[] => {
    const effects: Partial<ProgressBars> = {};
    effects[
      category === "Finansal Yönetim"
        ? "Finance"
        : category === "Teknik Ekip"
        ? "TechnicalTeam"
        : category === "Sponsorlar"
        ? "Sponsors"
        : "Fans"
    ] = 5;

    // Create fallback options
    return [
      {
        text: "Olumlu değerlendirip bu yönde devam etmek istiyorum",
        effects: effects,
        nextStory: {
          text: "Kararınız olumlu sonuçlar doğurdu ve takım daha da güçlendi.",
          options: [], // This will be replaced in the next story
        },
      },
      {
        text: "Temkinli yaklaşıp yeni stratejiler geliştirmeliyiz",
        effects: {},
        nextStory: {
          text: "Temkinli yaklaşımınız bazı fırsatları kaçırmanıza sebep olsa da riskleri azalttı.",
          options: [], // This will be replaced in the next story
        },
      },
      {
        text: "Bu durumu daha iyi analiz etmek için veri toplamalıyız",
        effects: {},
        nextStory: {
          text: "Veri toplama kararınız sayesinde daha bilinçli adımlar atabileceksiniz.",
          options: [], // This will be replaced in the next story
        },
      },
    ];
  };

  // Add a function to toggle option effects visibility
  const toggleOptionEffects = () => {
    setShowOptionEffects(!showOptionEffects);
  };

  // Add a function to calculate the total effect of an option
  const calculateOptionImpact = (effects: Partial<ProgressBars>): number => {
    return Object.values(effects).reduce((sum, value) => sum + value, 0);
  };

  // Add a function to get color based on impact
  const getImpactColor = (impact: number): string => {
    if (impact > 10) return styles.veryPositiveOption;
    if (impact > 0) return styles.positiveOption;
    if (impact === 0) return styles.neutralOption;
    if (impact > -10) return styles.negativeOption;
    return styles.veryNegativeOption;
  };

  // Add this function to check if 4 days have passed
  const checkNewStoryAvailability = (completionDate: Date) => {
    const now = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysPassed >= 4;
  };

  // Add this function to check if it's Monday
  const isMonday = () => {
    const today = new Date();
    return today.getDay() === 1; // 0 is Sunday, 1 is Monday
  };

  // Update the startNewStory function
  const startNewStory = async () => {
    if (!user) return;

    try {
      // Keep existing progress and points
      const gameState = {
        user_id: user.id,
        progress_bars: progressBars, // Keep existing progress
        completed_categories: [], // Reset categories to start new stories
        points: points, // Keep existing points
        estimated_scores: estimatedScores,
        last_story_completion_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("game_states")
        .upsert(gameState, { onConflict: "user_id" });

      if (error) throw error;

      // Reset story-related states but keep progress and points
      setCompletedCategories([]);
      setCurrentCategory(null);
      setCurrentStory(getStory("Finansal Yönetim")); // Start with first story
      setStoryCount(1);
      setLastStoryCompletionDate(new Date());
      window.location.reload();
    } catch (err) {
      console.error("Failed to start new story:", err);
    }
  };

  // Add this useEffect to handle non-admin story availability
  useEffect(() => {
    if (!isAdminPage && lastStoryCompletionDate) {
      const now = new Date();
      const daysPassed = Math.floor(
        (now.getTime() - lastStoryCompletionDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      setCanPlayNewStory(daysPassed >= 4);
    }
  }, [isAdminPage, lastStoryCompletionDate]);

  // Replace the getWeek function with this
  Date.prototype.getWeek = function () {
    const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
    return Math.ceil(
      ((this.getTime() - firstDayOfYear.getTime()) / 86400000 +
        firstDayOfYear.getDay() +
        1) /
        7
    );
  };

  // Update the function that fetches user points
  const fetchUserPoints = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user points:", error);
        return 0;
      }

      return data?.total_points || 0;
    } catch (err) {
      console.error("Failed to fetch user points:", err);
      return 0;
    }
  };

  // Add this useEffect to handle the waiting periods
  useEffect(() => {
    if (!lastStoryCompletionDate) return;

    const checkWaitingPeriod = () => {
      const now = new Date().getTime();
      const completionTime = lastStoryCompletionDate.getTime();
      const timeDifference = now - completionTime;

      if (isAdminPage) {
        // 1 minute wait for admin (60000 milliseconds)
        setCanStartNewStory(timeDifference >= 60000);
      } else {
        // 4 days wait for non-admin (345600000 milliseconds)
        setCanStartNewStory(timeDifference >= 345600000);
      }
    };

    // Initial check
    checkWaitingPeriod();

    // Set up interval to check every second for admin, every hour for non-admin
    const intervalTime = isAdminPage ? 1000 : 3600000;
    const interval = setInterval(checkWaitingPeriod, intervalTime);

    return () => clearInterval(interval);
  }, [lastStoryCompletionDate, isAdminPage]);

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading game...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Auth component will be rendered from layout
  }

  if (!canPlay && !isAdminPage) {
    return (
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Denizlispor Menajerlik</h1>
        <div className={styles.waitingMessage}>
          <h2>Bu haftaki hikayeyi tamamladınız!</h2>
          <p>Yeni hikaye için gelecek haftayı bekleyin.</p>
          <p className={styles.lastPlayedDate}>
            Son oynama:{" "}
            {lastCompletionTime
              ? new Date(lastCompletionTime).toLocaleDateString("tr-TR")
              : "Henüz oynanmadı"}
          </p>
        </div>

        {user && (
          <div className={styles.userInfo}>
            <div className={styles.pointsDisplay}>
              <span>Toplam Puan:</span>
              <span className={styles.pointsValue}>{points}</span>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className={styles.signOutButton}
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  if (matchPrediction && actualScore) {
    return (
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Maç Sonucu</h1>
        <div className={styles.scoreCard}>
          <motion.div
            className={styles.scoreContainer}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2>Tahmin Edilen Skor</h2>
            <div className={styles.scoreDisplay}>
              <span className={styles.teamName}>Denizlispor</span>
              <span className={styles.scoreValue}>
                {matchPrediction.denizlisporGoals}
              </span>
              <span className={styles.scoreSeparator}>-</span>
              <span className={styles.scoreValue}>
                {matchPrediction.opponentGoals}
              </span>
              <span className={styles.teamName}>Rakip</span>
            </div>
          </motion.div>

          <motion.div
            className={styles.scoreContainer}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2>Gerçek Skor</h2>
            <div className={styles.scoreDisplay}>
              <span className={styles.teamName}>Denizlispor</span>
              <span className={styles.scoreValue}>
                {actualScore.denizlisporGoals}
              </span>
              <span className={styles.scoreSeparator}>-</span>
              <span className={styles.scoreValue}>
                {actualScore.opponentGoals}
              </span>
              <span className={styles.teamName}>Rakip</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.predictionDetails}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h2>Tahmin Detayları</h2>

          {predictionDetails.isLoading ? (
            <p>Tahmin yükleniyor...</p>
          ) : predictionDetails.error ? (
            <p className={styles.errorText}>{predictionDetails.error}</p>
          ) : (
            <>
              {predictionDetails.nextOpponent && (
                <div className={styles.nextOpponent}>
                  <h3>Bir Sonraki Rakip</h3>
                  <div className={styles.opponentName}>
                    {predictionDetails.nextOpponent}
                  </div>
                </div>
              )}

              <div className={styles.formSummary}>
                <h3>Son 5 Maç Formu</h3>
                <div className={styles.formStats}>
                  <div className={styles.formStat}>
                    <span className={styles.formValue}>
                      {predictionDetails.form.wins}
                    </span>
                    <span className={styles.formLabel}>Galibiyet</span>
                  </div>
                  <div className={styles.formStat}>
                    <span className={styles.formValue}>
                      {predictionDetails.form.draws}
                    </span>
                    <span className={styles.formLabel}>Beraberlik</span>
                  </div>
                  <div className={styles.formStat}>
                    <span className={styles.formValue}>
                      {predictionDetails.form.losses}
                    </span>
                    <span className={styles.formLabel}>Mağlubiyet</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          className={styles.pointsContainer}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <h2>Toplam Puan</h2>
          <div className={styles.pointsValue}>{points}</div>
        </motion.div>

        <motion.div
          className={styles.matchResult}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <h2 className={styles.resultTitle}>
            {actualScore.denizlisporGoals > actualScore.opponentGoals
              ? `Denizlispor ${actualScore.denizlisporGoals}-${actualScore.opponentGoals} Kazandı! 🎉`
              : actualScore.denizlisporGoals < actualScore.opponentGoals
              ? `Denizlispor ${actualScore.denizlisporGoals}-${actualScore.opponentGoals} Kaybetti! 😔`
              : `Beraberlik: ${actualScore.denizlisporGoals}-${actualScore.opponentGoals} 🤝`}
          </h2>

          <p className={styles.predictionLabel}>
            Tahmininiz: Denizlispor {matchPrediction.denizlisporGoals}-
            {matchPrediction.opponentGoals} Rakip
          </p>

          <p className={styles.resultMessage}>
            {matchPrediction.denizlisporGoals ===
              actualScore.denizlisporGoals &&
            matchPrediction.opponentGoals === actualScore.opponentGoals
              ? "Tahmininiz tam olarak doğru! Tebrikler! 🏆"
              : matchPrediction &&
                ((matchPrediction.denizlisporGoals >
                  matchPrediction.opponentGoals &&
                  actualScore.denizlisporGoals > actualScore.opponentGoals) ||
                  (matchPrediction.denizlisporGoals <
                    matchPrediction.opponentGoals &&
                    actualScore.denizlisporGoals < actualScore.opponentGoals) ||
                  (matchPrediction.denizlisporGoals ===
                    matchPrediction.opponentGoals &&
                    actualScore.denizlisporGoals === actualScore.opponentGoals))
              ? "Sonucu doğru tahmin ettiniz, ama skor farklıydı. 👍"
              : "Tahmin yanlış, bir dahaki sefere bol şans! 🔄"}
          </p>

          <p className={styles.updateTime}>
            Son güncelleme: {new Date(lastScoreUpdate).toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Only show replay button on admin page */}
        {isAdminPage && (
          <motion.div
            className={styles.completionActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={startNewStory}
              className={`${styles.newStoryButton} ${
                !canStartNewStory ? styles.disabledButton : ""
              }`}
              disabled={!canStartNewStory}
            >
              {canStartNewStory ? "Yeni Hikaye" : "Lütfen 1 dakika bekleyin"}
            </button>
            <button onClick={resetGame} className={styles.replayButton}>
              Baştan Başla
            </button>
          </motion.div>
        )}
        {/* For non-admin pages, show a message about next week */}
        {!isAdminPage && (
          <div className={styles.nextWeekMessage}>
            <p>Gelecek hafta yeni bir hikaye için tekrar bekleriz!</p>
          </div>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          className={styles.signOutButton}
        >
          Çıkış Yap
        </button>
      </motion.div>
    );
  } else if (currentCategory && currentStory) {
    return (
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.storyHeader}>
          <h1 className={styles.categoryTitle}>
            {currentCategory} - Hikaye {storyCount}/5
          </h1>
          <div className={styles.storyProgress}>
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`${styles.storyStep} ${
                  num <= storyCount ? styles.activeStep : ""
                }`}
              />
            ))}
          </div>

          {/* Add admin controls if on admin page */}
          {isAdminPage && (
            <div className={styles.adminControls}>
              <button
                onClick={toggleOptionEffects}
                className={styles.adminButton}
              >
                {showOptionEffects ? "Etkileri Gizle" : "Etkileri Göster"}
              </button>
            </div>
          )}
        </div>

        <motion.div
          className={styles.storyCard}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className={styles.storyText}>{currentStory.text}</p>

          <div className={styles.options}>
            <AnimatePresence>
              {(currentStory.options && currentStory.options.length > 0
                ? currentStory.options
                : generateFallbackOptions(currentCategory || "")
              ).map((option, index) => {
                // Calculate total impact for admin view
                const impact = calculateOptionImpact(option.effects);
                const impactClass =
                  showOptionEffects && isAdminPage
                    ? getImpactColor(impact)
                    : "";

                return (
                  <motion.button
                    key={index}
                    className={`${styles.optionButton} ${impactClass}`}
                    onClick={() => chooseOption(option)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#133b5c" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.text}

                    {/* Show effects for admin */}
                    {showOptionEffects && isAdminPage && (
                      <div className={styles.optionEffects}>
                        {Object.entries(option.effects).map(([key, value]) => (
                          <span
                            key={key}
                            className={
                              value > 0
                                ? styles.positiveEffect
                                : styles.negativeEffect
                            }
                          >
                            {key}: {value > 0 ? `+${value}` : value}
                          </span>
                        ))}
                        <span
                          className={
                            impact > 0
                              ? styles.positiveEffect
                              : impact < 0
                              ? styles.negativeEffect
                              : styles.neutralEffect
                          }
                        >
                          Toplam: {impact > 0 ? `+${impact}` : impact}
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className={styles.progressBars}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className={styles.progressTitle}>Kulüp Durumu</h2>
          {Object.entries(progressBars).map(([key, value], index) => (
            <motion.div
              key={key}
              className={styles.progressContainer}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
            >
              <div className={styles.progressLabel}>
                <span>{key}</span>
                <span>{value}%</span>
              </div>
              <div className={styles.progressBarContainer}>
                <motion.div
                  className={`${styles.progressBarFill} ${
                    styles[key.toLowerCase()]
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  } else {
    return (
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.headerSection}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className={styles.gameTitle}>Denizlispor Menajerlik</h1>
          <p className={styles.gameDescription}>
            Stratejik kararlar alarak kulübü finansal zorluklar karşısında
            yönetin.
          </p>
        </motion.div>

        <motion.div
          className={styles.categoriesSection}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className={styles.categoryHeader}>Kategori Seçin</h2>
          <div className={styles.categories}>
            {Object.entries(stories)
              .filter(([key]) => key !== "newStories") // Filter out newStories
              .map(([category, story], index) => (
                <motion.button
                  key={category}
                  className={`${styles.categoryButton} ${
                    completedCategories.includes(category)
                      ? styles.completedCategory
                      : ""
                  }`}
                  onClick={() => selectCategory(category)}
                  disabled={completedCategories.includes(category)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  whileHover={
                    !completedCategories.includes(category)
                      ? { scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    !completedCategories.includes(category)
                      ? { scale: 0.95 }
                      : {}
                  }
                >
                  <span className={styles.categoryName}>{category}</span>
                  {completedCategories.includes(category) && (
                    <span className={styles.categoryScore}>
                      Puan: {estimatedScores[category] || 0}/10
                    </span>
                  )}
                </motion.button>
              ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.progressBars}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className={styles.progressTitle}>Kulüp Durumu</h2>
          {Object.entries(progressBars).map(([key, value], index) => (
            <motion.div
              key={key}
              className={styles.progressContainer}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
            >
              <div className={styles.progressLabel}>
                <span>{key}</span>
                <span>{value}%</span>
              </div>
              <div className={styles.progressBarContainer}>
                <motion.div
                  className={`${styles.progressBarFill} ${
                    styles[key.toLowerCase()]
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {user && (
          <motion.div
            className={styles.userInfo}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className={styles.pointsDisplay}>
              <span>Toplam Puan:</span>
              <span className={styles.pointsValue}>{points}</span>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className={styles.signOutButton}
            >
              Çıkış Yap
            </button>
          </motion.div>
        )}

        {/* Add a new story notification if available */}
        {/* {newStoriesAvailable && (
          <motion.div
            className={styles.newStoryNotification}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className={styles.newStoryBadge}>Yeni</div>
            <h3>Yeni Hikaye Mevcut!</h3>
            <p>
              Bu hafta yeni bir hikaye ile karşınızdayız. Denizlispor'un
              kaderini belirlemek için hemen oyna!
            </p>
          </motion.div>
        )} */}

        {/* Update the completion actions section */}
        {isAdminPage ? (
          <motion.div
            className={styles.completionActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={startNewStory}
              className={`${styles.newStoryButton} ${
                !canStartNewStory ? styles.disabledButton : ""
              }`}
              disabled={!canStartNewStory}
            >
              {canStartNewStory ? "Yeni Hikaye" : "Lütfen 1 dakika bekleyin"}
            </button>
            <button onClick={resetGame} className={styles.replayButton}>
              Baştan Başla
            </button>
          </motion.div>
        ) : (
          completedCategories.length === 4 && (
            <motion.div
              className={styles.completionActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {canStartNewStory ? (
                <button
                  onClick={startNewStory}
                  className={styles.newStoryButton}
                >
                  Yeni Hikaye
                </button>
              ) : (
                <p className={styles.waitMessage}>
                  Yeni hikaye için{" "}
                  {4 -
                    Math.floor(
                      (new Date().getTime() -
                        (lastStoryCompletionDate?.getTime() || 0)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                  gün kaldı
                </p>
              )}
            </motion.div>
          )
        )}
      </motion.div>
    );
  }
}
