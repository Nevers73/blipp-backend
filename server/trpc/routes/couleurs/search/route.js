import { publicProcedure } from "../../../create-context.js";
import { couleursStorage } from "../../../../storage/couleurs-storage.js";
import { z } from "zod";

export const searchCouleurs = publicProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ input }) => {
    await couleursStorage.initialize();
    const couleurs = couleursStorage.search(input.query);
    return { couleurs };
  });
