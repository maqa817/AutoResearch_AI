import { NextRequest, NextResponse } from "next/server";
import { runMultiAgentResearch, simpleQuery } from "@/lib/agents";
import { updateConfig, getConfig } from "@/lib/ollama";
import { getQueryHistory, searchQueries } from "@/lib/memory";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, useFullOrchestration, action, config, documents } = body;

    // Handle config updates
    if (action === "updateConfig" && config) {
      updateConfig(config);
      return NextResponse.json({
        success: true,
        message: "Config updated",
        config: getConfig(),
      });
    }

    // Handle history retrieval
    if (action === "getHistory") {
      const history = getQueryHistory(20);
      return NextResponse.json({ history });
    }

    // Handle search
    if (action === "search" && query) {
      const results = searchQueries(query);
      return NextResponse.json({ results });
    }

    // Handle research queries
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    // Proxy research queries to the Python FastAPI backend
    console.log("[v5] Proxying request to FastAPI backend...", {
      query: query.substring(0, 50) + "...",
      fullOrchestration: useFullOrchestration,
    });

    const fastApiUrl = "http://127.0.0.1:8000/api/research";
    
    // Convert to FastAPI expected format
    const fastApiRequest = {
      query: query,
      use_full_orchestration: useFullOrchestration || false
    };

    const fastApiResponse = await fetch(fastApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fastApiRequest),
    });

    if (!fastApiResponse.ok) {
      throw new Error(`FastAPI returned status ${fastApiResponse.status}`);
    }

    const data = await fastApiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
