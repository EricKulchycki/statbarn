# Pick'em Feature Specification

## Overview

Allow authenticated users to make predictions for upcoming NHL games and track their accuracy against the AI model.

## User Stories

### As a logged-in user, I want to:

1. See all games scheduled for tomorrow
2. Make a pick (home or away team) for each game
3. See my prediction history and accuracy
4. Compare my accuracy to the statbarn model
5. See a leaderboard of top predictors
6. Earn points/badges for prediction streaks

### As a visitor, I want to:

1. See that the pick'em feature exists (teaser)
2. Be prompted to sign in to participate
3. See public leaderboard (but not make picks)

---

## Database Schema

### UserPicks Model

```typescript
{
  firebaseUid: string

  // Overall stats
  totalPicks: number
  correctPicks: number
  accuracy: number           // Percentage

  // Streaks
  currentStreak: number      // Current correct streak
  longestStreak: number      // Best streak ever

  // Points & ranking
  totalPoints: number
  rank?: number              // Overall leaderboard position

  // Comparison to AI
  beatStatbarnCount: number        // Times user beat the statbarn on same game

  // By season
  seasonStats: {
   season: number
   picks: number
   correct: number
   accuracy: number
   points: number
  }[]

  picks: {
   firebaseUid: string         // User who made the pick
   gameId: number             // NHL game ID
   gameDate: Date             // When the game is scheduled
   season: number             // NHL season (20252026)

   // Pick details
   pickedTeam: string         // Team abbreviation (e.g., 'TOR')
   pickedAt: Date             // When user made the pick
   confidence?: number        // Optional 1-5 confidence rating

   // Game info (denormalized for easy querying)
   homeTeam: string           // Home team abbrev
   awayTeam: string           // Away team abbrev

   // Results (filled in after game ends)
   isCorrect?: boolean        // Was the pick correct?
   actualWinner?: string      // Actual game winner
   points?: number            // Points earned (based on confidence, upset, etc.)

   createdAt: Date
   updatedAt: Date
  }[]

  updatedAt: Date
}
```

---

## API Routes / Server Actions

### Pick Management

- `POST /api/picks` - Create a new pick
- `GET /api/picks/user/:uid` - Get user's picks (with filters)
- `PUT /api/picks/:pickId` - Update a pick (only before game starts)
- `DELETE /api/picks/:pickId` - Delete a pick (only before game starts)

### Server Actions (preferred for Next.js 15)

```typescript
// src/actions/picks.ts
async function createPick(data: CreatePickData)
async function updatePick(pickId: string, data: UpdatePickData)
async function deletePick(pickId: string)
async function getUserPicks(firebaseUid: string, filters?: PickFilters)
async function getTomorrowsGames()
async function getUserStats(firebaseUid: string)
async function getLeaderboard(limit?: number, season?: number)
```

### Scheduled Jobs

- Daily job to process completed games and update pick results
- Daily job to recalculate user stats and rankings

---

## UI Components

### 1. PickemDashboard (Main View)

**Location:** `/pickem` or embedded in home page for logged-in users

**Sections:**

- Tomorrow's games with pick interface
- User's current stats card
- Recent picks results
- Mini leaderboard

**States:**

- Not logged in: Show teaser + sign in CTA
- Logged in, no picks: Encourage making first pick
- Logged in, has picks: Show dashboard

### 2. PickCard Component

**For each game:**

```
┌─────────────────────────────────────┐
│ Tomorrow • 7:00 PM ET               │
├─────────────────────────────────────┤
│  [BOS Logo]  BOS  vs  TOR  [TOR]    │
│                                      │
│  ○ Pick BOS      ○ Pick TOR         │
│  (1620 ELO)      (1580 ELO)         │
│                                      │
│  AI Prediction: BOS (62%)           │
│  Confidence: ⭐⭐⭐⭐⭐              │
└─────────────────────────────────────┘
```

**Features:**

- Click team to select pick
- Visual indicator of AI prediction
- Optional confidence slider
- Lock icon when game has started
- Show result when game is finished

### 3. UserStatsCard

```
┌─────────────────────────────────────┐
│         Your Season Stats           │
├─────────────────────────────────────┤
│ Accuracy:    65.2%  (67/103)        │
│ vs AI Model: 58.9%                  │
│                                      │
│ Current Streak: 🔥 5                │
│ Best Streak:    🏆 12               │
│                                      │
│ Total Points:   453                 │
│ Rank:          #127 / 1,432         │
└─────────────────────────────────────┘
```

