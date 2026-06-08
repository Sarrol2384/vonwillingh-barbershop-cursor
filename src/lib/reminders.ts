import { formatTime12h } from "./slots";
import type { Booking } from "./types";
import { isWhatsAppApiConfigured, sendWhatsAppTemplate } from "./whatsapp-api";

function formatBookingDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function reminderBodyParams(booking: Booking) {
  return [
    booking.clientName,
    formatBookingDate(booking.bookingDate),
    formatTime12h(booking.bookingTime),
    booking.serviceName,
  ];
}

async function sendWhatsAppBookingMessage(
  booking: Booking,
  templateName?: string,
): Promise<boolean> {
  if (!isWhatsAppApiConfigured()) return false;

  await sendWhatsAppTemplate({
    to: booking.clientPhone,
    templateName,
    bodyParameters: reminderBodyParams(booking),
  });

  return true;
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  if (!isWhatsAppApiConfigured()) return;

  try {
    await sendWhatsAppBookingMessage(
      booking,
      process.env.WHATSAPP_CONFIRM_TEMPLATE ?? "booking_confirmation",
    );
  } catch (error) {
    console.error("WhatsApp confirmation failed:", error);
  }
}

export async function sendBookingReminder(booking: Booking): Promise<boolean> {
  if (!isWhatsAppApiConfigured()) {
    console.warn(
      "WhatsApp API not configured — set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID",
    );
    return false;
  }

  try {
    return await sendWhatsAppBookingMessage(booking);
  } catch (error) {
    console.error("WhatsApp reminder failed:", error);
    return false;
  }
}
