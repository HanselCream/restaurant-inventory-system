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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Empty } from "@/components/ui/empty";
import { Search, ClipboardList, Eye } from "lucide-react";
import type { Order } from "@/lib/types";

interface OrdersHistoryTableProps {
  orders: Order[];
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  preparing: "secondary",
  ready: "default",
  completed: "default",
  cancelled: "destructive",
};

export function OrdersHistoryTable({ orders }: OrdersHistoryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.table_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Orders ({filtered.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <Empty
              icon={ClipboardList}
              title="No orders found"
              description={search || statusFilter !== "all" ? "Try adjusting your filters" : "Orders will appear here"}
            />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Order #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="pl-6 font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.type === "dine_in"
                            ? `Dine In${order.table_number ? ` · T${order.table_number}` : ""}`
                            : "Takeout"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[order.status] ?? "outline"}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {order.items?.length ?? 0} item(s)
                      </TableCell>
                      <TableCell>₱{order.total.toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {new Date(order.created_at).toLocaleString("en-PH", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant[viewOrder.status] ?? "outline"}>
                  {viewOrder.status.charAt(0).toUpperCase() + viewOrder.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span>
                  {viewOrder.type === "dine_in"
                    ? `Dine In${viewOrder.table_number ? ` · Table ${viewOrder.table_number}` : ""}`
                    : "Takeout"}
                </span>
              </div>
              {viewOrder.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="italic">{viewOrder.notes}</span>
                </div>
              )}
              <div className="border rounded-md divide-y">
                {viewOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between px-3 py-2 text-sm">
                    <div>
                      <span>{item.quantity}x {item.menu_item?.name ?? "Unknown"}</span>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                      )}
                    </div>
                    <span>₱{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{viewOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (12%)</span>
                  <span>₱{viewOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₱{viewOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(viewOrder.created_at).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}