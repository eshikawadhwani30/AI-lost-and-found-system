/**
 * Google Gemini AI Semantic Item Matching Service
 * 
 * Compares a source item (LOST or FOUND) against candidate items in the database
 * using Gemini 1.5 Flash natural language reasoning to detect semantic correlations
 * (e.g. "cracked screen" matching "damaged display", or "Samsung galaxy" matching "Samsung mobile").
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Fallback semantic matcher using token frequency and keyword overlap
 * Used if GEMINI_API_KEY is not configured or if network/API limits are reached
 */
const fallbackHeuristicMatcher = (sourceItem, candidates) => {
  const getTokens = (str) =>
    (str || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const sourceTokens = new Set([
    ...getTokens(sourceItem.title),
    ...getTokens(sourceItem.description),
    ...getTokens(sourceItem.location),
    ...(sourceItem.tags || []).map((t) => t.toLowerCase()),
  ]);

  const scoredCandidates = candidates.map((cand) => {
    const candTokens = [
      ...getTokens(cand.title),
      ...getTokens(cand.description),
      ...getTokens(cand.location),
      ...(cand.tags || []).map((t) => t.toLowerCase()),
    ];

    const matchingWords = candTokens.filter((token) => sourceTokens.has(token));
    const uniqueMatches = Array.from(new Set(matchingWords));

    let score = Math.min(95, Math.round((uniqueMatches.length / Math.max(sourceTokens.size, 1)) * 100) + (uniqueMatches.length * 10));
    if (uniqueMatches.length === 0) score = 15;

    let matchLevel = 'LOW';
    if (score >= 70) matchLevel = 'HIGH';
    else if (score >= 40) matchLevel = 'MEDIUM';

    return {
      candidateId: cand._id.toString(),
      confidenceScore: score,
      matchLevel,
      matchReason: uniqueMatches.length > 0
        ? `[Heuristic Engine] Strong textual correlation detected on keywords: ${uniqueMatches.join(', ')}.`
        : 'Low similarity detected between title and description attributes.',
      keySimilarities: uniqueMatches.slice(0, 5),
    };
  });

  return scoredCandidates.sort((a, b) => b.confidenceScore - a.confidenceScore);
};

/**
 * Main matching function: Calls Google Gemini 1.5 API
 */
const matchItemsWithGemini = async (sourceItem, candidates) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key is set or placeholder exists, gracefully use the heuristic fallback
  if (!apiKey || apiKey === 'your_google_gemini_api_key_here' || apiKey.trim() === '') {
    console.warn('[Gemini AI Service] No GEMINI_API_KEY configured. Using intelligent heuristic matching engine.');
    return {
      engine: 'Heuristic Fallback Engine (Set GEMINI_API_KEY in server/.env for Gemini 1.5 Flash)',
      results: fallbackHeuristicMatcher(sourceItem, candidates),
    };
  }

  // Build structured prompt for Gemini
  const prompt = `
You are an expert AI Lost & Found matching assistant for an academic campus and municipal recovery desk.
Your objective is to compare the TARGET item against a list of CANDIDATE items and determine if any candidate represents the same real-world object.

Analyze semantic synonyms, brand nicknames, location proximity, visual descriptions, and distinguishing marks.
Examples:
- "Samsung mobile with cracked screen" is a high match for "Samsung Galaxy phone, damaged display".
- "Blue water bottle" in "Library 2nd floor" is a match for "Navy blue flask" found in "Library study room".

TARGET ITEM:
- Type: ${sourceItem.type}
- Title: ${sourceItem.title}
- Category: ${sourceItem.category?.name || 'General'}
- Description: ${sourceItem.description}
- Location: ${sourceItem.location}
- Incident Date: ${new Date(sourceItem.date).toLocaleDateString()}
- Tags: ${(sourceItem.tags || []).join(', ')}

CANDIDATE ITEMS TO EVALUATE:
${candidates.map((c, i) => `
[Candidate ${i + 1}]
- ID: ${c._id.toString()}
- Title: ${c.title}
- Category: ${c.category?.name || 'General'}
- Description: ${c.description}
- Location: ${c.location}
- Incident Date: ${new Date(c.date).toLocaleDateString()}
- Tags: ${(c.tags || []).join(', ')}
`).join('\n')}

INSTRUCTIONS:
Return a JSON array ONLY with an object for each evaluated candidate with the following exact keys:
- "candidateId": string (the exact Candidate ID provided)
- "confidenceScore": number (integer between 0 and 100)
- "matchLevel": string ("HIGH", "MEDIUM", or "LOW")
- "matchReason": string (1-2 sentences in clear natural language explaining why it is or is not a potential match)
- "keySimilarities": array of strings (the specific matching attributes, e.g. ["Brand: Samsung", "Cracked screen", "Library location"])

Sort the array in descending order by confidenceScore.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for deterministic analysis
          topK: 40,
          topP: 0.95,
          responseMimeType: 'application/json', // Enforces strict JSON output
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Gemini API Error] HTTP ${response.status}: ${errText}`);
      console.warn('[Gemini AI Service] Falling back to heuristic matching.');
      return {
        engine: 'Heuristic Fallback Engine (Gemini API returned error)',
        results: fallbackHeuristicMatcher(sourceItem, candidates),
      };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsedResults = JSON.parse(rawText);

    return {
      engine: 'Google Gemini 1.5 Flash (Semantic Neural Engine)',
      results: Array.isArray(parsedResults) ? parsedResults : [parsedResults],
    };
  } catch (error) {
    console.error(`[Gemini Service Exception]: ${error.message}`);
    return {
      engine: 'Heuristic Fallback Engine (Network/Parse exception)',
      results: fallbackHeuristicMatcher(sourceItem, candidates),
    };
  }
};

module.exports = {
  matchItemsWithGemini,
};
