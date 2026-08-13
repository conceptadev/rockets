---
globs: "**/*.ts"
description: TypeScript strict rules enforced across the entire codebase
---

# TypeScript Strict Rules

- Do not introduce `any` except when a documented upstream contract requires
  it. Keep that compatibility exception local, explain it in an adjacent
  comment, and scope any lint suppression to the exact line.
  - Use proper types, interfaces, or generics for repository-owned contracts.
  - If a type is unknown, use `unknown` and narrow it.
  - If a type is complex, define an interface.
- **NEVER use `[unknown type]`** placeholders. Every type must resolve to a concrete interface or generic.
- Prefer `interface` over `type` for object shapes.
- Use `readonly` for injected dependencies and immutable data.
- **No undocumented type workarounds.** Fix real mismatches. A production
  assertion is allowed only for a compatibility, phantom-type, or variance
  boundary TypeScript cannot express when runtime identity makes the cast safe;
  document that invariant next to the assertion. Tests and fixtures may assert
  controlled mock shapes, but never to bypass the behavior under test.
