import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// =========================
// ADD CATEGORY
// =========================

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const name = String(
      body.name || ""
    ).trim();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check duplicate
    const { data: existing, error: existingError } =
      await supabaseAdmin
        .from("categories")
        .select("id")
        .ilike("name", name)
        .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    // Find highest sort order
    const { data: lastCategory } =
      await supabaseAdmin
        .from("categories")
        .select("sort_order")
        .order("sort_order", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    const sortOrder =
      (lastCategory?.sort_order ?? 0) + 1;

    const { data, error } =
      await supabaseAdmin
        .from("categories")
        .insert({
          name,
          sort_order: sortOrder,
        })
        .select()
        .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      category: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// =========================
// DELETE CATEGORY
// =========================

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const id = String(
      body.id || ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        { error: "Category id is required" },
        { status: 400 }
      );
    }

    // Check whether any menu item uses this category
    const { data: items, error: itemError } =
      await supabaseAdmin
        .from("items")
        .select("id")
        .eq("category_id", id)
        .limit(1);

    if (itemError) {
      return NextResponse.json(
        { error: itemError.message },
        { status: 500 }
      );
    }

    if (items && items.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this category because menu items are using it. Delete or move those items first.",
        },
        { status: 400 }
      );
    }

    const { error } =
      await supabaseAdmin
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}