import Link from "next/link";
import { footerColumns as columns, footerSocials as socials } from "@/utils/SampleDate";

export default function Footer() {
  return (
    <footer id="footer" className="mt-auto border-t border-brand/10 bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* brand block */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-ink">
                Kasa<span className="text-brand">Cart</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-ink/55">
              The storefront and order dashboard for social sellers — give
              customers a place to order, and manage every sale in one place.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-brand/12 bg-white text-ink/60 transition-colors hover:border-brand/30 hover:bg-brand hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  {col.heading}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-[0.92rem] text-ink/65 transition-colors hover:text-brand"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-brand/10 pt-7 sm:flex-row">
          <p className="text-sm text-ink/45">
            © {new Date().getFullYear()} KasaCart. Built for social sellers.
          </p>
          {/* <p className="flex items-center gap-2 text-sm text-ink/45">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            All systems operational
          </p> */}
        </div>
      </div>
    </footer>
  );
}
