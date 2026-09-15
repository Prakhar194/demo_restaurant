import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// =========================
// UPDATE RESTAURANT SETTINGS
// =========================

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const address = String(
      body.address || ""
    ).trim();

    const phone = String(
      body.phone || ""
    ).trim();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Find existing settings
    const { data: existing, error: findError } =
      await supabaseAdmin
        .from("restaurant_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 500 }
      );
    }

    let data;
    let error;

    if (existing) {
      const result = await supabaseAdmin
        .from("restaurant_settings")
        .update({
          address,
          phone,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      const result = await supabaseAdmin
        .from("restaurant_settings")
        .insert({
          address,
          phone,
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}