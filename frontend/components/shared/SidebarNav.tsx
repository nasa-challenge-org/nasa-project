"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/sites", label: "Candidates" },
  { href: "/dashboard", label: "Mission" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Sources" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Primary">
      <ul className="space-y-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`block rounded-2xl px-3 py-2.5 text-sm ${
                  active
                    ? "bg-[#2563eb]/30 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
