import { getAdminMessages } from "@/app/admin/actions/messages";
import { MessagesAdminClient } from "@/components/admin/MessagesAdminClient";

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages({ archived: false });
  return <MessagesAdminClient messages={messages} />;
}
