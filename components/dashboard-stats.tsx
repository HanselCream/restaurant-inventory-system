import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, FolderOpen, DollarSign } from "lucide-react";

interface DashboardStatsProps {
  totalItems: number;
  lowStockCount: number;
  totalCategories: number;
  totalValue: number;
}

export function DashboardStats({
  totalItems,
  lowStockCount,
  totalCategories,
  totalValue,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Items",
      value: totalItems.toLocaleString(),
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Low Stock",
      value: lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "Categories",
      value: totalCategories.toLocaleString(),
      icon: FolderOpen,
      color: "text-accent-foreground",
      bg: "bg-accent",
    },
    {
      title: "Inventory Value",
      value: `₱${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
