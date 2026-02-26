create table public.games (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  current_quarter integer null default 1,
  cash numeric null default 1000000,
  engineers integer null default 4,
  sales_staff integer null default 2,
  product_quality double precision null default 50,
  is_active boolean null default true,
  updated_at timestamp with time zone null default now(),
  constraint games_pkey primary key (id),
  constraint games_user_id_key unique (user_id),
  constraint games_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create table public.game_history (
  id uuid not null default extensions.uuid_generate_v4 (),
  game_id uuid null,
  quarter integer null,
  cash numeric null,
  revenue numeric null,
  net_income numeric null,
  engineers integer null,
  sales_staff integer null,
  created_at timestamp with time zone null default now(),
  is_deleted boolean null default false,
  constraint game_history_pkey primary key (id),
  constraint game_history_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_game_history_active on public.game_history using btree (game_id) TABLESPACE pg_default
where
  (is_deleted = false);