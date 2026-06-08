"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTime12h } from "@/lib/slots";
import type { BusinessSettings, Booking } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

type SlotsResponse = {
  slots: string[];
  closed: boolean;
  dayLabel: string;
};

export function BookingSection({ settings }: Props) {
  const today = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: settings.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, [settings.timezone]);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  }, []);

  const [serviceName, setServiceName] = useState(settings.services[0]?.name ?? "");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeError, setTimeError] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!serviceName || !date) return;

    let cancelled = false;
    setLoadingSlots(true);
    setError("");
    setTime("");
    setTimeError(false);

    fetch(
      `/api/bookings/slots?date=${date}&service=${encodeURIComponent(serviceName)}`,
    )
      .then((res) => res.json())
      .then((data: SlotsResponse & { error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setSlots([]);
          return;
        }
        setSlots(data.slots);
        setClosed(data.closed);
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
      setError("The shop is closed on this day. Please choose another date.");
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
      return;
    }

    setBooking(data as Booking);
  }

  if (booking) {
    return (
      <section className="px-5 py-8">
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
      </section>
    );
  }

  return (
    <section className="px-5 py-8" id="book">
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
              onChange={(e) => setServiceName(e.target.value)}
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

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-cream">
              Date <span className="text-gold">*</span>
            </span>
            <input
              type="date"
              value={date}
              min={today}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-charcoal-light px-3 py-2 text-cream"
              required
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-cream">
              Time <span className="text-gold">*</span>
            </span>
            {loadingSlots ? (
              <p className="text-sm text-zinc-500">Loading times…</p>
            ) : closed ? (
              <p className="text-sm text-zinc-500">Closed on this day.</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-zinc-500">No slots available.</p>
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
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
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
    </section>
  );
}
