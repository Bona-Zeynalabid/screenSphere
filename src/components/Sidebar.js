"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./LayoutShell";

const NAV = [
  {
    href: "/",
    label: "Home",
    icon: "M3 12l9-9 9 9v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z",
  },
  {
    href: "/movies",
    label: "Movies",
    icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
  },
  {
    href: "/tv",
    label: "TV Shows",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    href: "/history",
    label: "History",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, isWatchPage } = useSidebar();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // On watch page: always off-canvas (drawer) on all viewports,
  //   only shown when mobileOpen === true.
  // On other pages: mobile drawer + desktop rail/expanded.
  const asideClasses = isWatchPage
    ? `w-60 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
    : `${
        collapsed ? "lg:w-[72px]" : "lg:w-60"
      } w-60 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`;

  return (
    <>
      {/* Overlay (mobile always, watch page on every viewport) */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 top-14 bg-black/60 z-40 ${
            isWatchPage ? "" : "lg:hidden"
          }`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-14 bottom-0 left-0 bg-[#0f0f0f] z-40
          transition-transform duration-200 overflow-y-auto no-scrollbar
          ${asideClasses}`}
      >
        <nav className="py-2">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const showRail =
              !isWatchPage && collapsed && !mobileOpen; // desktop rail mode

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-6 mx-2 px-3 py-2.5 rounded-lg transition
                  ${showRail ? "lg:flex-col lg:gap-1 lg:px-0 lg:py-4 lg:mx-1" : ""}
                  ${active ? "bg-[#272727]" : "hover:bg-[#272727]"}
                `}
              >
                <svg
                  className="w-6 h-6 shrink-0"
                  fill={active ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={active ? 0 : 1.8}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span
                  className={`text-sm ${active ? "font-semibold" : ""} ${
                    showRail ? "lg:text-[10px]" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}