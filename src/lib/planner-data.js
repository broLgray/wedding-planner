import { getSupabase } from "./supabase";

/**
 * Save the user's planner data to Supabase.
 * Uses upsert so it creates a row on first save,
 * then updates the same row on subsequent saves.
 */
export async function savePlannerData(data) {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Not authenticated, cannot save:", authError);
    return { success: false, error: authError };
  }

  const { error } = await supabase.from("user_data").upsert(
    {
      user_id: user.id,
      data: data,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Save failed:", error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Load the user's planner data from Supabase.
 * Returns null if no data exists yet (new user).
 */
export async function loadPlannerData() {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Not authenticated, cannot load:", authError);
    return null;
  }

  const { data, error } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // PGRST116 = no rows found, which is fine for new users
    if (error.code === "PGRST116") return null;
    console.error("Load failed:", error);
    return null;
  }

  return data?.data || null;
}

/**
 * Delete all planner data for the current user (reset).
 */
export async function deletePlannerData() {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return;

  await supabase.from("user_data").delete().eq("user_id", user.id);
}
