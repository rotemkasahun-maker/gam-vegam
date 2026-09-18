---
name: gam-vegam-slice
description: Execute an approved gam-vegam Functional V1 engineering slice with scoped implementation, independent checks, and a consolidated handoff. Use for implementation slices and focused corrections; not for product discovery or unrelated maintenance.
---

# gam-vegam slice

Use this procedure after the current task defines scope and acceptance. `AGENTS.md` remains the engineering contract; product sources and the approved task remain authoritative for product decisions.

## Procedure

1. Inspect only the task-relevant code, current Git state, constraints, and acceptance checks. Record protected paths and any untracked context artifacts before writing.
2. Scope the smallest sufficient change. Use one `implementer` as the sole writer for overlapping production scope. Architecture analysis is on-demand: do not spawn it for a normal well-specified slice unless a genuine architecture ambiguity is identified.
3. After implementation, run independent `reviewer` and `verifier` work in parallel whenever their inputs are independent. Use Luna/low for routine scoped review and deterministic verification; escalate review to Terra only for architecture-sensitive or genuinely complex work. Consolidate the evidence.
4. Return actionable findings to the same implementer for one focused correction. Rerun only failed checks, affected acceptance checks, and affected regression boundaries. Escalate instead when a correction would require a product decision, architectural change, broader scope, protected-boundary change, or a repeated failure with no safe focused fix.
5. Use `browser_verifier` and the existing smoke harness when browser behavior is accepted. Verify changed behavior deeply and retain durable automated regression coverage; public browser evidence proves the deployed artifact and critical affected cross-slice boundaries rather than duplicating the full local suite manually.
6. Release only after implementation, review, and verification are green. When release is in scope, establish `Commit → Source SHA → Dist SHA → Publish → Public SHA` identity once for the final accepted build. Do not substitute local checks for required public evidence.
7. Commit only after required gates pass. Return one handoff: scope, files, commit and identity evidence, checks and runtime evidence, known limitations, deferrals, and decisions or blockers.

## Guardrails

- Keep context minimal: give workers this task, `AGENTS.md`, and only relevant sources or paths; do not load the historical archive by default.
- Never run concurrent writers on overlapping production scope. Read-only work may be parallel only where it has no dependency on another unfinished check.
- Preserve `automation/`, untracked context artifacts, and non-scope files. Do not change protected runtime or verification files merely to make a check pass.
- Treat a regression finding as a focused correction loop, not a product-owner relay. Do not dismiss required acceptance evidence to save time or model usage.
- Use the least costly configured role and reasoning effort that can reliably do the work: Terra/medium for normal implementation; Luna/low for routine review, deterministic checks, and browser smoke. Increase model or effort only for demonstrated architecture ambiguity, persistent state/debugging failures, or review complexity.
- Target a normal scoped slice to complete in approximately 10–15 minutes when no meaningful blocker occurs. If work exceeds about 20 minutes, identify the cause and avoid expanding the work with redundant verification or unrelated scope.
- Stop and escalate for source conflicts, product or security/privacy decisions, material scope expansion, Foundation-contract changes, protected-boundary risk, release-identity failure, or a correction that still fails after focused retry.
