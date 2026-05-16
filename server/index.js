import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ].filter(Boolean)
}));
app.use(express.json());

const WIKI_DIR = path.resolve(__dirname, "./wiki");
const COMPILED_WIKI_PATH = path.resolve(__dirname, "./wiki/compiled_wiki.md");
const LEADS_FILE = path.resolve(__dirname, "./leads.jsonl");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── State ────────────────────────────────────────────────────────────────────

let compilationStatus = {
  state: "idle",        // idle | compiling | ready | error
  lastCompiled: null,
  filesCompiled: [],
  error: null,
};

let lastCompiledHash = null;

function hashWikiSources() {
  const files = fs.readdirSync(WIKI_DIR)
    .filter(f => f.endsWith(".md") && f !== "compiled_wiki.md")
    .sort();
  const content = files.map(f => fs.readFileSync(path.join(WIKI_DIR, f), "utf-8")).join("\n");
  return crypto.createHash("sha256").update(content).digest("hex");
}

// ─── Wiki Compiler ────────────────────────────────────────────────────────────
// This is the core of the LLM Wiki pattern.
// Instead of dumping raw MD files into every query prompt (expensive + messy),
// we run a one-time LLM pass that:
//   1. Reads all raw MD source files
//   2. Synthesizes them into a single, structured, cross-referenced compiled_wiki.md
//   3. Resolves any contradictions or gaps between files
//   4. Saves the compiled result — this becomes the query-time context
//
// At query time, we only send compiled_wiki.md (not the raw files).
// We also use prompt caching so the compiled wiki is cached server-side
// and NOT reprocessed on every request — massive token savings.

async function compileWiki() {
  // Skip if already compiling
  if (compilationStatus.state === "compiling") return;

  // Skip if source files haven't changed since last successful compile
  const currentHash = hashWikiSources();
  if (currentHash === lastCompiledHash && fs.existsSync(COMPILED_WIKI_PATH)) {
    console.log("⏭️  Wiki sources unchanged — skipping recompilation.");
    compilationStatus = { ...compilationStatus, state: "ready" };
    return;
  }

  compilationStatus = { state: "compiling", lastCompiled: null, filesCompiled: [], error: null };
  console.log("🔄 Compiling wiki...");

  try {
    const rawFiles = fs.readdirSync(WIKI_DIR)
      .filter(f => f.endsWith(".md") && f !== "compiled_wiki.md");

    if (rawFiles.length === 0) {
      compilationStatus = { state: "error", error: "No MD files found in wiki directory", filesCompiled: [], lastCompiled: null };
      return;
    }

    const rawContent = rawFiles.map(file => {
      const content = fs.readFileSync(path.join(WIKI_DIR, file), "utf-8");
      return `\n\n---\n## SOURCE FILE: ${file}\n\n${content}`;
    }).join("\n");

    const compilerPrompt = `You are a knowledge compiler. You have been given multiple raw markdown source files about a person named Tanmay Gandhi.

Your job is to produce a single structured reference document by extracting and organising ONLY what is explicitly written in the source files.

Rules — follow these strictly:
1. EXTRACT ONLY. Do not add, infer, extrapolate, or invent ANY information not explicitly present in the source files.
2. Do NOT rephrase personal statements, opinions, or feelings — reproduce them verbatim or omit them entirely.
3. Do NOT fill gaps. If a topic has no content in the source files, omit that section entirely.
4. Do NOT create cross-references or draw connections between sections that are not stated in the source.
5. Deduplicate identical facts across files, but preserve all unique facts exactly as written.
6. Add a "Quick Reference" section at the top with ONLY facts explicitly stated in the source (name, role, skills, contact).
7. Keep SCHEMA.md rules as a separate "Behaviour Rules" section at the end — copy them verbatim.
8. Output ONLY the compiled markdown — no preamble, no explanation, no commentary.

Your output must be 100% traceable back to the source files. Every sentence must come directly from the source — no elaboration, no inference, no filling in what seems logical.

Source files to compile:
${rawContent}`;

    let response;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: compilerPrompt }],
      });
    } catch (err) {
      if (err.status === 429) {
        const retryAfter = parseInt(err.headers?.["retry-after"] ?? "30", 10);
        console.warn(`⏳ Rate limited — retrying compilation in ${retryAfter}s...`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: compilerPrompt }],
        });
      } else {
        throw err;
      }
    }

    const compiled = response.content[0].type === "text" ? response.content[0].text : "";

    const header = `# Tanmay Gandhi — Compiled Wiki\n_Last compiled: ${new Date().toISOString()}_\n_Source files: ${rawFiles.join(", ")}_\n\n---\n\n`;
    fs.writeFileSync(COMPILED_WIKI_PATH, header + compiled, "utf-8");

    lastCompiledHash = currentHash;
    compilationStatus = {
      state: "ready",
      lastCompiled: new Date().toISOString(),
      filesCompiled: rawFiles,
      error: null,
    };

    console.log(`✅ Wiki compiled from ${rawFiles.length} files → compiled_wiki.md`);
  } catch (err) {
    compilationStatus = { state: "error", error: err.message, filesCompiled: [], lastCompiled: null };
    console.error("❌ Wiki compilation failed:", err.message);
  }
}

