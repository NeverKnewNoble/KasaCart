"use client";

import { use } from "react";
import StoreFront from "@/components/ui_components/store/StoreFront";

/**
 * Public storefront — the page customers land on from a shared store link
 * (`/store/<handle>`). It lives outside the (portal) group so it has no
 * dashboard chrome and no auth gate: anyone with the link can browse and order.
 */
export default function StorePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  return <StoreFront handle={handle} />;
}
