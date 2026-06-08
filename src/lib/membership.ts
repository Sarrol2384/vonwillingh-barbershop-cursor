import type { MemberBenefitUsage } from "./types";

export type MembershipStatus = "active" | "expired";

const BENEFIT_ALIASES: Record<string, string> = {
  "1 free beard trim": "Trim",
  "free beard trim": "Trim",
  "1 trim": "Trim",
  trim: "Trim",
};

export function normalizeBenefitName(name: string): string {
  const trimmed = name.trim();
  return BENEFIT_ALIASES[trimmed] ?? BENEFIT_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

export function benefitNamesMatch(a: string, b: string): boolean {
  return normalizeBenefitName(a) === normalizeBenefitName(b);
}

export function normalizeBenefitList(benefits: string[]): string[] {
  return benefits.map(normalizeBenefitName);
}

export function addOneMonth(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export function getMembershipStatus(expiresAt: string): MembershipStatus {
  const today = new Date().toISOString().slice(0, 10);
  return expiresAt >= today ? "active" : "expired";
}

export function formatMembershipDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isInMembershipPeriod(
  dateStr: string,
  lastPaymentDate: string,
  expiresAt: string,
): boolean {
  return dateStr >= lastPaymentDate && dateStr <= expiresAt;
}

export function getBenefitUsagesInPeriod(
  usages: MemberBenefitUsage[],
  lastPaymentDate: string,
  expiresAt: string,
): MemberBenefitUsage[] {
  return usages.filter((usage) =>
    isInMembershipPeriod(usage.usedOn, lastPaymentDate, expiresAt),
  );
}

export function getBenefitUsageForPeriod(
  usages: MemberBenefitUsage[],
  benefitName: string,
  lastPaymentDate: string,
  expiresAt: string,
): MemberBenefitUsage | undefined {
  return getBenefitUsagesInPeriod(usages, lastPaymentDate, expiresAt).find(
    (usage) => benefitNamesMatch(usage.benefitName, benefitName),
  );
}

export function daysUntilExpiry(expiresAt: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiresAt}T12:00:00`);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
