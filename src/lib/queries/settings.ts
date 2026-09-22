import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { SiteSettings } from "@/models";

export async function getSettings() {
  return unstable_cache(
    async () => {
      await connectDB();
      let settings = await SiteSettings.findOne({ key: "default" }).lean();
      if (!settings) {
        settings = (
          await SiteSettings.create({
            key: "default",
            email: "luccicreno873@yahoo.com",
            phone: "",
            socialHandle: "LUCCICRENO",
          })
        ).toObject();
      }
      return JSON.parse(JSON.stringify(settings));
    },
    ["site-settings"],
    { tags: ["settings", "cms"], revalidate: 60 },
  )();
}
