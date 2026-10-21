"use client";

import { useEffect, useMemo, useState } from "react";
import { isHouseCallService, parseServiceDuration } from "@/lib/service-duration";
import {
  addCalendarDays,
  describeClosedDays,
  formatTime12h,
  getNextOpenDate,
  getShopToday,
} from "@/lib/slots";
import type { BusinessSettings, Booking } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

type SlotsResponse = {
  slots: string[];
  closed: boolean;
  dayLabel: string;
  message?: string;
  reason?: string;
  error?: string;
};

function formatLongDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function slotAnnouncement(data: SlotsResponse): string {
  if (data.slots.length === 1) return "1 time available.";
  if (data.slots.length > 1) return `${data.slots.length} times available.`;
  return data.message || "No times available.";
}

export function BookingSection({ settings }: Props) {
  const today = useMemo(
    () => getShopToday(settings.timezone),
    [settings.timezone],
  );
  const maxDate = useMemo(() => addCalendarDays(today, 30), [today]);
  const closedDaysNote = useMemo(
    () => describeClosedDays(settings),
    [settings],
  );

  const initialDate = useMemo(
    () =>
      getNextOpenDate(settings, {
        serviceDuration: parseServiceDuration(
          settings.services[0]?.duration ?? "30 min",
        ),
      }),
    [settings],
  );
  const [serviceName, setServiceName] = useState(settings.services[0]?.name ?? "");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [slotMessage, setSlotMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeError, setTimeError] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [liveMessage, setLiveMessage] = useState(
    () => `Loading available times for ${formatLongDate(initialDate)}.`,
  );

  const selectedService = settings.services.find(
    (service) => service.name === serviceName,
  );
  const houseCall = isHouseCallService(serviceName);

  function beginSlotRequest(nextDate: string) {
    setLoadingSlots(true);
    setError("");
    setTime("");
    setTimeError(false);
    setSlots([]);
    setClosed(false);
    setSlotMessage("");
    setLiveMessage(`Loading available times for ${formatLongDate(nextDate)}.`);
  }

  useEffect(() => {
    if (!serviceName || !date) return;

    let cancelled = false;

    fetch(
      `/api/bookings/slots?date=${date}&service=${encodeURIComponent(serviceName)}`,
    )
      .then((res) => res.json())
      .then((data: SlotsResponse) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setSlots([]);
          setClosed(false);
          setSlotMessage("");
          return;
        }
        setSlots(data.slots);
        setClosed(data.closed);
        setSlotMessage(data.message ?? "");
        setLiveMessage(slotAnnouncement(data));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load available times.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceName, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTimeError(false);

    if (!serviceName) {
      setError("Please select a service.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (closed) {
      setError(slotMessage || "The shop is closed on this day. Please choose another date.");
      return;
    }
    if (slotMessage && slots.length === 0) {
      setError(slotMessage);
      return;
    }
    if (slots.length === 0) {
      setError("No times available on this day. Please choose another date.");
      return;
    }
    if (!time) {
      setTimeError(true);
      setError("Please select a time.");
      return;
    }
    if (!clientName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!clientPhone.trim()) {
      setError("Please enter your WhatsApp number.");
      return;
    }

    setSubmitting(true);
    setLiveMessage("Submitting your booking.");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        serviceName,
        bookingDate: date,
        bookingTime: time,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Booking failed. Please try again.");
      setLiveMessage("");
      return;
    }

    const confirmed = data as Booking;
    setLiveMessage(
      `Booking confirmed for ${confirmed.serviceName} on ${formatLongDate(confirmed.bookingDate)} at ${formatTime12h(confirmed.bookingTime)}.`,
    );
    setBooking(confirmed);
  }

  return (
    <section className="px-5 py-8" id="book">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>

      {booking ? (
        <div className="card mx-auto max-w-lg p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Booked
          </p>
          <h2 className="section-title mt-2">You&apos;re on the schedule</h2>
          <p className="mt-3 text-sm text-zinc-300">
            {booking.serviceName} on{" "}
            <strong className="text-cream">{booking.bookingDate}</strong> at{" "}
            <strong className="text-cream">
              {formatTime12h(booking.bookingTime)}
            </strong>
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            A WhatsApp confirmation and reminder will be sent to{" "}
            {booking.clientPhone}.
          </p>
        </div>
      ) : (
        <div className="card mx-auto max-w-lg p-6">
          <h2 className="section-title">Book an Appointment</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Pick a service, date, and time. You&apos;ll get a WhatsApp reminder 24
            hours before on the phone number you provide.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-cream">
                Service <span className="text-gold">*</span>
              </span>
              <select
                value={serviceName}
                onChange={(e) => {
                  setServiceName(e.target.value);
                  beginSlotRequest(date);
                }}
                aria-describedby={houseCall ? "house-call-note" : undefined}
                className="w-full rounded-lg border border-zinc-600 bg-charcoal-light px-3 py-2 text-cream"
                required
              >
                {settings.services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name} — {service.price}
                  </option>
                ))}
              </select>
            </label>

            {houseCall && (
              <p
                id="house-call-note"
                className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-cream"
              >
                The area and travel fee are confirmed via WhatsApp. House calls
                need at least 24 hours&apos; notice.
              </p>
            )}

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-cream">
                Date <span className="text-gold">*</span>
              </span>
              <input
                type="date"
                value={date}
                min={today}
                max={maxDate}
                onChange={(e) => {
                  setDate(e.target.value);
                  beginSlotRequest(e.target.value);
                }}
                aria-invalid={closed || undefined}
                aria-describedby={closedDaysNote ? "closed-days-note" : undefined}
                className="w-full rounded-lg border border-zinc-600 bg-charcoal-light px-3 py-2 text-cream"
                required
              />
              {closedDaysNote && (
                <span
                  id="closed-days-note"
                  className="mt-1 block text-xs text-zinc-500"
                >
                  {closedDaysNote}
                </span>
              )}
            </label>

            <div aria-busy={loadingSlots}>
              <span className="mb-2 block text-sm font-medium text-cream">
                Time <span className="text-gold">*</span>
                {selectedService && (
                  <span className="ml-2 font-normal text-zinc-500">
                    {selectedService.duration} appointments
                  </span>
                )}
              </span>
              {loadingSlots ? (
                <p className="text-sm text-zinc-500">Loading times…</p>
              ) : closed || slots.length === 0 ? (
                <p className="rounded-lg border border-zinc-600 bg-charcoal px-3 py-2 text-sm text-zinc-300">
                  {slotMessage || "No times available on this day."}
                </p>
              ) : (
                <div
                  className={`grid grid-cols-3 gap-2 sm:grid-cols-4 ${
                    timeError ? "rounded-lg ring-1 ring-red-400/50 p-1" : ""
                  }`}
                >
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={time === slot}
                      onClick={() => {
                        setTime(slot);
                        setTimeError(false);
                      }}
                      className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                        time === slot
                          ? "border-gold bg-gold/20 text-gold"
                          : "border-zinc-600 text-zinc-300 hover:border-gold/50"
                      }`}
                    >
                      {formatTime12h(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-cream">
                Your name <span className="text-gold">*</span>
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-zinc-600 bg-charcoal-light px-3 py-2 text-cream"
                required
                minLength={2}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-cream">
                WhatsApp number <span className="text-gold">*</span>
              </span>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. 071 123 4567"
                className="w-full rounded-lg border border-zinc-600 bg-charcoal-light px-3 py-2 text-cream"
                required
                minLength={9}
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
