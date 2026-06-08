import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function SubscriptionSection({ settings }: Props) {
  const { subscription } = settings;
  if (!subscription.enabled) return null;

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp,
    subscription.whatsappMessage,
  );

  return (
    <section className="px-5 py-8">
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
        </div>
      </div>
    </section>
  );
}
