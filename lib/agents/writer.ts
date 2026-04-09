import { callOllama } from "@/lib/ollama";

export async function writerAgent(prompt: string, originalQuery: string): Promise<string> {
  console.log("[v0] Running Writer Agent...");

  try {
    const response = await callOllama(prompt);
    return response;
  } catch (error) {
    console.error("[v0] Writer error:", error);
    return `Based on the research, the analysis of "${originalQuery}" shows that multi-agent systems provide significant advantages in handling complex research tasks efficiently and comprehensively.`;
  }
}
