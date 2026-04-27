-- Escartine's Inventory Management System Schema

-- Categories table for organizing inventory items
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements/logs table
CREATE TABLE IF NOT EXISTS stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity DECIMAL(10,2) NOT NULL,
  previous_stock DECIMAL(10,2) NOT NULL,
  new_stock DECIMAL(10,2) NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (restaurant staff)
-- Categories policies
CREATE POLICY "Allow authenticated read categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete categories" ON categories FOR DELETE TO authenticated USING (true);

-- Suppliers policies
CREATE POLICY "Allow authenticated read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update suppliers" ON suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete suppliers" ON suppliers FOR DELETE TO authenticated USING (true);

-- Inventory items policies
CREATE POLICY "Allow authenticated read inventory" ON inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert inventory" ON inventory_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update inventory" ON inventory_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete inventory" ON inventory_items FOR DELETE TO authenticated USING (true);

-- Stock logs policies
CREATE POLICY "Allow authenticated read stock_logs" ON stock_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert stock_logs" ON stock_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_item ON stock_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at DESC);

-- Insert default categories for a Filipino restaurant
INSERT INTO categories (name, description) VALUES
  ('Proteins', 'Meat, poultry, seafood, and other protein sources'),
  ('Vegetables', 'Fresh and preserved vegetables'),
  ('Seasonings', 'Spices, sauces, and condiments'),
  ('Dairy', 'Milk, cheese, eggs, and dairy products'),
  ('Dry Goods', 'Rice, flour, sugar, and other dry ingredients'),
  ('Beverages', 'Drinks and beverage supplies'),
  ('Packaging', 'Takeout containers, bags, and packaging materials'),
  ('Cleaning', 'Cleaning supplies and sanitation items')
ON CONFLICT DO NOTHING;
