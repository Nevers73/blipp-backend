import { adminProcedure } from "../../create-context.js";
import { couleursStorage } from "../../../../storage/couleurs-storage.js";
import { z } from "zod";



// Détecte le séparateur dans la première ligne
function detectSeparator(line) {
  const separators = ["\t", ";", ","];
  const counts = separators.map((sep) => line.split(sep).length - 1);
  const maxIndex = counts.indexOf(Math.max(...counts));
  return separators[maxIndex];
}

// Parse une ligne CSV en gérant correctement les guillemets
function parseCSVLine(line, separator) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

// Catégorie calculée automatiquement à partir du LAB
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

// Génère un nom lisible type "2A + 3C"
function generateColorName(gouttes) {
  const result = [];
  const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  for (const letter of keys) {
    const qty = gouttes[`gouttes${letter}`];
    if (qty > 0) result.push(`${qty}${letter}`);
  }

  return result.length > 0 ? result.join("+") : "Teinte";
}

export const uploadCSV = adminProcedure
  .input(
    z.object({
      csvContent: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[CSV] Début import…");

    try {
      const lines = input.csvContent.trim().split("\n");

      if (lines.length < 2) {
        throw new Error("Le fichier CSV est vide ou incorrect.");
      }

      // Détection automatique du séparateur
      const separator = detectSeparator(lines[0]);
      console.log("[CSV] Séparateur détecté:", JSON.stringify(separator));

      const headers = parseCSVLine(lines[0], separator);
      console.log("[CSV] En-têtes détectés:", headers);

      // Headers obligatoires
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

      // Traitement ligne par ligne
      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine.length) continue; // Skip lignes vides

        const values = parseCSVLine(rawLine, separator);
        const rowData = {};

        // Mappe les colonnes
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || "";
        });

        // Extraction sécurisée des données
        const gouttes = {};
        for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I"]) {
          gouttes[`gouttes${letter}`] =
            parseInt(rowData[`Gouttes ${letter}`]) || 0;
        }

        const L = parseFloat(rowData["L"]) || 0;
        const A = parseFloat(rowData["A"]) || 0;
        const B = parseFloat(rowData["B"]) || 0;
        const volume = parseFloat(rowData["Volume (cc)"]) || 0;

        let hex = rowData["Couleur HEX"].trim();
        if (!hex.startsWith("#")) hex = `#${hex}`;

        const categorie = categorizeColor(L, A, B);
        const nom = generateColorName(gouttes);

        // Construction de la couleur
        couleurs.push({
          id: `c_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          numero: i,
          ...gouttes,
          volume,
          L,
          A,
          B,
          hex,
          nom,
          categorie,
        });
      }

      // Remplace toute la base
      await couleursStorage.replaceAll(couleurs);

      console.log(`[CSV] Import terminé → ${couleurs.length} couleurs.`);

      return {
        success: true,
        count: couleurs.length,
        message: `${couleurs.length} couleurs importées avec succès`,
      };
    } catch (err) {
      console.error("[CSV] Erreur:", err);
      throw new Error(
        `Impossible de traiter le CSV : ${
          err instanceof Error ? err.message : "Erreur inconnue"
        }`
      );
    }
  });
