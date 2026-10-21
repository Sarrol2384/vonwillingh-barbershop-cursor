import { normalizeBenefitName } from "./membership";

export type MembershipBenefitCopy = {
  title: string;
  detail: string;
};

/**
 * Public wording for membership benefits.
 *
 * TODO: Confirm with Kobus what each benefit actually includes before
 * replacing the placeholders below. Do not invent the service name,
 * how often it can be used, or any price cap.
 * - "Trim": which service counts (beard, hair, or either), and any limits.
 * - "1 refresh fade": what counts as a refresh fade, and any length limits.
 */
export function membershipBenefitCopy(benefit: string): MembershipBenefitCopy {
  const key = normalizeBenefitName(benefit).toLowerCase();

  if (key === "trim") {
    return {
      title: "Monthly trim",
      detail:
        "One trim is included each month. [To confirm: which service counts as a trim, and any limits.]",
    };
  }

  if (key === "1 refresh fade") {
    return {
      title: "1 refresh fade",
      detail:
        "One refresh fade is included each month. [To confirm: what counts as a refresh fade, and any limits.]",
    };
  }

  return {
    title: benefit,
    detail: "Included with the monthly membership. [To confirm: exact terms.]",
  };
}