### 4. LeaderboardTable

**Columns:**

- Rank
- User (display name or email)
- Accuracy %
- Total Picks
- Current Streak
- Points

**Filters:**

- All time / This season / This month
- Show friends only (future feature)

### 5. PickHistoryList

**Show recent picks with results:**

```
✅ BOS vs TOR - Picked BOS (Won)
❌ EDM vs CGY - Picked EDM (Lost)
✅ VGK vs DAL - Picked VGK (Won)
⏳ FLA vs NYR - Picked FLA (Pending)
```

---

## Points System

### Basic Points

- **Correct pick:** 1 point
- **Upset pick (correct):** 2 points (when underdog wins)
- **High confidence correct:** +1 bonus point (5-star confidence)

### Streak Bonuses

- **5+ streak:** +1 point per pick
- **10+ streak:** +2 points per pick
- **20+ streak:** +3 points per pick

### Special Achievements

- **Perfect day:** All picks correct (+5 bonus)
- **Beat the AI:** When user is correct and AI is wrong (+2 points)

---

## Feature Phases

### Phase 1: MVP (Week 1-2)

- [ ] Database models (UserPick, UserStats)
- [ ] Server actions for creating/managing picks
- [ ] PickemDashboard page
- [ ] PickCard component with basic selection
- [ ] User stats display
- [ ] Scheduled job to process results

### Phase 2: Enhanced UX (Week 3)

- [ ] Confidence ratings
- [ ] Leaderboard page
- [ ] Pick history page
- [ ] Streak tracking
- [ ] Points system

### Phase 3: Social Features (Week 4+)

- [ ] Public user profiles
- [ ] Friend system
- [ ] Friend leaderboards
- [ ] Achievements/badges
- [ ] Share picks to social media
- [ ] Pick'em groups/leagues

---

## Technical Considerations

### Performance

- Cache leaderboards (update every 5 minutes)
- Index UserPick by firebaseUid and gameDate
- Denormalize frequently accessed data

### Data Integrity

- Prevent picks after game starts (validate on server)
- Prevent duplicate picks for same game
- Handle timezone conversions properly
- Validate team abbreviations

### Edge Cases

- What if game is postponed?
- What if user deletes account?
- What if game ends in a tie? (shootout winner)
- Handle overtime/shootout games

### Notifications (Future)

- Remind users to make picks (email/push)
- Notify when games start
- Daily summary of results

---

## Example User Flow

1. **User visits home page**
   - Sees "Make Your Picks for Tomorrow" section
   - Click to expand or go to `/pickem`

2. **User makes picks**
   - Sees 8 games scheduled for tomorrow
   - Clicks on TOR to pick them over BOS
   - Optionally sets confidence (4 stars)
   - Repeats for other games
   - Sees progress (5/8 picks made)

3. **Next day - games are played**
   - User checks back to see results
   - Dashboard shows: "You went 6/8 today! (+7 points)"
   - Stats updated: Current streak now 3 games

4. **Weekly check-in**
   - User sees they're ranked #127
   - Beating AI model by 5%
   - Current 5-game streak 🔥

---

## Success Metrics

### Engagement

- % of logged-in users who make at least 1 pick
- Average picks per user per week
- Pick completion rate (% of available games picked)

### Retention

- Weekly active users (WAU)
- 7-day retention rate
- Average session duration

### Competition

- Leaderboard competition (how close are top users?)
- User accuracy vs AI accuracy
- Streak lengths distribution

---

## Open Questions

1. **Deadline for picks?**
   - Must pick before game starts, or allow earlier deadline (e.g., 12 hours before)?

2. **Edit picks?**
   - Allow editing up until game time, or lock once submitted?

3. **Required picks?**
   - Must users pick all games, or can they be selective?

4. **Tiebreakers?**
   - How to rank users with same accuracy? (total picks, points, streaks?)

5. **Privacy?**
   - Are picks public or private?
   - Can users see others' picks before games?
   - Show picks in user profiles?

---

## Next Steps

1. Review and approve spec
2. Create database models
3. Set up server actions for picks
4. Build PickCard component
5. Create PickemDashboard page
6. Implement background job for processing results
7. Add to main navigation
8. Test with seed data
9. Deploy and monitor engagement
