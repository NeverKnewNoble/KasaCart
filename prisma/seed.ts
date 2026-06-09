// Seeds the demo store ("Adwoa's Closet") so the dashboard + storefront have data.
// Run with: yarn db:seed   (or it runs after `prisma migrate dev`).
//
// Idempotent: it upserts the user/store and rebuilds the store's catalogue,
// customers and orders on every run.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { OrderStatus, SalesChannel } from "../src/generated/prisma/enums";

// Demo login (dev only): adwoa@kasacart.demo / password123
const DEMO_PASSWORD = "password123";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

/** Cedis → integer pesewas. */
const ghs = (cedis: number) => Math.round(cedis * 100);
/** First whole number in a price/total string, e.g. "₵240" → 240. */
const firstInt = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? "0", 10) || 0;

const STORE = {
  name: "Adwoa's Closet",
  handle: "adwoascloset",
  tagline: "Affordable fashion, delivered across Accra",
  accentColor: "#1d4ed8",
  whatsappPhone: "233245550142",
  supportPhone: "+233 24 555 0142",
  location: "Accra, Ghana",
};

const CATEGORIES = ["Clothing", "Footwear", "Jewelry", "Bags"];

type SeedProduct = {
  name: string;
  category: string;
  basePrice: number; // cedis
  stock: number;
  sold: number;
  color: string;
  variants?: { size: string; price: number }[];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Blue Summer Dress",
    category: "Clothing",
    basePrice: 120,
    stock: 14,
    sold: 38,
    color: "#2563eb",
    variants: [
      { size: "S", price: 120 },
      { size: "M", price: 130 },
      { size: "L", price: 140 },
      { size: "XL", price: 150 },
    ],
  },
  {
    name: "Air Sneakers",
    category: "Footwear",
    basePrice: 350,
    stock: 6,
    sold: 24,
    color: "#0ea5e9",
    variants: [
      { size: "40", price: 350 },
      { size: "41", price: 350 },
      { size: "42", price: 360 },
      { size: "43", price: 360 },
      { size: "44", price: 370 },
    ],
  },
  { name: "Gold Earrings", category: "Jewelry", basePrice: 90, stock: 0, sold: 19, color: "#f59e0b" },
  { name: "Kente Tote Bag", category: "Bags", basePrice: 180, stock: 21, sold: 14, color: "#10b981" },
  { name: "Linen Shirt", category: "Clothing", basePrice: 160, stock: 9, sold: 11, color: "#6366f1" },
  { name: "Leather Sandals", category: "Footwear", basePrice: 190, stock: 3, sold: 8, color: "#8b5cf6" },
];

const CUSTOMERS = [
  { name: "Ama Mensah", phone: "+233 24 555 0142", via: "phone", color: "#2563eb" },
  { name: "Kofi Asante", email: "kofi.asante@gmail.com", via: "email", color: "#22d3ee" },
  { name: "Esi Boateng", phone: "+233 20 778 9921", via: "phone", color: "#1535b3" },
  { name: "Yaw Owusu", email: "yaw.owusu@gmail.com", via: "email", color: "#60a5fa" },
  { name: "Akua Darko", phone: "+233 27 334 1180", via: "phone", color: "#0ea5e9" },
  { name: "Nana Adjei", email: "nana.adjei@gmail.com", via: "email", color: "#4f46e5" },
] as const;

const ORDERS = [
  { id: "KC-2048", customer: "Ama Mensah", item: "Blue Summer Dress ×2", channel: "whatsapp", total: "₵240", paid: true, status: "pending" },
  { id: "KC-2047", customer: "Kofi Asante", item: "Air Sneakers", channel: "instagram", total: "₵350", paid: true, status: "confirmed" },
  { id: "KC-2046", customer: "Esi Boateng", item: "Gold Earrings", channel: "tiktok", total: "₵90", paid: false, status: "packed" },
  { id: "KC-2045", customer: "Yaw Owusu", item: "Kente Tote Bag", channel: "whatsapp", total: "₵180", paid: true, status: "delivered" },
  { id: "KC-2044", customer: "Akua Darko", item: "Beaded Bracelet ×3", channel: "facebook", total: "₵135", paid: true, status: "delivered" },
  { id: "KC-2043", customer: "Nana Adjei", item: "Linen Shirt", channel: "instagram", total: "₵160", paid: false, status: "confirmed" },
] as const;

