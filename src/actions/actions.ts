"use server";

import { createClient } from "@/lib/supabase/server";

export async function logoutCurrentUser() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  return error;
}