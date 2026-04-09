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

    console.log("[v0] Processing research request:", {
      query: query.substring(0, 50) + "...",
      fullOrchestration: useFullOrchestration,
      documentsCount: documents?.length || 0,
    });

    if (useFullOrchestration) {
      // Version 4: Full multi-agent orchestration with Critic
      console.log("[v0] Running full multi-agent orchestration");
      const result = await runMultiAgentResearch(query);
      return NextResponse.json(result);
    } else {
      // Simple query mode
      console.log("[v0] Running simple query");
      const answer = await simpleQuery(query);
      return NextResponse.json({
        query,
        answer,
        mode: "simple",
      });
    }
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
