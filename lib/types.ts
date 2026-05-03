export interface Category {
  id: string;
  name: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  category?: Category;
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  inventory_item_id: string;
  image_url: Text;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  order_number: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  type: "dine_in" | "takeout";
  table_number: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  supplier_id: string | null;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  supplier?: Supplier;
}

export interface StockLog {
  id: string;
  item_id: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Joined fields
  inventory_item?: InventoryItem;
}

export type StockLogType = "in" | "out" | "adjustment";
