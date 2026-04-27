import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardStats } from "@/components/dashboard-stats";
import { LowStockAlert } from "@/components/low-stock-alert";
import { RecentActivity } from "@/components/recent-activity";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch dashboard data
  const [itemsResult, lowStockResult, categoriesResult, logsResult] = await Promise.all([
    supabase.from("inventory_items").select("*", { count: "exact" }).eq("is_active", true),
    supabase
      .from("inventory_items")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .filter("current_stock", "lte", "minimum_stock"),
    supabase.from("categories").select("*", { count: "exact" }),
    supabase
      .from("stock_logs")
      .select("*, inventory_item:inventory_items(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalItems = itemsResult.count ?? 0;
  const lowStockItems = lowStockResult.data ?? [];
  const totalCategories = categoriesResult.count ?? 0;
  const recentLogs = logsResult.data ?? [];

  // Calculate total inventory value
  const items = itemsResult.data ?? [];
  const totalValue = items.reduce(
    (sum, item) => sum + item.current_stock * item.cost_per_unit,
    0
  );

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Overview of your restaurant inventory"
      />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <DashboardStats
          totalItems={totalItems}
          lowStockCount={lowStockItems.length}
          totalCategories={totalCategories}
          totalValue={totalValue}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <LowStockAlert items={lowStockItems} />
          <RecentActivity logs={recentLogs} />
        </div>
      </main>
    </>
  );
}
