-- ============================================
-- BONUS TOTAL FUNCTIONS - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This file creates all three bonus total functions needed for the dashboard
-- Copy and paste this entire file into the Supabase SQL Editor and run it
-- ============================================

-- Function: get_daily_bonus_total
-- Description: Returns the total bonus amount for completed requests within a date range
-- Parameters:
--   start_date (timestamptz): Start date (7am)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (total bonus amount)

CREATE OR REPLACE FUNCTION public.get_daily_bonus_total(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bonus numeric;
BEGIN
  SELECT COALESCE(SUM(bonus_amount), 0)
  INTO total_bonus
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  RETURN total_bonus;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_daily_bonus_total(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_bonus_total(timestamptz, timestamptz, uuid) TO anon;

-- ============================================

-- Function: get_week_bonus_total
-- Description: Returns the total bonus amount for completed requests within a date range (rolling 7 days)
-- Parameters:
--   start_date (timestamptz): Start date (7am, 7 days ago)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (total bonus amount)

CREATE OR REPLACE FUNCTION public.get_week_bonus_total(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bonus numeric;
BEGIN
  SELECT COALESCE(SUM(bonus_amount), 0)
  INTO total_bonus
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  RETURN total_bonus;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_week_bonus_total(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_week_bonus_total(timestamptz, timestamptz, uuid) TO anon;

-- ============================================

-- Function: get_month_bonus_total
-- Description: Returns the total bonus amount for completed requests within a date range (rolling 30 days)
-- Parameters:
--   start_date (timestamptz): Start date (7am, 30 days ago)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (total bonus amount)

CREATE OR REPLACE FUNCTION public.get_month_bonus_total(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bonus numeric;
BEGIN
  SELECT COALESCE(SUM(bonus_amount), 0)
  INTO total_bonus
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  RETURN total_bonus;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_month_bonus_total(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_month_bonus_total(timestamptz, timestamptz, uuid) TO anon;

