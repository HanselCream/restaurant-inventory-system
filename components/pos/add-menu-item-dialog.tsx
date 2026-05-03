"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Category } from "@/lib/types";

interface AddMenuItemDialogProps {
  categories: Category[];
  children: React.ReactNode;
}

export function AddMenuItemDialog({ categories, children }: AddMenuItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setIsAvailable(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("menu_items").insert({
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      category_id: categoryId || null,
      is_available: isAvailable,
    });

    if (error) {
      toast.error("Failed to add menu item");
      setIsLoading(false);
      return;
    }

    toast.success("Menu item added");
    resetForm();
    setOpen(false);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>Add a new item to your menu</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Name *</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Crispy Pata"
                required
              />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Price (₱) *</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={categoryId} onValueChange={setCategoryId}>
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
                  onClick={() => setIsAvailable(true)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    isAvailable
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    !isAvailable
                      ? "bg-destructive text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Unavailable
                </button>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}