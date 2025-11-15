import { protectedProcedure } from "trpc/create-context.js";



export const me = protectedProcedure.query(({ ctx }) => {
  console.log(`[auth] Récupération du profil utilisateur : ${ctx.userId}`);

  return {
    user: ctx.user,
  };
});
