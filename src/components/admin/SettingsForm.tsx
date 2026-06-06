"use client";

import { useState } from "react";
import type { BusinessSettings, Day, Service } from "@/lib/types";
import { getDayLabel, getOrderedDays } from "@/lib/hours";

type Props = {
  initialSettings: BusinessSettings;
};

const DAYS = getOrderedDays();

export function SettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setMessage(res.ok ? "Saved successfully." : "Failed to save. Try again.");
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  function updateField<K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateHour(day: Day, field: keyof BusinessSettings["hours"][Day], value: string | boolean) {
    setSettings((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], [field]: value },
      },
    }));
  }

  function updateService(index: number, field: keyof Service, value: string) {
    setSettings((prev) => ({
      ...prev,
      services: prev.services.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  }

  function addService() {
    setSettings((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { name: "New Service", price: "R0", duration: "30 min" },
      ],
    }));
  }

  function removeService(index: number) {
    setSettings((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }

  function updateBarber(field: keyof BusinessSettings["barber"], value: string | number) {
    setSettings((prev) => ({
      ...prev,
      barber: { ...prev.barber, [field]: value },
    }));
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500">Manage VonWillingh Barbershop content</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            target="_blank"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Preview site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Log out
          </button>
        </div>
      </div>

      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <legend className="px-2 text-lg font-semibold">Business</legend>
        <Input
          label="Business name"
          value={settings.businessName}
          onChange={(v) => updateField("businessName", v)}
        />
        <Input
          label="Tagline"
          value={settings.tagline}
          onChange={(v) => updateField("tagline", v)}
        />
        <Input
          label="Timezone"
          value={settings.timezone}
          onChange={(v) => updateField("timezone", v)}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <legend className="px-2 text-lg font-semibold">Contact</legend>
        <Input label="Phone" value={settings.phone} onChange={(v) => updateField("phone", v)} />
        <Input
          label="WhatsApp number (digits only, e.g. 27821234567)"
          value={settings.whatsapp}
          onChange={(v) => updateField("whatsapp", v)}
        />
        <Input label="Email" value={settings.email} onChange={(v) => updateField("email", v)} />
        <Input label="Address" value={settings.address} onChange={(v) => updateField("address", v)} />
        <Input
          label="Google Maps URL"
          value={settings.mapsUrl}
          onChange={(v) => updateField("mapsUrl", v)}
        />
        <Input
          label="WhatsApp booking message"
          value={settings.whatsappMessage}
          onChange={(v) => updateField("whatsappMessage", v)}
        />
        <Input
          label="Instagram URL"
          value={settings.social.instagram ?? ""}
          onChange={(v) =>
            updateField("social", { ...settings.social, instagram: v })
          }
        />
        <Input
          label="Facebook URL"
          value={settings.social.facebook ?? ""}
          onChange={(v) =>
            updateField("social", { ...settings.social, facebook: v })
          }
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <legend className="px-2 text-lg font-semibold">Opening Hours</legend>
        {DAYS.map((day) => (
          <div key={day} className="grid gap-3 rounded-lg bg-zinc-50 p-3 sm:grid-cols-4">
            <span className="font-medium text-zinc-700">{getDayLabel(day)}</span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.hours[day].closed}
                onChange={(e) => updateHour(day, "closed", e.target.checked)}
              />
              Closed
            </label>
            <Input
              label="Open"
              value={settings.hours[day].open}
              onChange={(v) => updateHour(day, "open", v)}
              disabled={settings.hours[day].closed}
            />
            <Input
              label="Close"
              value={settings.hours[day].close}
              onChange={(v) => updateHour(day, "close", v)}
              disabled={settings.hours[day].closed}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <legend className="px-2 text-lg font-semibold">Services</legend>
        {settings.services.map((service, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-zinc-100 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Name"
                value={service.name}
                onChange={(v) => updateService(index, "name", v)}
              />
              <Input
                label="Price"
                value={service.price}
                onChange={(v) => updateService(index, "price", v)}
              />
              <Input
                label="Duration"
                value={service.duration}
                onChange={(v) => updateService(index, "duration", v)}
              />
              <Input
                label="Description"
                value={service.description ?? ""}
                onChange={(v) => updateService(index, "description", v)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeService(index)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove service
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addService}
          className="text-sm font-medium text-zinc-700 hover:underline"
        >
          + Add service
        </button>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <legend className="px-2 text-lg font-semibold">Barber Profile</legend>
        <Input
          label="Name"
          value={settings.barber.name}
          onChange={(v) => updateBarber("name", v)}
        />
        <Input
          label="Title"
          value={settings.barber.title}
          onChange={(v) => updateBarber("title", v)}
        />
        <Input
          label="Years experience"
          value={String(settings.barber.yearsExperience)}
          onChange={(v) => updateBarber("yearsExperience", Number(v) || 0)}
        />
        <Input
          label="Tagline"
          value={settings.barber.tagline}
          onChange={(v) => updateBarber("tagline", v)}
        />
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">Bio</span>
          <textarea
            value={settings.barber.bio}
            onChange={(e) => updateBarber("bio", e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <p className={`text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-zinc-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 disabled:bg-zinc-100"
      />
    </label>
  );
}
