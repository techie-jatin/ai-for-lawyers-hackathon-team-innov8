/**
 * Guest Session Isolation Manager for Bharat Legal Intelligence
 * Ensures every visitor browser possesses an isolated guest identity (#GST-XXXX)
 * for private legal research, isolated chat threads, and scoped chamber dossiers.
 */

const GUEST_ID_KEY = 'bharat_guest_id';
const GUEST_NOTICE_KEY = 'bharat_guest_notice_seen_v1';

/**
 * Generate a random 4-character uppercase alphanumeric block
 */
function randomBlock(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Generates an institutional format guest ID: GST-XXXX-XXXX
 */
export function generateGuestId(): string {
  return `GST-${randomBlock()}-${randomBlock()}`;
}

/**
 * Retrieve the active browser's Guest ID, generating a persistent one if not yet set.
 */
export function getGuestId(): string {
  try {
    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing && existing.startsWith('GST-')) {
      return existing;
    }
    const fresh = generateGuestId();
    localStorage.setItem(GUEST_ID_KEY, fresh);
    return fresh;
  } catch (err) {
    console.warn('LocalStorage unavailable for guest identity, using fallback:', err);
    return 'GST-LOCAL-SESSION';
  }
}

/**
 * Resets the guest identity to start a fresh, completely blank research session.
 * Removes the old thread history associated with the prior guest ID.
 */
export function resetGuestId(): string {
  try {
    const current = localStorage.getItem(GUEST_ID_KEY);
    if (current) {
      localStorage.removeItem(`bharat_chat_threads_${current}`);
    }
    const fresh = generateGuestId();
    localStorage.setItem(GUEST_ID_KEY, fresh);
    // Also reset notice so user gets the welcome modal with the new session
    localStorage.removeItem(GUEST_NOTICE_KEY);
    return fresh;
  } catch (err) {
    console.error('Error resetting guest session:', err);
    return generateGuestId();
  }
}

/**
 * Checks whether the user has dismissed the first-visit guest notice modal.
 */
export function hasSeenGuestNotice(): boolean {
  try {
    return localStorage.getItem(GUEST_NOTICE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks the first-visit guest notice modal as acknowledged.
 */
export function markGuestNoticeSeen(): void {
  try {
    localStorage.setItem(GUEST_NOTICE_KEY, 'true');
  } catch (err) {
    console.warn('Could not persist guest notice dismissal:', err);
  }
}
