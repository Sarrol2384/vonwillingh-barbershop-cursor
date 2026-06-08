import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { recordMemberPayment } from "@/lib/members";
import type { RecordPaymentInput } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as RecordPaymentInput;

    if (!body.paymentDate) {
      return NextResponse.json(
        { error: "Payment date is required." },
        { status: 400 },
      );
    }

    const member = await recordMemberPayment(id, body);

    revalidatePath("/");
    revalidatePath("/admin/members");

    return NextResponse.json(member);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record payment";
    const status = message === "Member not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
