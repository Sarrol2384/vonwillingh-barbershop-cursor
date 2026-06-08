import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings, normalizeSettings } from "@/lib/settings";

export default async function AdminPage() {
  const settings = normalizeSettings(await getSettings());
  return <SettingsForm initialSettings={settings} />;
}
