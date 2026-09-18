# גם וגם Engineering Contract

## Current engineering baseline

- Repository: `rotemkasahun-maker/gam-vegam`
- Branch: `main`
- Pre-Foundation-Replacement baseline: `7b962df0ba0301027f5645a36c28dbab35683fde`
- This SHA is the approved starting point for the current Foundation Replacement. It is historical baseline identity, not a requirement that future HEAD remain at this SHA.

## Product and V1 boundary

גם וגם is a Hebrew-first, RTL, responsive, mobile-first web product that helps parents of young children continue working, learning, earning, and developing professionally while staying close to their children. Functional V1 is one site, one unified feed, one connection model, browse-first discovery, explicit account gates for protected actions, lightweight initiatives and opportunities, and WhatsApp as a communication/action layer. V1 excludes native apps, full internal chat, heavy community management, payments, attendance, contracts, dedicated mentoring systems, ATS/application pipelines, a full Academy, complex AI dependency, and a notification center.

## Sources of truth

- Master Product Source: stable product truth.
- Product Foundation: stable product principles.
- PROJECT OPERATING RULES: process and ownership rules.
- PROJECT STATE: current coordination truth.
- Current approved implementation and handoff documents: task truth.
- `repository/main`: actual implementation truth.

Contradictions must be surfaced and evidenced; they must never be silently resolved.

## Context minimization

The Engineering Orchestrator may receive the broad authoritative bootstrap once. Subagents receive only the repository, this `AGENTS.md`, the current task or handoff, and task-relevant source material. The historical project archive is not loaded by default.

## Ownership

- Product Lead owns product decisions and PROJECT STATE.
- Engineering owns implementation within approved scope.
- Independent UX/Product QA owns independent acceptance.
- Builder/Engineering verification is not independent acceptance.
- `automation/` is the protected preservation boundary during Foundation Replacement and must remain unchanged.

Engineering execution is migrated to Codex; obsolete wording that makes a previous builder the permanent owner of `main` or publishing does not apply.

## Current lifecycle

Functional Assembly → Foundation Replacement → Builder/Engineering Verification → Release Identity Gate → targeted Phase-1 Public Verification → Foundation Lock → Phase 2

No Phase 2 implementation begins before Foundation Lock.

## Engineering discipline

Every change has explicit scope, expected behavior, and an acceptance check. Make the smallest sufficient change. Reuse existing behavior and do not perform opportunistic refactors, cleanup, redesign, unrelated UX/product changes, or dependency/framework migration without authority. Verify before handoff. Repeated real failures require root-cause analysis rather than stacked patches.

## Foundation contract

The approved target is:

`Boot → one initializer → one dispatcher → one state transition path → one navigate/history owner → one state envelope → one render owner → one pendingAction/Gate contract`

The contract requires stable entity IDs and context, URL route identity, session-state restoration, safe fallback behavior, render that does not mutate navigation, Back/Forward that restore rather than navigate, protected continuation that executes once and then clears, and no duplicate event ownership.

## Legacy removal obligations

Foundation Replacement removes obsolete mechanisms rather than wrapping or suppressing them:

- `page`/`basePage`/`oldPage` ownership layering
- duplicate `bind`/`bindFix` navigation ownership
- direct `S.r`/`page()`/hash navigation paths
- duplicate history/navigation listeners
- `gate`/`safeGate`/`gate2`/`openGate` alternatives
- listener suppression used as architecture
- competing draft/search state paths

These removals are obligations of the replacement; they must not be described as already complete until verified.

## Protected areas

- Leave `automation/` unchanged during Foundation Replacement.
- Preserve product content, seed data, visual language, and V1 scope unless a task explicitly authorizes a change.
- Do not add real authentication, a backend, or Meta WhatsApp implementation as part of Foundation Replacement.
- Do not commit `gam-vegam-master-product-source.docx`, `gam-vegam-product-foundation.docx`, or `gam-vegam-full.bundle`.

## Release and verification

Require: `Commit → Source SHA → Dist SHA → Publish → Public SHA` verification. Public-runtime behavior is acceptance evidence for browser flows. Engineering verification precedes independent UX/Product QA.

## Change and handoff

Every substantial implementation handoff records scope, changed files, commit, tests/checks, runtime evidence, known limitations, and unresolved questions. Scope must not be silently expanded.
