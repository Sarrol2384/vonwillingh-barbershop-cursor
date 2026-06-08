export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

export type Service = {
  name: string;
  price: string;
  duration: string;
  description?: string;
};

export type SubscriptionPlan = {
  enabled: boolean;
  title: string;
  price: string;
  period: string;
  description: string;
  benefits: string[];
  whatsappMessage: string;
};

export type BarberProfile = {
  name: string;
  title: string;
  yearsExperience: number;
  photo: string;
  tagline: string;
  bio: string;
  bioShort: string;
};

export type BookingStatus = "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  serviceName: string;
  serviceDuration: number;
  bookingDate: string;
  bookingTime: string;
  status: BookingStatus;
  reminderSent: boolean;
  notes: string | null;
  createdAt: string;
};

export type CreateBookingInput = {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceName: string;
  serviceDuration: number;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
};

export type BusinessSettings = {
  businessName: string;
  tagline: string;
  logoUrl: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  timezone: string;
  hours: Record<Day, DayHours>;
  services: Service[];
  subscription: SubscriptionPlan;
  whatsappMessage: string;
  social: {
    instagram?: string;
    facebook?: string;
  };
  barber: BarberProfile;
};
