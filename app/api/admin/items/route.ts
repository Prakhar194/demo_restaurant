import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("items").insert({
    name: body.name, category_id: body.category_id, description: body.description || null,
    half_price: body.half_price === "" ? null : body.half_price,
    full_price: body.full_price === "" ? null : body.full_price,
    image_url: body.image_url || null, is_active: body.is_active ?? true
  }).select("*, categories(name)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  const { data, error } = await supabaseAdmin.from("items").update({
    ...updates, updated_at: new Date().toISOString()
  }).eq("id", id).select("*, categories(name)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
