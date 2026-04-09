import fs from "fs";
import path from "path";
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
 * Utility to load all files from the dataset directory
 */
function loadDatasetContext(): string {
  const datasetDir = path.join(process.cwd(), "dataset");
  let context = "";

  if (!fs.existsSync(datasetDir)) return "";

  try {
    const files = fs.readdirSync(datasetDir);
    for (const file of files) {
      if (file.endsWith(".txt") || file.endsWith(".md")) {
        const content = fs.readFileSync(path.join(datasetDir, file), "utf-8");
        context += `\n--- FILE: ${file} ---\n${content}\n`;
      }
    }
  } catch (err) {
    console.error("[v0] Error reading dataset:", err);
  }

  return context;
}

/**
 * Version 4: Simple query with Context
 */
export async function simpleQuery(query: string): Promise<string> {
  const context = loadDatasetContext();
  console.log(`[v0] Running simple query with ${context.length} chars of context...`);

  const prompt = `You are a helpful AI assistant. Answer the query ONLY using the provided context. 
  If the answer is not in the context, say "I cannot find this information in the provided documents."
  
  CONTEXT:
  ${context || "No documents provided."}
  
  QUERY: "${query}"`;
  
  const answer = await callOllama(prompt);

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
 * Version 4: Multi-agent orchestration with Context
 */
export async function runMultiAgentResearch(query: string): Promise<ResearchResult> {
  const steps: AgentStep[] = [];
  const context = loadDatasetContext();
  
  console.log(`[v0] Processing multi-agent request with ${context.length} chars of context...`);

  // Step 1: Planning
  console.log("[v0] Step 1: Planning");
  const planPrompt = `PLANNER: Break down this query into 3 research steps based ONLY on provided context.\nCONTEXT: ${context || "None"}\nQUERY: ${query}`;
  const plan = await plannerAgent(planPrompt); 
  steps.push({
    agent: "Planner",
    input: query,
    output: plan,
    timestamp: new Date().toISOString(),
  });

  // Step 2: Researching
  console.log("[v0] Step 2: Researching");
  const researchPrompt = `RESEARCHER: Gather findings from the context for this plan.\nCONTEXT: ${context || "None"}\nPLAN: ${plan}`;
  const findings = await researcherAgent(researchPrompt);
  steps.push({
    agent: "Researcher",
    input: plan,
    output: findings,
    timestamp: new Date().toISOString(),
  });

  // Step 3: Writing
  console.log("[v0] Step 3: Writing");
  const writePrompt = `WRITER: Synthesize findings into a final answer. Use THE PROVIDED CONTEXT ONLY.\nCONTEXT: ${context || "None"}\nFINDINGS: ${findings}\nQUERY: ${query}`;
  const initialAnswer = await writerAgent(writePrompt, query);
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
    output: `Quality: ${criticism.quality}\nSuggestions: ${criticism.suggestions.join(", ")}`,
    timestamp: new Date().toISOString(),
  });

  let finalAnswer = initialAnswer;

  // Step 5: Rewrite if needed
  if (criticism.shouldRegenerate) {
    console.log("[v0] Step 5: Regenerating based on criticism...");
    const improvementPrompt = `IMPROVE: The previous answer had issues. Rewrite it using CONTEXT ONLY.\nCONTEXT: ${context || "None"}\nISSUE: ${criticism.suggestions.join("\n")}\nQUERY: ${query}`;
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
