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
      <form action={saveSettings} className="stack">
        <div className="card stack">
          <h2>Event</h2>
          <div className="fields">
            <div className="field-full">
              <label>Event name</label>
              <input name="name" required defaultValue={s.name} />
            </div>
            <div>
              <label>Date</label>
              <input name="event_date" type="date" required defaultValue={isoDate(s.event_date)} />
            </div>
            <div className="field-full">
              <label>Location (shown on the sign-up page)</label>
              <input name="location" defaultValue={s.location} placeholder="Fields / school name" />
            </div>
          </div>
        </div>

        <div className="card stack">
          <h2>Public contact</h2>
          <div className="fields">
            <div>
              <label>Website</label>
              <input name="website" defaultValue={s.website} />
            </div>
            <div>
              <label>Email</label>
              <input name="contact_email" type="email" defaultValue={s.contact_email} />
            </div>
            <div>
              <label>Phone</label>
              <input name="contact_phone" type="tel" defaultValue={s.contact_phone} />
            </div>
          </div>
        </div>

        <div className="card stack">
          <div>
            <h2>Emergency information</h2>
            <p className="muted" style={{ margin: 0 }}>
              Confirm with the facility representative before event day. Shown at the top of the Day-of page for organizers
              only.
            </p>
          </div>
          <div className="fields">
            <div className="field-full">
              <label>Venue street address (for 911)</label>
              <input name="venue_address" defaultValue={s.venue_address} />
            </div>
            <div className="field-full">
              <label>Ambulance access point</label>
              <input name="ambulance_access" defaultValue={s.ambulance_access} placeholder="Gate / driveway responders should use" />
            </div>
            <div className="field-full">
              <label>AED locations</label>
              <input name="aed_locations" defaultValue={s.aed_locations} />
            </div>
            <div>
              <label>Medical area</label>
              <input name="medical_area" defaultValue={s.medical_area} />
            </div>
            <div>
              <label>Shelter / assembly location</label>
              <input name="shelter_location" defaultValue={s.shelter_location} />
            </div>
          </div>
        </div>

        <div className="card stack">
          <h2>Sign-up page</h2>
          <div className="fields">
            <div className="field-full">
              <label>Message on the volunteer sign-up page</label>
              <textarea name="signup_message" defaultValue={s.signup_message} />
            </div>
            <label className="check field-full">
              <input type="checkbox" name="signups_open" defaultChecked={s.signups_open} /> Volunteer sign-ups are open
            </label>
          </div>
        </div>

        <div>
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </div>
  );
}
