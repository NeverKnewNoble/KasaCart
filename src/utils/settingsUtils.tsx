
export const currencies = [
  { value: "GHS", label: "GHS (₵) — Ghana Cedi" },
  { value: "USD", label: "USD ($) — US Dollar" },
  { value: "GBP", label: "GBP (£) — British Pound" },
];

export const notifications = [
  { label: "New order placed", desc: "Get notified the moment a customer checks out", on: true },
  { label: "Low stock alerts", desc: "When a product drops below 5 in stock", on: true },
  { label: "New customer", desc: "When someone orders from your store for the first time", on: false },
  { label: "Weekly summary", desc: "A recap of your sales every Monday", on: false },
];

export function Toggle({ defaultOn }: { defaultOn: boolean }) {
  return (
    <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-fg/15 transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-2" />
      <span className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}