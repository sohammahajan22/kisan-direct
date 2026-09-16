import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fnejbybgxymhodfajdxv.supabase.co";
const supabaseAnonKey = "sb_publishable_vVyiscCicHk3ms7cTONI_g_iU3963wU";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);