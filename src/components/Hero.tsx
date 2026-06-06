import { OpenClosedBadge } from "./OpenClosedBadge";
import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function Hero({ settings }: Props) {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-12 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a962' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-lg">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Est. Professional Grooming
        </p>

        <h1 className="font-display text-4xl font-bold leading-tight text-cream sm:text-5xl">
          {settings.businessName}
        </h1>

        <p className="mt-3 text-lg text-zinc-400">{settings.tagline}</p>

        <div className="mt-6 flex justify-center">
          <OpenClosedBadge settings={settings} />
        </div>
      </div>
    </section>
  );
}
