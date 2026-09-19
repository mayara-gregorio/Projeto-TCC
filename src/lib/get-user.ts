import { cache } from "react";
import { createClient } from "./supabase/server";

export const getCurrentUser = cache(async () => {
    const supabase = await createClient();

    const { data: { user }, error: authError, } = await supabase.auth.getUser()

    if (authError || !user) {
        return null;
    }

    const {data: profile, error: profileError} = await supabase
    .from("users")
    .select("id, name, email")
    .eq("id", user.id)
    .single()

    if (profileError || !profile) {
        return null;
    }

    return profile;
})