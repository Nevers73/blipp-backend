import { publicProcedure } from "../../../create-context.js";
import { couleursStorage } from "../../../../storage/couleurs-storage.js";
import { z } from "zod";

export const getCouleurById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    await couleursStorage.initialize();
    const couleur = couleursStorage.getById(input.id);
    if (!couleur) throw new Error("Couleur not found");
    return { couleur };
  });
