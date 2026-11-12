import type { DifficultyLevel, ContentBlockType, StudyBlock } from '@/types/study';

/**
 * Builds the strict system prompt and user prompt for generating structured study materials via DeepSeek.
 */
export function buildGenerationPrompt(
  notes: string,
  difficulty: DifficultyLevel,
  selectedTypes: ContentBlockType[]
): { systemInstruction: string; userPrompt: string } {
  const typeDescriptions: Record<ContentBlockType, string> = {
    summary: `- "summary" block: Provide an insightful executive summary of the core concepts, followed by a bulleted array of essential keyPoints.`,
    flashcards: `- "flashcards" block: Provide 4 to 8 high-impact flashcards for active recall. Each card has "question", "answer", and "difficulty" ("easy" | "medium" | "hard").`,
    quiz: `- "quiz" block: Provide 3 to 6 multiple-choice questions testing conceptual comprehension and application. Each question must include "question", an array of 4 distinct "options", a zero-based integer "correctAnswerIndex" (between 0 and 3), and a clear "explanation" detailing why that option is correct.`,
    checklist: `- "checklist" block: Provide 4 to 8 actionable revision checklist items ("items" array with "text") for verifying subject mastery.`,
    chart: `- "chart" block: When quantitative comparisons, relative metrics, or distribution data are present or applicable in the study material, provide a "chart" block with "title", "chartType" ("bar" | "comparison" | "distribution"), "data" array ({ "label": string, "value": number, "unit"?: string, "description"?: string }), and an accessible "summary". Do NOT fabricate arbitrary numbers.`,
  };

  const requestedBlocksDescription = selectedTypes
    .map((type) => typeDescriptions[type])
    .filter(Boolean)
    .join('\n');

  const systemInstruction = `You are ReWise, an elite AI Active Learning Architect and Cognitive Learning Specialist.
Your mission is to transform unstructured lecture notes, articles, or topics into high-yield, structured active learning materials.

CRITICAL INSTRUCTIONS FOR JSON OUTPUT:
1. You MUST respond with a STRICT VALID JSON OBJECT ONLY.
2. Do NOT wrap with markdown backticks (\`\`\`json). Do NOT output conversational text, greetings, or explanations outside the JSON object.
3. The root JSON object MUST conform to this exact schema:
{
  "title": "Session Title Here",
  "blocks": [
    // Array of blocks conforming to requested block types
  ]
}

Available block schemas:
- Summary block:
  { "type": "summary", "id": "summary-1", "title": "...", "content": "...", "keyPoints": ["..."] }
- Flashcards block:
  { "type": "flashcards", "id": "flashcards-1", "cards": [{ "id": "c-1", "question": "...", "answer": "...", "difficulty": "medium", "conceptTag": "Core Concept" }] }
- Quiz block:
  { "type": "quiz", "id": "quiz-1", "questions": [{ "id": "q-1", "question": "...", "options": ["Choice A", "Choice B", "Choice C", "Choice D"], "correctAnswerIndex": 0, "explanation": "...", "conceptTag": "Core Concept" }] }
- Checklist block:
  { "type": "checklist", "id": "checklist-1", "title": "Revision Checklist", "items": [{ "id": "item-1", "text": "..." }] }
- Chart block:
  { "type": "chart", "id": "chart-1", "title": "Quantitative Comparison", "chartType": "bar", "xAxisLabel": "...", "yAxisLabel": "...", "data": [{ "label": "Alg A", "value": 85, "unit": "ms", "description": "..." }], "summary": "..." }

4. Requested block types for this generation:
${requestedBlocksDescription}

5. CONCEPT TAGS & QUIZ VALIDATION RULES:
   - Provide a concise "conceptTag" (1-3 words) for each flashcard and quiz question (e.g., "Critical Section", "Convoy Effect", "Aging") to power learning analytics.
   - "correctAnswerIndex" MUST be a valid 0-based integer strictly less than options.length (0, 1, 2, or 3).
   - "options" MUST contain at least 4 distinct choices.
   - Always include an in-depth "explanation" for each question.

6. TARGET DIFFICULTY (${difficulty.toUpperCase()}):
   ${
     difficulty === 'beginner'
       ? 'Focus on fundamental concepts, intuitive terminology, and accessible real-world analogies.'
       : difficulty === 'intermediate'
       ? 'Focus on mechanisms, trade-offs, practical application, comparing alternatives, and operational nuances.'
       : 'Focus on advanced scenarios, system constraints, performance bottlenecks, edge cases, and deep analytical problem-solving.'
   }`;

  const userPrompt = `Study Material / Topic:
"""
${notes}
"""

Target Difficulty: ${difficulty}
Requested Content Blocks: ${selectedTypes.join(', ')}

Respond with the complete, valid JSON object now.`;

  return { systemInstruction, userPrompt };
}

/**
 * Builds the refinement prompt for updating an existing study session based on user feedback via DeepSeek.
 */
export function buildRefinementPrompt(
  currentTitle: string,
  currentDifficulty: DifficultyLevel,
  currentBlocks: StudyBlock[],
  instruction: string
): { systemInstruction: string; userPrompt: string } {
  const systemInstruction = `You are ReWise, an elite AI Active Learning Architect.
The user wants to refine and update their existing structured study session according to a specific follow-up instruction.

CRITICAL INSTRUCTIONS FOR JSON OUTPUT:
1. Return a STRICT VALID JSON OBJECT ONLY.
2. Do not wrap with markdown backticks or commentary outside JSON.
3. The root object MUST maintain the format:
{
  "title": "Updated Title",
  "blocks": [ ... ]
}
4. Preserve the core concepts while accurately executing the user's refinement (e.g., adding questions, increasing quiz difficulty, adding flashcards, simplifying the summary, or adding quantitative comparison charts).
5. Maintain all schema constraints:
   - Every quiz question MUST have at least 4 options and a valid 0-based correctAnswerIndex.
   - Every block must have a valid "type" ("summary" | "flashcards" | "quiz" | "checklist" | "chart").
   - Chart block schema: { "type": "chart", "id": "chart-1", "title": "...", "chartType": "bar" | "comparison" | "distribution", "data": [{ "label": "...", "value": number, "unit"?: "...", "description"?: "..." }], "summary": "..." }. Do not fabricate arbitrary numbers.`;

  const userPrompt = `Current Session:
Title: ${currentTitle}
Difficulty: ${currentDifficulty}
Existing Blocks:
${JSON.stringify(currentBlocks, null, 2)}

User Refinement Request:
"${instruction}"

Output the complete, updated structured JSON object containing the refined blocks.`;

  return { systemInstruction, userPrompt };
}
