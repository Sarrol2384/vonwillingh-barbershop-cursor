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

export type BarberProfile = {
  name: string;
  title: string;
  yearsExperience: number;
  photo: string;
  tagline: string;
  bio: string;
  bioShort: string;
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
  whatsappMessage: string;
  social: {
    instagram?: string;
    facebook?: string;
  };
  barber: BarberProfile;
};
