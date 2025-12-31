# Process Pick Results Job

This endpoint processes completed NHL games from yesterday and updates all user picks with their results, points, and stats.

## Endpoint

```
GET /api/picks/processResults
```

## What It Does

1. **Fetches yesterday's completed games** from the NHL API
2. **Filters for regular season games** that have finished
3. **For each completed game:**
   - Determines the actual winner
   - Fetches the Statbarn prediction for comparison
   - Finds all users who made picks for that game
   - Calculates points for each pick based on:
     - **Base points (1)**: Correct prediction
     - **Upset bonus (+1)**: Picked the underdog and they won
     - **Confidence bonus (+1)**: Legacy feature for picks with 5-star confidence
     - **Streak bonuses**: +1 (5+ streak), +2 (10+ streak), +3 (20+ streak)
     - **Beat Statbarn (+2)**: User was correct AND Statbarn was wrong
   - Updates pick results (isCorrect, actualWinner, points)
   - Updates user stats (accuracy, streaks, total points, beatStatbarnCount)

## Response

```json
{
  "success": true,
  "date": "2024-12-29",
  "gamesProcessed": 12,
  "picksProcessed": 45,
  "usersProcessed": 23,
  "beatStatbarnCount": 8
}
```

## Scheduling

This endpoint should be run daily via a cron job. Recommended schedule:

- **Time**: 6:00 AM EST (after all games from previous day are finished)
- **Frequency**: Once per day
- **Example cron**: `0 6 * * *` (runs at 6 AM daily)

### Vercel Cron Job Setup

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/picks/processResults",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Alternative: Manual Trigger

You can also trigger this manually by visiting:
```
https://your-domain.com/api/picks/processResults
```

## Points System Summary

| Achievement | Points |
|------------|--------|
| Correct Pick | +1 |
| Upset Pick (underdog wins) | +1 |
| Max Confidence (legacy) | +1 |
| 5+ Game Streak | +1 |
| 10+ Game Streak | +2 |
| 20+ Game Streak | +3 |
| Beat Statbarn | +2 |

## Error Handling

- Returns 500 status with error message if processing fails
- Logs all errors to console for debugging
- Safe to run multiple times (idempotent for already-processed picks)

## Database Updates

For each processed pick, updates:

**Pick Document:**
- `isCorrect`: boolean
- `actualWinner`: team abbreviation
- `points`: calculated points

**User Stats:**
- `correctPicks`: incremented if correct
- `currentStreak`: updated based on result
- `longestStreak`: updated if current exceeds longest
- `totalPoints`: incremented by earned points
- `accuracy`: recalculated percentage
- `beatStatbarnCount`: incremented if beat Statbarn
- `seasonStats`: updated for the current season
