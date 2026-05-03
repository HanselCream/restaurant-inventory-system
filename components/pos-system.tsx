"use client";

import { useState } from "react";
import { MenuPanel } from "@/components/pos/menu-panel";
import { CartPanel } from "@/components/pos/cart-panel";
import { OrdersPanel } from "@/components/pos/orders-panel";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { MenuItem, Category, Order } from "@/lib/types";

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

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="flex flex-col h-full gap-4 lg:flex-row lg:gap-6">
      {/* Left panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "menu" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("menu")}
          >
            Menu
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("orders")}
          >
            Active Orders ({activeOrders.length})
          </Button>
        </div>

        {/* Panel */}
        <div className="flex-1 min-h-0">
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