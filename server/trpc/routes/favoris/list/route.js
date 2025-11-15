// trpc/routes/favoris/list/route.js

import { protectedProcedure } from "trpc/create-context.js";

import { couleursStorage } from "storage/couleurs-storage.js";

export const listFavoris = protectedProcedure.query(({ ctx }) => {
  console.log(`[tRPC] Fetching favoris for user ${ctx.userId}`);

  const favoriIds = ctx.user.favoris;
  const couleurs = favoriIds
    .map((id) => couleursStorage.getById(id))
    .filter((c) => c !== undefined);

  return { couleurs };
});
