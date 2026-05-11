# Route and Query Patterns

## Standard route

```js
const express = require('express');
const router = express.Router();
const { getOrders, createOrder } = require('../queries/orders');
const { isAuthenticated } = require('../config/auth');

router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const orders = await getOrders({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const order = await createOrder({ ...req.body, createdBy: req.user.id });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

## Standard query (single statement)

```js
const db = require('../db');

async function getOrders({ userId, status }) {
  const { rows } = await db.query(
    `SELECT o.*, c.name AS client_name
     FROM orders o
     JOIN clients c ON c.id = o.client_id
     WHERE o.created_by = $1
       AND ($2::text IS NULL OR o.status = $2)
     ORDER BY o.created_at DESC`,
    [userId, status ?? null]
  );
  return rows;
}
```

## Transaction pattern (multi-table write)

```js
async function createOrder({ clientId, items, createdBy }) {
  const client = await db.connect(); // pool.connect(), NOT db.query
  try {
    await client.query('BEGIN');

    const { rows: [order] } = await client.query(
      `INSERT INTO orders (client_id, created_by, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [clientId, createdBy]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // always release, even if ROLLBACK throws
  }
}
```

## Error responses

```js
// 400 validation
if (!req.body.clientId) return res.status(400).json({ error: 'clientId requerido' });

// 404 not found
if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

// 500 unexpected — let global handler deal with it
next(err);
```

## Cron job

```js
const cron = require('node-cron');
const { markOverdueOrders } = require('../queries/orders');

cron.schedule('0 8 * * *', async () => {
  try {
    const count = await markOverdueOrders();
    console.log(`[cron] checkOverdueOrders: ${count} pedidos marcados`);
  } catch (err) {
    console.error('[cron] checkOverdueOrders falló:', err.message);
    // do NOT re-throw — a thrown error here does nothing useful
  }
});
```
