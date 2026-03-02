/**
 * Phone number normalization utilities
 */

/**
 * Normalize phone number with country code
 */
export function normalizePhoneNumber(
  phone: string,
  defaultCountryCode: string = '+966'
): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // If starts with 00, replace with +
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  }

  // If doesn't start with +, add default country code
  if (!normalized.startsWith('+')) {
    // Remove leading zero if exists
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1);
    }
    normalized = defaultCountryCode + normalized;
  }

  return normalized;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Should start with + and have 10-15 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove + for formatting
  const digits = phone.replace(/\+/g, '');

  // Saudi format: +966 5X XXX XXXX
  if (phone.startsWith('+966') && digits.length === 12) {
    return `+966 ${digits.substring(3, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`;
  }

  // Generic format: +XXX XXX XXX XXXX
  if (digits.length >= 10) {
    const countryCode = digits.substring(0, digits.length - 9);
    const rest = digits.substring(digits.length - 9);
    return `+${countryCode} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
  }

  return phone;
}

/**
 * Extract country code from phone number
 */
export function extractCountryCode(phone: string): string | null {
  const match = phone.match(/^\+(\d{1,4})/);
  return match ? `+${match[1]}` : null;
}

/**
 * Batch normalize phone numbers from Excel import
 */
export function batchNormalizePhones(
  phones: string[],
  defaultCountryCode: string = '+966'
): { normalized: string[]; invalid: string[] } {
  const normalized: string[] = [];
  const invalid: string[] = [];

  for (const phone of phones) {
    try {
      const normalizedPhone = normalizePhoneNumber(phone, defaultCountryCode);
      if (isValidPhoneNumber(normalizedPhone)) {
        normalized.push(normalizedPhone);
      } else {
        invalid.push(phone);
      }
    } catch (error) {
      invalid.push(phone);
    }
  }

  return { normalized, invalid };
}

/**
 * Deduplicate phone numbers
 */
export function deduplicatePhones(phones: string[]): string[] {
  return Array.from(new Set(phones));
}
