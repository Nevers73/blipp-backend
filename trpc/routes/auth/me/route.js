import { protectedProcedure } from "../../create-context.js";

export const me = protectedProcedure.query(({ ctx }) => {
  console.log(`[tRPC] Fetching current user: ${ctx.userId}`);
  return { user: ctx.user };
});
