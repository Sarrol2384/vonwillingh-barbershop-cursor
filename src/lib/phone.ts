export function normalizePhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0") && digits.length === 10) {
    digits = `27${digits.slice(1)}`;
  }

  return digits;
}
