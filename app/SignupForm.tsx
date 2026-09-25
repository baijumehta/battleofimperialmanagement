"use client";

import { useActionState, useState } from "react";
import { submitSignup, type SignupResult } from "./actions";

type Shift = {
  id: number;
  area: string;
  title: string;
  description: string;
  time: string;
  open: number;
};

export function SignupForm({ shifts, buyoutLabel }: { shifts: Shift[]; buyoutLabel: string }) {
  const [state, action, pending] = useActionState<SignupResult, FormData>(submitSignup, null);
  const [choice, setChoice] = useState<"shifts" | "buyout">("shifts");

  if (state?.ok) {
    return (
      <div className="card stack">
        <h2>Thanks, {state.name}!</h2>
        {state.buyout ? (
          <p>You’re down for the {buyoutLabel} buy-out. An organizer will follow up about payment.</p>
        ) : (
          <>
            <p>You’re signed up for:</p>
            <ul>
              {state.shifts.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="muted">An organizer will reach out closer to the tournament with details.</p>
          </>
        )}
        <div>
          <button className="btn secondary" onClick={() => location.reload()}>
            Sign up someone else
          </button>
        </div>
      </div>
    );
  }

  const areas = [...new Set(shifts.map((s) => s.area))];

  return (
    <form action={action} className="stack">
      {state && !state.ok && <div className="alert bad">{state.error}</div>}

      <div className="card">
        <h2>Your info</h2>
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
          <div>
            <label htmlFor="player_name">Player’s name</label>
            <input id="player_name" name="player_name" />
          </div>
          <div>
            <label htmlFor="team">Team / grade</label>
            <input id="team" name="team" placeholder="e.g. 10U Boys" />
          </div>
        </div>
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        />
      </div>

      <div className="card stack">
        <h2>How will you help?</h2>
        <div className="row" style={{ gap: "1.25rem" }}>
          <label className="check">
            <input type="radio" name="choice" value="shifts" checked={choice === "shifts"} onChange={() => setChoice("shifts")} />
            I’ll volunteer for a shift
          </label>
          <label className="check">
            <input type="radio" name="choice" value="buyout" checked={choice === "buyout"} onChange={() => setChoice("buyout")} />
            I’ll do the {buyoutLabel} buy-out instead
          </label>
        </div>

        {choice === "shifts" &&
          (shifts.length === 0 ? (
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
          ))}

        <div>
          <label htmlFor="notes">Anything we should know?</label>
          <textarea id="notes" name="notes" placeholder="Skills, availability, questions…" />
        </div>
      </div>

      <button className="btn" disabled={pending} style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
