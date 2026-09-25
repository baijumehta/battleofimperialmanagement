import { SubmitButton } from "@/app/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { isoDate } from "@/lib/format";
import { saveSettings } from "../actions";

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <div className="stack narrow">
      <h1>Event settings</h1>
      <form action={saveSettings} className="card stack">
        <div className="fields">
          <div className="field-full">
            <label>Event name</label>
            <input name="name" required defaultValue={s.name} />
          </div>
          <div>
            <label>Date</label>
            <input name="event_date" type="date" required defaultValue={isoDate(s.event_date)} />
          </div>
          <div>
            <label>Buy-out amount ($)</label>
            <input name="buyout_amount" type="number" min={0} step="1" defaultValue={Number(s.buyout_amount)} />
          </div>
          <div className="field-full">
            <label>Location</label>
            <input name="location" defaultValue={s.location} placeholder="Fields / school name" />
          </div>
          <div className="field-full">
            <label>Message on the parent sign-up page</label>
            <textarea name="signup_message" defaultValue={s.signup_message} />
          </div>
          <label className="check field-full">
            <input type="checkbox" name="signups_open" defaultChecked={s.signups_open} /> Parent sign-ups are open
          </label>
        </div>
        <div>
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </div>
  );
}
