import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { addOneMonth } from "./membership";
import { normalizePhoneDigits } from "./phone";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import {
  getBenefitUsageForPeriod,
  getMembershipStatus,
} from "./membership";
import type {
  CreateMemberInput,
  Member,
  MemberBenefitUsage,
  MemberPayment,
  RecordBenefitUsageInput,
  RecordPaymentInput,
} from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "members.json");

let membersTableAvailable: boolean | null = null;

function isMembersTableMissing(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes('relation "public.members" does not exist')
  );
}

async function useSupabaseForMembers(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  if (membersTableAvailable === false) return false;
  if (membersTableAvailable === true) return true;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("members").select("id").limit(1);

  if (error && isMembersTableMissing(error.message)) {
    console.warn(
      "members table not found in Supabase — using data/members.json locally. " +
        "Run supabase/migrations/003_members.sql in the Supabase SQL Editor.",
    );
    membersTableAvailable = false;
    return false;
  }

  if (error) {
    throw new Error(`Failed to load members: ${error.message}`);
  }

  membersTableAvailable = true;
  return true;
}

type MemberRow = {
  id: string;
  member_number: string;
  client_name: string;
  client_phone: string;
  last_payment_date: string;
  expires_at: string;
  notes: string | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  member_id: string;
  payment_date: string;
  amount: string;
  created_at: string;
};

type BenefitUsageRow = {
  id: string;
  member_id: string;
  benefit_name: string;
  used_on: string;
  created_at: string;
};

function rowToPayment(row: PaymentRow): MemberPayment {
  return {
    id: row.id,
    memberId: row.member_id,
    paymentDate: row.payment_date,
    amount: row.amount,
    createdAt: row.created_at,
  };
}

function rowToBenefitUsage(row: BenefitUsageRow): MemberBenefitUsage {
  return {
    id: row.id,
    memberId: row.member_id,
    benefitName: row.benefit_name,
    usedOn: row.used_on,
    createdAt: row.created_at,
  };
}

function benefitUsageToRow(usage: MemberBenefitUsage): BenefitUsageRow {
  return {
    id: usage.id,
    member_id: usage.memberId,
    benefit_name: usage.benefitName,
    used_on: usage.usedOn,
    created_at: usage.createdAt,
  };
}

function rowToMember(
  row: MemberRow,
  payments?: MemberPayment[],
  benefitUsages?: MemberBenefitUsage[],
): Member {
  return {
    id: row.id,
    memberNumber: row.member_number,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    lastPaymentDate: row.last_payment_date,
    expiresAt: row.expires_at,
    notes: row.notes,
    createdAt: row.created_at,
    payments,
    benefitUsages,
  };
}

function memberToRow(member: Member): MemberRow {
  return {
    id: member.id,
    member_number: member.memberNumber,
    client_name: member.clientName,
    client_phone: member.clientPhone,
    last_payment_date: member.lastPaymentDate,
    expires_at: member.expiresAt,
    notes: member.notes,
    created_at: member.createdAt,
  };
}

function paymentToRow(payment: MemberPayment): PaymentRow {
  return {
    id: payment.id,
    member_id: payment.memberId,
    payment_date: payment.paymentDate,
    amount: payment.amount,
    created_at: payment.createdAt,
  };
}

async function readLocalMembers(): Promise<Member[]> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Member[];
  } catch {
    return [];
  }
}

async function writeLocalMembers(members: Member[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(members, null, 2), "utf-8");
}

