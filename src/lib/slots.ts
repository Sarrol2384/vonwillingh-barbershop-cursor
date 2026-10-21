import type { Booking, BusinessSettings, Day } from "./types";
import { getDayLabel, getOrderedDays } from "./hours";

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

function safeDuration(duration: number): number {
  return Number.isFinite(duration) && duration > 0 ? duration : 30;
}

function rangesOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number,
): boolean {
  return startA < startB + durationB && startA + durationA > startB;
}

export function appointmentsOverlap(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number,
): boolean {
  return rangesOverlap(
    parseTime(startA),
    safeDuration(durationA),
    parseTime(startB),
    safeDuration(durationB),
  );
}

function getDayKeyFromDate(dateStr: string, timezone: string): Day {
  const date = new Date(`${dateStr}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  })
    .format(date)
    .toLowerCase();

  return weekday as Day;
}

export function getShopToday(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addCalendarDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNowMinutesInTimezone(timezone: string, now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

/** Interpret a shop-local wall time as a UTC instant. */
export function zonedWallTimeToUtc(
  dateStr: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, 0);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(new Date(utcMillis));
  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const wallAsUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour"),
    read("minute"),
    read("second"),
  );
  const offset = wallAsUtc - utcMillis;
  return new Date(utcMillis - offset);
}

function pluralWeekday(dayLabel: string): string {
  return dayLabel.endsWith("s") ? dayLabel : `${dayLabel}s`;
}

export function closedDayMessage(dayLabel: string): string {
  return `Closed on ${pluralWeekday(dayLabel)}.`;
}

export function describeClosedDays(settings: BusinessSettings): string {
  const labels = getOrderedDays()
    .filter((day) => settings.hours[day]?.closed)
    .map((day) => pluralWeekday(getDayLabel(day)));

  if (labels.length === 0) return "";
  if (labels.length === 1) return `Closed on ${labels[0]}.`;
  if (labels.length === 2) return `Closed on ${labels[0]} and ${labels[1]}.`;
  return `Closed on ${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}.`;
}

export type SlotReason = "closed" | "notice" | "available" | "full";

export type SlotResult = {
  slots: string[];
  closed: boolean;
  dayLabel: string;
  reason: SlotReason;
  message: string;
};

/**
 * Start times step by the service duration, and each one must finish
 * by closing without overlapping another confirmed booking.
 */
function generateCandidateStarts(
  open: string,
  close: string,
  serviceDuration: number,
): string[] {
  const duration = safeDuration(serviceDuration);
  const openMinutes = parseTime(open);
  const closeMinutes = parseTime(close);
  const slots: string[] = [];

  for (
    let minute = openMinutes;
    minute + duration <= closeMinutes;
    minute += duration
  ) {
    slots.push(formatTime(minute));
  }

  return slots;
}

export function getAvailableSlots(
  settings: BusinessSettings,
  dateStr: string,
  serviceDuration: number,
  existingBookings: Booking[],
  options?: { now?: Date; leadTimeMs?: number },
): SlotResult {
  const now = options?.now ?? new Date();
  const leadTimeMs = options?.leadTimeMs ?? 0;
  const day = getDayKeyFromDate(dateStr, settings.timezone);
  const dayHours = settings.hours[day];
  const dayLabel = getDayLabel(day);

  if (!dayHours || dayHours.closed) {
    return {
      slots: [],
      closed: true,
      dayLabel,
      reason: "closed",
      message: closedDayMessage(dayLabel),
    };
  }

  const today = getShopToday(settings.timezone, now);
  if (dateStr < today) {
    return {
      slots: [],
      closed: false,
      dayLabel,
      reason: "full",
      message: "No times available on this day.",
    };
  }

  const duration = safeDuration(serviceDuration);
  const nowMinutes = getNowMinutesInTimezone(settings.timezone, now);
  const confirmed = existingBookings.filter(
    (booking) => booking.bookingDate === dateStr && booking.status === "confirmed",
  );

  const scheduled = generateCandidateStarts(
    dayHours.open,
    dayHours.close,
    duration,
  ).filter((slot) => {
    const slotStart = parseTime(slot);
    if (dateStr === today && slotStart <= nowMinutes) return false;
    return !confirmed.some((booking) =>
      appointmentsOverlap(
        slot,
        duration,
        booking.bookingTime,
        booking.serviceDuration,
      ),
    );
  });

  const slots =
    leadTimeMs > 0
      ? scheduled.filter((slot) => {
          const start = zonedWallTimeToUtc(dateStr, slot, settings.timezone);
          return start.getTime() >= now.getTime() + leadTimeMs;
        })
      : scheduled;

  if (slots.length > 0) {
    return {
      slots,
      closed: false,
      dayLabel,
      reason: "available",
      message: "",
    };
  }

  if (leadTimeMs > 0 && scheduled.length > 0) {
    return {
      slots: [],
      closed: false,
      dayLabel,
      reason: "notice",
      message: "House calls need at least 24 hours' notice.",
    };
  }

  return {
    slots: [],
    closed: false,
    dayLabel,
    reason: "full",
    message: "No times available on this day.",
  };
}

export function getNextOpenDate(
  settings: BusinessSettings,
  options?: { now?: Date; serviceDuration?: number; leadTimeMs?: number },
): string {
  const now = options?.now ?? new Date();
  const today = getShopToday(settings.timezone, now);
  const serviceDuration = options?.serviceDuration ?? 30;
  const leadTimeMs = options?.leadTimeMs ?? 0;

  for (let offset = 0; offset < 45; offset++) {
    const dateStr = addCalendarDays(today, offset);
    const result = getAvailableSlots(settings, dateStr, serviceDuration, [], {
      now,
      leadTimeMs,
    });
    if (result.slots.length > 0) return dateStr;
  }

  return today;
}
