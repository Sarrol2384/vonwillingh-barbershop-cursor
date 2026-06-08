import { BenefitUsageList } from "@/components/BenefitUsageList";
import {
  daysUntilExpiry,
  formatMembershipDate,
  getMembershipStatus,
  type MembershipStatus,
} from "@/lib/membership";
import type { BusinessSettings } from "@/lib/types";

type CardData = {
  memberNumber: string;
  clientName: string;
  lastPaymentDate: string;
  expiresAt: string;
  status: MembershipStatus;
  benefits?: string[];
  benefitUsages?: { benefitName: string; usedOn: string }[];
};

type Props = {
  settings: BusinessSettings;
  member: CardData;
};

export function MembershipCard({ settings, member }: Props) {
  const status = member.status ?? getMembershipStatus(member.expiresAt);
  const isActive = status === "active";
  const daysLeft = daysUntilExpiry(member.expiresAt);

  return (
    <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-gold/30 bg-charcoal-light p-5 shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          background:
            "linear-gradient(135deg, #c9a962 0%, transparent 45%, #c41e3a 100%)",
        }}
        aria-hidden
      />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {settings.businessName}
            </p>
            <p className="mt-1 text-sm text-zinc-400">Monthly Member</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
              isActive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {isActive ? "Active" : "Expired"}
          </span>
        </div>

        <div>
          <p className="font-display text-2xl font-bold text-cream">
            {member.clientName}
          </p>
          <p className="mt-1 font-mono text-sm text-gold">{member.memberNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-700/80 bg-charcoal/60 p-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Last payment
            </p>
            <p className="mt-1 text-cream">
              {formatMembershipDate(member.lastPaymentDate)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {isActive ? "Valid until" : "Expired on"}
            </p>
            <p className="mt-1 text-cream">
              {formatMembershipDate(member.expiresAt)}
            </p>
          </div>
        </div>

        {member.benefits && member.benefits.length > 0 && (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
              This month&apos;s benefits
            </p>
            <BenefitUsageList
              benefits={member.benefits}
              usages={member.benefitUsages ?? []}
            />
          </div>
        )}

        {isActive ? (
          <p className="text-sm text-zinc-400">
            {daysLeft === 0
              ? "Renews today — visit the shop to extend your membership."
              : daysLeft === 1
                ? "1 day left. Next payment due on renewal date."
                : `${daysLeft} days left on your membership.`}
          </p>
        ) : (
          <p className="text-sm text-zinc-400">
            Visit the shop and pay {settings.subscription.price} cash to renew.
          </p>
        )}
      </div>
    </div>
  );
}
