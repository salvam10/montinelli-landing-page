-- CREATE EXTENSION IF NOT EXISTS tablefunc;

SELECT *
FROM crosstab(
$$
  SELECT
    c.name AS client_name,
    TO_CHAR(DATE_TRUNC('month', o.invoice_date), 'YYYY_MM') AS month_key,
    SUM(i.quantity)::int AS total_units_sold
  FROM orders o
  JOIN order_items i ON i.order_id = o.id
  JOIN clients c ON c.id = o.client_id
  WHERE i.product_id = 100
    AND o.invoice_date IS NOT NULL
    AND o.invoice_date >= DATE '2025-05-01'
    AND o.invoice_date <  DATE '2026-03-01'
  GROUP BY c.name, DATE_TRUNC('month', o.invoice_date)
  ORDER BY c.name, DATE_TRUNC('month', o.invoice_date)
$$,
$$
  SELECT TO_CHAR(d, 'YYYY_MM')
  FROM generate_series(
    DATE '2025-05-01',
    DATE '2026-02-01',
    INTERVAL '1 month'
  ) AS d
  ORDER BY 1
$$
) AS pivot_table (
  client_name text,
  "2025_05" int,
  "2025_06" int,
  "2025_07" int,
  "2025_08" int,
  "2025_09" int,
  "2025_10" int,
  "2025_11" int,
  "2025_12" int,
  "2026_01" int,
  "2026_02" int
);