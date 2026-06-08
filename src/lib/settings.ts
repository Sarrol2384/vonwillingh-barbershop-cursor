import { unstable_noStore as noStore } from "next/cache";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { DEFAULT_SETTINGS } from "./default-settings";
import { normalizeSettings } from "./normalize-settings";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import type { BusinessSettings } from "./types";

export { normalizeSettings } from "./normalize-settings";

const DATA_PATH = path.join(process.cwd(), "data", "business.json");
const SETTINGS_ROW_ID = 1;

async function getSettingsFromFile(): Promise<BusinessSettings> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return normalizeSettings(JSON.parse(raw) as Partial<BusinessSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function updateSettingsFile(
  settings: BusinessSettings,
): Promise<BusinessSettings> {
  await writeFile(DATA_PATH, JSON.stringify(settings, null, 2), "utf-8");
  return settings;
}

async function getSettingsFromSupabase(): Promise<BusinessSettings> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("business_settings")
    .select("settings")
    .eq("id", SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }

  if (!data?.settings) {
    const { error: insertError } = await supabase
      .from("business_settings")
      .insert({ id: SETTINGS_ROW_ID, settings: DEFAULT_SETTINGS });

    if (insertError) {
      throw new Error(`Failed to seed settings: ${insertError.message}`);
    }

    return DEFAULT_SETTINGS;
  }

  return normalizeSettings(data.settings as Partial<BusinessSettings>);
}

async function updateSettingsInSupabase(
  settings: BusinessSettings,
): Promise<BusinessSettings> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("business_settings").upsert({
    id: SETTINGS_ROW_ID,
    settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to save settings: ${error.message}`);
  }

  return settings;
}

export async function getSettings(): Promise<BusinessSettings> {
  noStore();
  if (isSupabaseConfigured()) {
    return getSettingsFromSupabase();
  }

  return getSettingsFromFile();
}

export async function updateSettings(
  settings: BusinessSettings,
): Promise<BusinessSettings> {
  if (isSupabaseConfigured()) {
    return updateSettingsInSupabase(settings);
  }

  return updateSettingsFile(settings);
}
