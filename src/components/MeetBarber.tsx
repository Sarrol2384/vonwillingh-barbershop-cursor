import Image from "next/image";
import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function MeetBarber({ settings }: Props) {
  const { barber } = settings;

  return (
    <section className="px-5 py-8">
      <div className="card mx-auto max-w-lg p-6">
        <h2 className="section-title">Meet Your Barber</h2>

        <div className="mt-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-barber-red to-gold opacity-80" />
            <Image
              src={barber.photo}
              alt={barber.name}
              width={120}
              height={120}
              className="relative rounded-full object-cover ring-4 ring-charcoal"
              priority
            />
          </div>

          <div className="mt-4 sm:mt-0">
            <h3 className="font-display text-2xl font-semibold text-cream">
              {barber.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-gold">
              {barber.title} · {barber.yearsExperience} years experience
            </p>
            <p className="mt-1 text-sm italic text-zinc-400">{barber.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              {barber.bio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
