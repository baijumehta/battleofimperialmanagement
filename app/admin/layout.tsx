import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./AdminNav";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/admin" className="brand">
            Battle on <span>Imperial</span>
          </Link>
          <AdminNav />
          <div className="row">
            <Link href="/" className="btn ghost sm" target="_blank">
              Volunteer sign-up page ↗
            </Link>
            <form action={logout}>
              <button className="btn ghost sm">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
