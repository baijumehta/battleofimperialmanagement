export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

export function timeRange(start: string, end: string) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

// Neon returns `date` columns as JS Dates at UTC midnight; format in UTC so the day doesn't shift.
export function formatDate(d: Date | string | null, opts: Intl.DateTimeFormatOptions = {}) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00Z" : "")) : d;
  return date.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", ...opts });
}

export function isoDate(d: Date | string | null) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function money(n: number | string) {
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function daysUntil(d: Date | string) {
  const target = new Date(isoDate(d) + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export const EATERY_STATUSES = [
  ["not_contacted", "Not contacted"],
  ["contacted", "Contacted"],
  ["interested", "Interested"],
  ["booked", "Booked"],
  ["declined", "Declined"],
] as const;

export const SPONSOR_STATUSES = [
  ["prospect", "Prospect"],
  ["in_talks", "In talks"],
  ["confirmed", "Confirmed"],
  ["declined", "Declined"],
] as const;

export const SPONSOR_KINDS = [
  ["sponsor", "Sponsor"],
  ["vendor", "Vendor"],
  ["food", "Food / drink"],
  ["other", "Other"],
] as const;

export function label(list: readonly (readonly [string, string])[], value: string) {
  return list.find(([v]) => v === value)?.[1] ?? value;
}
