import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kwxpaboqaaefyjutovxq.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseKey &&
    supabaseKey.trim() !== "" &&
    !supabaseKey.includes("YOUR_") &&
    supabaseKey !== "PLACEHOLDER"
  );
};

// Initialize Supabase safely. If key is missing, export null to trigger localStorage fallback.
export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseKey) : null;
export default supabase;
