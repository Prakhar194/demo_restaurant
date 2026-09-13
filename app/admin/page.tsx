import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminClient from "@/components/AdminClient";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!await isAdmin()) redirect("/admin/login");
  const [{ data: categories }, { data: items }, { data: banners }] = await Promise.all([
    supabaseAdmin.from("categories").select("*").order("sort_order"),
    supabaseAdmin.from("items").select("*, categories(name)").order("created_at"),
    supabaseAdmin.from("banners").select("*").order("created_at", { ascending: false })
  ]);
  return <AdminClient categories={(categories ?? []) as any} items={(items ?? []) as any} banners={(banners ?? []) as any}/>;
}
