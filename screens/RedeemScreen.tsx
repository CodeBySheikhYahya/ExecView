import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/supabase-credentials';
import { createClient } from '@supabase/supabase-js';
import { StyleSheet } from 'react-native';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function RedeemScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Redeem</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

