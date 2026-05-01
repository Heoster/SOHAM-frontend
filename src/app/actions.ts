"use server";

/**
 * Server Actions — UI entry points for all AI features.
 *
 * All heavy AI work is delegated to the standalone Express backend server
 * via serverClient (ui/src/lib/server-client.ts).
 *
 * Backend URL: NEXT_PUBLIC_SERVER_URL or SERVER_URL (default: http://localhost:8080)
 */

import { serverClient } from "@/lib/server-client";
import { sendWelcomeEmail } from "@/ai/flows/send-welcome-email";
import { enhancedImageSolver } from "@/ai/flows/enhanced-image-solver";
import type {
  AnalyzePdfInput,
  AnalyzePdfOutput,
  ProcessUserMessageInput,
  SolveImageEquationInput,
  SolveImageEquationOutput,
} from "@/lib/types";

// ─── Error helper ─────────────────────────────────────────────────────────────

function handleError(error: unknown): { error: string } {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("API key") ||
    message.includes("API_KEY") ||
    message.includes("Authentication")
  ) {
    return { error: "AI processing failed. Please check your API key configuration." };
  }
  return { error: `AI processing failed: ${message}` };
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Main chat action — routes to backend /api/chat
 */
export async function generateResponse(
  input: ProcessUserMessageInput
): Promise<
  | { content: string; modelUsed?: string; autoRouted?: boolean; routingReasoning?: string }
  | { error: string }
> {
  try {
    const { message, history = [], settings = {} as any, userId } = input;

    const data = await serverClient.chat({
      message,
      history: (history ?? []).map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      settings: {
        model: settings?.model,
        tone: settings?.tone,
        technicalLevel: settings?.technicalLevel,
      },
      userId,
    });

    if (!data.success) {
      return { error: (data as any).message || "AI request failed" };
    }

    return {
      content: data.content,
      modelUsed: data.modelUsed,
      autoRouted: data.autoRouted,
      routingReasoning: data.routingReasoning,
    };
  } catch (error) {
    console.error("generateResponse error:", error);
    return handleError(error);
  }
}

// ─── Image equation solver ────────────────────────────────────────────────────

/**
 * Solve a math equation from an image — routes to backend /api/ai/image-solver
 */
export async function solveEquationFromImage(
  input: SolveImageEquationInput
): Promise<SolveImageEquationOutput | { error: string }> {
  try {
    const data = await enhancedImageSolver({
      imageDataUri: input.photoDataUri,
      problemType: "math",
      preferredModel: "gemini-2.5-flash",
    });

    return {
      recognizedEquation: data.recognizedContent,
      solutionSteps: data.solution,
      isSolvable: data.isSolvable,
      modelUsed: data.modelUsed,
    };
  } catch (error) {
    return handleError(error);
  }
}

// ─── PDF analyzer ─────────────────────────────────────────────────────────────

/**
 * Analyze a PDF document — routes to backend /api/ai/pdf-analyzer
 */
export async function analyzeDocumentFromPdf(
  input: AnalyzePdfInput
): Promise<AnalyzePdfOutput | { error: string }> {
  try {
    // Strip the data URI prefix to get raw base64
    const pdfBase64 = input.pdfDataUri.replace(/^data:[^;]+;base64,/, "");

    const data = await serverClient.pdfAnalyzer({
      pdfBase64,
      question: input.question,
    });

    return { answer: data.answer };
  } catch (error) {
    return handleError(error);
  }
}

// ─── Image generation ─────────────────────────────────────────────────────────

/**
 * Generate an image — routes to backend /api/image/generate
 * Returns the image URL (base64 data URL or Pollinations URL) on success.
 */
export async function generateImage(input: {
  prompt: string;
  userId: string;
  style?: "realistic" | "artistic" | "anime" | "sketch";
}): Promise<
  | { url: string; enhancedPrompt: string; provider: string; model: string; generationTime: number }
  | { error: string }
> {
  try {
    const data = await serverClient.generateImage({
      prompt: input.prompt,
      userId: input.userId,
      style: input.style,
    });

    if (!data.success) {
      return { error: (data as any).error || "Image generation failed" };
    }

    return {
      url: data.url ?? data.imageUrl ?? data.imageBase64 ?? "",
      enhancedPrompt: data.enhancedPrompt ?? input.prompt,
      provider: data.provider ?? "unknown",
      model: data.model ?? "unknown",
      generationTime: data.generationTime ?? 0,
    };
  } catch (error) {
    return handleError(error);
  }
}

// ─── Welcome email ────────────────────────────────────────────────────────────

export async function triggerWelcomeEmail(input: {
  email: string;
  displayName: string;
}): Promise<void | { error: string }> {
  try {
    await sendWelcomeEmail(input);
  } catch (error) {
    return handleError(error);
  }
}
