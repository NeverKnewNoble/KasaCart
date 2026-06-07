// Centralised sample/mock data for every page in KasaCart.
// Pages and components import from here so the demo content lives in one place.

import {
  Store,
  Share2,
  ShoppingCart,
  CreditCard,
  Package,
  LayoutDashboard,
  Clock,
  Tag,
  Users,
  Repeat,
  UserPlus,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type { Feature } from "@/types/home";
import type { RecentOrder } from "@/types/dashboard";
import type { Order } from "@/types/orders";
import type { Product } from "@/types/products";
import type { Customer } from "@/types/customers";

/* ------------------------------------------------------------------ */
/* Home — Navbar                                                       */
/* ------------------------------------------------------------------ */

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Why KasaCart", href: "#why" },
  { label: "Contact", href: "#footer" },
];

/* ------------------------------------------------------------------ */
/* Home — Hero                                                         */
/* ------------------------------------------------------------------ */

export const heroPlatforms = [
  { name: "WhatsApp", color: "#25D366", path: "M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.1 14.2c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3.2-.9-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" },
  { name: "Instagram", color: "#E1306C", path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z" },
  { name: "TikTok", color: "#111", path: "M16.5 2c.3 2 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v6.6a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V2h2.8Z" },
  { name: "Facebook", color: "#1877F2", path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" },
  { name: "Snapchat", color: "#F7B500", path: "M12 2c2.3 0 4.2 1.7 4.4 4 .1.9 0 1.8 0 2.4 0 .3.2.4.4.4.4 0 .9-.3 1.2-.3.4 0 .8.3.8.7 0 .6-.9.9-1.6 1.2-.3.1-.6.2-.6.5 0 .5 2 2.9 3.6 3.2.3 0 .5.3.5.5 0 .6-1.4 1-2.1 1.1-.2 0-.3.2-.3.4-.1.5-.1.8-.5.8-.5 0-1.1-.3-1.9-.1-.7.2-1.4 1.2-3.4 1.2s-2.6-1-3.4-1.2c-.8-.2-1.4.1-1.9.1-.4 0-.4-.3-.5-.8 0-.2-.1-.4-.3-.4-.7-.1-2.1-.5-2.1-1.1 0-.2.2-.5.5-.5 1.6-.3 3.6-2.7 3.6-3.2 0-.3-.3-.4-.6-.5-.7-.3-1.6-.6-1.6-1.2 0-.4.4-.7.8-.7.3 0 .8.3 1.2.3.2 0 .4-.1.4-.4 0-.6-.1-1.5 0-2.4.2-2.3 2.1-4 4.4-4Z" },
];

export const heroAvatars = [
  { initial: "A", color: "#2563eb" },
  { initial: "K", color: "#22d3ee" },
  { initial: "E", color: "#1535b3" },
  { initial: "Y", color: "#60a5fa" },
];

/* ------------------------------------------------------------------ */
/* Home — Features                                                     */
/* ------------------------------------------------------------------ */

// Feature type lives in @/types/home

export const features: Feature[] = [
  {
    icon: Store,
    title: "Your own storefront",
    body: "Spin up a clean, branded shop in minutes — no website, no developer. Add products, photos and prices, and you're open for business.",
  },
  {
    icon: Share2,
    title: "One link, shared anywhere",
    body: "Drop your store link in your WhatsApp status, IG bio or TikTok and let followers shop straight away.",
  },
  {
    icon: ShoppingCart,
    title: "Customers order themselves",
    body: "Buyers pick items, sizes and quantities and check out on their own — no more back-and-forth in the DMs.",
  },
  {
    icon: CreditCard,
    title: "Get paid your way",
    body: "Take payment however you already do — mobile money, bank transfer or cash on delivery — then mark each order paid in your dashboard.",
  },
  {
    icon: Package,
    title: "Stock that stays honest",
    body: "Inventory updates with every sale, so your storefront never sells what you've already run out of.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard to fulfil it all",
    body: "Track every order from new to delivered, update statuses, and see best-sellers and revenue — all in one place.",
  },
];

/* ------------------------------------------------------------------ */
/* Home — Convincing                                                   */
/* ------------------------------------------------------------------ */

export const convincingStats = [
  { value: "5 min", label: "to launch your store" },
  { value: "24/7", label: "storefront always open" },
  { value: "0", label: "orders lost in DMs" },
  { value: "1", label: "dashboard for everything" },
];

export const convincingWithout = [
  "Orders buried across WhatsApp, IG and TikTok chats",
  "No clear record of who paid and who didn't",
  "Back-and-forth on every size, colour and price",
  "Overselling items that already ran out",
  "No idea which products actually make you money",
];

export const convincingWithKasa = [
  "One storefront link customers order from",
  "Mark each order paid once payment lands, your way",
  "Customers pick items, sizes and quantities themselves",
  "Stock that updates with every single sale",
  "A dashboard showing best-sellers and revenue",
];

/* ------------------------------------------------------------------ */
/* Home — Footer                                                       */
/* ------------------------------------------------------------------ */

export const footerColumns = [
  {
    heading: "Product",
    links: ["Storefront", "Order dashboard", "Order tracking", "Inventory", "Pricing"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    heading: "Resources",
    links: ["Help center", "Seller guide", "API docs", "Status"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "Cookies"],
  },
];

export const footerSocials = [
  { name: "Instagram", path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z" },
  { name: "TikTok", path: "M16.5 2c.3 2 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v6.6a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V2h2.8Z" },
  { name: "WhatsApp", path: "M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.1 14.2c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3.2-.9-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" },
];

/* ------------------------------------------------------------------ */
/* Portal — shared                                                     */
/* ------------------------------------------------------------------ */

export const orderStatusStyle: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600",
  New: "bg-brand/10 text-brand-700",
  Confirmed: "bg-brand/10 text-brand-700",
  Packed: "bg-raised text-brand-700",
  Delivered: "bg-emerald-50 text-emerald-600",
};

/* ------------------------------------------------------------------ */
/* Portal — Dashboard                                                  */
/* ------------------------------------------------------------------ */

export const dashboardWeek = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 50 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 95 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 72 },
];

export const dashboardKpis: { label: string; value: string; sub: string; icon: LucideIcon }[] = [
  { label: "Awaiting fulfilment", value: "5", sub: "2 overdue", icon: Clock },
  { label: "Products live", value: "24", sub: "+2 this week", icon: Tag },
];

export const orderPipeline: { stage: string; count: number; color: string }[] = [
  { stage: "New", count: 3, color: "#1d4ed8" },
  { stage: "Confirmed", count: 4, color: "#22d3ee" },
  { stage: "Packed", count: 2, color: "#f59e0b" },
  { stage: "Delivered", count: 18, color: "#10b981" },
];

// RecentOrder type lives in @/types/dashboard

export const recentOrders: RecentOrder[] = [
  { id: "KC-2048", customer: "Ama Mensah", item: "Blue Summer Dress ×2", total: "₵240", status: "New", time: "2m ago", color: "#2563eb" },
  { id: "KC-2047", customer: "Kofi Asante", item: "Air Sneakers", total: "₵350", status: "Confirmed", time: "18m ago", color: "#22d3ee" },
  { id: "KC-2046", customer: "Esi Boateng", item: "Gold Earrings", total: "₵90", status: "Packed", time: "1h ago", color: "#1535b3" },
  { id: "KC-2045", customer: "Yaw Owusu", item: "Kente Tote Bag", total: "₵180", status: "Delivered", time: "3h ago", color: "#60a5fa" },
  { id: "KC-2044", customer: "Akua Darko", item: "Beaded Bracelet ×3", total: "₵135", status: "Delivered", time: "5h ago", color: "#0ea5e9" },
];

export const topProducts = [
  { name: "Air Sneakers", sold: 24, revenue: "₵8,400" },
  { name: "Blue Summer Dress", sold: 38, revenue: "₵4,560" },
  { name: "Kente Tote Bag", sold: 14, revenue: "₵2,520" },
  { name: "Gold Earrings", sold: 19, revenue: "₵1,710" },
];

/* ------------------------------------------------------------------ */
/* Portal — Orders                                                     */
/* ------------------------------------------------------------------ */

// Order type lives in @/types/orders

export const orders: Order[] = [
  { id: "KC-2048", customer: "Ama Mensah", item: "Blue Summer Dress ×2", channel: "WhatsApp", total: "₵240", paid: true, status: "Pending", date: "Today, 2:14 PM" },
  { id: "KC-2047", customer: "Kofi Asante", item: "Air Sneakers", channel: "Instagram", total: "₵350", paid: true, status: "Confirmed", date: "Today, 1:58 PM" },
  { id: "KC-2046", customer: "Esi Boateng", item: "Gold Earrings", channel: "TikTok", total: "₵90", paid: false, status: "Packed", date: "Today, 1:10 PM" },
  { id: "KC-2045", customer: "Yaw Owusu", item: "Kente Tote Bag", channel: "WhatsApp", total: "₵180", paid: true, status: "Delivered", date: "Today, 11:02 AM" },
  { id: "KC-2044", customer: "Akua Darko", item: "Beaded Bracelet ×3", channel: "Facebook", total: "₵135", paid: true, status: "Delivered", date: "Today, 9:31 AM" },
  { id: "KC-2043", customer: "Nana Adjei", item: "Linen Shirt", channel: "Instagram", total: "₵160", paid: false, status: "Confirmed", date: "Yesterday, 6:45 PM" },
  { id: "KC-2042", customer: "Abena Sarpong", item: "Ankara Skirt ×2", channel: "WhatsApp", total: "₵220", paid: true, status: "Delivered", date: "Yesterday, 4:20 PM" },
  { id: "KC-2041", customer: "Kwesi Appiah", item: "Leather Sandals", channel: "TikTok", total: "₵190", paid: true, status: "Delivered", date: "Yesterday, 2:05 PM" },
];

/* ------------------------------------------------------------------ */
/* Portal — Products                                                   */
/* ------------------------------------------------------------------ */

// Product type lives in @/types/products

export const products: Product[] = [
  {
    name: "Blue Summer Dress",
    price: "₵120 – ₵150",
    stock: 14,
    sold: 38,
    color: "#2563eb",
    category: "Clothing",
    variants: [
      { size: "S", price: 120 },
      { size: "M", price: 130 },
      { size: "L", price: 140 },
      { size: "XL", price: 150 },
    ],
  },
  {
    name: "Air Sneakers",
    price: "₵350",
    stock: 6,
    sold: 24,
    color: "#0ea5e9",
    category: "Footwear",
    variants: [
      { size: "40", price: 350 },
      { size: "41", price: 350 },
      { size: "42", price: 360 },
      { size: "43", price: 360 },
      { size: "44", price: 370 },
    ],
  },
  { name: "Gold Earrings", price: "₵90", stock: 0, sold: 19, color: "#f59e0b", category: "Jewelry" },
  { name: "Kente Tote Bag", price: "₵180", stock: 21, sold: 14, color: "#10b981", category: "Bags" },
  { name: "Linen Shirt", price: "₵160", stock: 9, sold: 11, color: "#6366f1", category: "Clothing" },
  { name: "Leather Sandals", price: "₵190", stock: 3, sold: 8, color: "#8b5cf6", category: "Footwear" },
];

/**
 * Default store profile for the public storefront. In a real build this would
 * come from the seller's saved settings; until that's persisted we share one
 * profile between the dashboard preview and the live `/store/[handle]` page.
 */
export const storeProfile = {
  name: "Adwoa's Closet",
  tagline: "Affordable fashion, delivered across Accra",
  handle: "adwoascloset",
  accent: "#1d4ed8",
  /** WhatsApp number in international format, no "+" — for wa.me links. */
  phone: "233245550142",
  location: "Accra, Ghana",
  logo: null as string | null,
  banner: null as string | null,
};

/* ------------------------------------------------------------------ */
/* Portal — Customers                                                  */
/* ------------------------------------------------------------------ */

export const customerSummary: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Total customers", value: "486", icon: Users },
  { label: "Repeat buyers", value: "172", icon: Repeat },
  { label: "New this month", value: "38", icon: UserPlus },
];