async function generateMemberNumber(existing: Member[]): Promise<string> {
  const numbers = existing
    .map((m) => Number.parseInt(m.memberNumber.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `VW-${String(next).padStart(4, "0")}`;
}

async function loadBenefitUsagesForMember(
  memberId: string,
): Promise<MemberBenefitUsage[]> {
  if (await useSupabaseForMembers()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("member_benefit_usages")
      .select("*")
      .eq("member_id", memberId)
      .order("used_on", { ascending: false });

    if (error && error.message.includes("Could not find the table")) {
      return [];
    }

    if (error) {
      throw new Error(`Failed to load benefit usage: ${error.message}`);
    }

    return (data as BenefitUsageRow[]).map(rowToBenefitUsage);
  }

  const members = await readLocalMembers();
  const member = members.find((m) => m.id === memberId);
  return member?.benefitUsages ?? [];
}

async function loadPaymentsForMember(memberId: string): Promise<MemberPayment[]> {
  if (await useSupabaseForMembers()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("member_payments")
      .select("*")
      .eq("member_id", memberId)
      .order("payment_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to load payments: ${error.message}`);
    }

    return (data as PaymentRow[]).map(rowToPayment);
  }

  const members = await readLocalMembers();
  const member = members.find((m) => m.id === memberId);
  return member?.payments ?? [];
}

export async function getMembers(includeDetails = false): Promise<Member[]> {
  if (await useSupabaseForMembers()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("expires_at", { ascending: false });

    if (error) throw new Error(`Failed to load members: ${error.message}`);

    const members = (data as MemberRow[]).map((row) => rowToMember(row));

    if (!includeDetails) return members;

    return Promise.all(
      members.map(async (member) => ({
        ...member,
        payments: await loadPaymentsForMember(member.id),
        benefitUsages: await loadBenefitUsagesForMember(member.id),
      })),
    );
  }

  const members = await readLocalMembers();
  return includeDetails
    ? members
    : members.map(
        ({ payments: _payments, benefitUsages: _benefitUsages, ...member }) =>
          member,
      );
}

export async function getMemberByPhone(phone: string): Promise<Member | null> {
  const normalized = normalizePhoneDigits(phone);
  if (!normalized) return null;

  if (await useSupabaseForMembers()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("client_phone", normalized)
      .maybeSingle();

    if (error) throw new Error(`Failed to look up member: ${error.message}`);
    if (!data) return null;

    const memberId = (data as MemberRow).id;
    const payments = await loadPaymentsForMember(memberId);
    const benefitUsages = await loadBenefitUsagesForMember(memberId);
    return rowToMember(data as MemberRow, payments, benefitUsages);
  }

  const members = await readLocalMembers();
  const member = members.find((m) => m.clientPhone === normalized);
  return member ?? null;
}

export async function createMember(input: CreateMemberInput): Promise<Member> {
  const clientPhone = normalizePhoneDigits(input.clientPhone);
  const clientName = input.clientName.trim();
  const paymentDate = input.paymentDate;
  const amount = input.amount?.trim() || "R30";

  if (!clientName || !clientPhone || !paymentDate) {
    throw new Error("Name, phone, and payment date are required.");
  }

  const existing = await getMemberByPhone(clientPhone);
  if (existing) {
    throw new Error(
      "This phone number already has a membership. Record a renewal payment instead.",
    );
  }

  const expiresAt = addOneMonth(paymentDate);
  const payment: MemberPayment = {
    id: randomUUID(),
    memberId: "",
    paymentDate,
    amount,
    createdAt: new Date().toISOString(),
  };

  if (await useSupabaseForMembers()) {
    const allMembers = await getMembers();
    const memberNumber = await generateMemberNumber(allMembers);
    const memberId = randomUUID();
    payment.memberId = memberId;

    const member: Member = {
      id: memberId,
      memberNumber,
      clientName,
      clientPhone,
      lastPaymentDate: paymentDate,
      expiresAt,
      notes: input.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("members")
      .insert(memberToRow(member))
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create member: ${error.message}`);
    }

    const { error: paymentError } = await supabase
      .from("member_payments")
      .insert(paymentToRow(payment));

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }

    return rowToMember(data as MemberRow, [payment]);
  }

  const members = await readLocalMembers();
  const memberNumber = await generateMemberNumber(members);
  const memberId = randomUUID();
  payment.memberId = memberId;

  const member: Member = {
    id: memberId,
    memberNumber,
    clientName,
    clientPhone,
    lastPaymentDate: paymentDate,
    expiresAt,
    notes: input.notes?.trim() || null,
    createdAt: new Date().toISOString(),
    payments: [payment],
  };

  members.push(member);
  await writeLocalMembers(members);
  return member;
}

export async function recordMemberPayment(
  memberId: string,
  input: RecordPaymentInput,
): Promise<Member> {
  const paymentDate = input.paymentDate;
  const amount = input.amount?.trim() || "R30";

  if (!paymentDate) {
    throw new Error("Payment date is required.");
  }

  const expiresAt = addOneMonth(paymentDate);
  const payment: MemberPayment = {
    id: randomUUID(),
    memberId,
    paymentDate,
    amount,
    createdAt: new Date().toISOString(),
  };

  if (await useSupabaseForMembers()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("members")
      .update({
        last_payment_date: paymentDate,
        expires_at: expiresAt,
      })
      .eq("id", memberId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update member: ${error.message}`);
    }

    const { error: paymentError } = await supabase
      .from("member_payments")
      .insert(paymentToRow(payment));

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }

    const payments = await loadPaymentsForMember(memberId);
    const benefitUsages = await loadBenefitUsagesForMember(memberId);
    return rowToMember(data as MemberRow, payments, benefitUsages);
  }

  const members = await readLocalMembers();
  const index = members.findIndex((m) => m.id === memberId);
  if (index === -1) throw new Error("Member not found.");

  members[index] = {
    ...members[index],
    lastPaymentDate: paymentDate,
    expiresAt,
    payments: [payment, ...(members[index].payments ?? [])],
  };

  await writeLocalMembers(members);
  return members[index];
}

