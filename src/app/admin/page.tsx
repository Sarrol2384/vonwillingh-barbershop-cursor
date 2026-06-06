import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export default async function AdminPage() {
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-zinc-100">
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
