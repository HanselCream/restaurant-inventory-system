"use client";

import { useState } from "react";
import { MenuPanel } from "@/components/pos/menu-panel";
import { CartPanel } from "@/components/pos/cart-panel";
import { OrdersPanel } from "@/components/pos/orders-panel";
import type { MenuItem, Category, Order, OrderItem } from "@/lib/types";
interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes: string;
}

interface POSSystemProps {
  menuItems: MenuItem[];
  categories: Category[];
  activeOrders: Order[];
}

export function POSSystem({ menuItems, categories, activeOrders }: POSSystemProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menu_item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menu_item: item, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menu_item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.menu_item.id === itemId ? { ...c, quantity } : c))
    );
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.menu_item.id === itemId ? { ...c, notes } : c))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 h-full">
      {/* Left: Menu + Orders Toggle */}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "menu"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
        </div>

        {activeTab === "menu" ? (
          <MenuPanel
            menuItems={menuItems}
            categories={categories}
            onAddToCart={addToCart}
            cart={cart}
          />
        ) : (
          <OrdersPanel initialOrders={activeOrders} />
        )}
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 shrink-0">
        <CartPanel
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onUpdateNotes={updateNotes}
          onClearCart={clearCart}
        />
      </div>
    </div>
  );
}