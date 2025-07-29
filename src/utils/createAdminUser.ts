import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "123456";

export const createHardcodedAdminUser = async () => {
  try {
    // First check if admin user already exists by trying to sign in
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (existingUser?.user) {
      // User exists and can sign in, sign them out and return success
      await supabase.auth.signOut();
      return { success: true, message: "Admin user already exists" };
    }

    if (signInError?.message === "Invalid login credentials") {
      // User doesn't exist, create them using admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          role: "admin",
          name: "Admin User"
        }
      });

      if (error) {
        console.error("Failed to create admin user:", error);
        return { success: false, error: error.message };
      }

      return { success: true, message: "Admin user created successfully" };
    }

    // Some other error occurred
    return { success: false, error: signInError?.message || "Unknown error" };
  } catch (error) {
    console.error("Error in createHardcodedAdminUser:", error);
    return { success: false, error: "Failed to create admin user" };
  }
};

// Alternative simpler approach - hardcoded login bypass
export const handleHardcodedLogin = async (email: string, password: string) => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Try to sign up the user first (this will fail if they exist)
    try {
      await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
    } catch (error) {
      // User might already exist, ignore error
    }

    // Now try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    return { data, error };
  }

  // For non-admin users, proceed with normal login
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};