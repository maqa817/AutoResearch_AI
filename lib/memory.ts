import fs from "fs";
import path from "path";

export interface QueryLog {
  id: string;
  query: string;
  answer: string;
  agent_steps: string;
  quality: string;
  timestamp: string;
  model_config: string;
}

const dbDir = path.join(process.cwd(), "data");
const dbFile = path.join(dbDir, "research.json");

// Initialize data directory and file
function initializeDb() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([]));
  }
}

export function saveQuery(log: Omit<QueryLog, "id" | "timestamp">): void {
  initializeDb();

  try {
    const logs = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    const newLog: QueryLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    logs.push(newLog);
    fs.writeFileSync(dbFile, JSON.stringify(logs, null, 2));
    console.log(`[v0] Query logged: ${newLog.id}`);
  } catch (error) {
    console.error("[v0] Error saving query:", error);
  }
}

export function getQueryHistory(limit: number = 10): QueryLog[] {
  initializeDb();

  try {
    const logs = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    return logs.slice(-limit).reverse();
  } catch (error) {
    console.error("[v0] Error reading query history:", error);
    return [];
  }
}

export function searchQueries(keyword: string): QueryLog[] {
  initializeDb();

  try {
    const logs = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    return logs.filter(
      (log: QueryLog) =>
        log.query.toLowerCase().includes(keyword.toLowerCase()) ||
        log.answer.toLowerCase().includes(keyword.toLowerCase())
    );
  } catch (error) {
    console.error("[v0] Error searching queries:", error);
    return [];
  }
}

export function clearHistory(): void {
  try {
    initializeDb();
    fs.writeFileSync(dbFile, JSON.stringify([]));
    console.log("[v0] Query history cleared");
  } catch (error) {
    console.error("[v0] Error clearing history:", error);
  }
}
