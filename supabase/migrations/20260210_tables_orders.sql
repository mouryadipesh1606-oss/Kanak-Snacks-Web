-- 1. Tables (restaurant tables)
CREATE TABLE public.tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  qr_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access tables"
ON public.tables
FOR ALL
USING (has_admin_access(auth.uid()))
WITH CHECK (has_admin_access(auth.uid()));

CREATE POLICY "Public can view active tables"
ON public.tables
FOR SELECT
USING (is_active = true);


-- 2. Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL,
  status text DEFAULT 'pending', -- pending, preparing, delivered, paid
  total_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access orders"
ON public.orders
FOR ALL
USING (has_admin_access(auth.uid()))
WITH CHECK (has_admin_access(auth.uid()));


-- 3. Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access order items"
ON public.order_items
FOR ALL
USING (has_admin_access(auth.uid()))
WITH CHECK (has_admin_access(auth.uid()));


-- 4. Reviews
CREATE TABLE public.order_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert review"
ON public.order_reviews
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin access reviews"
ON public.order_reviews
FOR SELECT
USING (has_admin_access(auth.uid()));
