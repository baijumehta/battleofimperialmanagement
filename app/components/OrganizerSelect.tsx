import type { Organizer } from "@/lib/data";

export function OrganizerSelect({
  name,
  organizers,
  value,
  emptyLabel = "Unassigned",
}: {
  name: string;
  organizers: Organizer[];
  value?: number | null;
  emptyLabel?: string;
}) {
  return (
    <select name={name} defaultValue={value ?? ""}>
      <option value="">{emptyLabel}</option>
      {organizers.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
