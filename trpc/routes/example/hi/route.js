// trpc/routes/couleurs/search/route.js

import { publicProcedure } from "../../../create-context.js";
import { couleursStorage } from "../../../../storage/couleurs-storage.js";
import { z } from "zod";

export const searchCouleurs = publicProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ input }) => {
    await couleursStorage.initialize();
    console.log(`[tRPC] Searching couleurs with query: ${input.query}`);
    const couleurs = couleursStorage.search(input.query);
    return { couleurs };
  });
