"use client";
import { useState, useEffect } from "react";
import { stories } from "../data/stories";
import styles from "../styles/Game.module.css";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

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
  const isAdminPage = pathname === "/admin";
  const [lastCompletionTime, setLastCompletionTime] = useState<number | null>(
    null
  );
  const [canPlay, setCanPlay] = useState<boolean>(true);

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
        setGameLoaded(true);
      } else {
        // If no data but also no error, consider the game loaded with defaults
        setGameLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load game state:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save game state to Supabase
  const saveGameState = async () => {
    if (!user) return;

    try {
      // Create a simpler object with just the essential fields
      const gameState = {
        user_id: user.id,
        progress_bars: progressBars,
        completed_categories: completedCategories,
        points: points || 0,
        estimated_scores: estimatedScores || {},
        updated_at: new Date().toISOString(), // Use ISO string for dates
      };

      console.log("Saving game state:", gameState);

      const { error } = await supabase.from("game_states").upsert(gameState, {
        onConflict: "user_id",
      });

      if (error) {
        console.error("Error saving game state:", error);
      } else {
        console.log("Game state saved successfully");
      }
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
      setCurrentStory(stories[category]);
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
    const newPoints = points + Math.round(score * 10); // Convert score to points (0-100 scale)
    setPoints(newPoints);

    // Save the game state
    const gameState = {
      user_id: user.id,
      progress_bars: progressBars,
      completed_categories: updatedCompletedCategories,
      points: newPoints,
      estimated_scores: updatedEstimatedScores,
      updated_at: new Date().toISOString(),
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
      console.log("🔍 Attempting to fetch score data...");

      // Try to get any row from the table
      const { data, error } = await supabase
        .from("real_dp_score")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      console.log("Query result:", { data, error });

      // If we got data, use it
      if (!error && data && data.length > 0) {
        console.log("✅ Found existing row:", data[0]);

        const score = {
          denizlisporGoals: Number(data[0].dp_score),
          opponentGoals: Number(data[0].rival),
        };

        console.log("🏆 Parsed score:", score);
        return score;
      }

      // If no data found or there was an error, use default values
      console.log("⚠️ No data found or access denied. Using default score.");
      return { denizlisporGoals: 2, opponentGoals: 4 };
    } catch (err) {
      console.error("💥 Exception in fetchActualScore:", err);
      return { denizlisporGoals: 2, opponentGoals: 4 };
    }
  };

  const calculateMatchPrediction = async () => {
    // Only calculate points if not already calculated
    if (scoreCalculated) {
      console.log("Points already calculated, skipping");
      return;
    }

    // Calculate a match prediction based on all progress bars
    const matchPrediction: Score = {
      denizlisporGoals: Math.round(
        (progressBars.TechnicalTeam * 0.5 +
          progressBars.Finance * 0.2 +
          progressBars.Fans * 0.3) /
          20
      ),
      opponentGoals: Math.round(
        10 -
          (progressBars.TechnicalTeam * 0.5 +
            progressBars.Finance * 0.2 +
            progressBars.Fans * 0.3) /
            20
      ),
    };

    setMatchPrediction(matchPrediction);

    // Fetch fresh score data
    const actualScore = await fetchActualScore();

    if (actualScore) {
      setActualScore(actualScore);
      setLastScoreUpdate(Date.now());

      // Only award points if they haven't been awarded already for this game session
      // Add a check to see if points were already calculated
      if (!matchPrediction || points === 0) {
        // Award points if the prediction matches the actual score
        let earnedPoints = 0;

        // Check if the prediction exactly matches the actual score
        if (
          matchPrediction.denizlisporGoals === actualScore.denizlisporGoals &&
          matchPrediction.opponentGoals === actualScore.opponentGoals
        ) {
          // Perfect match - award maximum points
          earnedPoints = 100;
        }
        // Check if at least the result (win/loss/draw) was predicted correctly
        else if (
          (matchPrediction.denizlisporGoals > matchPrediction.opponentGoals &&
            actualScore.denizlisporGoals > actualScore.opponentGoals) ||
          (matchPrediction.denizlisporGoals < matchPrediction.opponentGoals &&
            actualScore.denizlisporGoals < actualScore.opponentGoals) ||
          (matchPrediction.denizlisporGoals === matchPrediction.opponentGoals &&
            actualScore.denizlisporGoals === actualScore.opponentGoals)
        ) {
          // Correct result but not exact score - award partial points
          earnedPoints = 50;
        } else {
          // Incorrect prediction - award minimum points
          earnedPoints = 10;
        }

        // Update the player's points
        setPoints((prevPoints) => prevPoints + earnedPoints);

        // Save the updated points to Supabase
        if (saveTimer) {
          clearTimeout(saveTimer);
        }

        const timer = setTimeout(() => {
          saveGameState();
        }, 1000);

        setSaveTimer(timer);
      }

      // After setting points, mark as calculated
      setScoreCalculated(true);
    }
  };

  const resetGame = () => {
    // Only update last completion time if not on admin page
    if (!isAdminPage) {
      const now = new Date().getTime();
      setLastCompletionTime(now);

      // Save the complete game state with the updated last_completion_time
      if (user) {
        // Create a simpler game state object
        const gameState = {
          user_id: user.id,
          progress_bars: initialProgressBars,
          completed_categories: [],
          points: 0,
          estimated_scores: {},
          updated_at: new Date().toISOString(), // Use ISO string for dates
        };

        console.log("Resetting game state:", gameState);

        supabase
          .from("game_states")
          .upsert(gameState, {
            onConflict: "user_id",
          })
          .then(({ error }) => {
            if (error) {
              console.error("Error saving game state:", error);
            } else {
              console.log("Game state reset successfully");
            }
          });
      }
    }

    // Rest of your existing resetGame code
    setCompletedCategories([]);
    setCurrentCategory(null);
    setCurrentStory(null);
    setStoryCount(0);
    setProgressBars(initialProgressBars);
    setMatchPrediction(null);
    setActualScore(null);
    setPoints(0);
    setEstimatedScores({});
    setScoreCalculated(false);
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

        <div className={styles.pointsEarned}>
          <p>Kazanılan Puan: {points}</p>
        </div>

        {/* Only show replay button on admin page */}
        {isAdminPage && (
          <button onClick={resetGame} className={styles.button}>
            Yeniden Oyna
          </button>
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
              ).map((option, index) => (
                <motion.button
                  key={index}
                  className={styles.optionButton}
                  onClick={() => chooseOption(option)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  whileHover={{ scale: 1.02, backgroundColor: "#133b5c" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.text}
                </motion.button>
              ))}
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
            {Object.keys(stories).map((category, index) => (
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
                  !completedCategories.includes(category) ? { scale: 1.05 } : {}
                }
                whileTap={
                  !completedCategories.includes(category) ? { scale: 0.95 } : {}
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
      </motion.div>
    );
  }
}
