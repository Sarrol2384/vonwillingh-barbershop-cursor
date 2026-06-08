import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import type { Booking, BookingStatus, CreateBookingInput } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "bookings.json");

let bookingsTableAvailable: boolean | null = null;

function isBookingsTableMissing(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes('relation "public.bookings" does not exist')
  );
}

async function useSupabaseForBookings(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  if (bookingsTableAvailable === false) return false;
  if (bookingsTableAvailable === true) return true;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("bookings").select("id").limit(1);

  if (error && isBookingsTableMissing(error.message)) {
    console.warn(
      "bookings table not found in Supabase — using data/bookings.json locally. " +
        "Run supabase/migrations/002_bookings.sql in the Supabase SQL Editor.",
    );
    bookingsTableAvailable = false;
    return false;
  }

  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  bookingsTableAvailable = true;
  return true;
}

type BookingRow = {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  service_name: string;
  service_duration: number;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  reminder_sent: boolean;
  notes: string | null;
  created_at: string;
};

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    serviceName: row.service_name,
    serviceDuration: row.service_duration,
    bookingDate: row.booking_date,
    bookingTime: row.booking_time.slice(0, 5),
    status: row.status,
    reminderSent: row.reminder_sent,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function bookingToRow(booking: Booking): BookingRow {
  return {
    id: booking.id,
    client_name: booking.clientName,
    client_phone: booking.clientPhone,
    client_email: booking.clientEmail,
    service_name: booking.serviceName,
    service_duration: booking.serviceDuration,
    booking_date: booking.bookingDate,
    booking_time: booking.bookingTime,
    status: booking.status,
    reminder_sent: booking.reminderSent,
    notes: booking.notes,
    created_at: booking.createdAt,
  };
}

async function readLocalBookings(): Promise<Booking[]> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

async function writeLocalBookings(bookings: Booking[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(bookings, null, 2), "utf-8");
}

export async function getBookings(from?: string, to?: string): Promise<Booking[]> {
  if (await useSupabaseForBookings()) {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (from) query = query.gte("booking_date", from);
    if (to) query = query.lte("booking_date", to);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load bookings: ${error.message}`);
    return (data as BookingRow[]).map(rowToBooking);
  }

  let bookings = await readLocalBookings();
  if (from) bookings = bookings.filter((b) => b.bookingDate >= from);
  if (to) bookings = bookings.filter((b) => b.bookingDate <= to);
  return bookings.sort((a, b) =>
    `${a.bookingDate}${a.bookingTime}`.localeCompare(
      `${b.bookingDate}${b.bookingTime}`,
    ),
  );
}

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  const all = await getBookings(date, date);
  return all.filter((b) => b.status === "confirmed");
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const booking: Booking = {
    id: randomUUID(),
    clientName: input.clientName.trim(),
    clientPhone: input.clientPhone.trim(),
    clientEmail: input.clientEmail?.trim() || null,
    serviceName: input.serviceName,
    serviceDuration: input.serviceDuration,
    bookingDate: input.bookingDate,
    bookingTime: input.bookingTime,
    status: "confirmed",
    reminderSent: false,
    notes: input.notes?.trim() || null,
    createdAt: new Date().toISOString(),
  };

  if (await useSupabaseForBookings()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .insert(bookingToRow(booking))
      .select("*")
      .single();

    if (error) {
      throw new Error(
        error.code === "23505"
          ? "That time slot is already booked. Please choose another."
          : `Failed to create booking: ${error.message}`,
      );
    }

    return rowToBooking(data as BookingRow);
  }

  const existing = await readLocalBookings();
  const overlap = existing.some(
    (b) =>
      b.status === "confirmed" &&
      b.bookingDate === booking.bookingDate &&
      b.bookingTime === booking.bookingTime,
  );
  if (overlap) {
    throw new Error("That time slot is already booked. Please choose another.");
  }

  existing.push(booking);
  await writeLocalBookings(existing);
  return booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  if (await useSupabaseForBookings()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update booking: ${error.message}`);
    return rowToBooking(data as BookingRow);
  }

  const bookings = await readLocalBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Booking not found");
  bookings[index] = { ...bookings[index], status };
  await writeLocalBookings(bookings);
  return bookings[index];
}

export async function getBookingsNeedingReminder(
  hoursAhead = 24,
): Promise<Booking[]> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  const from = now.toISOString().slice(0, 10);
  const to = windowEnd.toISOString().slice(0, 10);

  const bookings = await getBookings(from, to);

  return bookings.filter((booking) => {
    if (booking.status !== "confirmed" || booking.reminderSent) return false;
    const appointment = new Date(`${booking.bookingDate}T${booking.bookingTime}:00`);
    return appointment > now && appointment <= windowEnd;
  });
}

export async function markReminderSent(id: string): Promise<void> {
  if (await useSupabaseForBookings()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("bookings")
      .update({ reminder_sent: true })
      .eq("id", id);
    if (error) throw new Error(`Failed to mark reminder: ${error.message}`);
    return;
  }

  const bookings = await readLocalBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return;
  bookings[index].reminderSent = true;
  await writeLocalBookings(bookings);
}
