import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { recordBenefitUsage } from "@/lib/members";
import { getSettings, normalizeSettings } from "@/lib/settings";
import type { RecordBenefitUsageInput } from "@/lib/types";

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
    const body = (await request.json()) as RecordBenefitUsageInput;
    const settings = normalizeSettings(await getSettings());
    const member = await recordBenefitUsage(
      id,
      body,
      settings.subscription.benefits,
    );

    revalidatePath("/");
    revalidatePath("/admin/members");

    return NextResponse.json(member);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record benefit usage";
    const status =
      message === "Member not found."
        ? 404
        : message.includes("already used") ||
            message.includes("expired") ||
            message.includes("Invalid")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
