# 00 — Start your own app

**Outcome:** the API is on port 3000 and your untouched new Next.js app is on port 3001. No feature code yet.

## Show me

```text
Terminal A: eqdesk                → :3000 → API docs + fixtures
Terminal B: cryptowire-practice   → :3001 → your starter page
```

## You type

In Terminal A:

```sh
cd /Users/alex/Funspace/eqdesk
bun run dev
```

If that server is already running on port 3000, keep it; do not start a second one. Open http://localhost:3000 and read the API docs.

In Terminal B, outside this repo:

```sh
cd /Users/alex/Funspace
bunx create-next-app@16.3.4 cryptowire-practice
```

Choose **customize settings** if prompted. Use TypeScript, ESLint, App Router, Bun, no Tailwind, no `src/` directory, no React Compiler, and the `@/*` import alias. Keep AGENTS.md. If a prompt differs, pause and show me rather than guessing a new setup.

Then:

```sh
cd /Users/alex/Funspace/cryptowire-practice
git switch -c codex/cryptowire-practice
bun run dev --port 3001
```

Check `next.config.ts`: leave `cacheComponents` absent (or false). Do not turn it on during these slices. Keep the generated configuration otherwise. The existing `/alex` reference uses it, but our first pass will not.

Read the new app's AGENTS.md. Its installed Next.js guides live at `node_modules/next/dist/docs/`; those are our version-matched reference when a framework detail feels unfamiliar.

## Check

- http://localhost:3000 shows API documentation.
- http://localhost:3000/api/prices shows a JSON array.
- http://localhost:3001 shows the Next.js starter page.
- Your new project's `package.json` uses Next.js 16.3.4.

**Talk it through:** which server will render the page, and which server supplies its data?

**Stop here.** Tell me both URLs work. Do not edit the homepage yet. The generated starter is intentional scaffolding, replaced in slice 01.
