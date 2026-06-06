import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export default async function AdminPage() {
  const settings = await getSettings();
  return <SettingsForm initialSettings={settings} />;
}
