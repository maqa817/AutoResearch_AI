import { callOllama, getConfig as getOllamaConfig } from "@/lib/ollama";
import { plannerAgent } from "@/lib/agents/planner";
import { researcherAgent } from "@/lib/agents/researcher";
import { writerAgent } from "@/lib/agents/writer";
import { criticAgent, type CriticReview } from "@/lib/agents/critic";
import { saveQuery } from "@/lib/memory";

export interface AgentStep {
  agent: string;
  input: string;
  output: string;
  timestamp: string;
}

export interface ResearchResult {
  steps: AgentStep[];
  finalAnswer: string;
  criticism?: CriticReview;
}

/**
 * Version 4: Simple query with Ollama (direct LLM call)
 */
export async function simpleQuery(query: string): Promise<string> {
  console.log("[v0] Running simple query with Ollama...");

  const prompt = `Please provide a concise and helpful answer to this research query: "${query}"`;
  const answer = await callOllama(prompt);

  // Save to memory
  try {
    saveQuery({
      query,
      answer,
      agent_steps: JSON.stringify([]),
      quality: "simple",
      model_config: JSON.stringify(getOllamaConfig()),
    });
  } catch (error) {
    console.error("[v0] Failed to save query:", error);
  }

  return answer;
}

/**
 * Version 4: Multi-agent orchestration with Critic Agent
 */
export async function runMultiAgentResearch(query: string): Promise<ResearchResult> {
  const steps: AgentStep[] = [];

  // Step 1: Planning
  console.log("[v0] Step 1: Planning");
  const plan = await plannerAgent(query);
  steps.push({
    agent: "Planner",
    input: query,
    output: plan,
    timestamp: new Date().toISOString(),
  });

  // Step 2: Researching
  console.log("[v0] Step 2: Researching");
  const findings = await researcherAgent(plan);
  steps.push({
    agent: "Researcher",
    input: plan,
    output: findings,
    timestamp: new Date().toISOString(),
  });

  // Step 3: Writing
  console.log("[v0] Step 3: Writing");
  const initialAnswer = await writerAgent(findings, query);
  steps.push({
    agent: "Writer",
    input: findings,
    output: initialAnswer,
    timestamp: new Date().toISOString(),
  });

  // Step 4: Critic Review
  console.log("[v0] Step 4: Critic Review");
  const criticism = await criticAgent(initialAnswer, query);
  steps.push({
    agent: "Critic",
    input: initialAnswer,
    output: `Quality: ${criticism.quality}\nHallucinations: ${criticism.hallucinations.length > 0 ? criticism.hallucinations.join(", ") : "None"}\nSuggestions: ${criticism.suggestions.join(", ")}`,
    timestamp: new Date().toISOString(),
  });

  let finalAnswer = initialAnswer;

  // Step 5: Rewrite if needed
  if (criticism.shouldRegenerate) {
    console.log("[v0] Step 5: Regenerating answer based on criticism...");
    const improvementPrompt = `The previous answer had these issues:\n${criticism.suggestions.join("\n")}\n\nPlease provide an improved answer to the query: "${query}"`;
    finalAnswer = await callOllama(improvementPrompt);
    steps.push({
      agent: "Writer (Revised)",
      input: improvementPrompt,
      output: finalAnswer,
      timestamp: new Date().toISOString(),
    });
  }

  // Save to memory
  try {
    saveQuery({
      query,
      answer: finalAnswer,
      agent_steps: JSON.stringify(steps),
      quality: criticism.quality,
      model_config: JSON.stringify(getOllamaConfig()),
    });
  } catch (error) {
    console.error("[v0] Failed to save query:", error);
  }

  return {
    steps,
    finalAnswer,
    criticism,
  };
}
