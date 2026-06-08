import { NextResponse } from "next/server";
import { getMemberByPhone } from "@/lib/members";
import { getMembershipStatus } from "@/lib/membership";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone?.trim()) {
    return NextResponse.json(
      { error: "Please enter your WhatsApp number." },
      { status: 400 },
    );
  }

  try {
    const member = await getMemberByPhone(phone);

    if (!member) {
      return NextResponse.json(
        { error: "No membership found for this number." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      memberNumber: member.memberNumber,
      clientName: member.clientName,
      lastPaymentDate: member.lastPaymentDate,
      expiresAt: member.expiresAt,
      status: getMembershipStatus(member.expiresAt),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to look up membership";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
