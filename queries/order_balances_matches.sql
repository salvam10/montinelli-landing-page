SELECT
  order_id,
  client_id,
  client_name,
  invoice_number,
  total,
  allocated,
  balance,
  paid_at
FROM order_balances
WHERE
  invoice_number IS NOT NULL
  AND TRIM(invoice_number) <> ''
  AND balance > 0
  AND paid_at is null
  AND invoice_number not in ('279','290','291','309','351','476')
ORDER BY client_name ASC;


select * from orders limit 1;

/*Paso 2: Insertar nuevo payment por cliente */
Insert into payments(client_id, amount) values (27,96.07) returning *;
Select * from payments where id = 595 ;

/*Paso 3 Insertar relación payment-order */
Select * from payment_allocations;
insert into payment_allocations (payment_id, order_id, amount) values (595,1111,96.07);



Select o.id, o.invoice_number, o.total, o.payment_status_id, o.paid_at from orders o where invoice_number != '' AND paid_at is null AND invoice_number not in ('279','290','291','309','351','476') order by invoice_number asc;
/*2025-10-23*/
/*payment statu sid 2*/
/*Modificar facturas:556,564,579, 607,611, 615,623, 626,632,986, */


