import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ClipboardList, ArrowRight, ArrowUpCircle, ArrowDownCircle, Settings2 } from "lucide-react";
import type { StockLog } from "@/lib/types";

interface RecentActivityProps {
  logs: StockLog[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const typeConfig = {
  in: {
    label: "Stock In",
    icon: ArrowUpCircle,
    variant: "default" as const,
    color: "text-primary",
  },
  out: {
    label: "Stock Out",
    icon: ArrowDownCircle,
    variant: "secondary" as const,
    color: "text-destructive",
  },
  adjustment: {
    label: "Adjustment",
    icon: Settings2,
    variant: "outline" as const,
    color: "text-muted-foreground",
  },
};

export function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest stock movements</CardDescription>
        </div>
        {logs.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/logs">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>No activity yet</EmptyTitle>
              <EmptyDescription>Stock movements will appear here</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const config = typeConfig[log.type];
              const Icon = config.icon;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`p-2 rounded-full bg-background ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {log.inventory_item?.name ?? "Unknown Item"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.type === "in" ? "+" : log.type === "out" ? "-" : ""}
                      {log.quantity} units {log.reason ? `• ${log.reason}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}