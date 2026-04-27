import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { CategoriesTable } from "@/components/categories-table";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <>
      <DashboardHeader
        title="Categories"
        description="Organize your inventory by category"
        actions={
          <AddCategoryDialog>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </AddCategoryDialog>
        }
      />
      <main className="flex-1 p-4 md:p-6">
        <CategoriesTable categories={categories ?? []} />
      </main>
    </>
  );
}
