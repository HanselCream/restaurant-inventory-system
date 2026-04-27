"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Empty } from "@/components/ui/empty";
import { EditItemDialog } from "@/components/edit-item-dialog";
import { StockAdjustDialog } from "@/components/stock-adjust-dialog";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import type { InventoryItem, Category, Supplier } from "@/lib/types";

interface InventoryTableProps {
  items: InventoryItem[];
  categories: Category[];
  suppliers: Supplier[];
}

export function InventoryTable({ items, categories, suppliers }: InventoryTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category_id === categoryFilter;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && item.current_stock <= item.minimum_stock) ||
      (stockFilter === "ok" && item.current_stock > item.minimum_stock);

    return matchesSearch && matchesCategory && matchesStock && item.is_active;
  });

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("inventory_items")
      .update({ is_active: false })
      .eq("id", deleteItem.id);

    if (error) {
      toast.error("Failed to delete item");
    } else {
      toast.success("Item deleted successfully");
      router.refresh();
    }

    setIsDeleting(false);
    setDeleteItem(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Items ({filteredItems.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="ok">In Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <Empty
              icon={Package}
              title="No items found"
              description={
                searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first inventory item to get started"
              }
            />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Item</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden sm:table-cell">Unit Cost</TableHead>
                    <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const isLowStock = item.current_stock <= item.minimum_stock;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="pl-6">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {item.category?.name ?? "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={isLowStock ? "destructive" : "default"}>
                              {item.current_stock} {item.unit}
                            </Badge>
                            {isLowStock && (
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                Min: {item.minimum_stock}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          ₱{item.cost_per_unit.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.supplier?.name ?? "-"}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <StockAdjustDialog item={item} type="in">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <ArrowUpCircle className="h-4 w-4 mr-2 text-primary" />
                                  Stock In
                                </DropdownMenuItem>
                              </StockAdjustDialog>
                              <StockAdjustDialog item={item} type="out">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <ArrowDownCircle className="h-4 w-4 mr-2 text-destructive" />
                                  Stock Out
                                </DropdownMenuItem>
                              </StockAdjustDialog>
                              <DropdownMenuSeparator />
                              <EditItemDialog
                                item={item}
                                categories={categories}
                                suppliers={suppliers}
                              >
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </EditItemDialog>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => setDeleteItem(item)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
