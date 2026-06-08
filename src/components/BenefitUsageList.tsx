import { benefitNamesMatch, formatMembershipDate } from "@/lib/membership";

type BenefitUsage = {
  benefitName: string;
  usedOn: string;
};

type Props = {
  benefits: string[];
  usages: BenefitUsage[];
  variant?: "dark" | "light";
};

export function BenefitUsageList({
  benefits,
  usages,
  variant = "dark",
}: Props) {
  const isDark = variant === "dark";

  return (
    <ul className="space-y-2">
      {benefits.map((benefit) => {
        const usage = usages.find((item) =>
          benefitNamesMatch(item.benefitName, benefit),
        );

        return (
          <li
            key={benefit}
            className={`rounded-lg border px-3 py-2 text-sm ${
              isDark
                ? "border-zinc-700/80 bg-charcoal/60"
                : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <p className={isDark ? "text-cream" : "text-zinc-900"}>{benefit}</p>
            <p className={`mt-0.5 text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {usage
                ? `Used on ${formatMembershipDate(usage.usedOn)}`
                : "Not used this month"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
