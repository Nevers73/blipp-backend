import { publicProcedure } from "../../../create-context.js";
import { couleursStorage } from "../../../storage/couleurs-storage.js";


export const getCategories = publicProcedure.query(async () => {
  await couleursStorage.initialize();
  return { categories: couleursStorage.getCategories() };
});
