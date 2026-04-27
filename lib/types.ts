export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
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
