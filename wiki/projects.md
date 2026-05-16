# Projects — Tanmay Gandhi

> These are the projects I've built, led, or brought to life. Not a list of things I "contributed to" — these are things I owned.

---

## AIRR (v1 + v2) — OneOrigin
**Role:** Tech Lead, Client Integration Lead, Core Backend Engineer
**Status:** Production — actively maintained
**Stack:** Next.js, Fastify, Node.js, TypeScript, MongoDB, Redis, AWS (Lambda, S3, EventBridge, CloudWatch), Cognito, Secrets Manager, ElasticSearch (v1)

### What It Is
AIRR is a transcript processing platform built for higher education institutions. It's not a generic data extractor — the product builds client-specific custom logic that helps admissions teams make faster, more accurate decisions. Data flows in from multiple source systems, gets processed and evaluated against institution-specific rules, and flows back out to their downstream systems.

### What I Built and Led

**Scale**
- 50+ live clients onboarded
- ~7,500 transcripts processed per day
- Led a team of 7 engineers on client implementations

**LLM-powered custom section extraction (v2)**
Transcripts contain non-standard sections that vary by state and institution. I built an extraction layer using LLM calls on top of OCR output to identify and extract these sections accurately — sections that generic parsers miss entirely. Result: reduced manual data entry time by 5 minutes per file. At scale across thousands of transcripts, that compounds fast.

**Client Integration Wing — Led end to end**
I was the technical face of client implementations. My team owned everything required to fully onboard a client:
- Accepting files + metadata from their existing systems (various formats, various protocols)
- Converting their textual, business-logic descriptions into executable custom decision rules
- Sending processed data back to their integration systems

The hard part: integration systems were sometimes well-documented with sandboxes, sometimes completely unknown with no API docs and no test environment. I've spent weeks researching undocumented APIs, reverse-engineering behaviour from production responses, and still delivered. I led this wing from the ground up — it wasn't a role I was handed, it was one I built.

**Orchestration Service (No-code/Low-code Logic Builder)**
This is the project I'm most proud of at OneOrigin. I had the vision for this in my first week on the job.

The problem: every new client needed custom decision logic built by engineers, which created a bottleneck. My solution: a visual, drag-and-drop orchestration service where client-specific logic could be composed using pre-built actions — without writing code for each one.

- Pick-and-drop visual interface for logic composition
- Modular action system — new action types can be added without changing the core
- Reduced time-to-onboard for new clients significantly
- Stack: Fastify, MongoDB, TypeScript
- Still running in production, handling live client workflows

**Modular Auth Service**
Built a 3-token authentication service now used across 4 separate products at OneOrigin.
- Stack: AWS Cognito + AWS Secrets Manager + Fastify + TypeScript
- Designed for reuse from day one — not patched to work across products, architected for it
- Handles access tokens, refresh tokens, and a third context-specific token layer

**Notable integration systems handled:** Salesforce, Ellucian Colleague, and others — some with full documentation, some with none.

---

## BlockPort — Examroom.ai
**Role:** Lead Developer — I gave this product its life
**Status:** Built 2022–2023, not currently maintained
**Stack:** Next.js (Microfrontend architecture), Express/Node.js, MongoDB, PostgreSQL, Solidity, Crypto.js

### What It Is
A blockchain-backed job portal with an in-house crypto token economy. Companies and recruiters used the internal token to sponsor job listings, run ads, and boost visibility on the platform. The token created a self-sustaining marketplace loop rather than a traditional subscription model.

### What I'm Proud Of

**Microfrontend architecture — before there was a playbook**
I implemented this using Microfrontends when the concept was still new (2022–2023). There was barely any documentation — no established patterns, no community tutorials to follow. I had to research scattered sources, talk to people who had experimented with it, and piece together an implementation that worked in production. That's the version I shipped.

**Hybrid database design**
Used MongoDB for flexible job/user data and PostgreSQL specifically for the financial ledger layer — token transactions, balances, transfer history. Keeping these concerns separate was a deliberate architectural call.

**Token economy design + implementation**
Beyond the technical build, I was involved in designing how the token interacted with platform mechanics — what actions cost tokens, how tokens were earned, how the supply was managed. Solidity smart contracts + Node.js integration layer.

**Started from zero**
This wasn't an inherited codebase. This was a thought. I turned it into a working, deployed product.

---

## Context Search — Personal Project
**Role:** Solo builder
**Status:** Live on Chrome Web Store
**Link:** [Context Search on Chrome Web Store](https://chromewebstore.google.com/detail/medpikanoaedpjdkcopaehpmdjnoadij)
**Stack:** Chrome Extension APIs, LLM APIs

### What It Is
A Chrome extension that returns the **contextual meaning** of selected text — not just the dictionary definition, but what the word or phrase means *in the context it appears in*. Select any text on any page, get a meaning that's relevant to the surrounding content.

### Why I Built It
I was personally frustrated with this problem. Standard dictionary lookups give you the word in isolation. When you're reading a technical article, a legal document, or an unfamiliar domain — the generic definition is useless. You need contextual understanding. I built the tool I wanted to exist.

### Why This Matters (Beyond the Feature)
This is my only fully independent, public-facing product. I identified a real problem I had, built a solution, and shipped it to the Chrome Web Store. The fact that it's live and people can install it right now means more to me than most of the production work I've done for employers — because I own it entirely.

---

## What's Coming

**Tanmay AI — Personal AI Assistant** *(currently building)*
A personal AI assistant built on Karpathy's LLM Wiki architecture. The system maintains a persistent, structured knowledge base about me — my skills, projects, experience, opinions — instead of running naive RAG on every query. Deployed as a web chat interface. This project exists both as a personal branding tool and as a hands-on way to go deep on LLM system design.

Stack: Node.js, Claude/Gemini APIs, Markdown wiki, React frontend

---

## Across All Projects — Patterns Worth Noting

- I don't just build features. I've architected systems (auth service, orchestration tool) that outlive the project they were born in.
- I'm often the first person in the room when something doesn't exist yet — BlockPort was a thought, the integration wing at OneOrigin was a gap I filled, the orchestration tool was my own vision.
- I work well in low-documentation, high-uncertainty environments. Unknown APIs, undocumented systems, no sandbox — I've shipped anyway.
- Client trust is not accidental. It's built through technical accuracy, honest communication, and consistently delivering.

---

*Last updated: May 2026*
