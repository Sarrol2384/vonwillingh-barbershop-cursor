import { getDayLabel, getOrderedDays } from "./hours";
import { formatPhoneDisplay } from "./phone";
import { SITE_URL } from "./site";
import type { BusinessSettings } from "./types";

function splitAddress(address: string): {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
} {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      streetAddress: parts[0],
      addressLocality: parts[1],
      addressRegion: parts.slice(2).join(", "),
    };
  }

  return {
    streetAddress: "177 Magdouw Street",
    addressLocality: "Russel's Rest",
    addressRegion: "Eerste River",
  };
}

export function buildHairSalonJsonLd(settings: BusinessSettings) {
  const address = splitAddress(settings.address);

  return {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "LocalBusiness"],
    name: settings.businessName,
    description: settings.barber.bioShort,
    url: SITE_URL,
    telephone: formatPhoneDisplay(settings.phone),
    email: settings.email,
    image: `${SITE_URL}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      addressCountry: "ZA",
    },
    ...(settings.mapsUrl ? { hasMap: settings.mapsUrl } : {}),
    openingHoursSpecification: getOrderedDays().flatMap((day) => {
      const hours = settings.hours[day];
      if (!hours || hours.closed) return [];
      return [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${getDayLabel(day)}`,
          opens: hours.open,
          closes: hours.close,
        },
      ];
    }),
  };
}
