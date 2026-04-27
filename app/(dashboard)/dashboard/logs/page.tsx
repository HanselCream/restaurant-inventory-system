import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { StockLogsTable } from "@/components/stock-logs-table";

export default async function StockLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("stock_logs")
    .select("*, inventory_item:inventory_items(name, unit)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <DashboardHeader
        title="Stock Logs"
        description="History of all stock movements"
      />
      <main className="flex-1 p-4 md:p-6">
        <StockLogsTable logs={logs ?? []} />
      </main>
    </>
  );
}
