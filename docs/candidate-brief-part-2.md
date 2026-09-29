# CryptoWire: practical exercise, part 2

You're extending the site you built in part 1. This time, use whatever AI assistant you normally work with. As before, we care most about your process: talk us through what you're doing and why, and ask anything.

## What to build

CryptoWire wants a metered registration wall.

- Unregistered visitors can read **3 full articles**.
- While they still have free articles left, a small meter below the hero image reads "N/3 free articles, register or login for unlimited views".
- From the 4th article on, they see the headline, the hero image and a "Register or login to read unlimited articles" banner, with no body.
- Registration and login are the same fake one-click action: no form, no input, just mark the visitor as logged in.
- Logged-in visitors see full articles with no meter. The header swaps [Register] [Login] for [Logout].

The homepage doesn't change. Only the header and the article page do.

```text
A. Anonymous, free articles left             B. Anonymous, no free articles left
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│ CRYPTOWIRE          [Register][Login]│     │ CRYPTOWIRE          [Register][Login]│
├──────────────────────────┬───────────┤     ├──────────────────────────┬───────────┤
│ ← Back to latest         │ PRICES    │     │ ← Back to latest         │ PRICES    │
│ title                    │ (same)    │     │ title                    │ (same)    │
│ category · date          │           │     │ category · date          │           │
│ ┌──────────────────────┐ │           │     │ ┌──────────────────────┐ │           │
│ │ hero image           │ │           │     │ │ hero image           │ │           │
│ └──────────────────────┘ │           │     │ └──────────────────────┘ │           │
│ ┌──────────────────────┐ │           │     │ ┌──────────────────────┐ │           │
│ │ 2/3 free articles,   │ │           │     │ │ Register or login to │ │           │
│ │ register or login    │ │           │     │ │ read unlimited       │ │           │
│ │ for unlimited views  │ │           │     │ │ articles             │ │           │
│ └──────────────────────┘ │           │     │ └──────────────────────┘ │           │
│ body                     │           │     │ (no body)                │           │
└──────────────────────────┴───────────┘     └──────────────────────────┴───────────┘

C. Logged in
┌──────────────────────────────────────┐
│ CRYPTOWIRE                   [Logout]│
├──────────────────────────┬───────────┤
│ ← Back to latest         │ PRICES    │
│ title                    │ (same)    │
│ category · date          │           │
│ ┌──────────────────────┐ │           │
│ │ hero image           │ │           │
│ └──────────────────────┘ │           │
│ body                     │           │
└──────────────────────────┴───────────┘
```

## Setup

- Keep working in your part 1 project.
- Use your own AI assistant: chat, editor plugin or agent, whatever you normally use.
- The API is the same as in part 1.
