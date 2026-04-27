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
import { Badge } from "@/components/ui/badge";
import type { InventoryItem, StockLogType } from "@/lib/types";

interface StockAdjustDialogProps {
  item: InventoryItem;
  type: "in" | "out";
  children: React.ReactNode;
}

const REASONS_IN = [
  "Purchase/Restock",
  "Return from customer",
  "Transfer in",
  "Found/Inventory correction",
  "Other",
];

const REASONS_OUT = [
  "Used in preparation",
  "Sold",
  "Spoiled/Expired",
  "Damaged",
  "Transfer out",
  "Other",
];

export function StockAdjustDialog({ item, type, children }: StockAdjustDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const reasons = type === "in" ? REASONS_IN : REASONS_OUT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (type === "out" && qty > item.current_stock) {
      toast.error("Cannot remove more than current stock");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const newStock =
      type === "in"
        ? item.current_stock + qty
        : item.current_stock - qty;

    // Update inventory item
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      toast.error("Failed to update stock");
      setIsLoading(false);
      return;
    }

    // Create stock log
    const { error: logError } = await supabase.from("stock_logs").insert({
      item_id: item.id,
      type: type as StockLogType,
      quantity: qty,
      previous_stock: item.current_stock,
      new_stock: newStock,
      reason: reason || null,
      notes: notes || null,
    });

    if (logError) {
      toast.error("Stock updated but failed to create log");
    } else {
      toast.success(
        type === "in" ? "Stock added successfully" : "Stock removed successfully"
      );
    }

    setQuantity("");
    setReason("");
    setNotes("");
    setOpen(false);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "in" ? "Add Stock" : "Remove Stock"}
          </DialogTitle>
          <DialogDescription>
            {type === "in"
              ? "Add stock to this item"
              : "Remove stock from this item"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              Current stock: {item.current_stock} {item.unit}
            </p>
          </div>
          <Badge variant={type === "in" ? "default" : "destructive"}>
            {type === "in" ? "Stock In" : "Stock Out"}
          </Badge>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Quantity ({item.unit}) *</FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={type === "out" ? item.current_stock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Enter quantity in ${item.unit}`}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Reason</FieldLabel>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                rows={2}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant={type === "out" ? "destructive" : "default"}
            >
              {isLoading && <Spinner className="mr-2" />}
              {type === "in" ? "Add Stock" : "Remove Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
