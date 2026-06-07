-- ===========================================================================
-- KasaCart — DB-side extras that Prisma's schema can't express.
-- Apply AFTER `prisma migrate deploy` (which creates the tables), e.g.:
--   psql "$DIRECT_URL" -f prisma/sql/extras.sql
-- or paste into the Neon SQL editor.
--
-- These are idempotent (CREATE OR REPLACE / DROP ... IF EXISTS).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Analytics & dashboard views (see docs/database-schema.md §6).
-- `updated_at` is maintained by Prisma's @updatedAt, so no trigger is needed.
-- ---------------------------------------------------------------------------

-- Order line summary string, e.g. "Blue Summer Dress ×2, Gold Earrings"
CREATE OR REPLACE VIEW order_item_summary AS
SELECT o.id AS order_id,
       string_agg(
         oi.product_name || CASE WHEN oi.quantity > 1
                                 THEN ' ×' || oi.quantity ELSE '' END,
         ', ' ORDER BY oi.created_at) AS item_summary
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

-- Product price range for "₵120 – ₵150" labels
CREATE OR REPLACE VIEW product_price_range AS
SELECT p.id AS product_id,
       COALESCE(MIN(v.price_pesewas), p.base_price_pesewas) AS min_price_pesewas,
       COALESCE(MAX(v.price_pesewas), p.base_price_pesewas) AS max_price_pesewas
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.id
GROUP BY p.id, p.base_price_pesewas;

-- Customers page: orders count, total spent, last order
CREATE OR REPLACE VIEW customer_stats AS
SELECT c.id AS customer_id,
       c.store_id,
       COUNT(o.id)                       AS order_count,
       COALESCE(SUM(o.total_pesewas), 0) AS total_spent_pesewas,
       MAX(o.placed_at)                  AS last_order_at
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.store_id;

-- Analytics KPIs: revenue, orders, AOV per store
CREATE OR REPLACE VIEW store_sales_kpis AS
SELECT store_id,
       COUNT(*)                                AS orders_count,
       COALESCE(SUM(total_pesewas), 0)         AS revenue_pesewas,
       COALESCE(AVG(total_pesewas), 0)::bigint AS avg_order_value_pesewas
FROM orders
WHERE status <> 'cancelled'
GROUP BY store_id;

-- Analytics: top products by units sold & revenue
CREATE OR REPLACE VIEW top_products AS
SELECT o.store_id,
       oi.product_id,
       oi.product_name,
       SUM(oi.quantity)           AS units_sold,
       SUM(oi.line_total_pesewas) AS revenue_pesewas
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status <> 'cancelled'
GROUP BY o.store_id, oi.product_id, oi.product_name;

-- Analytics: sales by channel & order-status breakdown
CREATE OR REPLACE VIEW sales_by_channel AS
SELECT store_id, channel,
       COUNT(*) AS orders_count,
       COALESCE(SUM(total_pesewas), 0) AS revenue_pesewas
FROM orders
GROUP BY store_id, channel;

CREATE OR REPLACE VIEW order_status_breakdown AS
SELECT store_id, status, COUNT(*) AS orders_count
FROM orders
GROUP BY store_id, status;

-- ---------------------------------------------------------------------------
-- OPTIONAL: keep products.stock / products.sold honest on each sale.
--
-- ⚠️  Enable this AFTER seeding. The seed sets stock/sold directly *and*
--     inserts order_items; if the trigger is active during seeding it will
--     decrement stock a second time. For production, run this once after the
--     initial data load.
-- ---------------------------------------------------------------------------

-- CREATE OR REPLACE FUNCTION apply_order_item_stock()
-- RETURNS trigger AS $$
-- BEGIN
--   UPDATE products
--      SET stock = GREATEST(0, stock - NEW.quantity),
--          sold  = sold + NEW.quantity,
--          updated_at = now()
--    WHERE id = NEW.product_id;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- DROP TRIGGER IF EXISTS trg_order_item_stock ON order_items;
-- CREATE TRIGGER trg_order_item_stock
--   AFTER INSERT ON order_items
--   FOR EACH ROW WHEN (NEW.product_id IS NOT NULL)
--   EXECUTE FUNCTION apply_order_item_stock();
