-- ============================================
-- BONUS TOTAL SQL QUERIES FOR SQL EDITOR
-- ============================================

-- ============================================
-- 1. DAILY BONUS TOTAL (7am-7am window)
-- ============================================
-- Description: Returns total bonus for the current day period (7am to 7am)
-- To filter by specific ENT, replace NULL with the team_id UUID

WITH date_range AS (
  SELECT 
    CASE 
      WHEN EXTRACT(HOUR FROM NOW()) < 7 OR (EXTRACT(HOUR FROM NOW()) = 7 AND EXTRACT(MINUTE FROM NOW()) < 0)
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
    END AS start_date,
    CASE 
      WHEN EXTRACT(HOUR FROM NOW()) < 7 OR (EXTRACT(HOUR FROM NOW()) = 7 AND EXTRACT(MINUTE FROM NOW()) < 0)
      THEN DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '7 hours'
    END AS end_date
)
SELECT 
  COALESCE(SUM(bonus_amount), 0) AS daily_bonus_total
FROM public.recharge_requests, date_range
WHERE process_status = '4'  -- COMPLETED only
  AND created_at >= date_range.start_date
  AND created_at < date_range.end_date
  AND (NULL IS NULL OR team_id = NULL);  -- Replace NULL with team_id UUID to filter by ENT


-- ============================================
-- 2. WEEKLY BONUS TOTAL (Rolling 7 days, 7am-aligned)
-- ============================================
-- Description: Returns total bonus for the last 7 days (rolling window, 7am-aligned)
-- To filter by specific ENT, replace NULL with the team_id UUID

WITH date_range AS (
  SELECT 
    CASE 
      WHEN NOW() < DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
    END AS today_7am,
    CASE 
      WHEN NOW() < DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '1 day' + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '7 hours'
    END AS end_date
)
SELECT 
  COALESCE(SUM(bonus_amount), 0) AS weekly_bonus_total
FROM public.recharge_requests, date_range
WHERE process_status = '4'  -- COMPLETED only
  AND created_at >= (date_range.end_date - INTERVAL '7 days')
  AND created_at < date_range.end_date
  AND (NULL IS NULL OR team_id = NULL);  -- Replace NULL with team_id UUID to filter by ENT


-- ============================================
-- 3. MONTHLY BONUS TOTAL (Rolling 30 days, 7am-aligned)
-- ============================================
-- Description: Returns total bonus for the last 30 days (rolling window, 7am-aligned)
-- To filter by specific ENT, replace NULL with the team_id UUID

WITH date_range AS (
  SELECT 
    CASE 
      WHEN NOW() < DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
    END AS today_7am,
    CASE 
      WHEN NOW() < DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '1 day' + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '7 hours'
    END AS end_date
)
SELECT 
  COALESCE(SUM(bonus_amount), 0) AS monthly_bonus_total
FROM public.recharge_requests, date_range
WHERE process_status = '4'  -- COMPLETED only
  AND created_at >= (date_range.end_date - INTERVAL '30 days')
  AND created_at < date_range.end_date
  AND (NULL IS NULL OR team_id = NULL);  -- Replace NULL with team_id UUID to filter by ENT


-- ============================================
-- ALTERNATIVE: Using the RPC functions (if already created)
-- ============================================

-- Daily Bonus Total (All ENTs)
SELECT get_daily_bonus_total(
  CASE 
    WHEN EXTRACT(HOUR FROM NOW()) < 7 OR (EXTRACT(HOUR FROM NOW()) = 7 AND EXTRACT(MINUTE FROM NOW()) < 0)
    THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '7 hours'
    ELSE DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
  END,
  CASE 
    WHEN EXTRACT(HOUR FROM NOW()) < 7 OR (EXTRACT(HOUR FROM NOW()) = 7 AND EXTRACT(MINUTE FROM NOW()) < 0)
    THEN DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
    ELSE DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '7 hours'
  END,
  NULL  -- NULL for all ENTs, or provide team_id UUID for specific ENT
) AS daily_bonus_total;

-- Weekly Bonus Total (All ENTs)
WITH date_range AS (
  SELECT 
    CASE 
      WHEN NOW() < DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '1 day' + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '7 hours'
    END AS end_date
)
SELECT get_week_bonus_total(
  (SELECT end_date - INTERVAL '7 days' FROM date_range),
  (SELECT end_date FROM date_range),
  NULL  -- NULL for all ENTs, or provide team_id UUID for specific ENT
) AS weekly_bonus_total;

-- Monthly Bonus Total (All ENTs)
WITH date_range AS (
  SELECT 
    CASE 
      WHEN NOW() < DATE_TRUNC('day', NOW()) + INTERVAL '7 hours'
      THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '1 day' + INTERVAL '7 hours'
      ELSE DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '7 hours'
    END AS end_date
)
SELECT get_month_bonus_total(
  (SELECT end_date - INTERVAL '30 days' FROM date_range),
  (SELECT end_date FROM date_range),
  NULL  -- NULL for all ENTs, or provide team_id UUID for specific ENT
) AS monthly_bonus_total;

