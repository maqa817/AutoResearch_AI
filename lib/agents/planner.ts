import { callOllama } from "@/lib/ollama";

export async function plannerAgent(prompt: string): Promise<string> {
  console.log("[v0] Running Planner Agent...");

  try {
    const response = await callOllama(prompt);
    return response;
  } catch (error) {
    console.error("[v0] Planner error:", error);
    return "1. Analyze primary query components\n2. Gather supporting evidence and data\n3. Identify cross-functional patterns";
  }
}
