"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("kc_sidebar_collapsed") === "1");
    setDark(localStorage.getItem("kc_theme") === "dark");
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("kc_sidebar_collapsed", next ? "1" : "0");
      return next;
    });

  const toggleTheme = () =>
    setDark((d) => {
      const next = !d;
      localStorage.setItem("kc_theme", next ? "dark" : "light");
      return next;
    });

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-canvas`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
      <main
        className={`transition-[padding] duration-200 ${
          collapsed ? "md:pl-19" : "md:pl-64"
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 md:px-10 md:pb-16 md:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
