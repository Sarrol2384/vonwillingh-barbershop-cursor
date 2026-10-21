import { BarberPole } from "@/components/BarberPole";
import { BookingSection } from "@/components/BookingSection";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { HoursSection } from "@/components/HoursSection";
import { MeetBarber } from "@/components/MeetBarber";
import { ServicesSection } from "@/components/ServicesSection";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import { getSettings } from "@/lib/settings";
import { buildHairSalonJsonLd } from "@/lib/structured-data";

export default async function HomePage() {
  const settings = await getSettings();
  const jsonLd = JSON.stringify(buildHairSalonJsonLd(settings)).replace(
    /</g,
    "\\u003c",
  );

  return (
    <main className="min-h-screen bg-charcoal pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <BarberPole />
      <Hero settings={settings} />
      <MeetBarber settings={settings} />
      <ServicesSection settings={settings} />
      <BookingSection settings={settings} />
      <SubscriptionSection settings={settings} />
      <HoursSection settings={settings} />
      <ContactSection settings={settings} />

      <footer className="px-5 py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {settings.businessName}
      </footer>

      <StickyBookingBar settings={settings} />
    </main>
  );
}
