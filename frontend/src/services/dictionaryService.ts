/**
 * Dictionary API service for Zaggle.
 *
 * Provides word definitions using the Free Dictionary API.
 * https://dictionaryapi.dev/
 */

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
}

export interface DictionaryResult {
  success: boolean;
  word: string;
  definition?: WordDefinition;
  error?: string;
}

// Cache for definitions to avoid repeated API calls
const definitionCache = new Map<string, WordDefinition>();

/**
 * Fetch the definition of a word from the Free Dictionary API.
 *
 * @param word - The word to look up
 * @returns Definition result with success status
 */
export async function getWordDefinition(word: string): Promise<DictionaryResult> {
  const normalizedWord = word.toLowerCase().trim();

  // Check cache first
  if (definitionCache.has(normalizedWord)) {
    return {
      success: true,
      word: normalizedWord,
      definition: definitionCache.get(normalizedWord),
    };
  }

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(normalizedWord)}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          word: normalizedWord,
          error: "No definition found",
        };
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: WordDefinition[] = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        word: normalizedWord,
        error: "No definition found",
      };
    }

    // Use the first result
    const definition = data[0];

    // Cache the result
    definitionCache.set(normalizedWord, definition);

    return {
      success: true,
      word: normalizedWord,
      definition,
    };
  } catch (error) {
    return {
      success: false,
      word: normalizedWord,
      error: error instanceof Error ? error.message : "Failed to fetch definition",
    };
  }
}

/**
 * Get a simple, short definition for display.
 *
 * @param word - The word to look up
 * @returns A short definition string, or null if not found
 */
export async function getShortDefinition(word: string): Promise<string | null> {
  const result = await getWordDefinition(word);

  if (!result.success || !result.definition) {
    return null;
  }

  // Get the first definition from the first meaning
  const firstMeaning = result.definition.meanings[0];
  if (!firstMeaning || firstMeaning.definitions.length === 0) {
    return null;
  }

  const firstDef = firstMeaning.definitions[0];
  const partOfSpeech = firstMeaning.partOfSpeech;

  // Format: "noun: a word definition"
  return `${partOfSpeech}: ${firstDef.definition}`;
}

/**
 * Get the phonetic pronunciation of a word.
 *
 * @param word - The word to look up
 * @returns Phonetic string, or null if not found
 */
export async function getPhonetic(word: string): Promise<string | null> {
  const result = await getWordDefinition(word);

  if (!result.success || !result.definition) {
    return null;
  }

  // Try the main phonetic field first
  if (result.definition.phonetic) {
    return result.definition.phonetic;
  }

  // Fall back to phonetics array
  const phonetics = result.definition.phonetics;
  if (phonetics && phonetics.length > 0) {
    const withText = phonetics.find((p) => p.text);
    if (withText?.text) {
      return withText.text;
    }
  }

  return null;
}

/**
 * Get audio URL for word pronunciation.
 *
 * @param word - The word to look up
 * @returns Audio URL, or null if not found
 */
export async function getPronunciationAudio(word: string): Promise<string | null> {
  const result = await getWordDefinition(word);

  if (!result.success || !result.definition) {
    return null;
  }

  const phonetics = result.definition.phonetics;
  if (phonetics && phonetics.length > 0) {
    const withAudio = phonetics.find((p) => p.audio);
    if (withAudio?.audio) {
      return withAudio.audio;
    }
  }

  return null;
}

/**
 * Clear the definition cache.
 */
export function clearDefinitionCache(): void {
  definitionCache.clear();
}

/**
 * Get all meanings with their definitions.
 *
 * @param word - The word to look up
 * @returns Array of meanings, or empty array if not found
 */
export async function getAllMeanings(word: string): Promise<Meaning[]> {
  const result = await getWordDefinition(word);

  if (!result.success || !result.definition) {
    return [];
  }

  return result.definition.meanings;
}
