import { callOllama } from "@/lib/ollama";

export async function plannerAgent(query: string): Promise<string> {
  console.log("[v0] Running Planner Agent...");

  const prompt = `You are a Research Planner. Break down the following research query into 3 clear, actionable research steps.

QUERY: "${query}"

Provide only the 3 steps in a numbered list. Be concise.`;

  try {
    const response = await callOllama(prompt);
    return response;
  } catch (error) {
    console.error("[v0] Planner error:", error);
    return "1. Analyze primary query components\n2. Gather supporting evidence and data\n3. Identify cross-functional patterns";
  }
}
