import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import type { InventoryItem } from "@/lib/types";

interface LowStockAlertProps {
  items: InventoryItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Items below minimum stock level</CardDescription>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/inventory">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle className="text-green-500" />
              </EmptyMedia>
              <EmptyTitle>All stocked up!</EmptyTitle>
              <EmptyDescription>No items are below minimum stock level</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category?.name ?? "Uncategorized"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="destructive" className="whitespace-nowrap">
                    {item.current_stock} / {item.minimum_stock} {item.unit}
                  </Badge>
                </div>
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{items.length - 5} more items need restocking
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}