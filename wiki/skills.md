# Skills — Tanmay Gandhi

> Ratings: **Expert** (can architect, debug, mentor, led prod systems) → **Strong** (shipped prod, comfortable ownership) → **Comfortable** (used in prod, know the edges) → **Familiar** (worked with it, not my go-to) → **Outdated** (was strong, not current)

---

## Languages

### JavaScript — Expert
- Working with it since Day 1 of my career (5.5+ years)
- The language I know deepest — from event loop internals to memory management to async patterns
- I've tracked the full ecosystem shift: Vanilla → React class components → React functional (manual `useCallback`/`useMemo` optimisation → React compiler) → Next.js SSR/RSC → modern backend runtimes
- Used across frontend, backend, blockchain, AI — if it runs JS, I've built something real with it
- Not just a user — I can reason about *why* JS behaves the way it does

### TypeScript — Strong
- 4 years of TypeScript across multiple frameworks and project types
- Recently led the v2 rebuild of AIRR (current company's flagship product) — TypeScript throughout: Next.js on frontend, Fastify + Node.js on backend
- Comfortable with generics, utility types, strict mode, discriminated unions — not just "TS as annotated JS"

---

## Frontend

### React.js — Expert
- Working with it since the beginning of my career
- Lived through the class component era, the hooks transition, and the current compiler optimisation era
- Know the internals well enough to debug re-render issues, optimise heavy trees, and make the right architecture calls
- Used in production apps at scale — not tutorial-level React

### Next.js — Expert
- Led full applications from concept to production using Next.js as the frontend layer
- Worked with microfrontends using Next.js when that was barely a concept — not a buzzword, an actual architecture decision I owned
- Deep on SSR, SSG, ISR, App Router, RSC — know the trade-offs, not just the syntax
- Used across multiple companies and product types

---

## Backend

### Node.js — Expert
- Core backend runtime since the start of my career
- Built production systems with it across EdTech, blockchain, and AI domains
- Used with LLMs (building AI-powered APIs), blockchain (Web3 integrations), and enterprise client integrations
- Deep enough to implement distributed systems patterns like distributed locking, job queues, and rate limiting from scratch

### Express.js — Expert
- My original backend framework — know it well enough to build custom middleware, debug edge cases, and optimise for production
- Used across multiple product tenures

### Fastify — Expert
- Used as the backend runtime for AIRR v2 (current company's product rebuild)
- Chose it for performance; understand how it differs from Express at the plugin/lifecycle level
- Combined with TypeScript and MongoDB in a production system

### NestJS — Strong
- Used in projects requiring more structured, opinionated backend architecture
- Comfortable with modules, guards, interceptors, dependency injection patterns

---

## Databases

### MongoDB — Strong
- Used in my first year and then again heavily for the past 1.5 years on AIRR v2
- Not surface-level MongoDB: implemented **sharding, aggregation pipelines, compound indexes, Atlas Search indexes, and replication**
- Understand the performance trade-offs between different schema designs at scale
- Used Compass and Atlas for management and monitoring

### PostgreSQL — Comfortable
- Used as part of a **hybrid database architecture** when building a blockchain-backed job portal at Examroom.ai
- Know relational modelling, joins, transactions, and how it complements a NoSQL layer
- One of the DBs I respect most — strong opinions about when to use it vs MongoDB

### Redis — Comfortable
- Used on AIRR v2 for **distributed locking and caching layer**
- Implemented cache invalidation strategies and pub/sub patterns
- Not a Redis power user but I've used it correctly in production

### ElasticSearch — Strong
- Core search and fast-retrieval layer for AIRR v1
- Know data types, index mappings, analyzers, query DSL, and aggregations
- Used Kibana for monitoring and visualisation
- Understand the operational side — when ES is the right tool and when it's overkill

---

## Cloud & Infrastructure

### AWS — Strong (3 years daily use)
- **S3:** File storage, presigned URLs, bucket policies, lifecycle rules
- **EC2:** Instance management, security groups, deployment pipelines
- **Lambda:** Serverless functions for event-driven workloads, integrations, scheduled jobs
- **EventBridge:** Event-driven architecture — routing events between services, scheduling
- **CloudWatch:** Monitoring, log groups, metric alarms, dashboards
- Honest assessment: I use these daily and I'm solid, but AWS has more depth than I've explored. Always feel there's more to learn — and I mean that as motivation, not an excuse.

---

## AI / LLM

### LLMs, AI Agents, RAG — Growing Fast (1+ year)
- Started working with LLMs about a year ago — building integrations, agent workflows, and RAG pipelines
- The pace of this space is brutal — it moves faster than any other area I've worked in
- Currently building: personal AI assistant using Karpathy's LLM Wiki architecture (this project) — using it to go deeper on persistent knowledge systems vs naive RAG
- Honest take: I'm not claiming expert here yet, but I'm actively building, not just reading about it
- Stack I'm working with: Claude/Gemini APIs, Node.js backends, LangChain patterns, vector concepts
- Growing into this deliberately — it's where I want to compound my skills over the next 2 years

---

## Blockchain

### Blockchain / Web3 — Outdated (last active: 2022–2023)
- Built a **blockchain-backed job portal** at Examroom.ai — used an internal token economy to power job postings, ads, and promotions on the platform
- Web3.js integrations, wallet interactions, token-gated features
- PostgreSQL as the off-chain database layer; blockchain for token ledger
- Not current — the space moved fast and my focus shifted to AI. Can discuss the concepts and architecture, but wouldn't claim production-ready blockchain skills today

---

## Client Integration (Cross-Skill)

This deserves its own section because it's not a technology — it's a capability.

I've been the **technical lead and client-facing owner** for integrations with:
- **Salesforce** — data sync, API integrations, event-driven workflows
- **Ellucian Banner, Recruit, Colleague** — EdTech ERP integrations
- **Anthology** — student information system integrations
- Multiple other enterprise systems

This involves reading poorly documented APIs, navigating client IT teams, writing integration specs, debugging at 11pm before a go-live, and communicating complex technical constraints to non-technical stakeholders. Most developers avoid this work. I've made it a differentiator.

See `client_integrations.md` for full details.

---

## What I Can Teach vs What I've Used

| Skill | Can Architect | Can Debug Prod Issues | Can Mentor Others | Currently Active |
|---|---|---|---|---|
| JavaScript | ✅ | ✅ | ✅ | ✅ |
| React / Next.js | ✅ | ✅ | ✅ | ✅ |
| Node.js / Express / Fastify | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| MongoDB | ✅ | ✅ | ⚠️ basics | ✅ |
| ElasticSearch | ✅ | ✅ | ⚠️ basics | ⚠️ recent gap |
| PostgreSQL | ⚠️ | ✅ | ⚠️ basics | ⚠️ recent gap |
| Redis | ⚠️ | ✅ | ❌ | ⚠️ recent gap |
| AWS | ⚠️ | ✅ | ⚠️ basics | ✅ |
| LLMs / AI Agents | ⚠️ growing | ⚠️ growing | ❌ not yet | ✅ active |
| Blockchain / Web3 | ❌ outdated | ❌ outdated | ❌ | ❌ |

---

*Last updated: May 2026*
