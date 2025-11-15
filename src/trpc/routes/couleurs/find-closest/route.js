import { publicProcedure } from "../../create-context.js";
import { couleursStorage } from "../../../storage/couleurs-storage.js";
import { z } from "zod";

export const findClosestCouleur = publicProcedure
  .input(z.object({ hex: z.string() }))
  .query(async ({ input }) => {
    await couleursStorage.initialize();
    console.log(`[couleurs] Finding closest couleur to hex: ${input.hex}`);

    const couleur = couleursStorage.findClosestByHex(input.hex);

    if (!couleur) {
      throw new Error("No couleurs available");
    }

    return { couleur };
  });
