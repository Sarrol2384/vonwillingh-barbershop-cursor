import { NextResponse } from "next/server";
import { getBookingsForDate } from "@/lib/bookings";
import { noticeWindowMs, parseServiceDuration } from "@/lib/service-duration";
import { getAvailableSlots } from "@/lib/slots";
import { getSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceName = searchParams.get("service");

  if (!date || !serviceName) {
    return NextResponse.json(
      { error: "date and service are required" },
      { status: 400 },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  try {
    const settings = await getSettings();
    const service = settings.services.find((item) => item.name === serviceName);
    if (!service) {
      return NextResponse.json({ error: "Unknown service." }, { status: 400 });
    }

    // Always use the menu duration. A client-supplied duration could shrink
    // a long service onto a short grid and overlap the next appointment.
    const duration = parseServiceDuration(service.duration);
    const existing = await getBookingsForDate(date);
    const result = getAvailableSlots(settings, date, duration, existing, {
      leadTimeMs: noticeWindowMs(service.name),
    });

    return NextResponse.json({
      date,
      service: serviceName,
      duration,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load slots";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
