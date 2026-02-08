import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getPlanLimits } from "@/lib/plans";
import { eq } from "drizzle-orm";

export const getCurrentUser = async (): Promise<{
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  planLimits: ReturnType<typeof getPlanLimits>;
}> => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  try {
    // Optionally, you could also fetch additional user details from the database here
    // if needed, using session.user.id to query your users table.
    const userId = session.user.id;
    if (!userId) {
      throw new Error("No user id available on session");
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const userPlan: "free" | "pro" | "enterprise" = "free";
    const planLimits = getPlanLimits("free");
    const userEmail = "demo@example.com";
    const userName: string | undefined = "Demo User";

    if (!currentUser) {
      return {
        id: userId,
        email: userEmail,
        name: userName,
        plan: userPlan,
        planLimits,
      }
    }

    return {
      id: currentUser.id,
      email: currentUser.email ?? "demo@example.com",
      name: currentUser.name ?? "Demo User",
      plan: currentUser.plan as "free" | "pro" | "enterprise",
      planLimits: getPlanLimits(currentUser.plan as "free" | "pro" | "enterprise"),

    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error("Failed to fetch current user");
  }
}