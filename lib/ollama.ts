export interface OllamaConfig {
  temperature: number;
  max_tokens: number;
  top_k: number;
  model: string;
}

export const defaultConfig: OllamaConfig = {
  temperature: 0.7,
  max_tokens: 1024,
  top_k: 40,
  model: "llama2", // Default model - adjust based on your Ollama setup
};

let currentConfig: OllamaConfig = { ...defaultConfig };

export function getConfig(): OllamaConfig {
  return { ...currentConfig };
}

export function updateConfig(partial: Partial<OllamaConfig>): void {
  currentConfig = { ...currentConfig, ...partial };
  console.log("[v0] Config updated:", currentConfig);
}

export async function callOllama(prompt: string, customConfig?: Partial<OllamaConfig>): Promise<string> {
  const config = customConfig ? { ...currentConfig, ...customConfig } : currentConfig;
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  console.log(`[v0] Calling Ollama at ${ollamaUrl} with model: ${config.model}`);

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        temperature: config.temperature,
        num_predict: config.max_tokens,
        top_k: config.top_k,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "";
  } catch (error) {
    console.error("[v0] Ollama call failed:", error);
    // Return mock response for development
    return `[Ollama Connection Issue] Unable to connect to Ollama at ${ollamaUrl}. Make sure Ollama is running. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