// ─── File Watcher — triggers recompilation on wiki changes ───────────────────

let debounceTimer = null;

fs.watch(WIKI_DIR, (eventType, filename) => {
  if (!filename || !filename.endsWith(".md") || filename === "compiled_wiki.md") return;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`📝 Wiki change detected in ${filename} — recompiling...`);
    compileWiki();
  }, 5000); // debounce 5s — gives editors time to finish saving multiple files
});

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt() {
  if (!fs.existsSync(COMPILED_WIKI_PATH)) {
    return "The wiki is still being compiled. Ask the user to wait a moment and try again.";
  }
  const compiled = fs.readFileSync(COMPILED_WIKI_PATH, "utf-8");
  const today = new Date().toISOString().split("T")[0];
  return `You are an AI assistant representing Tanmay Gandhi. Speak in first person on his behalf.
Your knowledge comes EXCLUSIVELY from the compiled wiki below. Do NOT add, infer, or elaborate beyond what is written there.

CRITICAL RULES — these override everything else:
- Answer ONLY from what is explicitly stated in the wiki. Never invent or infer personal facts.
- SHORT questions (age, location, role, yes/no) get ONE sentence. No elaboration. No context. No follow-up thoughts.
- Never use markdown formatting (no bold, no bullets, no headers). Plain prose only.
- Today's date is ${today}. Use it to compute ages correctly if needed.

${compiled}`;
}

// ─── Lead Logger ──────────────────────────────────────────────────────────────

function extractAndLogLead(response, userMessage) {
  const leadMatch = response.match(/\[LEAD DETECTED\]([\s\S]*?)(?=\n\n|$)/i);
  if (!leadMatch) return;
  const lead = {
    timestamp: new Date().toISOString(),
    raw: leadMatch[1].trim(),
    userMessage,
  };
  fs.appendFileSync(LEADS_FILE, JSON.stringify(lead) + "\n");
  console.log("📋 Lead captured:", lead.raw.slice(0, 80));
}

// ─── Chat Endpoint — with prompt caching ─────────────────────────────────────

app.post("/tanmay-ai/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }
  if (compilationStatus.state === "compiling") {
    return res.status(503).json({ error: "Wiki is compiling. Please wait a moment." });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // cache_control marks the system prompt for Anthropic's prompt caching.
    // First request: full tokens charged. Subsequent requests within the cache TTL
    // (5 min, extendable): ~90% token reduction on the system prompt.
    // This is what makes the LLM Wiki pattern token-efficient at query time.
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: buildSystemPrompt(),
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        const text = chunk.delta.text;
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    extractAndLogLead(fullResponse, lastUserMessage);

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Claude API error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to get response" });
    }
  }
});

// ─── Status Endpoint ──────────────────────────────────────────────────────────

app.get("/tanmay-ai/status", (req, res) => {
  const rawFiles = fs.existsSync(WIKI_DIR)
    ? fs.readdirSync(WIKI_DIR).filter(f => f.endsWith(".md") && f !== "compiled_wiki.md")
    : [];
  res.json({
    compilation: compilationStatus,
    rawFiles,
    compiledExists: fs.existsSync(COMPILED_WIKI_PATH),
  });
});

// ─── Leads Endpoint ───────────────────────────────────────────────────────────

app.get("/tanmay-ai/leads", (req, res) => {
  if (!fs.existsSync(LEADS_FILE)) return res.json({ leads: [] });
  const lines = fs.readFileSync(LEADS_FILE, "utf-8").trim().split("\n").filter(Boolean);
  res.json({ leads: lines.map(l => JSON.parse(l)).reverse() });
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/tanmay-ai/health", (req, res) => {
  res.json({ status: "ok", compilationStatus });
});

// ─── Compile on startup then start server ─────────────────────────────────────

app.listen(PORT, async () => {
  console.log(`🚀 Tanmay AI server → http://localhost:${PORT}`);
  await compileWiki();
});
