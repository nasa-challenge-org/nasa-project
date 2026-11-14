"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/",
    label: "Home",
    hint: "Start here",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 12l9-8 9 8M5 10v10h14V10"
      />
    ),
  },
  {
    href: "/sites",
    label: "Candidates",
    hint: "Pick a site",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11zM12 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
      />
    ),
  },
  {
    href: "/dashboard",
    label: "Mission",
    hint: "Sun & Earth",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4m12.8-12.8l1.4-1.4M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
  },
  {
    href: "/compare",
    label: "Compare",
    hint: "Same clock",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 19V9M12 19V5M17 19v-7"
      />
    ),
  },
  {
    href: "/methodology",
    label: "Sources",
    hint: "Data used",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 4h10M7 8h10M7 12h6M6 20h12a1 1 0 001-1V5a1 1 0 00-1-1H6a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    ),
  },
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
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  active
                    ? "bg-cyan-400/15 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <svg
                  className={`h-5 w-5 shrink-0 ${
                    active ? "text-cyan-300" : "text-slate-500"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {link.icon}
                </svg>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{link.label}</span>
                  <span className="block text-[11px] text-slate-500">
                    {link.hint}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
