import { supabase } from "@/integrations/supabase/client";

/**
 * Sign in using either email or username + password.
 * - If identifier contains '@', treats it as email directly.
 * - Otherwise, looks up profiles.username (case-insensitive) and uses profiles.auth_email.
 */
export const signInWithIdentifier = async (identifier: string, password: string) => {
  const trimmed = identifier.trim();
  const isEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(trimmed);

  let emailToUse = trimmed;

  if (!isEmail) {
    // Resolve username -> auth email (case-insensitive exact match)
    const { data, error } = await (supabase as any)
      .from("shipper_profiles")
      .select("auth_email, username")
      .ilike("username", trimmed)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }
    if (!data?.auth_email) {
      return { data: null, error: new Error("Username not found or not linked to an email.") };
    }
    emailToUse = data.auth_email;
  }

  return await supabase.auth.signInWithPassword({ email: emailToUse, password });
};
