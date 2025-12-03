import { GameMode } from './types';

// ID-ul sheet-ului furnizat de tine
const SHEET_ID = '1xdGFEuaddRxqpXl18rAw1U76rKsatLrTnirVh12ZZuc';
// URL-ul de export CSV. Funcționează dacă sheet-ul este "Anyone with link can view"
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

/**
 * Parsare CSV simplă care respectă celulele cu ghilimele (pentru text multi-line)
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        // Ghilimele duble în interiorul unui text citat ("") -> se transformă într-una singură
        currentVal += '"';
        i++; // Sărim peste următoarea ghilimeauă
      } else {
        // Intrare sau ieșire din modul citat
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      // Final de celulă
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      // Final de rând
      if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
      
      currentRow.push(currentVal);
      if (currentRow.length > 0) rows.push(currentRow);
      
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  
  // Adăugăm ultima valoare/rând dacă există
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }

  return rows;
}

export async function fetchPromptsFromSheet(): Promise<Record<string, string> | null> {
  try {
    console.log('[Google Sheets] Fetching prompts...');
    
    // MODIFICARE: Adăugăm timestamp pentru a evita cache-ul browserului
    const uniqueUrl = `${CSV_URL}&t=${Date.now()}`;
    
    const response = await fetch(uniqueUrl, {
      cache: "no-store", // Instrucțiune explicită pentru browser
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    const promptsMap: Record<string, string> = {};
    const foundKeys: string[] = [];

    // Iterăm rândurile. Presupunem că nu avem header, sau dacă avem, verificăm ID-ul.
    // Structura așteptată: Coloana A = ID (ex: magic_jin), Coloana B = Prompt
    rows.forEach((row, index) => {
      if (row.length >= 2) {
        const id = row[0].trim();
        const prompt = row[1].trim();
        
        // Verificăm dacă ID-ul este unul valid din enum-ul nostru
        if (Object.values(GameMode).includes(id as GameMode)) {
            if (prompt.length > 10) {
                promptsMap[id] = prompt;
                foundKeys.push(id);
            } else {
                console.warn(`[Google Sheets] Found key "${id}" but prompt was too short/empty.`);
            }
        } else if (index > 0 && id.length > 0) {
            // Log doar dacă nu e header și pare a fi un rând de date
            console.debug(`[Google Sheets] Row ${index}: Ignored unknown key "${id}"`);
        }
      }
    });

    if (foundKeys.length > 0) {
        console.log(`[Google Sheets] Successfully loaded prompts for: ${foundKeys.join(', ')}`);
    } else {
        console.warn('[Google Sheets] Connected, but found no valid GameMode IDs in Column A.');
    }
    
    return promptsMap;

  } catch (error) {
    console.warn('[Google Sheets] Failed to load prompts, using defaults:', error);
    return null;
  }
}