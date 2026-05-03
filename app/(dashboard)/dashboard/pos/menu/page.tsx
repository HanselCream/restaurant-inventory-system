import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { MenuItemsTable } from "@/components/pos/menu-items-table";
import { AddMenuItemDialog } from "@/components/pos/add-menu-item-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function MenuItemsPage() {
  const supabase = await createClient();

  const [menuItemsResult, categoriesResult] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*, category:categories(*), inventory_item:inventory_items(*)")
      .order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <>
      <DashboardHeader
        title="Menu Items"
        description="Manage your restaurant menu"
        actions={
          <AddMenuItemDialog categories={categoriesResult.data ?? []}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Menu Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </AddMenuItemDialog>
        }
      />
      <main className="flex-1 p-4 md:p-6">
        <MenuItemsTable
          items={menuItemsResult.data ?? []}
          categories={categoriesResult.data ?? []}
        />
      </main>
    </>
  );
}