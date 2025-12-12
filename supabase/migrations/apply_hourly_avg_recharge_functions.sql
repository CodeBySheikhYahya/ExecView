-- ============================================
-- HOURLY AVERAGE RECHARGE FUNCTIONS - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This file creates all three hourly average recharge functions needed for the dashboard
-- Copy and paste this entire file into the Supabase SQL Editor and run it
-- ============================================

-- Function: get_daily_hourly_avg_recharge
-- Description: Returns the hourly average recharge amount for completed requests within a date range
-- Calculates average based on actual hours passed since 7am (not 24 hours)
-- Parameters:
--   start_date (timestamptz): Start date (7am of current day or previous day if before 7am)
--   end_date (timestamptz): End date (current time NOW - to get actual hours passed)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (hourly average amount)

CREATE OR REPLACE FUNCTION public.get_daily_hourly_avg_recharge(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_amount numeric;
  hours_in_period numeric;
  hourly_avg numeric;
BEGIN
  -- Calculate total recharge amount
  SELECT COALESCE(SUM(amount), 0)
  INTO total_amount
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  -- Calculate actual hours passed since 7am (not 24 hours)
  -- This divides by the actual time elapsed, so if 14 hours have passed, we divide by 14
  hours_in_period := EXTRACT(EPOCH FROM (end_date - start_date)) / 3600.0;
  
  -- Calculate hourly average
  IF hours_in_period > 0 THEN
    hourly_avg := total_amount / hours_in_period;
  ELSE
    hourly_avg := 0;
  END IF;
  
  RETURN hourly_avg;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_daily_hourly_avg_recharge(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_hourly_avg_recharge(timestamptz, timestamptz, uuid) TO anon;

-- ============================================

-- Function: get_week_hourly_avg_recharge
-- Description: Returns the hourly average recharge amount for completed requests within a date range (rolling 7 days)
-- Parameters:
--   start_date (timestamptz): Start date (7am, 7 days ago)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (hourly average amount)

CREATE OR REPLACE FUNCTION public.get_week_hourly_avg_recharge(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_amount numeric;
  hours_in_period numeric;
  hourly_avg numeric;
BEGIN
  -- Calculate total recharge amount
  SELECT COALESCE(SUM(amount), 0)
  INTO total_amount
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  -- Calculate hours in period (7 days * 24 hours = 168 hours)
  hours_in_period := EXTRACT(EPOCH FROM (end_date - start_date)) / 3600.0;
  
  -- Calculate hourly average
  IF hours_in_period > 0 THEN
    hourly_avg := total_amount / hours_in_period;
  ELSE
    hourly_avg := 0;
  END IF;
  
  RETURN hourly_avg;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_week_hourly_avg_recharge(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_week_hourly_avg_recharge(timestamptz, timestamptz, uuid) TO anon;

-- ============================================

-- Function: get_month_hourly_avg_recharge
-- Description: Returns the hourly average recharge amount for completed requests within a date range (rolling 30 days)
-- Parameters:
--   start_date (timestamptz): Start date (7am, 30 days ago)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (hourly average amount)

CREATE OR REPLACE FUNCTION public.get_month_hourly_avg_recharge(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_amount numeric;
  hours_in_period numeric;
  hourly_avg numeric;
BEGIN
  -- Calculate total recharge amount
  SELECT COALESCE(SUM(amount), 0)
  INTO total_amount
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  -- Calculate hours in period (30 days * 24 hours = 720 hours)
  hours_in_period := EXTRACT(EPOCH FROM (end_date - start_date)) / 3600.0;
  
  -- Calculate hourly average
  IF hours_in_period > 0 THEN
    hourly_avg := total_amount / hours_in_period;
  ELSE
    hourly_avg := 0;
  END IF;
  
  RETURN hourly_avg;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_month_hourly_avg_recharge(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_month_hourly_avg_recharge(timestamptz, timestamptz, uuid) TO anon;

