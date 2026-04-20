-- =========================================================
-- PROFILES (extends auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  trust_score integer not null default 50,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- LISTINGS
-- =========================================================
create type public.listing_status as enum ('active', 'sold', 'removed');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  category text not null,
  image_url text not null,
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_seller_idx on public.listings(seller_id);
create index listings_category_idx on public.listings(category);
create index listings_status_idx on public.listings(status);

alter table public.listings enable row level security;

create policy "Listings viewable by everyone"
  on public.listings for select using (true);

create policy "Authenticated users can create listings"
  on public.listings for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings"
  on public.listings for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
  on public.listings for delete using (auth.uid() = seller_id);

create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

-- =========================================================
-- REVIEWS
-- =========================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now(),
  unique (seller_id, reviewer_id)
);

create index reviews_seller_idx on public.reviews(seller_id);

alter table public.reviews enable row level security;

create policy "Reviews viewable by everyone"
  on public.reviews for select using (true);

create policy "Authenticated users can create reviews for others"
  on public.reviews for insert with check (
    auth.uid() = reviewer_id and reviewer_id <> seller_id
  );

create policy "Reviewers can update their own reviews"
  on public.reviews for update using (auth.uid() = reviewer_id);

create policy "Reviewers can delete their own reviews"
  on public.reviews for delete using (auth.uid() = reviewer_id);

-- =========================================================
-- REPORTS
-- =========================================================
create type public.report_reason as enum ('fake_product', 'scam_attempt', 'other');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  reason public.report_reason not null,
  details text,
  created_at timestamptz not null default now(),
  unique (reported_user_id, reporter_id, listing_id)
);

create index reports_reported_idx on public.reports(reported_user_id);

alter table public.reports enable row level security;

create policy "Users can view reports they filed"
  on public.reports for select using (auth.uid() = reporter_id);

create policy "Authenticated users can file reports against others"
  on public.reports for insert with check (
    auth.uid() = reporter_id and reporter_id <> reported_user_id
  );

-- =========================================================
-- CART ITEMS
-- =========================================================
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index cart_user_idx on public.cart_items(user_id);

alter table public.cart_items enable row level security;

create policy "Users view their own cart"
  on public.cart_items for select using (auth.uid() = user_id);

create policy "Users add to their own cart"
  on public.cart_items for insert with check (auth.uid() = user_id);

create policy "Users remove from their own cart"
  on public.cart_items for delete using (auth.uid() = user_id);

-- =========================================================
-- DEALS
-- =========================================================
create type public.deal_status as enum ('pending', 'completed');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  status public.deal_status not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (listing_id, buyer_id)
);

create index deals_buyer_idx on public.deals(buyer_id);
create index deals_seller_idx on public.deals(seller_id);

alter table public.deals enable row level security;

create policy "Participants can view their deals"
  on public.deals for select using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

create policy "Buyers create deals on WhatsApp click"
  on public.deals for insert with check (
    auth.uid() = buyer_id and buyer_id <> seller_id
  );

create policy "Buyers can mark their deal completed"
  on public.deals for update using (auth.uid() = buyer_id);

-- =========================================================
-- TRUST SCORE TRIGGERS
-- =========================================================
create or replace function public.clamp_trust(score integer)
returns integer language sql immutable as $$
  select greatest(0, least(100, score));
$$;

create or replace function public.apply_trust_delta(target uuid, delta integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set trust_score = public.clamp_trust(trust_score + delta)
  where id = target;
end;
$$;

create or replace function public.on_review_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.rating >= 4 then
    perform public.apply_trust_delta(new.seller_id, 5);
  elsif new.rating <= 2 then
    perform public.apply_trust_delta(new.seller_id, -5);
  end if;
  return new;
end;
$$;

create trigger reviews_trust_trigger
  after insert on public.reviews
  for each row execute function public.on_review_insert();

create or replace function public.on_report_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_count integer;
begin
  update public.profiles
  set report_count = report_count + 1
  where id = new.reported_user_id
  returning report_count into new_count;

  perform public.apply_trust_delta(new.reported_user_id, -15);

  if new_count = 3 then
    perform public.apply_trust_delta(new.reported_user_id, -20);
  end if;

  return new;
end;
$$;

create trigger reports_trust_trigger
  after insert on public.reports
  for each row execute function public.on_report_insert();

create or replace function public.on_deal_completed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    perform public.apply_trust_delta(new.seller_id, 10);
    new.completed_at = now();
    update public.listings set status = 'sold' where id = new.listing_id;
  end if;
  return new;
end;
$$;

create trigger deals_trust_trigger
  before update on public.deals
  for each row execute function public.on_deal_completed();