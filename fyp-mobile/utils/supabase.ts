import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

let supabase: SupabaseClient;

try {
  // Only use AsyncStorage if running in React Native (not web/server)
  const { Platform } = require("react-native");
  if (Platform.OS !== "web") {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch {
  // Fallback for server/Node.js
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
