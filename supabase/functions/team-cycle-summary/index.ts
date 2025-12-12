// @ts-nocheck
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const supabaseUrl = Deno.env.get("READ_REPLICA_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type RequestPayload = {
  start_date?: string;
  end_date?: string;
  team_codes?: string[] | string;
  team_code?: string[] | string;
  ent?: string;
};

const parseTeamCodes = (
  value: RequestPayload["team_codes"] | null,
): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => `${v}`.trim()).filter(Boolean);
  }
  return `${value}`
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

// Helper: derive cycle_date using 7AM-to-7AM window with +5h shift (matches PowerBI SQL)
// Logic: created_at + 5h; if hour >= 7 -> same day, else previous day.
const calculateCycleDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  date.setHours(date.getHours() + 5);

  if (date.getHours() >= 7) {
    return date.toISOString().split("T")[0];
  }

  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
};

// Helper function to check if process_status matches pattern and is Completed (4) or Finance confirmed (5)
const isValidRechargeStatus = (status: string | null): boolean => {
  if (!status) return false;
  const trimmed = `${status}`.trim();
  const numMatch = trimmed.match(/^\d+$/);
  if (!numMatch) return false;
  const num = parseInt(trimmed, 10);
  return num === 4 || num === 5;
};

// Helper function to check if process_status matches pattern and >= 2
const isValidRedeemStatus = (status: string | null): boolean => {
  if (!status) return false;
  const numMatch = status.match(/^\d+$/);
  if (!numMatch) return false;
  return parseInt(status) >= 2;
};

