# גם וגם — Automation Phase 1

This directory defines the backend/automation boundary from the WhatsApp handoff.

## Pipeline

`event → validate → dedupe → relevance/expiry check → consent/eligibility → message decision → delivery log → signed webhook → idempotent state update`

## Non-negotiables

- Website/backend remains the source of truth.
- `AutomationEvent.dedupe_key` is unique; replays do not create a second action.
- Provider webhook receipts are keyed by `provider_event_id` and must pass signature validation.
- Every send is recorded in `MessageLog`, including failures and provider IDs.
- An expired or no-longer-relevant event is not sent late.
- This phase does not infer anything from private WhatsApp conversations.

The JSON files are implementation contracts. The JavaScript file is a small framework-neutral reference for the two idempotency boundaries; production persistence must replace the in-memory Sets with unique database constraints/transactions.
