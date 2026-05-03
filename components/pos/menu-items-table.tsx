"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Search, MoreHorizontal, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import type { MenuItem, Category } from "@/lib/types";

interface MenuItemsTableProps {
  items: MenuItem[];
  categories: Category[];
}

export function MenuItemsTable({ items, categories }: MenuItemsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (item: MenuItem) => {
    setEditName(item.name);
    setEditDescription(item.description ?? "");
    setEditPrice(item.price.toString());
    setEditCategoryId(item.category_id ?? "");
    setEditIsAvailable(item.is_available);
    setEditItem(item);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("menu_items")
      .update({
        name: editName,
        description: editDescription || null,
        price: parseFloat(editPrice) || 0,
        category_id: editCategoryId || null,
        is_available: editIsAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editItem.id);

    if (error) {
      toast.error("Failed to update menu item");
    } else {
      toast.success("Menu item updated");
      router.refresh();
    }

    setIsLoading(false);
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", deleteItem.id);

    if (error) {
      toast.error("Failed to delete menu item");
    } else {
      toast.success("Menu item deleted");
      router.refresh();
    }

    setIsLoading(false);
    setDeleteItem(null);
  };

  const toggleAvailability = async (item: MenuItem) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      toast.error("Failed to update availability");
    } else {
      toast.success(`${item.name} marked as ${!item.is_available ? "available" : "unavailable"}`);
      router.refresh();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Menu Items ({filtered.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <Empty
              icon={UtensilsCrossed}
              title="No menu items found"
              description={search ? "Try a different search term" : "Add your first menu item"}
            />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
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
                      <TableCell>₱{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleAvailability(item)}>
                          <Badge variant={item.is_available ? "default" : "destructive"}>
                            {item.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteItem(item)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update menu item details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Name *</FieldLabel>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Price (₱) *</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel>Availability</FieldLabel>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsAvailable(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                      editIsAvailable ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsAvailable(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                      !editIsAvailable ? "bg-destructive text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Unavailable
                  </button>
                </div>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditItem(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}