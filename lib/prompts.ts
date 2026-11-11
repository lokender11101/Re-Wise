import type { DifficultyLevel, ContentBlockType, StudyBlock } from '@/types/study';

/**
 * Builds the strict system prompt and user prompt for generating structured study materials.
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
  };

  const requestedBlocksDescription = selectedTypes
    .map((type) => typeDescriptions[type])
    .filter(Boolean)
    .join('\n');

  const systemInstruction = `You are ReWise, an elite AI Active Learning Architect and Cognitive Learning Specialist.
Your mission is to transform unstructured lecture notes, articles, or topics into high-yield, structured active learning materials.

CRITICAL INSTRUCTIONS:
1. You MUST respond with STRICT VALID JSON ONLY. Do NOT wrap with markdown backticks (\`\`\`json). Do NOT include conversational greetings or preamble.
2. The JSON root MUST be an object with two properties:
   - "title": A clear, concise title for this study session.
   - "blocks": An array containing the requested learning blocks.
3. Supported block types to generate based on user request:
${requestedBlocksDescription}
4. STRICT QUIZ VALIDATION RULE:
   - "correctAnswerIndex" MUST be an integer >= 0 and < options.length.
   - Always ensure "options" has at least 4 realistic choices.
   - Never provide a quiz question without an in-depth "explanation".
5. DIFFICULTY ADAPTATION (${difficulty.toUpperCase()}):
   ${
     difficulty === 'beginner'
       ? 'Focus on fundamental concepts, clear terminology, accessible analogies, and foundational recall.'
       : difficulty === 'intermediate'
       ? 'Focus on mechanisms, trade-offs, practical application, comparing alternatives, and operational nuances.'
       : 'Focus on advanced scenarios, system constraints, performance bottlenecks, edge cases, and deep analytical problem-solving.'
   }
6. High Pedagogy Standards:
   - Make questions challenging and educational.
   - Avoid trivial true/false questions in quizzes.
   - Summaries must synthesize, not merely repeat.`;

  const userPrompt = `Study Material / Topic:
"""
${notes}
"""

Target Difficulty: ${difficulty}
Requested Content Blocks: ${selectedTypes.join(', ')}

Generate the structured JSON response now.`;

  return { systemInstruction, userPrompt };
}

/**
 * Builds the refinement prompt for updating an existing study session based on user feedback.
 */
export function buildRefinementPrompt(
  currentTitle: string,
  currentDifficulty: DifficultyLevel,
  currentBlocks: StudyBlock[],
  instruction: string
): { systemInstruction: string; userPrompt: string } {
  const systemInstruction = `You are ReWise, an elite AI Active Learning Architect.
The user wants to refine and update their existing structured study session according to a specific follow-up instruction.

CRITICAL INSTRUCTIONS:
1. Return STRICT VALID JSON ONLY. No markdown code fences, no introductory or trailing commentary.
2. The root object MUST maintain the format:
   {
     "title": "...",
     "blocks": [ ... ]
   }
3. Preserve the core knowledge while accurately executing the user's refinement (e.g., adding questions, increasing question difficulty, adding more flashcards, simplifying the summary, or tailoring examples).
4. Maintain all schema constraints:
   - Every quiz question MUST have at least 4 options and a valid zero-based correctAnswerIndex.
   - Every block must have a valid "type" ("summary" | "flashcards" | "quiz" | "checklist").`;

  const userPrompt = `Current Session:
Title: ${currentTitle}
Difficulty: ${currentDifficulty}
Existing Blocks:
${JSON.stringify(currentBlocks, null, 2)}

User Refinement Request:
"${instruction}"

Output the complete, updated structured JSON containing the refined blocks.`;

  return { systemInstruction, userPrompt };
}
