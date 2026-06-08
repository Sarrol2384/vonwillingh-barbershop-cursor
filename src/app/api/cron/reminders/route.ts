import { NextResponse } from "next/server";
import {
  getBookingsNeedingReminder,
  markReminderSent,
} from "@/lib/bookings";
import { sendBookingReminder } from "@/lib/reminders";
import { isWhatsAppApiConfigured } from "@/lib/whatsapp-api";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await getBookingsNeedingReminder(24);
    const results: { id: string; sent: boolean }[] = [];

    for (const booking of bookings) {
      const sent = await sendBookingReminder(booking);
      if (sent) {
        await markReminderSent(booking.id);
      }
      results.push({ id: booking.id, sent });
    }

    return NextResponse.json({
      processed: results.length,
      whatsappEnabled: isWhatsAppApiConfigured(),
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reminder job failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
