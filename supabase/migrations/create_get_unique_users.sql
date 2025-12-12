-- Function: get_unique_users
-- Description: Returns the count of unique players who had activity (recharge requests) within a date range
-- Uses the same cycle date logic as PowerBI: timezone adjustment (+5 hours) and 7am day cycle
-- This single function replaces get_daily_unique_users, get_week_unique_users, and get_month_unique_users
-- Parameters:
--   start_date (timestamptz): Start date (7am)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: integer (count of unique users)

CREATE OR REPLACE FUNCTION public.get_unique_users(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unique_count integer;
  start_cycle_date date;
  end_cycle_date date;
BEGIN
  -- Convert start_date and end_date to cycle dates (timezone +5 hours, 7am day cycle)
  SELECT CAST(
    CASE WHEN EXTRACT(HOUR FROM start_date + INTERVAL '5 hour') >= 7
      THEN start_date + INTERVAL '5 hour'
      ELSE start_date + INTERVAL '5 hour' - INTERVAL '1 day'
    END AS DATE
  ) INTO start_cycle_date;
  
  SELECT CAST(
    CASE WHEN EXTRACT(HOUR FROM end_date + INTERVAL '5 hour') >= 7
      THEN end_date + INTERVAL '5 hour'
      ELSE end_date + INTERVAL '5 hour' - INTERVAL '1 day'
    END AS DATE
  ) INTO end_cycle_date;
  
  -- Count distinct players where cycle_date falls within the range
  SELECT COUNT(DISTINCT rr.player_id)
  INTO unique_count
  FROM public.recharge_requests rr
  INNER JOIN public.teams t ON rr.team_id = t.id
  WHERE rr.amount > 0
    AND rr.process_status ~ '^\d+$'
    AND CAST(rr.process_status AS integer) = 4
    AND t.team_code <> 'enttest'
    AND (p_team_id IS NULL OR rr.team_id = p_team_id)
    AND CAST(
      CASE WHEN EXTRACT(HOUR FROM rr.created_at + INTERVAL '5 hour') >= 7
        THEN rr.created_at + INTERVAL '5 hour'
        ELSE rr.created_at + INTERVAL '5 hour' - INTERVAL '1 day'
      END AS DATE
    ) >= start_cycle_date
    AND CAST(
      CASE WHEN EXTRACT(HOUR FROM rr.created_at + INTERVAL '5 hour') >= 7
        THEN rr.created_at + INTERVAL '5 hour'
        ELSE rr.created_at + INTERVAL '5 hour' - INTERVAL '1 day'
      END AS DATE
    ) < end_cycle_date;
  
  RETURN COALESCE(unique_count, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_unique_users(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unique_users(timestamptz, timestamptz, uuid) TO anon;

