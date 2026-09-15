

import { supabase } from "@/lib/supabase";
import MenuClient from "@/components/MenuClient";

export const revalidate = 0;

export default async function Home() {
  const [
    { data: categories },
    { data: items },
    { data: banners },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),

    supabase
      .from("items")
      .select("*, categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),

    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),

    supabase
      .from("restaurant_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <MenuClient
      categories={(categories ?? []) as any}
      items={(items ?? []) as any}
      banners={(banners ?? []) as any}
      settings={
        (settings ?? {
          address: "Rawata Mor Chowk, New Delhi - 110073",
          phone: "9625346361",
        }) as any
      }
    />
  );
}