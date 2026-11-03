# Prediction Model Changelog

Model versions are stored in the `modelVersions` collection. Each version holds
every tunable param (`ModelParams` in `packages/prediction-core/src/types.ts`),
notes, and its saved backtest. Exactly one version is `active`, and the nightly
crons use that version. A version's params never change once it leaves draft;
any change becomes a new version.

Every prediction records its version in `prediction.modelVersion`. Outcomes
processed from v2 onward record theirs in `outcome.modelVersion`. If no version
is active, the app falls back to `DEFAULT_MODEL_PARAMS` / `MODEL_VERSION` in
`packages/prediction-core/src/constants.ts` and logs a warning.

History is **not** recalculated when the model changes. Stored ratings and
predictions keep the version that produced them, so compare models by filtering
on `modelVersion` and not by date range alone.

## Changing the model

```bash
# 1. Try a variant against every stored game (read-only)
npm run model:backtest -- v2 --set kFactor=6 --set homeAdvantage=35

# 2. Keep it as a draft, with its backtest attached
npm run model:backtest -- v2 --set kFactor=6 --save-as v3 --notes "why"

# 3. Make it live (the next nightly runs use it); then add an entry below
npm run model:activate -- v3
```

The backtest replays every completed game in date order, the same way the
crons would have. The most recent completed season is the **holdout**: judge a
change by its holdout Brier, and tune only against the train seasons. The
in-progress season is reported but used for neither. Lower is better; always
guessing 50% scores 0.250.

Change the model rarely, ideally between seasons. Ratings are path-dependent,
so frequent changes are hard to evaluate. `npm run model:seed` records v1 and v2
and is safe to re-run.

---

## v3 (2026-11-03)

**Change:** the last-5 head-to-head adjustment is off (`matchupMaxAdjustment`
8 → 0). Nothing else changed.

**Why:** turning it off made no measurable difference. It only ever affected
Elo updates (never published predictions), and at K=8 it moved ratings by a
fraction of a point per game. It also cost a database query for every game in
the nightly outcome run.

| Config                 | 2023–25 Brier | 2025–26 Brier (holdout) |
| ---------------------- | ------------- | ----------------------- |
| v2: head-to-head ±8    | 0.2390        | 0.2479                  |
| v3: head-to-head off   | 0.2390        | 0.2480                  |

The same check found that turning off home advantage made Brier clearly worse
(train +0.0024), and turning off the goal-margin boost was mixed (train +0.0004,
holdout −0.0003). Both were kept.

**Code:** the setting remains so v1 and v2 can still be replayed exactly. When
it is 0, the outcome run skips the head-to-head query.

**Rollout:** current ratings were rebuilt under v3 straight after activation
(`eloResets` reason `rebuild-v3`; largest change 1.0 Elo, COL). Stored history
is unchanged.

## v2 ratings rebuild (2026-11-02)

**Change:** every team's current rating was rebuilt by replaying all 4,108
completed games (2023–24 onward) under v2, as if v2 had been used from the
start. Nothing about the model itself changed.

**Why:** v2 was rolled out forward only, so it was working from ratings that
three seasons of K=32 had spread too wide (SD from 1500: 58.8 live vs 41.8
rebuilt). At K=8 those would take a long time to settle. Biggest moves: CGY
+64.7, DET +57.2, PHI +52.0, EDM −42.7, NYR −42.2.

**Caveat:** the rebuild was suggested after seeing that a v2 replay scored 61.0%
on this season's first 213 games, against 55.4% live. Don't read that gap as
the expected gain; 213 games is too few to tell, and v2 scored 52.9% on the
2025–26 holdout.

**What changed in the data:**
- `currentElo` on all 32 teams. The old values are logged in `eloResets` with
  reason `rebuild-v2`, so they can be restored.
- Stored games, outcomes, predictions and accuracy are unchanged. A team's
  history graph will show a jump between its last game's `eloAfter` and its
  next game's `eloBefore`.
- Upcoming predictions and system picks update in the next nightly run.

Rerun with `npm run model:rebuild-ratings` (dry run) and `-- --apply`.

## v2 (2026-10-12)

**Change:** Elo K-factor lowered from **32 to 8**. Nothing else changed: the
goal-margin K boost, the +25 home advantage and the 0.33 off-season regression
are the same as v1.

**Why:** v1 was overconfident. Across 2023–26, favourites the model rated at
70–80% won only about 56–63% of the time. Ratings moved about 20 Elo per game
(median), and the 2025–26 Brier score was 0.2571, worse than always guessing
50% (0.250).

**Evidence:** a walk-forward replay of the stored scores (tuned on 2023–25,
tested on 2025–26):

| Config            | 2023–25 Brier | 2025–26 Brier (holdout) |
| ----------------- | ------------- | ----------------------- |
| v1: K=32          | 0.2476        | 0.2571                  |
| v2: K=8           | 0.2390        | 0.2479                  |

(These are the saved `model:backtest` results. The replay reproduces v1's stored
2025–26 Brier exactly.)

Any K from 4 to 12 performed about equally well. Results only got worse above
K=16. Changes to home advantage and the goal-margin boost were within noise.

**Rollout:** forward only.
- Predictions written from 2026-10-12 onward are tagged `v2`. Upcoming games
  that already had a `v1` prediction are re-tagged when the nightly outcome run
  recalculates them.
- Elo updates from the next nightly outcome run onward use K=8. Current ratings
  were built under K=32, so they start out spread wide and narrow gradually as
  new games are played.
- Past outcomes, ratings and predictions are unchanged.

**Related data fix (same day):** a duplicate `UTA` team document (an empty
"Utah Mammoth" record created by the rebrand) was overriding Utah's rating in
the nightly run, so every 2026–27 Utah game started from 1500. The duplicate was
merged into the real document. `triCode` is now unique, and `populateTeams`
upserts by `triCode`.

## v1 (original)

Elo with K=32, a goal-margin K boost (up to about 1.5×), a +25 Elo home
advantage, and regression one-third of the way to 1500 between seasons.
Predictions use ratings and home advantage only. A last-5 head-to-head
adjustment (±8 Elo) affects Elo updates but not published predictions.

Known caveat: all 2025–26 predictions were seeded with every team at 1500, so
they are a flat 53.6% home win probability and do not reflect Elo.
