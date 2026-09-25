"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/shifts", "Shifts"],
  ["/admin/volunteers", "Volunteers"],
  ["/admin/eateries", "Eateries"],
  ["/admin/sponsors", "Sponsors"],
  ["/admin/tasks", "Tasks"],
  ["/admin/team", "Team"],
  ["/admin/settings", "Settings"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="nav">
      {LINKS.map(([href, text]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            {text}
          </Link>
        );
      })}
    </nav>
  );
}
