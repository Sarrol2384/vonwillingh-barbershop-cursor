import { DEFAULT_SETTINGS } from "./default-settings";
import type { BusinessSettings } from "./types";

export function normalizeSettings(
  settings: Partial<BusinessSettings>,
): BusinessSettings {
  const { subscription, social, barber, ...rest } = settings;

  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    subscription: {
      ...DEFAULT_SETTINGS.subscription,
      ...(subscription ?? {}),
      benefits:
        subscription?.benefits ?? DEFAULT_SETTINGS.subscription.benefits,
    },
    social: { ...DEFAULT_SETTINGS.social, ...(social ?? {}) },
    barber: { ...DEFAULT_SETTINGS.barber, ...(barber ?? {}) },
  };
}
