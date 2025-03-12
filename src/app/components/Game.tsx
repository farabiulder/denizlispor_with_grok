"use client";
import { useState, useEffect } from "react";
import { stories } from "../data/stories";
import styles from "../styles/Game.module.css";

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

const initialProgressBars: ProgressBars = {
  Finance: 50,
  TechnicalTeam: 50,
  Sponsors: 50,
  Fans: 50,
};

export default function Game() {
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [storyCount, setStoryCount] = useState<number>(0); // Track number of stories completed in category
  const [progressBars, setProgressBars] =
    useState<ProgressBars>(initialProgressBars);
  const [matchPrediction, setMatchPrediction] = useState<Score | null>(null);
  const [actualScore, setActualScore] = useState<Score | null>(null);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    if (completedCategories.length === 4) {
      calculateMatchPrediction();
    }
  }, [completedCategories]);

  const selectCategory = (category: string) => {
    if (!completedCategories.includes(category)) {
      setCurrentCategory(category);
      setCurrentStory(stories[category]);
      setStoryCount(1); // Start at first story
    }
  };

  const chooseOption = (option: Option) => {
    // Update progress bars
    const newProgressBars = { ...progressBars };
    for (const [key, value] of Object.entries(option.effects)) {
      const barKey = key as keyof ProgressBars;
      newProgressBars[barKey] = Math.max(
        0,
        Math.min(100, newProgressBars[barKey] + (value || 0))
      );
    }
    setProgressBars(newProgressBars);

    // Move to next story or complete category
    if (storyCount < 5) {
      setCurrentStory(option.nextStory);
      setStoryCount(storyCount + 1);
    } else {
      setCompletedCategories((prev) => [...prev, currentCategory!]);
      setCurrentCategory(null);
      setCurrentStory(null);
      setStoryCount(0);
    }
  };

  const calculateMatchPrediction = () => {
    const strength =
      (progressBars.Finance +
        progressBars.TechnicalTeam +
        progressBars.Sponsors +
        progressBars.Fans) /
      4;
    const denizlisporGoals = Math.floor(strength / 20);
    const opponentGoals = 1; // Fixed opponent strength
    setMatchPrediction({ denizlisporGoals, opponentGoals });

    const actualDenizlisporGoals = Math.max(
      0,
      denizlisporGoals + Math.floor(Math.random() * 3) - 1
    );
    const actualOpponentGoals = Math.max(
      0,
      opponentGoals + Math.floor(Math.random() * 3) - 1
    );
    setActualScore({
      denizlisporGoals: actualDenizlisporGoals,
      opponentGoals: actualOpponentGoals,
    });

    const predictedOutcome =
      denizlisporGoals > opponentGoals
        ? "win"
        : denizlisporGoals < opponentGoals
        ? "lose"
        : "draw";
    const actualOutcome =
      actualDenizlisporGoals > actualOpponentGoals
        ? "win"
        : actualDenizlisporGoals < actualOpponentGoals
        ? "lose"
        : "draw";
    if (predictedOutcome === actualOutcome) {
      setPoints(points + 10);
    }
  };

  const resetGame = () => {
    setCompletedCategories([]);
    setCurrentCategory(null);
    setCurrentStory(null);
    setStoryCount(0);
    setProgressBars(initialProgressBars);
    setMatchPrediction(null);
    setActualScore(null);
    setPoints(0);
  };

  if (matchPrediction && actualScore) {
    return (
      <div className={styles.container}>
        <h1>Match Result</h1>
        <p>
          Predicted Score: {matchPrediction.denizlisporGoals} -{" "}
          {matchPrediction.opponentGoals}
        </p>
        <p>
          Actual Score: {actualScore.denizlisporGoals} -{" "}
          {actualScore.opponentGoals}
        </p>
        <p>Points: {points}</p>
        <button className={styles.button} onClick={resetGame}>
          Play Again
        </button>
      </div>
    );
  } else if (currentCategory && currentStory) {
    return (
      <div className={styles.container}>
        <h1>
          {currentCategory} - Story {storyCount}
        </h1>
        <p>{currentStory.text}</p>
        <div className={styles.options}>
          {currentStory.options.map((option, index) => (
            <button
              key={index}
              className={styles.button}
              onClick={() => chooseOption(option)}
            >
              {option.text}
            </button>
          ))}
        </div>
        <div className={styles.progressBars}>
          <h2>Progress</h2>
          {Object.entries(progressBars).map(([key, value]) => (
            <div key={key} className={styles.progressContainer}>
              <div className={styles.progressLabel}>
                {key}: {value}%
              </div>
              <progress
                className={styles.progressBar}
                value={value}
                max={100}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <h1>Denizlispor Menajerlik</h1>
        <p>
          Stratejik kararlar alarak kulübü finansal zorluklar karşısında
          yönetin.
        </p>
        <h2>Kategori Seçin</h2>
        <div className={styles.categories}>
          {Object.keys(stories).map((category) => (
            <button
              key={category}
              className={styles.button}
              onClick={() => selectCategory(category)}
              disabled={completedCategories.includes(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className={styles.progressBars}>
          <h2>Progress</h2>
          {Object.entries(progressBars).map(([key, value]) => (
            <div key={key} className={styles.progressContainer}>
              <div className={styles.progressLabel}>
                {key}: {value}%
              </div>
              <progress
                className={styles.progressBar}
                value={value}
                max={100}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}
