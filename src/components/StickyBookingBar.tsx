import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function StickyBookingBar({ settings }: Props) {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp,
    settings.whatsappMessage,
  );
  const phoneHref = `tel:${settings.phone.replace(/\s/g, "")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-700/50 bg-charcoal/95 p-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg gap-3">
        <a href="#book" className="btn-primary flex-1">
          Book online
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex-1"
        >
          WhatsApp
        </a>
        <a href={phoneHref} className="btn-secondary shrink-0 px-4">
          Call
        </a>
      </div>
    </div>
  );
}
