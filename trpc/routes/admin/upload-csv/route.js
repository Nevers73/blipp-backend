import { adminProcedure } from "../../create-context.js";
import { couleursStorage } from "../../../storage/couleurs-storage.js";
import { z } from "zod";

// Détecte le séparateur dans le CSV
function detectSeparator(line) {
  const separators = ["\t", ";", ","];
  const counts = separators.map((sep) => line.split(sep).length - 1);
  const maxIndex = counts.indexOf(Math.max(...counts));
  return separators[maxIndex];
}

// Parse une ligne CSV en tenant compte des guillemets
function parseCSVLine(line, separator) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Catégorise la couleur selon L, A, B
function categorizeColor(L, A, B) {
  if (A > 40 && B > 20) return "Rouge";
  if (A > 30 && B < 10) return "Rose";
  if (A > 20 && B < -5) return "Rose";
  if (A < 25 && B < 20 && L > 60) return "Nude";
  if (A > 30 && B > 30) return "Coral";
  if (A > 35 && B < 5) return "Rose";
  if (A > 25 && B > 15) return "Coral";
  return "Rose";
}

// Génère un nom à partir des gouttes
function generateColorName(gouttes) {
  const activeGouttes = [];
  const gouttesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  gouttesLetters.forEach((letter) => {
    const key = `gouttes${letter}`;
    const qty = gouttes[key] || 0;
    if (qty > 0) {
      activeGouttes.push(`${qty}${letter}`);
    }
  });

  return activeGouttes.join("+") || "Teinte";
}

export const uploadCSV = adminProcedure
  .input(
    z.object({
      csvContent: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[tRPC] Processing CSV upload");

    try {
      const lines = input.csvContent.trim().split("\n");

      if (lines.length < 2) {
        throw new Error("Le fichier CSV est vide ou invalide");
      }

      const separator = detectSeparator(lines[0]);
      console.log("[tRPC] Detected separator:", separator);

      const headers = parseCSVLine(lines[0], separator);
      console.log("[tRPC] CSV Headers:", headers);

      const requiredHeaders = [
        "Gouttes A",
        "Gouttes B",
        "Gouttes C",
        "Gouttes D",
        "Gouttes E",
        "Gouttes F",
        "Gouttes G",
        "Gouttes H",
        "Gouttes I",
        "Volume (cc)",
        "L",
        "A",
        "B",
        "Couleur HEX",
      ];

      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingHeaders.join(", ")}`);
      }

      const couleurs = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line, separator);
        const rowData = {};

        headers.forEach((header, idx) => {
          rowData[header] = values[idx] || "";
        });

        const gouttesA = parseInt(rowData["Gouttes A"]) || 0;
        const gouttesB = parseInt(rowData["Gouttes B"]) || 0;
        const gouttesC = parseInt(rowData["Gouttes C"]) || 0;
        const gouttesD = parseInt(rowData["Gouttes D"]) || 0;
        const gouttesE = parseInt(rowData["Gouttes E"]) || 0;
        const gouttesF = parseInt(rowData["Gouttes F"]) || 0;
        const gouttesG = parseInt(rowData["Gouttes G"]) || 0;
        const gouttesH = parseInt(rowData["Gouttes H"]) || 0;
        const gouttesI = parseInt(rowData["Gouttes I"]) || 0;
        const volume = parseFloat(rowData["Volume (cc)"]) || 0;
        const L = parseFloat(rowData["L"]) || 0;
        const A = parseFloat(rowData["A"]) || 0;
        const B = parseFloat(rowData["B"]) || 0;

        let hex = rowData["Couleur HEX"] || "#000000";
        if (!hex.startsWith("#")) hex = `#${hex}`;

        const categorie = categorizeColor(L, A, B);
        const nom = generateColorName({
          gouttesA,
          gouttesB,
          gouttesC,
          gouttesD,
          gouttesE,
          gouttesF,
          gouttesG,
          gouttesH,
          gouttesI,
        });

        couleurs.push({
          id: `couleur_${Date.now()}_${i}_${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          numero: i,
          gouttesA,
          gouttesB,
          gouttesC,
          gouttesD,
          gouttesE,
          gouttesF,
          gouttesG,
          gouttesH,
          gouttesI,
          volume,
          L,
          A,
          B,
          hex,
          nom,
          categorie,
        });
      }

      await couleursStorage.replaceAll(couleurs);

      console.log(`[tRPC] CSV uploadé avec succès: ${couleurs.length} couleurs`);

      return {
        success: true,
        count: couleurs.length,
        message: `${couleurs.length} couleurs importées avec succès`,
      };
    } catch (error) {
      console.error("[tRPC] Erreur upload CSV:", error);
      throw new Error(
        `Échec du traitement CSV: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  });
