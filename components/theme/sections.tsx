import type { Invitation } from "@/components/builder/types";

export function formatDisplayDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function coupleName(invitation: Invitation): string {
  return [invitation.groom_name, invitation.bride_name]
    .filter(Boolean)
    .join(" & ");
}
