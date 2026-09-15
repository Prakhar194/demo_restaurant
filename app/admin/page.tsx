import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";
import { isAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

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
      .order("created_at", { ascending: false }),

    supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("restaurant_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <AdminClient
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