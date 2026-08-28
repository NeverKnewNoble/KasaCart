"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Users, Repeat, UserPlus } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import EmptyState from "@/components/ui_components/EmptyState";
import TableSkeleton from "@/components/ui_components/TableSkeleton";
import Customers from "@/services/customers";
import { initials } from "@/utils/general";
import { customerToRow } from "@/utils/mappers";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomerWithStats, CustomerDTO } from "@/types/customers";




export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("");

  // ** QUERY CLIENT FOR REFRESHING DATA !!!!!!!!!!!!!!!!!!!!!!
  const { data: rows = [], isLoading: loading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const list = await Customers.listCustomers();
      if (!list) {
        toast.error("Couldn't load your customers.");
        return [] as CustomerWithStats[];
      }
      // Keep raw DTOs: the summary tiles below need createdAt/orderCount, which
      // customerToRow drops. Rows are derived in the `customers` memo instead.
      return list;
    }
  })

  // ?? reuslt as useEffect to notice changes on refresh
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["customers"] });



  // *** Summary tiles computed from the loaded data.
  const summary = useMemo(() => {
    const now = new Date();
    const newThisMonth = rows.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return [
      { label: "Total customers", value: String(rows.length), icon: Users },
      { label: "Repeat buyers", value: String(rows.filter((c) => c.orderCount > 1).length), icon: Repeat },
      { label: "New this month", value: String(newThisMonth), icon: UserPlus },
    ];
  }, [rows]); 

  const customers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .map((c, i) => customerToRow(c, i))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q));
  }, [rows, search]);

  






  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Everyone who's bought from your store, and what they're worth."
      />

      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface flex items-center gap-4 rounded-2xl p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/8 text-brand">
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-fg">{value}</p>
              <p className="text-sm text-fg/55">{label}</p>
            </div>
          </div>
        ))}
      </div> 

      {/* search */}
      <div className="relative sm:max-w-sm">
        <input
          className="input pl-10"
          placeholder="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* table */}
      {loading ? (
        <TableSkeleton columns={5} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={rows.length === 0 ? "No customers yet" : "No customers match your search"}
          description={
            rows.length === 0
              ? "Customers appear here once they order from your storefront."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="surface overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-left text-sm">
              <thead>
                <tr className="border-b border-brand/10 text-xs uppercase tracking-wide text-fg/40">
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Contact</th>
                  <th className="px-5 py-3.5 font-semibold">Orders</th>
                  <th className="px-5 py-3.5 font-semibold">Total spent</th>
                  <th className="px-5 py-3.5 font-semibold">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/8">
                {customers.map((c) => (
                  <tr key={c.dbId} className="transition-colors hover:bg-raised/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xs font-bold text-white"
                          style={{ background: c.color }}
                        >
                          {initials(c.name)}
                        </span>
                        <p className="font-medium text-fg">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-fg/60">
                        {c.via === "phone" ? (
                          <Phone className="h-3.5 w-3.5 text-fg/40" strokeWidth={1.8} />
                        ) : (
                          <Mail className="h-3.5 w-3.5 text-fg/40" strokeWidth={1.8} />
                        )}
                        {c.contact}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-fg">{c.orders}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-fg">{c.spent}</td>
                    <td className="px-5 py-4 text-fg/55">{c.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
