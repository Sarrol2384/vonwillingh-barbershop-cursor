import { NextResponse } from "next/server";
import { getBookingsForDate } from "@/lib/bookings";
import { getAvailableSlots } from "@/lib/slots";
import { parseServiceDuration } from "@/lib/service-duration";
import { getSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceName = searchParams.get("service");
  const durationParam = searchParams.get("duration");

  if (!date || !serviceName) {
    return NextResponse.json(
      { error: "date and service are required" },
      { status: 400 },
    );
  }

  try {
    const settings = await getSettings();
    const service = settings.services.find((s) => s.name === serviceName);
    const duration = durationParam
      ? Number.parseInt(durationParam, 10)
      : parseServiceDuration(service?.duration ?? "30 min");

    const existing = await getBookingsForDate(date);
    const result = getAvailableSlots(settings, date, duration, existing);

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
