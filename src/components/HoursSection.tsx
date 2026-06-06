import { formatHoursRange, getDayLabel, getOrderedDays } from "@/lib/hours";
import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function HoursSection({ settings }: Props) {
  const days = getOrderedDays();
  const todayIndex = new Date(
    new Date().toLocaleString("en-US", { timeZone: settings.timezone }),
  ).getDay();
  const todayMap = [6, 0, 1, 2, 3, 4, 5];
  const todayDay = days[todayMap[todayIndex]];

  return (
    <section className="px-5 py-8">
      <div className="card mx-auto max-w-lg p-6">
        <h2 className="section-title">Opening Hours</h2>

        <ul className="mt-5 space-y-2">
          {days.map((day) => {
            const isToday = day === todayDay;
            const hours = settings.hours[day];

            return (
              <li
                key={day}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  isToday ? "bg-gold/10 text-cream" : "text-zinc-300"
                }`}
              >
                <span className={isToday ? "font-semibold" : ""}>
                  {getDayLabel(day)}
                  {isToday && (
                    <span className="ml-2 text-xs text-gold">Today</span>
                  )}
                </span>
                <span className={hours.closed ? "text-zinc-500" : ""}>
                  {formatHoursRange(hours)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
