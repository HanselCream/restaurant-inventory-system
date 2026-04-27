import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { InventoryTable } from "@/components/inventory-table";
import { AddItemDialog } from "@/components/add-item-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function InventoryPage() {
  const supabase = await createClient();

  const [itemsResult, categoriesResult, suppliersResult] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*, category:categories(*), supplier:suppliers(*)")
      .order("name"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("suppliers").select("*").order("name"),
  ]);

  const items = itemsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const suppliers = suppliersResult.data ?? [];

  return (
    <>
      <DashboardHeader
        title="Inventory"
        description="Manage your restaurant inventory items"
        actions={
          <AddItemDialog categories={categories} suppliers={suppliers}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </AddItemDialog>
        }
      />
      <main className="flex-1 p-4 md:p-6">
        <InventoryTable
          items={items}
          categories={categories}
          suppliers={suppliers}
        />
      </main>
    </>
  );
}
