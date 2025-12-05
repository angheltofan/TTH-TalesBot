import { GameMode } from './types';

// ID-ul sheet-ului furnizat de tine
const SHEET_ID = '1xdGFEuaddRxqpXl18rAw1U76rKsatLrTnirVh12ZZuc';
// GID pentru tab-ul cu API Keys
const KEYS_SHEET_GID = '2030785583';

// URL-ul de export CSV pentru Prompts (Tab-ul principal/default)
const PROMPTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
// URL-ul de export CSV pentru API Keys (Tab-ul specificat)
const KEYS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${KEYS_SHEET_GID}`;

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
    
    // Adăugăm timestamp pentru a evita cache-ul browserului
    const uniqueUrl = `${PROMPTS_CSV_URL}&t=${Date.now()}`;
    
    const response = await fetch(uniqueUrl, {
      cache: "no-store",
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    const promptsMap: Record<string, string> = {};
    const foundKeys: string[] = [];

    // Iterăm rândurile. Structura așteptată: Coloana A = ID (ex: magic_jin), Coloana B = Prompt
    rows.forEach((row, index) => {
      if (row.length >= 2) {
        const id = row[0].trim();
        const prompt = row[1].trim();
        
        if (Object.values(GameMode).includes(id as GameMode)) {
            if (prompt.length > 10) {
                promptsMap[id] = prompt;
                foundKeys.push(id);
            }
        }
      }
    });

    if (foundKeys.length > 0) {
        console.log(`[Google Sheets] Successfully loaded prompts for: ${foundKeys.join(', ')}`);
    }
    
    return promptsMap;

  } catch (error) {
    console.warn('[Google Sheets] Failed to load prompts, using defaults:', error);
    return null;
  }
}

export async function fetchApiKeyFromSheet(): Promise<string | null> {
  try {
    console.log('[Google Sheets] Fetching API Keys...');
    
    const uniqueUrl = `${KEYS_CSV_URL}&t=${Date.now()}`;
    
    const response = await fetch(uniqueUrl, {
      cache: "no-store",
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    // Colectăm cheile din prima coloană (Coloana A)
    const validKeys: string[] = [];
    
    rows.forEach(row => {
      if (row.length > 0) {
        const key = row[0].trim();
        // O validare simplă: cheile Gemini încep de obicei cu AIza și au o anumită lungime
        if (key.length > 20 && !key.includes('API_KEY')) { 
           validKeys.push(key);
        }
      }
    });

    if (validKeys.length === 0) {
      console.warn('[Google Sheets] No valid API keys found in the sheet.');
      return null;
    }

    // Dacă avem mai multe chei, alegem una random
    const randomIndex = Math.floor(Math.random() * validKeys.length);
    const selectedKey = validKeys[randomIndex];

    console.log(`[Google Sheets] Loaded ${validKeys.length} API keys. Selected index: ${randomIndex}`);
    return selectedKey;

  } catch (error) {
    console.warn('[Google Sheets] Failed to load API Key:', error);
    return null;
  }
}