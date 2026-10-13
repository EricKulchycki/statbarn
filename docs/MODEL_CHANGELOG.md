# Prediction Model Changelog

Every prediction stores the model that produced it in `prediction.modelVersion`.
The current version is `MODEL_VERSION` in `packages/prediction-core/src/constants.ts`.
When the model changes, bump that constant and add an entry here.

History is **not** recalculated when the model changes. Stored ratings and
predictions keep the version that produced them, so compare models by filtering
on `modelVersion` and not by date range alone.

---

## v2 (2026-10-12)

**Change:** Elo K-factor lowered from **32 to 8**. Nothing else changed: the
goal-margin K boost, the +25 home advantage and the 0.33 off-season regression
are the same as v1.

**Why:** v1 was overconfident. Across 2023–26, favourites the model rated at
70–80% won only about 56–63% of the time. Ratings moved about 20 Elo per game
(median), and the 2025–26 Brier score was 0.2572, worse than always guessing
50% (0.250).

**Evidence:** a walk-forward replay of the stored scores (tuned on 2023–25,
tested on 2025–26):

| Config            | 2023–25 Brier | 2025–26 Brier (test) |
| ----------------- | ------------- | -------------------- |
| v1: K=32          | 0.2476        | 0.2572               |
| v2: K=8           | 0.2390        | 0.2480               |

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
