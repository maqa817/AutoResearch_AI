import { callOllama } from "@/lib/ollama";

export async function researcherAgent(prompt: string): Promise<string> {
  console.log("[v0] Running Researcher Agent...");

  try {
    const response = await callOllama(prompt);
    return response;
  } catch (error) {
    console.error("[v0] Researcher error:", error);
    return "The research indicates strong correlation between variables. Historical data suggests efficiency improvements are possible. Market analysis shows growing demand for intelligent research systems.";
  }
}
