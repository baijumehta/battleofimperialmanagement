"use client";

import { useActionState, useState } from "react";
import { VOLUNTEER_TYPES } from "@/lib/format";
import { submitSignup, type SignupResult } from "./actions";

type Shift = {
  id: number;
  area: string;
  title: string;
  description: string;
  time: string;
  open: number;
};

export function SignupForm({ shifts }: { shifts: Shift[] }) {
  const [state, action, pending] = useActionState<SignupResult, FormData>(submitSignup, null);
  const [type, setType] = useState("");

  if (state?.ok) {
    return (
      <div className="card stack">
        <h2>Thanks, {state.name}!</h2>
        <p>You’re signed up for:</p>
        <ul>
          {state.shifts.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {state.student && (
          <p>
            We’ll track your hours when you check in on tournament day. Bring your school’s volunteer-hours form and an
            organizer will sign it after your shift.
          </p>
        )}
        <p className="muted">An organizer will reach out closer to the tournament with details.</p>
        <div>
          <button className="btn secondary" onClick={() => location.reload()}>
            Sign up someone else
          </button>
        </div>
      </div>
    );
  }

  const areas = [...new Set(shifts.map((s) => s.area))];
  const student = type === "student";
  const family = type === "parent" || type === "sibling";

  return (
    <form action={action} className="stack">
      {state && !state.ok && <div className="alert bad">{state.error}</div>}

      <div className="card stack">
        <h2>About you</h2>
        <div>
          <label>I’m a… *</label>
          <div className="shift-list">
            {VOLUNTEER_TYPES.map(([key, text]) => (
              <label key={key} className="shift-option">
                <input
                  type="radio"
                  name="volunteer_type"
                  value={key}
                  required
                  checked={type === key}
                  onChange={() => setType(key)}
                />
                <span>{text}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="fields">
          <div>
            <label htmlFor="name">Your name *</label>
            <input id="name" name="name" required autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="phone">Mobile phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          {student && (
            <div>
              <label htmlFor="school">School & grade *</label>
              <input id="school" name="school" required placeholder="e.g. Imperial High, 11th" />
            </div>
          )}
          {family && (
            <>
              <div>
                <label htmlFor="player_name">Player’s name</label>
                <input id="player_name" name="player_name" />
              </div>
              <div>
                <label htmlFor="team">Player’s team</label>
                <input id="team" name="team" placeholder="e.g. 10U Boys" />
              </div>
            </>
          )}
        </div>
        {student && (
          <p className="muted" style={{ margin: 0 }}>
            Organizers record the hours you work, so you can get your volunteer hours signed off.
          </p>
        )}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        />
      </div>

      <div className="card stack">
        <h2>Pick your shifts</h2>
        {shifts.length === 0 ? (
          <p className="muted">Shifts haven’t been posted yet. Check back soon!</p>
        ) : (
          areas.map((area) => (
            <div key={area}>
              <h3>{area}</h3>
              <div className="shift-list">
                {shifts
                  .filter((s) => s.area === area)
                  .map((s) => (
                    <label key={s.id} className={`shift-option${s.open <= 0 ? " disabled" : ""}`}>
                      <input type="checkbox" name="shift" value={s.id} disabled={s.open <= 0} />
                      <span style={{ flex: 1 }}>
                        <strong>{s.title}</strong> <span className="muted">· {s.time}</span>
                        {s.description && (
                          <>
                            <br />
                            <small>{s.description}</small>
                          </>
                        )}
                      </span>
                      <span className={`badge ${s.open <= 0 ? "" : s.open <= 1 ? "warn" : "ok"}`}>
                        {s.open <= 0 ? "Full" : `${s.open} open`}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))
        )}

        <div>
          <label htmlFor="notes">Anything we should know?</label>
          <textarea id="notes" name="notes" placeholder="Skills, availability, questions…" />
        </div>
      </div>

      <button className="btn" disabled={pending} style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
        {pending ? "Submitting…" : "Sign up"}
      </button>
    </form>
  );
}
