"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ClipboardList } from "lucide-react";
import type { Order } from "@/lib/types";

interface OrdersPanelProps {
  initialOrders: Order[];
}

const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const, next: "preparing", nextLabel: "Start Preparing" },
  preparing: { label: "Preparing", variant: "secondary" as const, next: "ready", nextLabel: "Mark Ready" },
  ready: { label: "Ready", variant: "default" as const, next: "completed", nextLabel: "Complete Order" },
  completed: { label: "Completed", variant: "default" as const, next: null, nextLabel: null },
  cancelled: { label: "Cancelled", variant: "destructive" as const, next: null, nextLabel: null },
};

export function OrdersPanel({ initialOrders }: OrdersPanelProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setLoadingId(orderId);
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
      setLoadingId(null);
      return;
    }

    if (newStatus === "completed" || newStatus === "cancelled") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
      );
    }

    toast.success(`Order updated to ${newStatus}`);
    setLoadingId(null);
    router.refresh();
  };

  const cancelOrder = async (orderId: string) => {
    await updateStatus(orderId, "cancelled");
  };

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20">
        <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No active orders</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => {
        const config = statusConfig[order.status];
        const isLoading = loadingId === order.id;

        return (
          <Card key={order.id}>
            <CardContent className="p-4 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.type === "dine_in"
                      ? `Dine In${order.table_number ? ` · Table ${order.table_number}` : ""}`
                      : "Takeout"}
                  </p>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.menu_item?.name ?? "Unknown"}
                      </span>
                      <span>₱{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {order.notes && (
                <p className="text-xs text-muted-foreground italic">"{order.notes}"</p>
              )}

              {/* Total */}
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total</span>
                <span>₱{order.total.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {config.next && (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                    onClick={() => updateStatus(order.id, config.next!)}
                  >
                    {isLoading && <Spinner className="mr-1" />}
                    {config.nextLabel}
                  </Button>
                )}
                {order.status !== "completed" && order.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => cancelOrder(order.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleTimeString("en-PH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}