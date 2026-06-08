import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createBooking, getBookings } from "@/lib/bookings";
import { sendBookingConfirmation } from "@/lib/reminders";
import { parseServiceDuration } from "@/lib/service-duration";
import { getAvailableSlots } from "@/lib/slots";
import { getSettings } from "@/lib/settings";
import type { CreateBookingInput } from "@/lib/types";

export async function GET(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  try {
    const bookings = await getBookings(from, to);
    return NextResponse.json(bookings);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load bookings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBookingInput;

    if (
      !body.clientName?.trim() ||
      !body.clientPhone?.trim() ||
      !body.serviceName ||
      !body.bookingDate ||
      !body.bookingTime
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const settings = await getSettings();
    const service = settings.services.find((s) => s.name === body.serviceName);
    if (!service) {
      return NextResponse.json({ error: "Invalid service." }, { status: 400 });
    }

    const serviceDuration =
      body.serviceDuration ?? parseServiceDuration(service.duration);

    const existing = await getBookings(body.bookingDate, body.bookingDate);
    const { slots, closed } = getAvailableSlots(
      settings,
      body.bookingDate,
      serviceDuration,
      existing,
    );

    if (closed) {
      return NextResponse.json(
        { error: "The shop is closed on that day." },
        { status: 400 },
      );
    }

    if (!slots.includes(body.bookingTime)) {
      return NextResponse.json(
        { error: "That time slot is no longer available." },
        { status: 409 },
      );
    }

    const booking = await createBooking({
      ...body,
      serviceDuration,
    });

    try {
      await sendBookingConfirmation(booking);
    } catch {
      // Booking still succeeds if WhatsApp confirmation fails
    }

    revalidatePath("/");
    revalidatePath("/admin/bookings");

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
