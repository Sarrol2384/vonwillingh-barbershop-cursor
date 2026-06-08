import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateBookingStatus } from "@/lib/bookings";
import type { BookingStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = (await request.json()) as { status?: BookingStatus };

  if (!status || !["confirmed", "cancelled", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const booking = await updateBookingStatus(id, status);
    revalidatePath("/");
    revalidatePath("/admin/bookings");
    return NextResponse.json(booking);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
