-- ============================================================
-- Fasih — Scenario metrics (read-only)
--
-- The launch metrics from spec 2026-09-14 §2.12, over the learning data every
-- user row already syncs. Run in the Supabase SQL editor (service role).
--
-- NOT A MIGRATION. Nothing here creates a view or function: a view in the
-- public schema would be exposed through the API, and these read every user's
-- row. Keep them as saved queries.
--
-- Caveats that change how to read the numbers:
--   • Pre-launch rows are test accounts. Filter them out before trusting any rate.
--   • scenario_history starts with schema v5. Runs completed before it are in
--     scenario_runs / endings_found but have no dated record, so replay
--     numbers cover v5-and-later runs only.
--   • History is capped at 20 runs per scenario (src/engine/scenarioHistory.ts).
--     Run numbers past 20 are counted in scenario_runs only.
--   • Trial → paid is not here: RevenueCat reports it (Charts → Trial
--     Conversion), from the store's own records.
-- ============================================================


-- ─── 1. Completions by ending and run number ─────────────────────────────────
-- Which endings people reach on run 1, run 2, … — does a replay go somewhere new?
SELECT
  h.key                     AS scenario_id,
  r.ordinality              AS run_number,
  r.value ->> 'endingId'    AS ending_id,
  r.value ->> 'endingType'  AS ending_type,
  count(*)                  AS completions
FROM user_data u
CROSS JOIN LATERAL jsonb_each(u.scenario_history) AS h
CROSS JOIN LATERAL jsonb_array_elements(h.value) WITH ORDINALITY AS r(value, ordinality)
WHERE jsonb_typeof(h.value) = 'array'  -- a malformed row is skipped, not an error
GROUP BY 1, 2, 3, 4
ORDER BY 1, 2, completions DESC;


-- ─── 2. Distinct endings found per player ────────────────────────────────────
-- From endings_found (all runs, not capped): how far into each scenario's
-- endings players get.
SELECT
  h.key                      AS scenario_id,
  jsonb_array_length(h.value) AS endings_found,
  count(*)                   AS players
FROM user_data u
CROSS JOIN LATERAL jsonb_each(u.endings_found) AS h
WHERE jsonb_typeof(h.value) = 'array'
GROUP BY 1, 2
ORDER BY 1, 2;


-- ─── 3. Hidden-ending discovery rate ─────────────────────────────────────────
-- Share of players with at least one run who have reached the hidden ending
-- (endingType = 'exceptional' — every route script's hidden ending, and only it).
SELECT
  h.key AS scenario_id,
  count(*) AS players,
  count(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(h.value) AS r(value)
      WHERE r.value ->> 'endingType' = 'exceptional'
    )
  ) AS found_hidden,
  round(100.0 * count(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(h.value) AS r(value)
      WHERE r.value ->> 'endingType' = 'exceptional'
    )
  ) / nullif(count(*), 0), 1) AS pct_found_hidden
FROM user_data u
CROSS JOIN LATERAL jsonb_each(u.scenario_history) AS h
WHERE jsonb_typeof(h.value) = 'array' AND h.value <> '[]'::jsonb
GROUP BY 1
ORDER BY 1;


-- ─── 4. Replay within 7 days — the success bar (≥ 30%) ───────────────────────
-- Of players who first completed a scenario at least 7 days ago, the share who
-- completed it again within 7 days of that first run. Players whose first run
-- is newer are left out: they have not had their 7 days yet, and counting them
-- would drag the rate down for no reason.
WITH first_runs AS (
  SELECT
    h.key                              AS scenario_id,
    (h.value -> 0 ->> 'on')::date      AS first_on,
    (h.value -> 1 ->> 'on')::date      AS second_on
  FROM user_data u
  CROSS JOIN LATERAL jsonb_each(u.scenario_history) AS h
  WHERE jsonb_typeof(h.value) = 'array' AND h.value <> '[]'::jsonb
)
SELECT
  coalesce(scenario_id, 'ALL SCENARIOS') AS scenario_id,
  count(*) AS eligible_completers,
  count(*) FILTER (WHERE second_on - first_on <= 7) AS replayed_within_7_days,
  round(100.0 * count(*) FILTER (WHERE second_on - first_on <= 7) / nullif(count(*), 0), 1)
    AS pct_replayed_within_7_days
FROM first_runs
WHERE first_on <= current_date - 7
GROUP BY ROLLUP (scenario_id)
ORDER BY GROUPING(first_runs.scenario_id), first_runs.scenario_id;  -- the ALL row last
