"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isWatchPage = pathname?.startsWith("/watch") ?? false;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  // Reset drawer when the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed, isWatchPage }}
    >
      <Header />
      <Sidebar />
      <main
        className={`pt-14 min-h-screen bg-[#0f0f0f] transition-all duration-200 ${
          isWatchPage ? "" : collapsed ? "lg:pl-[72px]" : "lg:pl-60"
        }`}
      >
        {children}
      </main>
    </SidebarContext.Provider>
  );
}