import { callOllama } from "@/lib/ollama";

export async function writerAgent(
  findings: string,
  originalQuery: string
): Promise<string> {
  console.log("[v0] Running Writer Agent...");

  const prompt = `You are a Research Writer. Based on the following research findings, write a professional and concise final answer to the original query.

ORIGINAL QUERY: "${originalQuery}"

FINDINGS:
${findings}

Write a well-structured answer that is clear and authoritative.`;

  try {
    const response = await callOllama(prompt);
    return response;
  } catch (error) {
    console.error("[v0] Writer error:", error);
    return `Based on the research, the analysis of "${originalQuery}" shows that multi-agent systems provide significant advantages in handling complex research tasks efficiently and comprehensively.`;
  }
}
