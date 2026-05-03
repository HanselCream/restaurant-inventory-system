"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import type { MenuItem, Category } from "@/lib/types";

interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes: string;
}

interface MenuPanelProps {
  menuItems: MenuItem[];
  categories: Category[];
  onAddToCart: (item: MenuItem) => void;
  cart: CartItem[];
}

export function MenuPanel({ menuItems, categories, onAddToCart, cart }: MenuPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (itemId: string) => {
    return cart.find((c) => c.menu_item.id === itemId)?.quantity ?? 0;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No items found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item) => {
            const qty = getCartQuantity(item.id);
            return (
              <Card
                key={item.id}
                onClick={() => onAddToCart(item)}
                className="cursor-pointer hover:border-primary transition-colors relative"
              >
                <CardContent className="p-3">
                  {qty > 0 && (
                    <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {qty}
                    </span>
                  )}
                  <p className="font-medium text-sm leading-tight mb-1 pr-6">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-primary">
                      ₱{item.price.toFixed(2)}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {item.category && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {item.category.name}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}