async function main() {
  // 1. Seller — NextAuth credentials account. ADMIN so the role path is testable.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: "adwoa@kasacart.demo" },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: "adwoa@kasacart.demo",
      fullName: "Adwoa Owusu",
      passwordHash,
      role: "ADMIN",
    },
  });

  // 2. Store (brand) — upsert by unique handle.
  const store = await prisma.store.upsert({
    where: { handle: STORE.handle },
    update: { ...STORE, ownerId: user.id },
    create: { ...STORE, ownerId: user.id },
  });

  // 3. Notification prefs + subscription (one per store).
  await prisma.notificationPreferences.upsert({
    where: { storeId: store.id },
    update: {},
    create: { storeId: store.id },
  });
  await prisma.subscription.upsert({
    where: { storeId: store.id },
    update: {},
    create: { storeId: store.id, plan: "free", pricePesewas: 0 },
  });

  // 4. Reset this store's catalogue/customers/orders for a clean re-seed.
  await prisma.order.deleteMany({ where: { storeId: store.id } });
  await prisma.product.deleteMany({ where: { storeId: store.id } });
  await prisma.customer.deleteMany({ where: { storeId: store.id } });
  await prisma.category.deleteMany({ where: { storeId: store.id } });

  // 5. Categories.
  const categoryByName = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = await prisma.category.create({
      data: { storeId: store.id, name: CATEGORIES[i], position: i },
    });
    categoryByName.set(c.name, c.id);
  }

  // 6. Products (+ variants).
  const productByName = new Map<string, { id: string; price: number }>();
  for (const p of PRODUCTS) {
    const created = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categoryByName.get(p.category) ?? null,
        name: p.name,
        basePricePesewas: ghs(p.basePrice),
        stock: p.stock,
        sold: p.sold,
        color: p.color,
        variants: p.variants
          ? {
              create: p.variants.map((v, idx) => ({
                size: v.size,
                pricePesewas: ghs(v.price),
                position: idx,
              })),
            }
          : undefined,
      },
    });
    productByName.set(p.name, { id: created.id, price: ghs(p.basePrice) });
  }

  // 7. Customers.
  const customerByName = new Map<string, string>();
  for (const c of CUSTOMERS) {
    const [firstName, ...rest] = c.name.split(" ");
    const created = await prisma.customer.create({
      data: {
        storeId: store.id,
        firstName,
        lastName: rest.join(" ") || null,
        email: "email" in c ? c.email : null,
        phone: "phone" in c ? c.phone : null,
        preferredContact: c.via,
        color: c.color,
      },
    });
    customerByName.set(c.name, created.id);
  }

  // 8. Orders (+ one line item + a status event each).
  for (const o of ORDERS) {
    const match = o.item.match(/^(.*?)(?:\s*×\s*(\d+))?$/);
    const itemName = match?.[1]?.trim() ?? o.item;
    const qty = parseInt(match?.[2] ?? "1", 10) || 1;
    const totalPesewas = ghs(firstInt(o.total));
    const unit = Math.round(totalPesewas / qty);
    const product = productByName.get(itemName);

    await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customerByName.get(o.customer) ?? null,
        orderNumber: o.id,
        status: o.status as OrderStatus,
        channel: o.channel as SalesChannel,
        paymentStatus: o.paid ? "paid" : "unpaid",
        subtotalPesewas: totalPesewas,
        totalPesewas,
        customerName: o.customer,
        items: {
          create: [
            {
              productId: product?.id ?? null,
              productName: itemName,
              unitPricePesewas: unit,
              quantity: qty,
              lineTotalPesewas: unit * qty,
            },
          ],
        },
        statusEvents: {
          create: [{ status: o.status as OrderStatus }],
        },
      },
    });
  }

  console.log(
    `Seeded store "${store.name}" (@${store.handle}) with ${PRODUCTS.length} products, ` +
      `${CUSTOMERS.length} customers and ${ORDERS.length} orders.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
