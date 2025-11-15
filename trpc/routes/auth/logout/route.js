import { protectedProcedure } from "../../create-context.js";
import { sessionsStorage } from "../../../storage/sessions-storage.js";

export const logout = protectedProcedure.mutation(({ ctx }) => {
  console.log(`[tRPC] Logout user: ${ctx.userId}`);

  if (ctx.sessionId) {
    sessionsStorage.delete(ctx.sessionId);
  }

  return { success: true };
});
