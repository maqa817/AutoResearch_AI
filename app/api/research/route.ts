import { NextRequest, NextResponse } from "next/server";
import { runMultiAgentResearch, simpleQuery } from "@/lib/agents";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { query, useFullOrchestration } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    if (useFullOrchestration) {
      // Version 3: Multi-agent orchestration
      console.log("[v0] Running full multi-agent orchestration");
      const result = await runMultiAgentResearch(query);
      return NextResponse.json(result);
    } else {
      // Version 1: Simple query
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
