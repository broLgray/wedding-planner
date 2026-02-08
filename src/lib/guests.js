import { getSupabase } from "./supabase";

/**
 * Fetch all households and their guests for the current user.
 */
export async function fetchHouseholds() {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("households")
        .select(`
      *,
      guests (*)
    `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .order("created_at", { foreignTable: "guests", ascending: true });

    if (error) {
        console.error("Error fetching households:", error);
        return [];
    }
    return data;
}

/**
 * Create a new household with initial guests.
 */
export async function createHousehold(name, category, initialGuests = []) {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: household, error: hError } = await supabase
        .from("households")
        .insert({ user_id: user.id, name, category })
        .select()
        .single();

    if (hError) {
        console.error("Error creating household:", hError);
        return null;
    }

    if (initialGuests.length > 0) {
        const guestsToInsert = initialGuests.map(g => ({
            household_id: household.id,
            name: g.name || "",
            rsvp_status: g.rsvp_status || "pending"
        }));

        const { error: gError } = await supabase
            .from("guests")
            .insert(guestsToInsert);

        if (gError) {
            console.error("Error creating guests:", gError);
        }
    }

    return household;
}

/**
 * Update a household's details.
 */
export async function updateHousehold(id, updates) {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("households")
        .update(updates)
        .eq("id", id);
    return !error;
}

/**
 * Delete a household and its guests.
 */
export async function deleteHousehold(id) {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("households")
        .delete()
        .eq("id", id);
    return !error;
}

/**
 * Update a guest's details.
 */
export async function updateGuest(id, updates) {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("guests")
        .update(updates)
        .eq("id", id);
    return !error;
}

/**
 * Add a guest to an existing household.
 */
export async function addGuest(householdId, name = "") {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("guests")
        .insert({ household_id: householdId, name })
        .select()
        .single();
    return data;
}

/**
 * Remove a guest.
 */
export async function removeGuest(id) {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", id);
    return !error;
}

/**
 * Fetch a household and its guests by RSVP token (Public).
 */
export async function fetchByToken(token) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from("households")
        .select(`
      *,
      guests (*)
    `)
        .eq("rsvp_token", token)
        .order("created_at", { foreignTable: "guests", ascending: true })
        .single();

    if (error) {
        console.error("Error fetching by token:", error);
        return null;
    }
    return data;
}

/**
 * Submit RSVP for a household and its guests (Public).
 */
export async function submitRSVP(householdId, guestUpdates) {
    const supabase = getSupabase();

    // Update guests
    const promises = guestUpdates.map(g =>
        supabase
            .from("guests")
            .update({ rsvp_status: g.rsvp_status, dietary_requirements: g.dietary_requirements })
            .eq("id", g.id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
        console.error("Errors updating guests:", errors);
        return false;
    }

    return true;
}

/**
 * Migrate guests from the old JSONB format to the new tables.
 */
export async function migrateGuests(oldGuests) {
    if (!oldGuests || oldGuests.length === 0) return true;

    let allSuccess = true;
    for (const group of oldGuests) {
        // Check if group has guests (new format) or just count (old format)
        const initialGuests = group.guests || Array.from({ length: group.count || 0 }).map(() => ({ name: "Guest" }));
        const result = await createHousehold(group.name || "Group", group.category || "Other", initialGuests);
        if (!result) {
            allSuccess = false;
            break;
        }
    }

    return allSuccess;
}
