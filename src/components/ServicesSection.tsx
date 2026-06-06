import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function ServicesSection({ settings }: Props) {
  return (
    <section className="px-5 py-8">
      <div className="card mx-auto max-w-lg p-6">
        <h2 className="section-title">Services & Prices</h2>

        <ul className="mt-5 divide-y divide-zinc-700/50">
          {settings.services.map((service) => (
            <li key={service.name} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-cream">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1 text-sm text-zinc-400">
                      {service.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">{service.duration}</p>
                </div>
                <span className="shrink-0 font-display text-lg font-semibold text-gold">
                  {service.price}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
