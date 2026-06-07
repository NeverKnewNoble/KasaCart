import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import {
  convincingStats as stats,
  convincingWithout as without,
  convincingWithKasa as withKasa,
} from "@/utils/SampleDate";

export default function Convincing() {
  return (
    <section id="why" className="bg-ink text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/80">
            Why sellers switch to KasaCart
          </p>
          <h2 className="mx-auto mt-5 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-[2.8rem]">
            Your followers are ready to buy. Give them a place to.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
            Selling on social works — until the orders pile up in your chats and
            you lose track of who ordered what. KasaCart turns that mess into a
            real shop with a checkout, so you sell more and lose less.
          </p>
        </div>

        {/* before / after comparison */}
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/3 p-8 sm:p-10">
            <h3 className="font-display text-xl font-bold text-white/80">
              Selling in the DMs
            </h3>
            <p className="mt-1 text-sm text-white/45">The way it works today</p>
            <ul className="mt-6 space-y-4">
              {without.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-white/60">
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[0.95rem] text-white/65">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-brand-400/40 bg-brand/15 p-8 sm:p-10">
            <span className="absolute right-6 top-6 rounded-full bg-cyan px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-ink">
              The fix
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              With KasaCart
            </h3>
            <p className="mt-1 text-sm text-brand-200/80">A real store, in minutes</p>
            <ul className="mt-6 space-y-4">
              {withKasa.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[0.95rem] text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* stats band */}
        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink/40 px-6 py-8 text-center">
              <dt className="font-display text-4xl font-extrabold text-white sm:text-5xl">
                {s.value}
              </dt>
              <dd className="mt-2 text-sm text-white/55">{s.label}</dd>
            </div>
          ))}
        </dl>

        {/* CTA */}
        <div className="mt-12 rounded-3xl bg-brand px-6 py-12 text-center sm:px-12 sm:py-14">
          <h3 className="mx-auto max-w-2xl font-display text-2xl font-extrabold leading-tight sm:text-3xl">
            Ready to give your shop a real storefront?
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            Launch your store in minutes. Free to start — no card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-brand-700 transition-transform hover:-translate-y-0.5"
            >
              Create your free store
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
