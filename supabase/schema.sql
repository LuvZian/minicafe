create extension if not exists pgcrypto;

drop table if exists public.minicafe_store cascade;

create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.menu_types (
  id text primary key,
  name text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.menus (
  id text primary key,
  name text not null,
  category_id text not null references public.categories(id),
  menu_type_id text not null references public.menu_types(id),
  option_config jsonb not null default '{}'::jsonb,
  price integer not null check (price >= 0),
  description text not null default '',
  image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorite_menus (
  id bigint generated always as identity primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  menu_id text not null references public.menus(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, menu_id)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id bigint generated always as identity primary key,
  cart_id uuid not null references public.carts(id) on delete cascade,
  cart_item_key text not null,
  menu_id text references public.menus(id) on delete cascade,
  name text not null,
  category_id text not null references public.categories(id),
  menu_type_id text not null references public.menu_types(id),
  price integer not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (cart_id, cart_item_key)
);

create table if not exists public.orders (
  id text primary key,
  user_id text references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null default '',
  total integer not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  menu_id text references public.menus(id) on delete set null,
  name text not null,
  category_id text not null references public.categories(id),
  menu_type_id text not null references public.menu_types(id),
  price integer not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  options jsonb not null default '{}'::jsonb
);

create index if not exists favorite_menus_user_id_idx on public.favorite_menus(user_id);
create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

insert into public.categories (id, name, sort_order) values
  ('spring', '봄', 1), ('summer', '여름', 2),
  ('autumn', '가을', 3), ('winter', '겨울', 4)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.menu_types (id, name, sort_order) values
  ('drink', '음료', 1), ('dessert', '디저트', 2), ('goods', '굿즈', 3)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.profiles (id, name, email, password_hash, role)
values ('admin-default', 'Minicafe Admin', 'admin@minicafe.local', extensions.crypt('admin1234', extensions.gen_salt('bf')), 'admin')
on conflict (email) do update set role = 'admin';

create or replace function public.register_minicafe_user(p_id text, p_name text, p_email text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare created_profile public.profiles;
begin
  if length(trim(p_name)) = 0 or length(trim(p_email)) = 0 or length(p_password) < 6 then
    raise exception 'Invalid registration data';
  end if;
  insert into public.profiles (id, name, email, password_hash, role)
  values (p_id, trim(p_name), lower(trim(p_email)), extensions.crypt(p_password, extensions.gen_salt('bf')), 'customer')
  returning * into created_profile;
  return jsonb_build_object(
    'id', created_profile.id, 'name', created_profile.name, 'email', created_profile.email,
    'role', created_profile.role, 'createdAt', created_profile.created_at
  );
exception when unique_violation then
  raise exception 'Email already registered';
end;
$$;

create or replace function public.login_minicafe_user(p_email text, p_password text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', id, 'name', name, 'email', email, 'role', role, 'createdAt', created_at
  )
  from public.profiles
  where email = lower(trim(p_email)) and password_hash = extensions.crypt(p_password, password_hash)
  limit 1;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.menu_types enable row level security;
alter table public.menus enable row level security;
alter table public.favorite_menus enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','categories','menu_types','menus','favorite_menus','carts','cart_items','orders','order_items'] loop
    execute format('drop policy if exists "minicafe demo access" on public.%I', table_name);
    execute format('create policy "minicafe demo access" on public.%I for all to anon using (true) with check (true)', table_name);
  end loop;
end $$;

grant usage on schema public to anon;
grant select on public.categories, public.menu_types to anon;
grant select, insert, update, delete on public.menus, public.carts, public.cart_items, public.orders, public.order_items to anon;
grant select, insert, delete on public.favorite_menus to anon;
revoke all on public.profiles from anon;
grant select (id, name, email, role, created_at), update (name) on public.profiles to anon;
grant usage, select on sequence public.favorite_menus_id_seq, public.cart_items_id_seq, public.order_items_id_seq to anon;
grant execute on function public.register_minicafe_user(text, text, text, text) to anon;
grant execute on function public.login_minicafe_user(text, text) to anon;
