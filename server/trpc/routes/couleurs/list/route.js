import { publicProcedure } from "../../../create-context.js";
import { couleursStorage } from "../../../../storage/couleurs-storage.js";

export const listCouleurs = publicProcedure.query(async () => {
  await couleursStorage.initialize();
  return { couleurs: couleursStorage.getAll() };
});
