import { protectedProcedure } from "../../create-context.js";
import { sessionsStorage } from "../../../storage/sessions-storage.js";
import { TRPCError } from "@trpc/server";

export const logout = protectedProcedure.mutation(({ ctx }) => {
  console.log(`[auth] Déconnexion de l'utilisateur : ${ctx.userId}`);

  if (!ctx.sessionId) {
    console.warn("[auth] Aucune session fournie pour la déconnexion");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Aucune session active",
    });
  }

  sessionsStorage.delete(ctx.sessionId);

  console.log(`[auth] Session supprimée : ${ctx.sessionId}`);

  return { success: true };
});