// Round to 2 decimal places for consistent responses
const round2 = (value: number): number =>
  Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = (req.method === "POST" ? await req.json().catch(() => ({})) : {}) as RequestPayload;

    let startDate = body.start_date ?? url.searchParams.get("start_date") ?? undefined;
    let endDate = body.end_date ?? url.searchParams.get("end_date") ?? undefined;
    let entParam = body.ent ?? url.searchParams.get("ent") ?? undefined;

    // Default view: Ent1 on 2025-12-01 if no filters are provided
    const noTeamFilterProvided =
      !entParam &&
      !body.team_code &&
      !body.team_codes &&
      !url.searchParams.get("team_code") &&
      !url.searchParams.get("team_codes");
    const noDateProvided = !startDate && !endDate;

    if (noDateProvided) {
      startDate = "2025-12-01";
      endDate = "2025-12-01";
    }

    if (noTeamFilterProvided) {
      entParam = "ent1";
    }
    const normalizedEnt = entParam?.toLowerCase();
    const entAsTeamFilter =
      normalizedEnt && normalizedEnt !== "all" ? entParam : undefined;

    const teamCodeParam =
      body.team_code ?? url.searchParams.get("team_code") ?? entAsTeamFilter;
    const teamCodes = parseTeamCodes(
      body.team_codes ?? teamCodeParam ?? url.searchParams.get("team_codes") ?? url.searchParams.get("team_code"),
    );

    // Build date filters at query level to avoid over-fetching.
    // Widen by 1 day on both sides because cycle_date shifts by +5h and may move across midnight.
    const startDateTime = startDate
      ? new Date(new Date(`${startDate}T00:00:00.000Z`).getTime() - 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    const endDateTime = endDate
      ? new Date(new Date(`${endDate}T23:59:59.999Z`).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Get team IDs if team codes are provided
    let teamIds: string[] | null = null;
    if (teamCodes.length > 0) {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id")
        .in("team_code", teamCodes);

      if (teamsError) {
        throw teamsError;
      }

      teamIds = teamsData?.map((t) => t.id) || [];
    }

    // Fetch recharge requests with teams and games
    let rechargeQuery = supabase
      .from("recharge_requests")
      .select(`
        id,
        amount,
        bonus_amount,
        created_at,
        process_status,
        team_id,
        teams(team_code)
     
      `)
      .range(0, 99999);

    // Apply team filter if provided
    if (teamIds && teamIds.length > 0) {
      rechargeQuery = rechargeQuery.in("team_id", teamIds);
    }
    if (startDateTime) rechargeQuery = rechargeQuery.gte("created_at", startDateTime);
    if (endDateTime) rechargeQuery = rechargeQuery.lte("created_at", endDateTime);

    const { data: rechargeData, error: rechargeError } = await rechargeQuery;

    if (rechargeError) {
      throw rechargeError;
    }

    // Fetch redeem requests with teams
    let redeemQuery = supabase
      .from("redeem_requests")
      .select(`
        id,
        total_amount,
        created_at,
        process_status,
        team_id,
        teams(team_code)
      `)
      .range(0, 99999);

    // Apply team filter if provided
    if (teamIds && teamIds.length > 0) {
      redeemQuery = redeemQuery.in("team_id", teamIds);
    }
    if (startDateTime) redeemQuery = redeemQuery.gte("created_at", startDateTime);
    if (endDateTime) redeemQuery = redeemQuery.lte("created_at", endDateTime);

    const { data: redeemData, error: redeemError } = await redeemQuery;

    if (redeemError) {
      throw redeemError;
    }

    // Build team id -> team_code map as a fallback when relation data is missing or has whitespace issues
    const teamIdsFromData = new Set<string>();
    for (const rr of rechargeData || []) {
      if (rr?.team_id) teamIdsFromData.add(String(rr.team_id));
    }
    for (const rd of redeemData || []) {
      if (rd?.team_id) teamIdsFromData.add(String(rd.team_id));
    }

    const teamsMap = new Map<string, string>();
    if (teamIdsFromData.size > 0) {
      const { data: teamsRows, error: teamsFetchError } = await supabase
        .from("teams")
        .select("id, team_code")
        .in("id", Array.from(teamIdsFromData))
        .range(0, 99999);
      if (teamsFetchError) {
        throw teamsFetchError;
      }
      for (const t of teamsRows || []) {
        if (!t?.id) continue;
        const code = `${t.team_code ?? ""}`.trim() || "Unknown";
        teamsMap.set(String(t.id), code);
      }
    }

    // Helper to resolve team_code from row + fallback map
    const resolveTeamCode = (row: any): string => {
      const relTeam = Array.isArray(row?.teams) ? row.teams[0] : row?.teams;
      const rawFromRel = relTeam?.team_code;
      const fromRel = rawFromRel ? `${rawFromRel}`.trim() : "";
      if (fromRel) return fromRel;
      const fromMap = row?.team_id ? teamsMap.get(String(row.team_id)) : undefined;
      if (fromMap) return fromMap;
      return "Unknown";
    };

    // Process recharge data
    const rechargeSummary = new Map<string, { total_in: number; bonus_amount: number }>();
    
    for (const rr of rechargeData || []) {
      if (!isValidRechargeStatus(rr.process_status)) continue;
      
      // Handle games - could be object or array
      // const games = Array.isArray(rr.games) ? rr.games[0] : rr.games;
      // Exclude FiFo/Tip regardless of game_id presence; only rely on game name text
      // const gameName = games?.game_name || "";
      // const normalizedGame = gameName.toString().toLowerCase().replace(/\s+/g, "");
      // if (normalizedGame === "fifo" || normalizedGame === "tip") continue;
      
      // Resolve team code via relation or fallback map; keep empty as "Unknown" so totals don't drop
      const teamCode = resolveTeamCode(rr);
      if (teamCode.toLowerCase() === "enttest" || teamCode.toLowerCase() === "enttestz") continue;
      
      const cycleDate = calculateCycleDate(rr.created_at);
      const key = `${cycleDate}|${teamCode}`;
      
      if (!rechargeSummary.has(key)) {
        rechargeSummary.set(key, { total_in: 0, bonus_amount: 0 });
      }
      
      const summary = rechargeSummary.get(key)!;
      summary.total_in += parseFloat(String(rr.amount || "0"));
      summary.bonus_amount += parseFloat(String(rr.bonus_amount || "0"));
    }

    // Process redeem data
    const redeemSummary = new Map<string, number>();
    
    for (const rd of redeemData || []) {
      if (!isValidRedeemStatus(rd.process_status)) continue;
      
      // Resolve team code via relation or fallback map
      const teamCode = resolveTeamCode(rd);
      if (teamCode.toLowerCase() === "enttest" || teamCode.toLowerCase() === "enttestz") continue;
      
      const cycleDate = calculateCycleDate(rd.created_at);
      const key = `${cycleDate}|${teamCode}`;
      
      if (!redeemSummary.has(key)) {
        redeemSummary.set(key, 0);
      }
      
      redeemSummary.set(key, redeemSummary.get(key)! + parseFloat(String(rd.total_amount || "0")));
    }

    // Combine data
    const summarizedData = new Map<string, {
      cycle_date: string;
      team_code: string;
      total_in: number;
      bonus_amount: number;
      total_redeem: number;
    }>();
    const dailySummary = new Map<string, { total_in: number; total_redeem: number; bonus_amount: number }>();

    // Add recharge data
    for (const [key, value] of rechargeSummary.entries()) {
      const [cycleDate, teamCode] = key.split("|");
      summarizedData.set(key, {
        cycle_date: cycleDate,
        team_code: teamCode,
        total_in: value.total_in,
        bonus_amount: value.bonus_amount,
        total_redeem: 0,
      });

      // Aggregate daily (all teams)
      if (!dailySummary.has(cycleDate)) {
        dailySummary.set(cycleDate, { total_in: 0, total_redeem: 0, bonus_amount: 0 });
      }
      const dayAgg = dailySummary.get(cycleDate)!;
      dayAgg.total_in += value.total_in;
      dayAgg.bonus_amount += value.bonus_amount;
    }

    // Add/merge redeem data
    for (const [key, totalRedeem] of redeemSummary.entries()) {
      const [cycleDate, teamCode] = key.split("|");
      if (summarizedData.has(key)) {
        summarizedData.get(key)!.total_redeem = totalRedeem;
      } else {
        summarizedData.set(key, {
          cycle_date: cycleDate,
          team_code: teamCode,
          total_in: 0,
          bonus_amount: 0,
          total_redeem: totalRedeem,
        });
      }

      // Aggregate daily (all teams)
      if (!dailySummary.has(cycleDate)) {
        dailySummary.set(cycleDate, { total_in: 0, total_redeem: 0, bonus_amount: 0 });
      }
      const dayAgg = dailySummary.get(cycleDate)!;
      dayAgg.total_redeem += totalRedeem;
    }

    // Filter by date range if provided
    let filteredData = Array.from(summarizedData.values());
    if (startDate || endDate) {
      filteredData = filteredData.filter((item) => {
        if (startDate && item.cycle_date < startDate) return false;
        if (endDate && item.cycle_date > endDate) return false;
        return true;
      });
    }

    // Filter daily summary by date range
    let filteredDaily = Array.from(dailySummary.entries()).filter(([cycleDate]) => {
      if (startDate && cycleDate < startDate) return false;
      if (endDate && cycleDate > endDate) return false;
      return true;
    });

    // Aggregate by team_code
    const teamAggregates = new Map<string, {
      total_in: number;
      bonus_amount: number;
      total_redeem: number;
    }>();

    for (const item of filteredData) {
      if (!teamAggregates.has(item.team_code)) {
        teamAggregates.set(item.team_code, {
          total_in: 0,
          bonus_amount: 0,
          total_redeem: 0,
        });
      }
      
      const agg = teamAggregates.get(item.team_code)!;
      agg.total_in += item.total_in;
      agg.bonus_amount += item.bonus_amount;
      agg.total_redeem += item.total_redeem;
    }

    // Format results
    const results: Array<{
      Team_Code: string;
      In: number;
      Out: number;
      Total_Credits_Loaded: number;
      Bonus: number;
      "Bonus_%": number;
      "Holding_%": number;
    }> = [];

    const dailyResults: Array<{
      date: string;
      In: number;
      Out: number;
      Total_Credits_Loaded: number;
      Bonus: number;
      "Holding_%": number;
    }> = [];

    // Add team results
    for (const [teamCode, agg] of teamAggregates.entries()) {
      const totalIn = agg.total_in || 0;
      const bonus = agg.bonus_amount || 0;
      const totalRedeem = agg.total_redeem || 0;
      const bonusPercent = totalIn === 0 ? 0 : Math.round((bonus / totalIn) * 100 * 100) / 100;
      const holdingPercent = totalIn === 0 ? 0 : Math.round(((totalIn - totalRedeem) / totalIn) * 100 * 100) / 100;

      results.push({
        Team_Code: teamCode,
        In: totalIn,
        Out: totalRedeem,
        Total_Credits_Loaded: totalIn + bonus,
        Bonus: bonus,
        "Bonus_%": bonusPercent,
        "Holding_%": holdingPercent,
      });
    }

    // Build daily totals (across all teams)
    for (const [cycleDate, agg] of filteredDaily) {
      const totalIn = agg.total_in || 0;
      const totalRedeem = agg.total_redeem || 0;
      const bonus = agg.bonus_amount || 0;
      const holdingPercent = totalIn === 0 ? 0 : round2(((totalIn - totalRedeem) / totalIn) * 100);

      dailyResults.push({
        date: cycleDate,
        In: round2(totalIn),
        Out: round2(totalRedeem),
        Total_Credits_Loaded: round2(totalIn + bonus),
        Bonus: round2(bonus),
        "Holding_%": holdingPercent,
      });
    }

    // Calculate totals
    const totalIn = Array.from(teamAggregates.values()).reduce((sum, agg) => sum + (agg.total_in || 0), 0);
    const totalBonus = Array.from(teamAggregates.values()).reduce((sum, agg) => sum + (agg.bonus_amount || 0), 0);
    const totalRedeem = Array.from(teamAggregates.values()).reduce((sum, agg) => sum + (agg.total_redeem || 0), 0);
    const totalBonusPercent = totalIn === 0 ? 0 : Math.round((totalBonus / totalIn) * 100 * 100) / 100;
    const totalHoldingPercent = totalIn === 0 ? 0 : Math.round(((totalIn - totalRedeem) / totalIn) * 100 * 100) / 100;

    results.push({
      Team_Code: "Total",
      In: totalIn,
      Out: totalRedeem,
      Total_Credits_Loaded: totalIn + totalBonus,
      Bonus: totalBonus,
      "Bonus_%": totalBonusPercent,
      "Holding_%": totalHoldingPercent,
    });

    // Sort results
    results.sort((a, b) => {
      if (a.Team_Code === "Total") return 1;
      if (b.Team_Code === "Total") return -1;
      
      const aNum = parseInt(a.Team_Code.replace(/\D/g, "")) || 0;
      const bNum = parseInt(b.Team_Code.replace(/\D/g, "")) || 0;
      return aNum - bNum;
    });

    // Sort daily results by date ascending
    dailyResults.sort((a, b) => a.date.localeCompare(b.date));

    return new Response(JSON.stringify({ data: results, daily: dailyResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("team-cycle-summary error", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: `${error}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

