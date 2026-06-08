import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createMember, getMembers } from "@/lib/members";
import type { CreateMemberInput } from "@/lib/types";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await getMembers(true);
    return NextResponse.json(members);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load members";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateMemberInput;

    if (
      !body.clientName?.trim() ||
      !body.clientPhone?.trim() ||
      !body.paymentDate
    ) {
      return NextResponse.json(
        { error: "Name, phone, and payment date are required." },
        { status: 400 },
      );
    }

    const member = await createMember(body);

    revalidatePath("/");
    revalidatePath("/admin/members");

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create member";
    const status = message.includes("already has a membership") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
