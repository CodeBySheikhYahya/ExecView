-- Function: get_month_redeem_total
-- Description: Returns the total redeem amount for partially paid and completed requests within a date range (rolling 30 days, process_status >= 2)
-- Parameters:
--   start_date (timestamptz): Start date (7am, 30 days ago)
--   end_date (timestamptz): End date (next 7am)
--   p_team_id (uuid, optional): NULL for all entities, or specific team_id for one entity
-- Returns: numeric (total amount)

CREATE OR REPLACE FUNCTION public.get_month_redeem_total(
  start_date timestamptz,
  end_date timestamptz,
  p_team_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_total numeric;
BEGIN
  SELECT COALESCE(SUM(rr.total_amount), 0)
  INTO result_total
  FROM public.redeem_requests rr
  WHERE CAST(rr.process_status AS integer) >= 2  -- Partially paid and completed (>= 2)
    AND rr.created_at >= start_date
    AND rr.created_at < end_date
    AND (p_team_id IS NULL OR rr.team_id = p_team_id);
  
  RETURN result_total;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_month_redeem_total(timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_month_redeem_total(timestamptz, timestamptz, uuid) TO anon;

