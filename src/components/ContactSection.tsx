import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;

  const content = (
    <span className="text-sm text-cream hover:text-gold transition-colors">
      {value}
    </span>
  );

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {href ? (
        <a href={href} className="text-sm text-cream hover:text-gold transition-colors">
          {value}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export function ContactSection({ settings }: Props) {
  return (
    <section className="px-5 py-8">
      <div className="card mx-auto max-w-lg p-6">
        <h2 className="section-title">Find Us</h2>

        <div className="mt-5 space-y-4">
          <ContactRow label="Address" value={settings.address} />
          {settings.mapsUrl && (
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light transition-colors"
            >
              Get directions →
            </a>
          )}

          <hr className="border-zinc-700/50" />

          <ContactRow
            label="Phone"
            value={settings.phone}
            href={`tel:${settings.phone.replace(/\s/g, "")}`}
          />
          <ContactRow
            label="Email"
            value={settings.email}
            href={`mailto:${settings.email}`}
          />

          {(settings.social.instagram || settings.social.facebook) && (
            <>
              <hr className="border-zinc-700/50" />
              <div className="flex gap-4">
                {settings.social.instagram && (
                  <a
                    href={settings.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-gold transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {settings.social.facebook && (
                  <a
                    href={settings.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-gold transition-colors"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
