import type { Booking, BusinessSettings, Day, DayHours } from "./types";
import { getDayLabel } from "./hours";

const SLOT_INTERVAL = 30;

function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function formatTime12h(time: string): string {
  const total = parseTime(time);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function getDayKeyFromDate(dateStr: string, timezone: string): Day {
  const date = new Date(`${dateStr}T12:00:00`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  })
    .format(date)
    .toLowerCase();

  return weekday as Day;
}

function getTodayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getNowMinutesInTimezone(timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function rangesOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number,
): boolean {
  return startA < startB + durationB && startA + durationA > startB;
}

function generateDaySlots(dayHours: DayHours): string[] {
  if (dayHours.closed) return [];

  const open = parseTime(dayHours.open);
  const close = parseTime(dayHours.close);
  const slots: string[] = [];

  for (let minute = open; minute + SLOT_INTERVAL <= close; minute += SLOT_INTERVAL) {
    slots.push(formatTime(minute));
  }

  return slots;
}

export function getAvailableSlots(
  settings: BusinessSettings,
  dateStr: string,
  serviceDuration: number,
  existingBookings: Booking[],
): { slots: string[]; closed: boolean; dayLabel: string } {
  const day = getDayKeyFromDate(dateStr, settings.timezone);
  const dayHours = settings.hours[day];
  const dayLabel = getDayLabel(day);

  if (dayHours.closed) {
    return { slots: [], closed: true, dayLabel };
  }

  const confirmed = existingBookings.filter(
    (b) => b.bookingDate === dateStr && b.status === "confirmed",
  );

  const today = getTodayInTimezone(settings.timezone);
  const nowMinutes = getNowMinutesInTimezone(settings.timezone);

  const slots = generateDaySlots(dayHours).filter((slot) => {
    const slotStart = parseTime(slot);

    if (dateStr === today && slotStart <= nowMinutes) {
      return false;
    }

    if (slotStart + serviceDuration > parseTime(dayHours.close)) {
      return false;
    }

    return !confirmed.some((booking) =>
      rangesOverlap(
        slotStart,
        serviceDuration,
        parseTime(booking.bookingTime),
        booking.serviceDuration,
      ),
    );
  });

  return { slots, closed: false, dayLabel };
}
