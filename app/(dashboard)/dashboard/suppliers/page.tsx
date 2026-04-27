import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { SuppliersTable } from "@/components/suppliers-table";
import { AddSupplierDialog } from "@/components/add-supplier-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function SuppliersPage() {
  const supabase = await createClient();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");

  return (
    <>
      <DashboardHeader
        title="Suppliers"
        description="Manage your supplier contacts"
        actions={
          <AddSupplierDialog>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Supplier</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </AddSupplierDialog>
        }
      />
      <main className="flex-1 p-4 md:p-6">
        <SuppliersTable suppliers={suppliers ?? []} />
      </main>
    </>
  );
}
