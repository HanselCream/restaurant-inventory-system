import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { OrdersHistoryTable } from "@/components/pos/orders-history-table";

export default async function OrdersHistoryPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*, menu_item:menu_items(*))")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <DashboardHeader
        title="Orders History"
        description="View all past and active orders"
      />
      <main className="flex-1 p-4 md:p-6">
        <OrdersHistoryTable orders={orders ?? []} />
      </main>
    </>
  );
}