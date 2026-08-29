-- Sprint 4: persiapan kolom payment gateway (Midtrans) di tabel orders.
-- gateway_order_id       : order_id (string) yang dikirim ke Midtrans Snap, dipakai
--                          untuk memetakan webhook notification -> order.
-- payment_status_gateway : status mentah dari gateway (mis. capture/settlement/pending/
--                          expire/deny) untuk rekonsiliasi & keputusan idempotency.
alter table public.orders
  add column gateway_order_id text,
  add column payment_status_gateway text;

-- Order_id ke gateway harus unik (Midtrans menolak duplikat).
create unique index orders_gateway_order_id_key
  on public.orders (gateway_order_id)
  where gateway_order_id is not null;
