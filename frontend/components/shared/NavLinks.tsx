"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/sites", label: "Candidates" },
  { href: "/dashboard", label: "Mission" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Sources" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-3 text-sm" aria-label="Primary">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-cyan-300 underline decoration-cyan-700 underline-offset-4"
                : "text-slate-200 hover:text-cyan-300"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
