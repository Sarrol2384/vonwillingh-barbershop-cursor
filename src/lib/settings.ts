import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { BusinessSettings } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "business.json");

export async function getSettings(): Promise<BusinessSettings> {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as BusinessSettings;
}

export async function updateSettings(
  settings: BusinessSettings,
): Promise<BusinessSettings> {
  await writeFile(DATA_PATH, JSON.stringify(settings, null, 2), "utf-8");
  return settings;
}
