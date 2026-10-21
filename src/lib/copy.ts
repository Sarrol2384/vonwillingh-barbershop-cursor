import type { BarberProfile, Service } from "./types";
import { isHouseCallService } from "./service-duration";

const HOUSE_CALL_AREA_NOTE =
  "The area and travel fee are confirmed via WhatsApp.";
const HOUSE_CALL_NOTICE_NOTE = "At least 24 hours' notice is required.";

const OLD_EXPERIENCE_TAGLINE_PREFIX = /^10 years behind the chair\.\s*/i;
const OLD_BIO_DECADE_SENTENCE =
  /Kobus Von Willingh has spent a decade perfecting his craft behind the chair\.\s*/gi;
const OLD_BIO_SHORT_PREFIX = /^With 10 years of barbering experience,\s*/i;

const CHEESEKOP_DESCRIPTION = /^blade or razor shave\s*[-–—]?\s*no hot towel\.?$/i;
const TRIM_AND_SHAVE_DESCRIPTION =
  /^neat beard sculpting and razor[- ]edge detail\.?$/i;

export function tidyServiceDescription(
  name: string,
  description?: string,
): string {
  let text = (description ?? "").replace(/\s+/g, " ").trim();

  if (CHEESEKOP_DESCRIPTION.test(text)) {
    text = "Blade or razor shave. No hot towel.";
  }

  if (name === "Trim & Shave" && TRIM_AND_SHAVE_DESCRIPTION.test(text)) {
    text = "Neat beard sculpting and a razor-edge finish.";
  }

  if (isHouseCallService(name)) {
    text = ensureHouseCallNote(text);
  }

  return text;
}

function ensureHouseCallNote(description: string): string {
  const hasArea = /area and travel fee/i.test(description);
  const hasNotice = /24 hours/i.test(description);
  if (hasArea && hasNotice) return description;

  const extras = [
    hasArea ? "" : HOUSE_CALL_AREA_NOTE,
    hasNotice ? "" : HOUSE_CALL_NOTICE_NOTE,
  ].filter(Boolean);

  const base = description.replace(/\.+$/g, "").trim();
  return base ? `${base}. ${extras.join(" ")}` : extras.join(" ");
}

/**
 * The years of experience already appear beside the barber's title.
 * Drop the same claim from the subtitle, bio, and meta description when
 * they still use the original wording.
 */
export function dedupeExperienceCopy(barber: BarberProfile): BarberProfile {
  let tagline = barber.tagline.replace(OLD_EXPERIENCE_TAGLINE_PREFIX, "").trim();
  if (!tagline) tagline = "Precision cuts. Classic style.";

  const bio = barber.bio.replace(OLD_BIO_DECADE_SENTENCE, "").trim();

  let bioShort = barber.bioShort.replace(OLD_BIO_SHORT_PREFIX, "").trim();
  if (bioShort && bioShort[0] === bioShort[0].toLowerCase()) {
    bioShort = `${bioShort[0].toUpperCase()}${bioShort.slice(1)}`;
  }

  return {
    ...barber,
    tagline,
    bio: bio || barber.bio,
    bioShort: bioShort || barber.bioShort,
  };
}

export function tidyService(service: Service): Service {
  return {
    ...service,
    description: tidyServiceDescription(service.name, service.description),
  };
}
