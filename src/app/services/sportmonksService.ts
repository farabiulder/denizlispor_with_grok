// SportMonks API service for fetching football data
const API_KEY = process.env.NEXT_PUBLIC_SPORTMONKS_API_KEY;
const BASE_URL = 'https://api.sportmonks.com/v3/football';

// Denizlispor team ID in SportMonks API
const DENIZLISPOR_TEAM_ID = 3566; 

// Using SerpAPI to fetch football data and make predictions
const SERPAPI_KEY = process.env.NEXT_PUBLIC_SERPAPI_API_KEY;

interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  isDenizlisporHome: boolean;
}

export interface PredictionData {
  predictedScore: {
    denizlisporGoals: number;
    opponentGoals: number;
  };
  recentMatches: MatchResult[];
  form: {
    wins: number;
    draws: number;
    losses: number;
  };
  nextOpponent?: string;
  dataSource: string;
}

// Add this interface at the top of the file
interface ProgressBars {
  Finance: number;
  TechnicalTeam: number;
  Sponsors: number;
  Fans: number;
}

/**
 * Fetches recent matches for Denizlispor using SerpAPI
 */
export const fetchRecentMatches = async (): Promise<{ matches: MatchResult[], source: string }> => {
  try {
    // Use our Next.js API route to call SerpAPI
    const response = await fetch(
      `/api/serpapi?query=${encodeURIComponent('Denizlispor son 5 maç sonuçları')}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("SerpAPI response:", data); // Log the response for debugging
    
    // Try to extract sports results from the SerpAPI response
    let matches: MatchResult[] = [];
    
    try {
      // Check if sports_results exists in the response
      if (data.sports_results && data.sports_results.games) {
        matches = data.sports_results.games
          .filter((game: any) => game && game.teams && Array.isArray(game.teams) && game.teams.length >= 2 && game.score)
          .map((game: any) => {
            try {
              const homeTeam = game.teams[0].name || "Home Team";
              const awayTeam = game.teams[1].name || "Away Team";
              const isDenizlisporHome = homeTeam.includes("Denizlispor");
              
              // Parse scores safely
              let homeScore = 0;
              let awayScore = 0;
              
              if (typeof game.score === 'string' && game.score.includes('-')) {
                const scores = game.score.split('-').map((s: string) => parseInt(s.trim()));
                if (scores.length >= 2) {
                  homeScore = isNaN(scores[0]) ? 0 : scores[0];
                  awayScore = isNaN(scores[1]) ? 0 : scores[1];
                }
              }
              
              return {
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                date: game.date || new Date().toISOString().split('T')[0],
                isDenizlisporHome
              };
            } catch (gameError) {
              console.warn("Error parsing game:", gameError);
              return null;
            }
          })
          .filter(Boolean)
          .slice(0, 5); // Get only the last 5 matches
      }
      
      // If we still couldn't find any matches, use fallback data
      if (matches.length === 0) {
        console.log("Using fallback match data");
        return { 
          matches: getFallbackMatches(), 
          source: "Fallback data (API'den veri alınamadı)" 
        };
      }
      
      return { matches, source: "SerpAPI live data" };
    } catch (parseError) {
      console.error('Error parsing SerpAPI response:', parseError);
      return { 
        matches: getFallbackMatches(), 
        source: "Fallback data (API yanıtı işlenemedi)" 
      };
    }
  } catch (error) {
    console.error('Error fetching recent matches from SerpAPI:', error);
    return { 
      matches: getFallbackMatches(), 
      source: "Fallback data (API bağlantı hatası)" 
    };
  }
};

/**
 * Provides fallback match data when API fails
 */
const getFallbackMatches = (): MatchResult[] => {
  return [
    {
      homeTeam: "Denizlispor",
      awayTeam: "Kömürspor",
      homeScore: 2,
      awayScore: 2,
      date: "2024-03-10",
      isDenizlisporHome: true
    },
    {
      homeTeam: "Denizlispor",
      awayTeam: "TM Kırıkkalespor",
      homeScore: 4,
      awayScore: 1,
      date: "2024-03-03",
      isDenizlisporHome: true
    },
    {
      homeTeam: "Kahramanmaraş İstiklal Spor",
      awayTeam: "Denizlispor",
      homeScore: 1,
      awayScore: 1,
      date: "2024-02-25",
      isDenizlisporHome: false
    },
    {
      homeTeam: "Denizlispor",
      awayTeam: "Tepecikspor",
      homeScore: 1,
      awayScore: 1,
      date: "2024-02-18",
      isDenizlisporHome: true
    },
    {
      homeTeam: "Talasgücü Belediyespor",
      awayTeam: "Denizlispor",
      homeScore: 1,
      awayScore: 2,
      date: "2024-02-11",
      isDenizlisporHome: false
    }
  ];
};

/**
 * Fetches Denizlispor's next opponent using SerpAPI
 */
export const fetchNextOpponent = async (): Promise<string> => {
  try {
    const response = await fetch(
      `/api/serpapi?query=${encodeURIComponent('Denizlispor bir sonraki maç')}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Try to extract next match information
    if (data.sports_results && data.sports_results.upcoming_match) {
      const match = data.sports_results.upcoming_match;
      const opponent = match.teams[0].includes("Denizlispor") 
        ? match.teams[1] 
        : match.teams[0];
      return opponent;
    }
    
    // If we couldn't find the next opponent in sports_results, try organic results
    if (data.organic_results) {
      for (const result of data.organic_results) {
        if (result.snippet && result.snippet.includes("Denizlispor") && 
            (result.snippet.includes(" vs ") || result.snippet.includes(" - "))) {
          // Extract opponent name from snippet
          const vsPattern = /Denizlispor\s+(?:vs|[-])\s+([A-Za-zçğıöşüÇĞİÖŞÜ\s]+)/i;
          const reversePattern = /([A-Za-zçğıöşüÇĞİÖŞÜ\s]+)\s+(?:vs|[-])\s+Denizlispor/i;
          
          let match = vsPattern.exec(result.snippet);
          if (match) {
            return match[1].trim();
          }
          
          match = reversePattern.exec(result.snippet);
          if (match) {
            return match[1].trim();
          }
        }
      }
    }
    
    return "Bilinmeyen Rakip";
  } catch (error) {
    console.error('Error fetching next opponent:', error);
    throw error;
  }
};

/**
 * Generates a prediction based on recent match data
 */
export const generatePrediction = async (): Promise<PredictionData> => {
  try {
    // Get match data (will use fallback if API fails)
    const { matches: recentMatches, source } = await fetchRecentMatches();
    let nextOpponent;
    
    try {
      nextOpponent = await fetchNextOpponent();
    } catch (opponentError) {
      console.error("Error fetching next opponent:", opponentError);
      nextOpponent = "Bilinmeyen Rakip";
    }
    
    // Calculate form (last 5 matches)
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let denizlisporGoalsScored = 0;
    let denizlisporGoalsConceded = 0;
    let homeGoalsScored = 0;
    let homeGoalsConceded = 0;
    let awayGoalsScored = 0;
    let awayGoalsConceded = 0;
    let homeMatches = 0;
    let awayMatches = 0;
    
    recentMatches.forEach(match => {
      const denizlisporScore = match.isDenizlisporHome ? match.homeScore : match.awayScore;
      const opponentScore = match.isDenizlisporHome ? match.awayScore : match.homeScore;
      
      denizlisporGoalsScored += denizlisporScore;
      denizlisporGoalsConceded += opponentScore;
      
      if (match.isDenizlisporHome) {
        homeGoalsScored += denizlisporScore;
        homeGoalsConceded += opponentScore;
        homeMatches++;
      } else {
        awayGoalsScored += denizlisporScore;
        awayGoalsConceded += opponentScore;
        awayMatches++;
      }
      
      if (denizlisporScore > opponentScore) {
        wins++;
      } else if (denizlisporScore === opponentScore) {
        draws++;
      } else {
        losses++;
      }
    });
    
    // Calculate average goals scored and conceded
    const avgGoalsScored = recentMatches.length > 0 ? denizlisporGoalsScored / recentMatches.length : 1;
    const avgGoalsConceded = recentMatches.length > 0 ? denizlisporGoalsConceded / recentMatches.length : 1;
    
    // Calculate home/away averages
    const avgHomeGoalsScored = homeMatches > 0 ? homeGoalsScored / homeMatches : avgGoalsScored;
    const avgHomeGoalsConceded = homeMatches > 0 ? homeGoalsConceded / homeMatches : avgGoalsConceded;
    const avgAwayGoalsScored = awayMatches > 0 ? awayGoalsScored / awayMatches : avgGoalsScored;
    const avgAwayGoalsConceded = awayMatches > 0 ? awayGoalsConceded / awayMatches : avgGoalsConceded;
    
    // Calculate form factor (0-1) based on recent results
    const formFactor = (wins * 3 + draws) / (recentMatches.length * 3);
    
    // Assume next match is at home (can be adjusted with actual data)
    const isNextMatchHome = true;
    
    // Generate prediction with some randomness
    let predictedDenizlisporGoals;
    let predictedOpponentGoals;
    
    if (isNextMatchHome) {
      // Home match prediction
      predictedDenizlisporGoals = Math.round(avgHomeGoalsScored * (0.8 + formFactor * 0.4));
      predictedOpponentGoals = Math.round(avgHomeGoalsConceded * (1.2 - formFactor * 0.4));
    } else {
      // Away match prediction
      predictedDenizlisporGoals = Math.round(avgAwayGoalsScored * (0.8 + formFactor * 0.4));
      predictedOpponentGoals = Math.round(avgAwayGoalsConceded * (1.2 - formFactor * 0.4));
    }
    
    // Add some randomness
    const randomFactor = Math.random() * 0.5;
    if (Math.random() > 0.5) {
      predictedDenizlisporGoals = Math.max(0, Math.round(predictedDenizlisporGoals + randomFactor));
    }
    if (Math.random() > 0.5) {
      predictedOpponentGoals = Math.max(0, Math.round(predictedOpponentGoals + randomFactor));
    }
    
    return {
      predictedScore: {
        denizlisporGoals: predictedDenizlisporGoals,
        opponentGoals: predictedOpponentGoals
      },
      recentMatches,
      form: {
        wins,
        draws,
        losses
      },
      nextOpponent,
      dataSource: source
    };
  } catch (error) {
    console.error('Error generating prediction:', error);
    
    // Use fallback data instead of throwing an error
    const fallbackMatches = getFallbackMatches();
    return {
      predictedScore: {
        denizlisporGoals: 2,
        opponentGoals: 1
      },
      recentMatches: fallbackMatches,
      form: {
        wins: 3,
        draws: 1,
        losses: 1
      },
      nextOpponent: "Altay",
      dataSource: "Fallback data (API hatası)"
    };
  }
};

/**
 * Fallback function that returns a prediction based on progress bars
 * when the API is unavailable
 */
export const generatePredictionFromProgressBars = ({
  progressBars,
  categoryScores,
  apiPrediction,
  avgPerformance,
  avgCategoryScore
}: {
  progressBars: ProgressBars;
  categoryScores: Record<string, number>;
  apiPrediction: PredictionData;
  avgPerformance: number;
  avgCategoryScore: number;
}): PredictionData => {
  // Calculate the weighted importance of each category
  const categoryWeights = {
    'Finansal Yönetim': 0.3,    // Financial stability is crucial
    'Teknik Ekip': 0.3,         // Technical team has major impact
    'Sponsorlar': 0.2,          // Sponsors provide resources
    'Taraftar İlişkileri': 0.2  // Fan support affects morale
  };

  // Calculate weighted average score (0-10 scale)
  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(categoryScores).forEach(([category, score]) => {
    const weight = categoryWeights[category as keyof typeof categoryWeights] || 0.25;
    weightedScore += score * weight;
    totalWeight += weight;
  });

  // Normalize the score if we have any categories completed
  const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  console.log('Category score calculations:', {
    categoryScores,
    weightedScore,
    finalScore
  });

  // Determine match outcome based on final score
  let denizlisporGoals: number;
  let opponentGoals: number;

  // Very poor performance (0-3): High chance of losing
  if (finalScore <= 3) {
    denizlisporGoals = 0;
    opponentGoals = 3;
  }
  // Below average (3-5): Likely to lose or draw
  else if (finalScore <= 5) {
    denizlisporGoals = 1;
    opponentGoals = 2;
  }
  // Average performance (5-7): Competitive match
  else if (finalScore <= 7) {
    denizlisporGoals = 2;
    opponentGoals = 2;
  }
  // Good performance (7-8.5): Likely to win
  else if (finalScore <= 8.5) {
    denizlisporGoals = 2;
    opponentGoals = 1;
  }
  // Excellent performance (8.5-10): Strong win probability
  else {
    denizlisporGoals = 3;
    opponentGoals = 0;
  }

  return {
    predictedScore: {
      denizlisporGoals,
      opponentGoals,
    },
    recentMatches: apiPrediction.recentMatches,
    form: apiPrediction.form,
    nextOpponent: apiPrediction.nextOpponent,
    dataSource: "Kategori Puanları Analizi"
  };
}; 