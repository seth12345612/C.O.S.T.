create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete set null,
  email           text not null,
  amount          integer not null,
  currency        text not null default 'ron',
  status          text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled', 'refunded')),
  duration_days   integer not null default 30,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  provider            text not null default 'stripe',
  provider_session_id text unique not null,
  provider_payment_id text,
  amount              integer not null,
  currency            text not null default 'ron',
  status              text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  premium_until       timestamptz,
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_payments_provider_session_id on payments(provider_session_id);
create index if not exists idx_payments_status on payments(status);