// Customer type lives in @/types/customers

export const customers: Customer[] = [
  { name: "Ama Mensah", contact: "+233 24 555 0142", via: "phone", orders: 12, spent: "₵2,480", last: "Today", color: "#2563eb" },
  { name: "Kofi Asante", contact: "kofi.asante@gmail.com", via: "email", orders: 8, spent: "₵1,920", last: "Today", color: "#22d3ee" },
  { name: "Esi Boateng", contact: "+233 20 778 9921", via: "phone", orders: 6, spent: "₵1,140", last: "Yesterday", color: "#1535b3" },
  { name: "Yaw Owusu", contact: "yaw.owusu@gmail.com", via: "email", orders: 5, spent: "₵980", last: "2 days ago", color: "#60a5fa" },
  { name: "Akua Darko", contact: "+233 27 334 1180", via: "phone", orders: 4, spent: "₵760", last: "4 days ago", color: "#0ea5e9" },
  { name: "Nana Adjei", contact: "nana.adjei@gmail.com", via: "email", orders: 3, spent: "₵540", last: "1 week ago", color: "#4f46e5" },
];

/* ------------------------------------------------------------------ */
/* Portal — Analytics                                                  */
/* ------------------------------------------------------------------ */

export const analyticsKpis: { label: string; value: string; delta: string; up: boolean }[] = [
  { label: "Revenue", value: "₵48,250", delta: "+18%", up: true },
  { label: "Orders", value: "312", delta: "+9%", up: true },
  { label: "Avg. order value", value: "₵155", delta: "+4%", up: true },
  { label: "New customers", value: "126", delta: "+12%", up: true },
];

