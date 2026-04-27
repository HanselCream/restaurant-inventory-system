"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty } from "@/components/ui/empty";
import {
  Search,
  ClipboardList,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings2,
} from "lucide-react";
import type { StockLog } from "@/lib/types";

interface StockLogsTableProps {
  logs: StockLog[];
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
    variant: "destructive" as const,
    color: "text-destructive",
  },
  adjustment: {
    label: "Adjustment",
    icon: Settings2,
    variant: "outline" as const,
    color: "text-muted-foreground",
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function StockLogsTable({ logs }: StockLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.inventory_item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || log.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Logs ({filteredLogs.length})</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[200px]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Stock In</SelectItem>
                <SelectItem value="out">Stock Out</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <Empty
            icon={ClipboardList}
            title="No logs found"
            description={
              searchQuery || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "Stock movements will appear here"
            }
          />
        ) : (
          <div className="overflow-x-auto -mx-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Quantity</TableHead>
                  <TableHead className="hidden md:table-cell">Stock Change</TableHead>
                  <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  <TableHead className="pr-6 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const config = typeConfig[log.type];
                  const Icon = config.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="pl-6">
                        <div>
                          <p className="font-medium">
                            {log.inventory_item?.name ?? "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground sm:hidden">
                            {log.type === "in" ? "+" : log.type === "out" ? "-" : ""}
                            {log.quantity} {log.inventory_item?.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{config.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={config.color}>
                          {log.type === "in" ? "+" : log.type === "out" ? "-" : ""}
                          {log.quantity} {log.inventory_item?.unit}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {log.previous_stock} → {log.new_stock}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground truncate max-w-[200px]">
                        {log.reason ?? "-"}
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
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
  );
}
