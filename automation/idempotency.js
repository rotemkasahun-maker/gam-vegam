/** Phase 1 reference implementation. Backend-only: WhatsApp is never the source of truth. */
export function acceptEvent(event, seenDedupeKeys) {
  if (!event?.event_id || !event?.dedupe_key) return { accepted: false, reason: 'invalid_event' };
  if (seenDedupeKeys.has(event.dedupe_key)) return { accepted: false, reason: 'duplicate' };
  if (event.expires_at && Date.parse(event.expires_at) <= Date.now()) {
    return { accepted: false, reason: 'expired' };
  }
  seenDedupeKeys.add(event.dedupe_key);
  return { accepted: true, reason: 'accepted' };
}

export function handleWebhook(receipt, processedProviderEvents) {
  if (!receipt?.provider_event_id) return { applied: false, reason: 'invalid_webhook' };
  if (processedProviderEvents.has(receipt.provider_event_id)) {
    return { applied: false, reason: 'duplicate_webhook' };
  }
  if (receipt.signature_valid !== true) return { applied: false, reason: 'invalid_signature' };
  processedProviderEvents.add(receipt.provider_event_id);
  return { applied: true, reason: 'accepted' };
}
