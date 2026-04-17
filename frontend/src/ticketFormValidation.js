/**
 * Client-side validation helpers for ticket submission forms.
 * Backend still enforces rules; these catch mistakes early for better UX.
 */

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESC_MIN = 10;
const DESC_MAX = 2000;
const COMMENT_MAX = 2000;
const PHONE_MAX = 20;

/**
 * @returns {string|null} Error message or null if valid.
 */
export function validateTicketTitle(title) {
  const t = String(title ?? "").trim();
  if (t.length < TITLE_MIN) return `Title must be at least ${TITLE_MIN} characters.`;
  if (t.length > TITLE_MAX) return `Title must be at most ${TITLE_MAX} characters.`;
  return null;
}

/**
 * @returns {string|null}
 */
export function validateTicketDescription(description) {
  const d = String(description ?? "").trim();
  if (d.length < DESC_MIN) return `Description must be at least ${DESC_MIN} characters.`;
  if (d.length > DESC_MAX) return `Description must be at most ${DESC_MAX} characters.`;
  return null;
}

/**
 * Optional field: empty is OK.
 * @returns {string|null}
 */
export function validateOptionalPhone(phone) {
  const p = String(phone ?? "").trim();
  if (!p) return null;
  if (p.length > PHONE_MAX) return `Phone must be at most ${PHONE_MAX} characters.`;
  if (!/^[\d\s+\-()]+$/.test(p)) return "Phone may only contain digits, spaces, +, -, and parentheses.";
  return null;
}

/**
 * @returns {string|null}
 */
export function validateEmailRequired(email) {
  const e = String(email ?? "").trim();
  if (!e) return "Email is required.";
  if (e.length > 120) return "Email is too long.";
  // Simple RFC-style check sufficient for coursework UI
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Enter a valid email address.";
  return null;
}

/** Empty is OK; non-empty must look like an email. */
export function validateOptionalEmail(email) {
  const e = String(email ?? "").trim();
  if (!e) return null;
  if (e.length > 120) return "Email is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Enter a valid email address.";
  return null;
}

/**
 * @returns {string|null}
 */
export function validateOptionalLongText(text, label) {
  const s = String(text ?? "").trim();
  if (s.length > COMMENT_MAX) return `${label} must be at most ${COMMENT_MAX} characters.`;
  return null;
}

/**
 * @param {File[]} newFiles
 * @param {number} existingCount
 * @returns {{ error: string|null, accepted: File[] }}
 */
export function validateImageFiles(newFiles, existingCount) {
  const images = newFiles.filter((f) => f.type.startsWith("image/"));
  if (images.length === 0 && newFiles.length > 0) {
    return { error: "Only image files are allowed.", accepted: [] };
  }
  const room = 3 - existingCount;
  if (room <= 0) {
    return { error: "Maximum 3 images per ticket.", accepted: [] };
  }
  if (images.length > room) {
    return {
      error: `You can add at most ${room} more image(s) (3 total).`,
      accepted: images.slice(0, room),
    };
  }
  return { error: null, accepted: images };
}
