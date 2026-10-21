import { dedupeExperienceCopy, tidyService } from "./copy";
import { DEFAULT_SETTINGS } from "./default-settings";
import { normalizeBenefitList } from "./membership";
import { formatPhoneDisplay } from "./phone";
import type { BusinessSettings } from "./types";

export function normalizeSettings(
  settings: Partial<BusinessSettings>,
): BusinessSettings {
  const { subscription, social, barber, services, phone, ...rest } = settings;

  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    phone: formatPhoneDisplay(phone ?? DEFAULT_SETTINGS.phone),
    services: (services ?? DEFAULT_SETTINGS.services).map(tidyService),
    subscription: {
      ...DEFAULT_SETTINGS.subscription,
      ...(subscription ?? {}),
      benefits: normalizeBenefitList(
        subscription?.benefits ?? DEFAULT_SETTINGS.subscription.benefits,
      ),
    },
    social: { ...DEFAULT_SETTINGS.social, ...(social ?? {}) },
    barber: dedupeExperienceCopy({
      ...DEFAULT_SETTINGS.barber,
      ...(barber ?? {}),
    }),
  };
}
