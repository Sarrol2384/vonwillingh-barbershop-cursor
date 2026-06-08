"use client";

import { useState } from "react";
import { MembershipCard } from "@/components/MembershipCard";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/lib/types";
import type { MembershipStatus } from "@/lib/membership";

type Props = {
  settings: BusinessSettings;
};

type LookupResult = {
  memberNumber: string;
  clientName: string;
  lastPaymentDate: string;
  expiresAt: string;
  status: MembershipStatus;
  benefits: string[];
  benefitUsages: { benefitName: string; usedOn: string }[];
};

export function SubscriptionSection({ settings }: Props) {
  const { subscription } = settings;
  const [phone, setPhone] = useState("");
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  if (!subscription.enabled) return null;

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp,
    subscription.whatsappMessage,
  );

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookingUp(true);
    setLookupError("");
    setLookup(null);

    const res = await fetch(
      `/api/members/lookup?phone=${encodeURIComponent(phone.trim())}`,
    );
    const data = await res.json();
    setLookingUp(false);

    if (!res.ok) {
      setLookupError(data.error ?? "Could not find your membership.");
      return;
    }

    setLookup(data as LookupResult);
  }

  return (
    <section className="px-5 py-8" id="membership">
      <div className="card relative mx-auto max-w-lg overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            background:
              "linear-gradient(135deg, #c9a962 0%, transparent 50%, #c41e3a 100%)",
          }}
          aria-hidden
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Member Deal
          </p>
          <h2 className="section-title mt-1">{subscription.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{subscription.description}</p>

          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-4xl font-bold text-gold">
              {subscription.price}
            </span>
            <span className="mb-1.5 text-sm text-zinc-400">
              {subscription.period}
            </span>
          </div>

          <ul className="mt-5 space-y-2">
            {subscription.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-sm text-cream"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs text-gold">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6 w-full"
          >
            Subscribe on WhatsApp
          </a>

          <div className="mt-8 border-t border-zinc-700/80 pt-6">
            <h3 className="text-sm font-semibold text-cream">
              Already a member?
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Enter your WhatsApp number to view your membership card.
            </p>

            <form onSubmit={handleLookup} className="mt-4 space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 071 123 4567"
                className="w-full rounded-lg border border-zinc-600 bg-charcoal-light px-3 py-2 text-cream"
                required
              />
              {lookupError && (
                <p className="text-sm text-red-300">{lookupError}</p>
              )}
              <button
                type="submit"
                disabled={lookingUp}
                className="w-full rounded-lg border border-gold/50 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/10 disabled:opacity-50"
              >
                {lookingUp ? "Looking up…" : "View my membership card"}
              </button>
            </form>

            {lookup && (
              <div className="mt-5">
                <MembershipCard settings={settings} member={lookup} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
