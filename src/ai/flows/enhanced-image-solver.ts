'use server';

/**
 * Enhanced Image Problem Solver with direct multimodal vision support.
 * Uses Google Gemini 2.5 Flash free tier as the default uploaded-image reader.
 */

import { z } from 'genkit';

const EnhancedImageSolverInputSchema = z.object({
  imageDataUri: z.string().describe('Image data URI (up to 5MB).'),
  problemType: z.enum(['math', 'quiz', 'general']).optional(),
  preferredModel: z.string().optional(),
});

const EnhancedImageSolverOutputSchema = z.object({
  recognizedContent: z.string().describe('The content recognized from the image.'),
  solution: z.string().describe('The solution or answer.'),
  isSolvable: z.boolean().describe('Whether the problem is solvable.'),
  modelUsed: z.string().optional(),
});

export type EnhancedImageSolverInput = z.infer<typeof EnhancedImageSolverInputSchema>;
export type EnhancedImageSolverOutput = z.infer<typeof EnhancedImageSolverOutputSchema>;

const DEFAULT_VISION_MODEL = 'gemini-2.5-flash';
const DEFAULT_PROVIDER_LABEL = 'Google Gemini 2.5 Flash (free tier)';

function validateImageSize(dataUri: string): void {
  const base64Match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Invalid image data URI format');
  }

  const base64Data = base64Match[2];
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > 5) {
    throw new Error(`Image size (${sizeInMB.toFixed(2)}MB) exceeds 5MB limit`);
  }
}

function parseImageDataUri(dataUri: string): { mimeType: string; base64Data: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data URI format');
  }

  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

function parseVisionResponse(text: string): Pick<EnhancedImageSolverOutput, 'recognizedContent' | 'solution' | 'isSolvable'> {
  const recognizedMatch = text.match(/recognized content:\s*([\s\S]*?)(?:\n+solution:|$)/i);
  const solutionMatch = text.match(/solution:\s*([\s\S]*?)(?:\n+solvable:|$)/i);
  const solvableMatch = text.match(/solvable:\s*(yes|no)/i);

  return {
    recognizedContent: recognizedMatch?.[1]?.trim() || 'Content recognized from uploaded image',
    solution: solutionMatch?.[1]?.trim() || text,
    isSolvable: solvableMatch ? solvableMatch[1].toLowerCase() === 'yes' : !/cannot solve|unsolvable/i.test(text),
  };
}

async function callGeminiVision(input: EnhancedImageSolverInput): Promise<EnhancedImageSolverOutput> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google vision model is not configured. Add GOOGLE_API_KEY or GEMINI_API_KEY.');
  }

  const modelId = input.preferredModel || DEFAULT_VISION_MODEL;
  const { mimeType, base64Data } = parseImageDataUri(input.imageDataUri);

  const prompt = `Analyze this uploaded image. Problem type: ${input.problemType || 'general'}.

If the image contains math, solve it step by step.
If the image contains a question, answer it clearly.
If the image contains general content, describe and explain it.

Return your answer in exactly this format:
Recognized content: <what is visible in the image>
Solution:
<your answer or explanation>
Solvable: <yes or no>`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          topP: 0.85,
          maxOutputTokens: 4096,
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini vision request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini vision returned an empty response.');
  }

  return {
    ...parseVisionResponse(text),
    modelUsed: `${modelId} via ${DEFAULT_PROVIDER_LABEL}`,
  };
}

export async function enhancedImageSolver(input: EnhancedImageSolverInput): Promise<EnhancedImageSolverOutput> {
  try {
    validateImageSize(input.imageDataUri);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      recognizedContent: 'Unable to process image',
      solution: errorMessage,
      isSolvable: false,
      modelUsed: `${input.preferredModel || DEFAULT_VISION_MODEL} via ${DEFAULT_PROVIDER_LABEL}`,
    };
  }

  try {
    return await callGeminiVision(input);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      recognizedContent: 'Unable to process image',
      solution: `Error: ${errorMessage}. This feature is configured for ${DEFAULT_PROVIDER_LABEL}.`,
      isSolvable: false,
      modelUsed: `${input.preferredModel || DEFAULT_VISION_MODEL} via ${DEFAULT_PROVIDER_LABEL}`,
    };
  }
}
