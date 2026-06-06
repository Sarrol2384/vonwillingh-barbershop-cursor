import type { BusinessSettings, Day, DayHours } from "./types";

const DAY_ORDER: Day[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<Day, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function getDayLabel(day: Day): string {
  return DAY_LABELS[day];
}

export function getOrderedDays(): Day[] {
  return DAY_ORDER;
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

function getNowInTimezone(timezone: string): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
}

function getDayKey(date: Date): Day {
  const index = date.getDay();
  const map: Day[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return map[index];
}

function isOpenAt(dayHours: DayHours, date: Date): boolean {
  if (dayHours.closed) return false;

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const open = parseTime(dayHours.open);
  const close = parseTime(dayHours.close);
  const openMinutes = open.hours * 60 + open.minutes;
  const closeMinutes = close.hours * 60 + close.minutes;

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function formatTime12h(time: string): string {
  const { hours, minutes } = parseTime(time);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function findNextOpen(
  hours: Record<Day, DayHours>,
  startDate: Date,
): { day: Day; open: string } | null {
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);
    const day = getDayKey(date);
    const dayHours = hours[day];

    if (dayHours.closed) continue;

    if (offset === 0) {
      const nowMinutes = date.getHours() * 60 + date.getMinutes();
      const open = parseTime(dayHours.open);
      const openMinutes = open.hours * 60 + open.minutes;
      if (nowMinutes < openMinutes) {
        return { day, open: dayHours.open };
      }
      continue;
    }

    return { day, open: dayHours.open };
  }

  return null;
}

export type OpenStatus = {
  isOpen: boolean;
  message: string;
};

export function getOpenStatus(settings: BusinessSettings): OpenStatus {
  const now = getNowInTimezone(settings.timezone);
  const today = getDayKey(now);
  const todayHours = settings.hours[today];

  if (isOpenAt(todayHours, now)) {
    return {
      isOpen: true,
      message: `Open until ${formatTime12h(todayHours.close)}`,
    };
  }

  if (!todayHours.closed) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const open = parseTime(todayHours.open);
    const openMinutes = open.hours * 60 + open.minutes;
    if (nowMinutes < openMinutes) {
      return {
        isOpen: false,
        message: `Opens today at ${formatTime12h(todayHours.open)}`,
      };
    }
  }

  const next = findNextOpen(settings.hours, now);
  if (next) {
    return {
      isOpen: false,
      message: `Closed — opens ${getDayLabel(next.day)} ${formatTime12h(next.open)}`,
    };
  }

  return { isOpen: false, message: "Closed" };
}

export function formatHoursRange(dayHours: DayHours): string {
  if (dayHours.closed) return "Closed";
  return `${formatTime12h(dayHours.open)} – ${formatTime12h(dayHours.close)}`;
}
