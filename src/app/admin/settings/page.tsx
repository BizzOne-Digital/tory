import { getSiteSettingsAdmin } from "@/app/admin/actions/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsAdmin();
  return <SettingsForm settings={settings} />;
}
