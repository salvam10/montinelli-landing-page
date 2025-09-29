SELECT 
  mci.id AS market_check_item_id,
  mc.id AS market_check_id,
  c.name AS client_name, 
  mp.name AS product_name,
  mci.price_usd
FROM market_check_items mci
JOIN market_checks mc ON mc.id = mci.market_check_id
JOIN clients c ON c.id = mc.client_id
JOIN market_products mp ON mp.id = mci.market_product_id order by client_name, product_name, market_check_id desc;


WITH ranked AS (
  SELECT 
    mci.id,
    ROW_NUMBER() OVER (
      PARTITION BY mc.client_id, mci.market_product_id
      ORDER BY COALESCE(mci.updated_at, mci.created_at) DESC, mci.id DESC
    ) AS rn
  FROM market_check_items mci
  JOIN market_checks mc ON mc.id = mci.market_check_id
)
DELETE FROM market_check_items m
USING ranked r
WHERE m.id = r.id
  AND r.rn > 1;
