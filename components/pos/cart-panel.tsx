"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { MenuItem } from "@/lib/types";

interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes: string;
}

interface CartPanelProps {
  cart: CartItem[];
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onClearCart: () => void;
}

const TAX_RATE = 0.12;

export function CartPanel({
  cart,
  onRemove,
  onUpdateQuantity,
  onUpdateNotes,
  onClearCart,
}: CartPanelProps) {
  const router = useRouter();
  const [orderType, setOrderType] = useState<"dine_in" | "takeout">("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const orderNumber = `ORD-${Date.now()}`;

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        status: "pending",
        type: orderType,
        table_number: orderType === "dine_in" ? tableNumber || null : null,
        subtotal,
        tax,
        total,
        notes: orderNotes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Failed to place order");
      setIsLoading(false);
      return;
    }

    // 2. Create order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        cart.map((item) => ({
          order_id: order.id,
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
          unit_price: item.menu_item.price,
          subtotal: item.menu_item.price * item.quantity,
          notes: item.notes || null,
        }))
      );

    if (itemsError) {
      toast.error("Order created but failed to add items");
      setIsLoading(false);
      return;
    }

    // 3. Deduct inventory
    for (const cartItem of cart) {
      const { data: ingredients } = await supabase
        .from("menu_item_ingredients")
        .select("inventory_item_id, quantity_used")
        .eq("menu_item_id", cartItem.menu_item.id);

      if (!ingredients?.length) continue;

      for (const ing of ingredients) {
        const { data: inv } = await supabase
          .from("inventory_items")
          .select("current_stock")
          .eq("id", ing.inventory_item_id)
          .single();

        if (!inv) continue;

        const deductAmount = ing.quantity_used * cartItem.quantity;
        const newStock = Math.max(0, inv.current_stock - deductAmount);

        await supabase
          .from("inventory_items")
          .update({
            current_stock: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ing.inventory_item_id);

        await supabase.from("stock_logs").insert({
          item_id: ing.inventory_item_id,
          type: "out",
          quantity: deductAmount,
          previous_stock: inv.current_stock,
          new_stock: newStock,
          reason: "Sold",
          notes: `${orderNumber} — ${cartItem.menu_item.name} x${cartItem.quantity}`,
        });
      }
    }

    toast.success(`Order ${orderNumber} placed!`);
    onClearCart();
    setTableNumber("");
    setOrderNotes("");
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Card className="flex flex-col h-full sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart {cart.length > 0 && `(${cart.reduce((s, i) => s + i.quantity, 0)})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1 overflow-auto">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No items in cart</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.menu_item.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium flex-1 truncate">
                      {item.menu_item.name}
                    </p>
                    <button
                      onClick={() => onRemove(item.menu_item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.menu_item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.menu_item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      ₱{(item.menu_item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <Input
                    placeholder="Item notes..."
                    value={item.notes}
                    onChange={(e) =>
                      onUpdateNotes(item.menu_item.id, e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Type */}
            <div className="flex gap-2">
              <Button
                variant={orderType === "dine_in" ? "default" : "outline"}
                className="flex-1"
                size="sm"
                onClick={() => setOrderType("dine_in")}
              >
                Dine In
              </Button>
              <Button
                variant={orderType === "takeout" ? "default" : "outline"}
                className="flex-1"
                size="sm"
                onClick={() => setOrderType("takeout")}
              >
                Takeout
              </Button>
            </div>

            {orderType === "dine_in" && (
              <Input
                placeholder="Table number (optional)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            )}

            <Textarea
              placeholder="Order notes..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={2}
            />

            <Separator />

            {/* Totals */}
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (12%)</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base mt-1">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading && <Spinner className="mr-2" />}
              Place Order
            </Button>

            <Button
              variant="outline"
              onClick={onClearCart}
              disabled={isLoading}
              className="w-full"
            >
              Clear Cart
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}