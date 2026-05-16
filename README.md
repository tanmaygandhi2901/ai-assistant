# Tanmay AI — Personal Assistant

A personal AI assistant built on Karpathy's LLM Wiki architecture.
The LLM reads a persistent, structured markdown wiki about Tanmay and answers on his behalf.

## Structure

```
tanmay-ai/
  /server       → Express backend (wiki loader + Claude API)
  /client       → Next.js frontend (chat UI)
  /wiki         → Markdown knowledge base (the brain)
  leads.jsonl   → Auto-captured lead log
```

## Quick Start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

Server runs on http://localhost:3001

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### 3. Open http://localhost:3000 and talk to yourself.

---

## Updating the Wiki

Edit any `.md` file in `/wiki` — the server hot-reloads automatically.
No restart needed. Add new files anytime — they get picked up on the next reload.

## Leads

Every time someone expresses hiring/collaboration intent, the bot logs it to `leads.jsonl`.
View via API: `GET http://localhost:3001/api/leads`

## Tech Stack

- **Backend:** Node.js + Express + Anthropic SDK (streaming)
- **Frontend:** Next.js 14 + Tailwind CSS
- **LLM:** Claude Sonnet (claude-sonnet-4-20250514)
- **Wiki:** Markdown files — no vector DB, no embeddings, compiled once at startup
