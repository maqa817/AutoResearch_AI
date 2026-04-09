import { callOllama } from "@/lib/ollama";

export interface CriticReview {
  quality: "good" | "fair" | "poor";
  hallucinations: string[];
  suggestions: string[];
  shouldRegenerate: boolean;
}

export async function criticAgent(answer: string, query: string): Promise<CriticReview> {
  console.log("[v0] Running Critic Agent...");

  const prompt = `You are a Critical Reviewer. Analyze the following answer for quality and potential hallucinations.

ORIGINAL QUERY: "${query}"

ANSWER:
${answer}

Respond in this exact format:
QUALITY: [good/fair/poor]
HALLUCINATIONS: [list any false claims, one per line, or "None"]
SUGGESTIONS: [list improvements, one per line]
REGENERATE: [yes/no]`;

  try {
    const response = await callOllama(prompt);
    return parseReview(response);
  } catch (error) {
    console.error("[v0] Critic error:", error);
    return {
      quality: "fair",
      hallucinations: [],
      suggestions: ["Review and verify all claims"],
      shouldRegenerate: false,
    };
  }
}

function parseReview(response: string): CriticReview {
  const lines = response.split("\n");
  const review: CriticReview = {
    quality: "fair",
    hallucinations: [],
    suggestions: [],
    shouldRegenerate: false,
  };

  for (const line of lines) {
    if (line.includes("QUALITY:")) {
      const quality = line.split(":")[1].trim().toLowerCase();
      if (["good", "fair", "poor"].includes(quality)) {
        review.quality = quality as any;
      }
    } else if (line.includes("HALLUCINATIONS:")) {
      const hals = line.split(":")[1].trim();
      if (hals !== "None" && hals) {
        review.hallucinations.push(hals);
      }
    } else if (line.includes("SUGGESTIONS:")) {
      const sugg = line.split(":")[1].trim();
      if (sugg) {
        review.suggestions.push(sugg);
      }
    } else if (line.includes("REGENERATE:")) {
      const regen = line.split(":")[1].trim().toLowerCase();
      review.shouldRegenerate = regen === "yes" || regen === "true";
    }
  }

  return review;
}
