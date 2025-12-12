-- Function: get_week_recharge_total
-- Description: Returns the total recharge amount for completed requests within a date range (rolling 7 days)
-- Parameters:
--   start_date (timestamptz): Start date (7am, 7 days ago)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (total amount)

CREATE OR REPLACE FUNCTION public.get_week_recharge_total(
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
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_amount
  FROM public.recharge_requests
  WHERE process_status = '4'  -- COMPLETED only
    AND created_at >= start_date
    AND created_at < end_date
    AND (p_team_id IS NULL OR team_id = p_team_id);
  
  RETURN total_amount;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_week_recharge_total(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_week_recharge_total(timestamptz, timestamptz, uuid) TO anon;