export const analyticsSecondary: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Repeat purchase rate", value: "35%", icon: Repeat },
  { label: "Avg. fulfilment time", value: "1.4 days", icon: Clock },
  { label: "Return rate", value: "1.8%", icon: RotateCcw },
];

export const orderStatusBreakdown = [
  { label: "Delivered", count: 248, color: "#10b981" },
  { label: "Packed", count: 22, color: "#f59e0b" },
  { label: "Confirmed", count: 28, color: "#22d3ee" },
  { label: "New", count: 14, color: "#1d4ed8" },
];

export const analyticsTopProducts = [
  { name: "Air Sneakers", sold: 84, revenue: "₵29,400" },
  { name: "Blue Summer Dress", sold: 76, revenue: "₵9,120" },
  { name: "Kente Tote Bag", sold: 52, revenue: "₵9,360" },
  { name: "Gold Earrings", sold: 41, revenue: "₵3,690" },
];

export const analyticsMonths = [
  { m: "Jan", v: 52 }, { m: "Feb", v: 60 }, { m: "Mar", v: 48 }, { m: "Apr", v: 72 },
  { m: "May", v: 66 }, { m: "Jun", v: 84 }, { m: "Jul", v: 78 }, { m: "Aug", v: 92 },
  { m: "Sep", v: 70 }, { m: "Oct", v: 88 }, { m: "Nov", v: 96 }, { m: "Dec", v: 100 },
];

export const salesChannels = [
  { name: "WhatsApp", pct: 42, color: "#25D366" },
  { name: "Instagram", pct: 28, color: "#E1306C" },
  { name: "TikTok", pct: 18, color: "#111827" },
  { name: "Facebook", pct: 12, color: "#1877F2" },
];

/* ------------------------------------------------------------------ */
/* Portal — Billing & plan                                             */
/* ------------------------------------------------------------------ */

export const freeFeatures = [
  "Your own storefront",
  "Unlimited products",
  "Order dashboard & tracking",
  "Up to 50 orders / month",
];

export const proFeatures = [
  "Everything in Free",
  "Unlimited orders",
  "Custom domain",
  "Advanced analytics",
  "Priority support",
];

/* ------------------------------------------------------------------ */
/* Portal — Storefront                                                 */
/* ------------------------------------------------------------------ */

export const storefrontThemes = ["#1d4ed8", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

export const previewProducts = [
  { name: "Blue Summer Dress", price: "₵120", color: "#2563eb" },
  { name: "Air Sneakers", price: "₵350", color: "#0ea5e9" },
  { name: "Kente Tote Bag", price: "₵180", color: "#10b981" },
  { name: "Gold Earrings", price: "₵90", color: "#f59e0b" },
];
