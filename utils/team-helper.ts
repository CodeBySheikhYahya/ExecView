import { supabaseRead } from './supabase-read';

export async function getTeamId(teamCode: string): Promise<string | null> {
  if (teamCode === 'ALL') {
    console.log('[getTeamId] ALL selected, returning null');
    return null;
  }
  
  // Try both uppercase and lowercase since database might store in either case
  const searchCodeUpper = teamCode.toUpperCase();
  const searchCodeLower = teamCode.toLowerCase();
  console.log('[getTeamId] Looking up team_code (trying both cases):', searchCodeUpper, '/', searchCodeLower);
  
  try {
    // First try uppercase match
    let { data, error } = await supabaseRead
      .from('teams')
      .select('id, team_code')
      .eq('team_code', searchCodeUpper)
      .maybeSingle();
    
    // If not found, try lowercase match (database likely stores lowercase)
    if (!data && !error) {
      console.log('[getTeamId] Uppercase not found, trying lowercase...');
      const { data: lowerData, error: lowerError } = await supabaseRead
        .from('teams')
        .select('id, team_code')
        .eq('team_code', searchCodeLower)
        .maybeSingle();
      
      if (lowerData) {
        data = lowerData;
        console.log('[getTeamId] Found with lowercase search');
      }
      if (lowerError && !error) {
        error = lowerError;
      }
    }
    
    console.log('[getTeamId] Query result - data:', data, 'error:', error);
    
    if (error) {
      console.error('[getTeamId] Supabase error:', error);
      console.error('[getTeamId] Error details:', JSON.stringify(error, null, 2));
      return null;
    }
    
    if (!data || !data.id) {
      console.warn(`[getTeamId] Team not found for code: ${teamCode} (searched as: ${searchCode})`);
      
      // Debug: Check what team_codes actually exist in the database
      const { data: allTeams, error: allTeamsError } = await supabaseRead
        .from('teams')
        .select('team_code, id')
        .order('created_at', { ascending: true });
      
      if (allTeamsError) {
        console.error('[getTeamId] Error fetching all teams:', allTeamsError);
      } else {
        console.log('[getTeamId] All teams in DB:', allTeams);
        const availableCodes = allTeams?.map(t => t.team_code) || [];
        console.log('[getTeamId] Available team_codes (raw):', availableCodes);
        console.log('[getTeamId] Available team_codes (uppercase):', availableCodes.map(c => c?.toUpperCase()));
        console.log('[getTeamId] Searching for:', searchCode);
        console.log('[getTeamId] Match found?', availableCodes.some(c => c?.toUpperCase() === searchCode));
      }
      
      return null;
    }
    
    console.log('[getTeamId] Found team_id:', data.id, 'for team_code:', data.team_code);
    return data.id;
  } catch (err) {
    console.error('[getTeamId] Exception:', err);
    return null;
  }
}

