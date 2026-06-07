import { features } from "@/utils/SampleDate";

export default function Features() {
  return (
    <section id="features" className="bg-background">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-sky px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Storefront + dashboard, in one
          </p>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.05]">
            Everything you need to sell and fulfil
          </h2>
          <p className="mt-4 text-lg text-ink/60">
            KasaCart turns your social following into a real shop — customers order
            themselves, and you manage every sale from one place.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="group rounded-3xl border border-brand/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_24px_50px_-26px_rgba(10,28,77,0.4)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/8 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink/60">
                  {f.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
