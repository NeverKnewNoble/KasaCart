import Link from "next/link";
import { navLinks as links } from "@/utils/SampleDate";
import NavAuth from "./NavAuth";

export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-5">
      <nav className="flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-brand/15 bg-white py-2 pl-4 pr-2 shadow-[0_8px_30px_-18px_rgba(10,28,77,0.35)]">
        {/* brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="font-display text-[1.15rem] font-extrabold tracking-tight text-ink">
            Kasa<span className="text-brand">Cart</span>
          </span>
        </Link>

        {/* center links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink/65 transition-colors hover:bg-brand/8 hover:text-brand"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* auth */}
        <div className="flex shrink-0 items-center gap-2.5">
          <NavAuth />
        </div>
      </nav>
    </div>
  );
}
