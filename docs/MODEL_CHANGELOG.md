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
