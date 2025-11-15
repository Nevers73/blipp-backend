import { publicProcedure } from "../../create-context.js";
import { couleursStorage } from "../../../../storage/couleurs-storage.js";

import { z } from "zod";

export const getCouleursByCategorie = publicProcedure
  .input(z.object({ categorie: z.string() }))
  .query(async ({ input }) => {
    await couleursStorage.initialize();
    const couleurs = couleursStorage.getByCategorie(input.categorie);
    return { couleurs };
  });
