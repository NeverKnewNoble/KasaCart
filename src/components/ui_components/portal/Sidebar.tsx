"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Store,
  Users,
  Wallet,
  BarChart3,
  Settings,
  ExternalLink,
  Home,
  Menu,
  X,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "@/types/portal";


const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Products", href: "/products", icon: Tag },
  { label: "Storefront", href: "/storefront", icon: Store },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function Wordmark() {
  return (
    <span className="font-display text-[1.25rem] font-extrabold tracking-tight text-fg">
      Kasa<span className="text-brand">Cart</span>
    </span>
  );
}

function Logo() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand font-display text-base font-extrabold text-white">
      K
    </span>
  );
}

function NavLinks({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
              collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
            } ${
              active
                ? "bg-brand text-white shadow-[0_8px_18px_-10px_rgba(29,78,216,0.9)]"
                : "text-fg/65 hover:bg-brand/8 hover:text-brand"
            }`}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
            {!collapsed && label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBlock({ collapsed }: { collapsed: boolean }) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.fullName || user?.username || "Your account";

  if (collapsed) {
    return (
      <div className="flex justify-center" title={email || name}>
        <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand/10 bg-surface px-3 py-2.5">
      <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{name}</p>
        <p className="truncate text-xs text-fg/50">{email}</p>
      </div>
    </div>
  );
}

function FooterButton({
  collapsed,
  label,
  icon: Icon,
  onClick,
  href,
  title,
}: {
  collapsed: boolean;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  title?: string;
}) {
  const cls = `flex items-center rounded-xl border border-brand/12 text-sm font-medium text-fg/70 transition-colors hover:border-brand/30 hover:text-brand ${
    collapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
  }`;
  const content = collapsed ? (
    <Icon className="h-4 w-4" strokeWidth={1.8} />
  ) : (
    <>
      {label}
      <Icon className="h-4 w-4" strokeWidth={1.8} />
    </>
  );
  if (href) {
    return (
      <a href={href} title={title} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <button onClick={onClick} title={title} className={`w-full ${cls}`}>
      {content}
    </button>
  );
}

function SidebarBody({
  pathname,
  collapsed,
  dark,
  onToggle,
  onToggleTheme,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  dark: boolean;
  onToggle?: () => void;
  onToggleTheme: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6 p-3">
      {/* brand + collapse toggle */}
      <div
        className={`flex items-center pt-1 ${
          collapsed ? "flex-col gap-3" : "justify-between px-1"
        }`}
      >
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          {collapsed ? <Logo /> : <Wordmark />}
        </Link>
        {onToggle && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-8 w-8 place-items-center rounded-lg text-fg/45 transition-colors hover:bg-brand/8 hover:text-brand md:grid"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5" strokeWidth={1.8} />
            ) : (
              <PanelLeftClose className="h-4.5 w-4.5" strokeWidth={1.8} />
            )}
          </button>
        )}
      </div>

      <NavLinks pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />

      <div className="space-y-2 border-t border-brand/10 pt-3">
        <FooterButton
          collapsed={collapsed}
          label="Home"
          icon={Home}
          href="/"
          title="Go to home page"
        />
        <FooterButton
          collapsed={collapsed}
          label={dark ? "Light mode" : "Dark mode"}
          icon={dark ? Sun : Moon}
          onClick={onToggleTheme}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        />
        <FooterButton
          collapsed={collapsed}
          label="View storefront"
          icon={ExternalLink}
          href="/"
          title="View storefront"
        />
        <AccountBlock collapsed={collapsed} />
      </div>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
  dark,
  onToggleTheme,
}: {
  collapsed: boolean;
  onToggle: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-brand/10 bg-surface px-4 md:hidden">
        <Link href="/dashboard">
          <Wordmark />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-brand/12 text-fg/70"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-fg/60 hover:bg-brand/8"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody
              pathname={pathname}
              collapsed={false}
              dark={dark}
              onToggleTheme={onToggleTheme}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 hidden border-r border-brand/10 bg-surface transition-[width] duration-200 md:block ${
          collapsed ? "w-19" : "w-64"
        }`}
      >
        <SidebarBody
          pathname={pathname}
          collapsed={collapsed}
          dark={dark}
          onToggle={onToggle}
          onToggleTheme={onToggleTheme}
        />
      </aside>
    </>
  );
}