export async function recordBenefitUsage(
  memberId: string,
  input: RecordBenefitUsageInput,
  allowedBenefits: string[],
): Promise<Member> {
  const benefitName = input.benefitName.trim();
  const usedOn = input.usedOn ?? new Date().toISOString().slice(0, 10);

  if (!benefitName) {
    throw new Error("Benefit name is required.");
  }

  if (!allowedBenefits.includes(benefitName)) {
    throw new Error("Invalid membership benefit.");
  }

  const members = await getMembers(true);
  const member = members.find((m) => m.id === memberId);
  if (!member) {
    throw new Error("Member not found.");
  }

  if (getMembershipStatus(member.expiresAt) !== "active") {
    throw new Error("Membership is expired. Record a payment before logging benefits.");
  }

  const existing = getBenefitUsageForPeriod(
    member.benefitUsages ?? [],
    benefitName,
    member.lastPaymentDate,
    member.expiresAt,
  );

  if (existing) {
    throw new Error(
      `${benefitName} was already used on ${existing.usedOn} this membership month.`,
    );
  }

  const usage: MemberBenefitUsage = {
    id: randomUUID(),
    memberId,
    benefitName,
    usedOn,
    createdAt: new Date().toISOString(),
  };

  if (await useSupabaseForMembers()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("member_benefit_usages")
      .insert(benefitUsageToRow(usage));

    if (error) {
      throw new Error(`Failed to record benefit usage: ${error.message}`);
    }

    const { data, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (memberError) {
      throw new Error(`Failed to load member: ${memberError.message}`);
    }

    const payments = await loadPaymentsForMember(memberId);
    const benefitUsages = await loadBenefitUsagesForMember(memberId);
    return rowToMember(data as MemberRow, payments, benefitUsages);
  }

  const localMembers = await readLocalMembers();
  const index = localMembers.findIndex((m) => m.id === memberId);
  if (index === -1) throw new Error("Member not found.");

  localMembers[index] = {
    ...localMembers[index],
    benefitUsages: [usage, ...(localMembers[index].benefitUsages ?? [])],
  };

  await writeLocalMembers(localMembers);
  return localMembers[index];
}
