# Seeding Scripts

This directory contains scripts for populating the database with test data.

## Available Scripts

### `npm run seed:testGames`

Seeds the database with test GameELO data for UI testing. Creates games in various states:

**Yesterday's Games (Completed)**
- 3 games with correct predictions (higher ELO team won)
- 2 games with upsets (lower ELO team won)

**Today's Games (Live)**
- 2 games where prediction is currently correct
- 2 games where an upset is in progress

**Today's Games (Upcoming)**
- 4 future games with predictions

This script is useful for:
- Testing the game banner with live games
- Verifying prediction correctness indicators
- Testing yesterday's outcomes display
- Seeing how upsets are highlighted
- Testing different game states (FINAL, LIVE, FUT)

**Usage:**
```bash
npm run seed:testGames
```

**Note:** Make sure your MongoDB connection is configured in `.env` before running.

---

### `npm run seed:populateTeams`

Populates the teams collection with NHL team data.

---

### `npm run seed:predictionsForDate`

Seeds predictions for a specific date.

---

### `npm run seed:markGameType`

Marks game types in existing game data.

## Testing Workflow

1. **Clear old test data** (optional):
   ```bash
   # Connect to MongoDB and delete test games
   # Or use MongoDB Compass to manually delete games from today/yesterday
   ```

2. **Run the test games script**:
   ```bash
   npm run seed:testGames
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Check the UI**:
   - Home page should show today's predictions (FUT games)
   - Game banner should show live games with colored borders
   - Yesterday's games section should show completed games with results

## Customizing Test Data

Edit `scripts/seedTestGames.ts` to:
- Change the number of games in each category
- Adjust team ELO ratings
- Modify game times
- Add different game scenarios
