import { createClient } from "@supabase/supabase-js";
// Publishable key: authorization is enforced by Postgres RLS, never this key.
export const supabase = createClient(
  "https://zkfuaydidrhrniewaxqt.supabase.co",
  "sb_publishable_v2eJvH0_NHGavhN8iGZK2g_oepS2AmF",
  { auth: { flowType: "pkce", detectSessionInUrl: true } },
);
export const authRedirect = () =>
  window.location.origin + window.location.pathname;
