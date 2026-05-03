import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { POSSystem } from "@/components/pos-system";

export default async function POSPage() {
  const supabase = await createClient();

  const [menuItemsResult, categoriesResult, ordersResult] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*, category:categories(*), inventory_item:inventory_items(*)")
      .eq("is_available", true)
      .order("name"),
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("orders")
      .select("*, items:order_items(*, menu_item:menu_items(*))")
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <DashboardHeader
        title="POS"
        description="Point of Sale — take and manage orders"
      />
      <main className="flex-1 p-4 md:p-6">
        <POSSystem
          menuItems={menuItemsResult.data ?? []}
          categories={categoriesResult.data ?? []}
          activeOrders={ordersResult.data ?? []}
        />
      </main>
    </>
  );
}