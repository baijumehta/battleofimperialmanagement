import { redirect } from "next/navigation";
import { checkPassword, isSignedIn, startSession } from "@/lib/auth";

async function login(fd: FormData) {
  "use server";
  if (!checkPassword(String(fd.get("password") ?? ""))) redirect("/login?error=1");
  await startSession();
  redirect("/admin");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isSignedIn()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="container" style={{ maxWidth: 380, paddingTop: "15vh" }}>
      <form action={login} className="card stack">
        <h1>Organizer login</h1>
        {error && <div className="alert bad">That password didn’t work.</div>}
        <div>
          <label htmlFor="password">Team password</label>
          <input id="password" name="password" type="password" autoFocus required autoComplete="current-password" />
        </div>
        <button className="btn" style={{ width: "100%", justifyContent: "center" }}>
          Sign in
        </button>
      </form>
    </main>
  );
}
