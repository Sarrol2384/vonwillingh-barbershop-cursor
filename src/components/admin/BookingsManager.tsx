"use client";

import { useCallback, useEffect, useState } from "react";
import { formatTime12h } from "@/lib/slots";
import type { Booking, BookingStatus } from "@/lib/types";

function formatDateHeading(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(bookings: Booking[]): Record<string, Booking[]> {
  return bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    if (!acc[booking.bookingDate]) acc[booking.bookingDate] = [];
    acc[booking.bookingDate].push(booking);
    return acc;
  }, {});
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    const from = new Date().toISOString().slice(0, 10);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 30);
    const to = toDate.toISOString().slice(0, 10);

    const res = await fetch(`/api/bookings?from=${from}&to=${to}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to load bookings.");
      return;
    }

    setBookings(
      (data as Booking[]).filter((b) => b.status !== "cancelled"),
    );
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);

    if (res.ok) {
      await loadBookings();
    }
  }

  const grouped = groupByDate(bookings);
  const dates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Bookings</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Upcoming appointments for Kobus
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/admin"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Site settings
          </a>
          <a
            href="/admin/members"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Members
          </a>
          <a
            href="/"
            target="_blank"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            View site
          </a>
        </div>
      </div>

      {loading && <p className="text-sm text-zinc-600">Loading bookings…</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && dates.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">No upcoming bookings yet.</p>
        </div>
      )}

      {dates.map((date) => (
        <section
          key={date}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            {formatDateHeading(date)}
          </h2>
          <ul className="mt-4 space-y-3">
            {grouped[date].map((booking) => (
              <li
                key={booking.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-zinc-900">
                    {formatTime12h(booking.bookingTime)} — {booking.clientName}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {booking.serviceName} · {booking.clientPhone}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 capitalize">
                    {booking.status}
                    {booking.reminderSent && " · reminder sent"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.status === "confirmed" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() => updateStatus(booking.id, "completed")}
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                      >
                        Mark done
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
