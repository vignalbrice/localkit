"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { PlanType } from "@/lib/plans";

export async function updateUserPlan(plan: PlanType) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  try {
    // Mettre à jour le plan de l'utilisateur dans la base de données
    await db
      .update(users)
      .set({
        plan,
        planUpdatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { success: true, plan };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du plan:", error);
    throw new Error("Impossible de mettre à jour le plan");
  }
}

export async function getUserPlan() {
  const session = await auth();

  if (!session?.user?.id) {
    return { plan: "free" as PlanType };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        plan: true,
        planUpdatedAt: true,
      },
    });

    return {
      plan: (user?.plan as PlanType) || "free",
      planUpdatedAt: user?.planUpdatedAt,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du plan:", error);
    return { plan: "free" as PlanType };
  }
}
