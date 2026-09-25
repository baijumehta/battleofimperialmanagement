import { OrganizerSelect } from "@/app/components/OrganizerSelect";
import type { Organizer, ShiftRow } from "@/lib/data";
import { isoDate } from "@/lib/format";

export function ShiftFields({ shift, organizers, areas }: { shift?: ShiftRow; organizers: Organizer[]; areas: string[] }) {
  return (
    <div className="fields">
      {shift && <input type="hidden" name="id" value={shift.id} />}
      <div>
        <label>Area</label>
        <input name="area" required defaultValue={shift?.area} list="shift-areas" placeholder="e.g. Concessions" />
        <datalist id="shift-areas">
          {areas.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>
      <div>
        <label>Shift name</label>
        <input name="title" required defaultValue={shift?.title} placeholder="e.g. Snack bar (AM)" />
      </div>
      <div>
        <label>Date</label>
        <input name="shift_date" type="date" defaultValue={shift ? isoDate(shift.shift_date) : ""} />
      </div>
      <div>
        <label>Start</label>
        <input name="start_time" type="time" required defaultValue={shift?.start_time.slice(0, 5)} />
      </div>
      <div>
        <label>End</label>
        <input name="end_time" type="time" required defaultValue={shift?.end_time.slice(0, 5)} />
      </div>
      <div>
        <label>People needed</label>
        <input name="slots" type="number" min={1} required defaultValue={shift?.slots ?? 2} />
      </div>
      <div>
        <label>Organizer lead</label>
        <OrganizerSelect name="lead_id" organizers={organizers} value={shift?.lead_id} emptyLabel="No lead" />
      </div>
      <div className="field-full">
        <label>Description (shown to parents)</label>
        <input name="description" defaultValue={shift?.description} />
      </div>
    </div>
  );
}
