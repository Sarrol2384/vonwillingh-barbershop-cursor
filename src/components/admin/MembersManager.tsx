"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BenefitUsageList } from "@/components/BenefitUsageList";
import {
  formatMembershipDate,
  getBenefitUsageForPeriod,
  getBenefitUsagesInPeriod,
  getMembershipStatus,
} from "@/lib/membership";
import type { Member } from "@/lib/types";

type Filter = "all" | "active" | "expired";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MembersManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [recordingBenefit, setRecordingBenefit] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayString());
  const [notes, setNotes] = useState("");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/members");
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to load members.");
      return;
    }

    setMembers(data.members as Member[]);
    setBenefits((data.benefits as string[]) ?? []);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filtered = useMemo(() => {
    return members.filter((member) => {
      const status = getMembershipStatus(member.expiresAt);
      if (filter === "active") return status === "active";
      if (filter === "expired") return status === "expired";
      return true;
    });
  }, [members, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientPhone,
        paymentDate,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to add member.");
      return;
    }

    setMessage(`${data.clientName} added as ${data.memberNumber}.`);
    setClientName("");
    setClientPhone("");
    setPaymentDate(todayString());
    setNotes("");
    setShowForm(false);
    await loadMembers();
  }

  async function handleRenew(member: Member) {
    const date = todayString();
    setRenewingId(member.id);
    setMessage("");
    setError("");

    const res = await fetch(`/api/members/${member.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentDate: date }),
    });

    const data = await res.json();
    setRenewingId(null);

    if (!res.ok) {
      setError(data.error ?? "Failed to record payment.");
      return;
    }

    setMessage(
      `Payment recorded for ${member.clientName}. Valid until ${formatMembershipDate(data.expiresAt)}.`,
    );
    await loadMembers();
  }

  async function handleRecordBenefit(member: Member, benefitName: string) {
    const key = `${member.id}:${benefitName}`;
    setRecordingBenefit(key);
    setMessage("");
    setError("");

    const res = await fetch(`/api/members/${member.id}/benefits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitName }),
    });

    const data = await res.json();
    setRecordingBenefit(null);

    if (!res.ok) {
      setError(data.error ?? "Failed to record benefit visit.");
      return;
    }

    setMessage(`${benefitName} recorded for ${member.clientName}.`);
    await loadMembers();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Members</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Cash memberships — record payments and renewals
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Site settings
          </a>
          <a
            href="/admin/bookings"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Bookings
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "active", "expired"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                filter === value
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {showForm ? "Cancel" : "Add member"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-zinc-900">New member</h2>
          <p className="text-sm text-zinc-600">
            Record a cash payment at the shop. Membership runs for one month from
            the payment date.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-800">Name *</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClassName}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-800">
                WhatsApp number *
              </span>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. 071 123 4567"
                className={inputClassName}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-800">
                Payment date *
              </span>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={inputClassName}
                required
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-zinc-800">Notes</span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                className={inputClassName}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save member"}
          </button>
        </form>
      )}

      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-zinc-600">Loading members…</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">No members in this list yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((member) => {
          const status = getMembershipStatus(member.expiresAt);
          const isActive = status === "active";

          return (
            <section
              key={member.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {member.clientName}
                    </h2>
                    <span className="font-mono text-sm text-zinc-500">
                      {member.memberNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                        isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600">{member.clientPhone}</p>
                  <div className="grid gap-2 text-sm text-zinc-700 sm:grid-cols-3">
                    <p>
                      <span className="text-zinc-500">Last payment: </span>
                      {formatMembershipDate(member.lastPaymentDate)}
                    </p>
                    <p>
                      <span className="text-zinc-500">Valid until: </span>
                      {formatMembershipDate(member.expiresAt)}
                    </p>
                    <p>
                      <span className="text-zinc-500">Next payment due: </span>
                      {formatMembershipDate(member.expiresAt)}
                    </p>
                  </div>
                  {member.notes && (
                    <p className="text-sm text-zinc-500">Note: {member.notes}</p>
                  )}
                  {benefits.length > 0 && (
                    <div className="pt-2">
                      <p className="mb-2 text-sm font-medium text-zinc-800">
                        Benefits this month
                      </p>
                      <BenefitUsageList
                        benefits={benefits}
                        usages={getBenefitUsagesInPeriod(
                          member.benefitUsages ?? [],
                          member.lastPaymentDate,
                          member.expiresAt,
                        ).map((usage) => ({
                          benefitName: usage.benefitName,
                          usedOn: usage.usedOn,
                        }))}
                        variant="light"
                      />
                      {isActive && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {benefits.map((benefit) => {
                            const used = getBenefitUsageForPeriod(
                              member.benefitUsages ?? [],
                              benefit,
                              member.lastPaymentDate,
                              member.expiresAt,
                            );
                            const key = `${member.id}:${benefit}`;

                            return (
                              <button
                                key={benefit}
                                type="button"
                                disabled={Boolean(used) || recordingBenefit === key}
                                onClick={() => handleRecordBenefit(member, benefit)}
                                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {recordingBenefit === key
                                  ? "Saving…"
                                  : used
                                    ? "Already used"
                                    : `Mark: ${benefit}`}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {member.payments && member.payments.length > 0 && (
                    <details className="text-sm text-zinc-600">
                      <summary className="cursor-pointer font-medium text-zinc-700">
                        Payment history ({member.payments.length})
                      </summary>
                      <ul className="mt-2 space-y-1 pl-1">
                        {member.payments.map((payment) => (
                          <li key={payment.id}>
                            {formatMembershipDate(payment.paymentDate)} —{" "}
                            {payment.amount}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {member.benefitUsages && member.benefitUsages.length > 0 && (
                    <details className="text-sm text-zinc-600">
                      <summary className="cursor-pointer font-medium text-zinc-700">
                        Benefit visit history ({member.benefitUsages.length})
                      </summary>
                      <ul className="mt-2 space-y-1 pl-1">
                        {member.benefitUsages.map((usage) => (
                          <li key={usage.id}>
                            {formatMembershipDate(usage.usedOn)} —{" "}
                            {usage.benefitName}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
                <button
                  type="button"
                  disabled={renewingId === member.id}
                  onClick={() => handleRenew(member)}
                  className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {renewingId === member.id
                    ? "Recording…"
                    : isActive
                      ? "Record early renewal"
                      : "Record payment"}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
