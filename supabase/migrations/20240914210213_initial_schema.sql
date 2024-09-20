create sequence "public"."accounts_id_seq";

create sequence "public"."market_id_seq";

create sequence "public"."setup_id_seq";

create sequence "public"."trades_id_seq";

create sequence "public"."type_id_seq";

-- Modify the trades table to remove quantity
create table "public"."trades" (
    "id" integer not null default nextval('trades_id_seq'::regclass),
    "creation_date" date default CURRENT_DATE,
    "account_id" integer,
    "name" text,
    "setup_id" integer,
    "type_id" integer,
    "market_id" integer,
    "group_rank" text,
    "pro_score" text,
    "one_week_rs" numeric(5,3),
    "one_month_rs" numeric(5,3),
    "risk_percent" numeric(5,3),
    "user_id" uuid not null
);

-- Update buy_transactions table
create table "public"."buy_transactions" (
    "id" serial primary key,
    "trade_id" integer not null,
    "buy_price" numeric(11,3),
    "buy_date" date,
    "quantity" numeric(11,3),
    "initial_stop" numeric(11,3),
    "stop_loss_percent" numeric(5,3),
    "buy_brokerage" numeric(11,3),
    "user_id" uuid not null
);

-- Update sell_transactions table
create table "public"."sell_transactions" (
    "id" serial primary key,
    "trade_id" integer not null,
    "sell_price" numeric(11,3),
    "sell_date" date,
    "quantity" numeric(11,3),
    "sell_brokerage" numeric(11,3),
    "user_id" uuid not null
);

create table "public"."accounts" (
    "id" integer not null default nextval('accounts_id_seq'::regclass),
    "account_name" text not null,
    "user_id" uuid not null
);


alter table "public"."accounts" enable row level security;

create table "public"."market" (
    "id" integer not null default nextval('market_id_seq'::regclass),
    "market_name" text not null,
    "user_id" uuid not null
);


alter table "public"."market" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "updated_at" timestamp with time zone,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "website" text
);


alter table "public"."profiles" enable row level security;

create table "public"."setup" (
    "id" integer not null default nextval('setup_id_seq'::regclass),
    "setup_name" text not null,
    "user_id" uuid not null
);


alter table "public"."setup" enable row level security;

create table "public"."type" (
    "id" integer not null default nextval('type_id_seq'::regclass),
    "type_name" text not null,
    "user_id" uuid not null
);


alter table "public"."type" enable row level security;

alter sequence "public"."accounts_id_seq" owned by "public"."accounts"."id";

alter sequence "public"."market_id_seq" owned by "public"."market"."id";

alter sequence "public"."setup_id_seq" owned by "public"."setup"."id";

alter sequence "public"."trades_id_seq" owned by "public"."trades"."id";

alter sequence "public"."type_id_seq" owned by "public"."type"."id";

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX market_pkey ON public.market USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX setup_pkey ON public.setup USING btree (id);

CREATE UNIQUE INDEX trades_pkey ON public.trades USING btree (id);

CREATE UNIQUE INDEX type_pkey ON public.type USING btree (id);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."market" add constraint "market_pkey" PRIMARY KEY using index "market_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."setup" add constraint "setup_pkey" PRIMARY KEY using index "setup_pkey";

alter table "public"."trades" add constraint "trades_pkey" PRIMARY KEY using index "trades_pkey";

alter table "public"."type" add constraint "type_pkey" PRIMARY KEY using index "type_pkey";

alter table "public"."accounts" add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."accounts" validate constraint "accounts_user_id_fkey";

alter table "public"."market" add constraint "market_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."market" validate constraint "market_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."profiles" add constraint "username_length" CHECK ((char_length(username) >= 3)) not valid;

alter table "public"."profiles" validate constraint "username_length";

alter table "public"."setup" add constraint "setup_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."setup" validate constraint "setup_user_id_fkey";

alter table "public"."trades" add constraint "trades_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) not valid;

alter table "public"."trades" validate constraint "trades_account_id_fkey";

alter table "public"."trades" add constraint "trades_market_id_fkey" FOREIGN KEY (market_id) REFERENCES market(id) not valid;

alter table "public"."trades" validate constraint "trades_market_id_fkey";

alter table "public"."trades" add constraint "trades_setup_id_fkey" FOREIGN KEY (setup_id) REFERENCES setup(id) not valid;

alter table "public"."trades" validate constraint "trades_setup_id_fkey";

alter table "public"."trades" add constraint "trades_type_id_fkey" FOREIGN KEY (type_id) REFERENCES type(id) not valid;

alter table "public"."trades" validate constraint "trades_type_id_fkey";

alter table "public"."trades" add constraint "trades_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."trades" validate constraint "trades_user_id_fkey";

alter table "public"."type" add constraint "type_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."type" validate constraint "type_user_id_fkey";

alter table "public"."buy_transactions" add constraint "buy_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."sell_transactions" add constraint "sell_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

-- Add foreign key constraints
alter table "public"."buy_transactions" add constraint "buy_transactions_trade_id_fkey" 
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE;

alter table "public"."sell_transactions" add constraint "sell_transactions_trade_id_fkey" 
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE;

-- Enable RLS for new tables
alter table "public"."buy_transactions" enable row level security;
alter table "public"."sell_transactions" enable row level security;

-- Grant permissions for new tables (adjust as needed)
grant all privileges on table "public"."buy_transactions" to authenticated;
grant all privileges on table "public"."sell_transactions" to authenticated;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."market" to "anon";

grant insert on table "public"."market" to "anon";

grant references on table "public"."market" to "anon";

grant select on table "public"."market" to "anon";

grant trigger on table "public"."market" to "anon";

grant truncate on table "public"."market" to "anon";

grant update on table "public"."market" to "anon";

grant delete on table "public"."market" to "authenticated";

grant insert on table "public"."market" to "authenticated";

grant references on table "public"."market" to "authenticated";

grant select on table "public"."market" to "authenticated";

grant trigger on table "public"."market" to "authenticated";

grant truncate on table "public"."market" to "authenticated";

grant update on table "public"."market" to "authenticated";

grant delete on table "public"."market" to "service_role";

grant insert on table "public"."market" to "service_role";

grant references on table "public"."market" to "service_role";

grant select on table "public"."market" to "service_role";

grant trigger on table "public"."market" to "service_role";

grant truncate on table "public"."market" to "service_role";

grant update on table "public"."market" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."setup" to "anon";

grant insert on table "public"."setup" to "anon";

grant references on table "public"."setup" to "anon";

grant select on table "public"."setup" to "anon";

grant trigger on table "public"."setup" to "anon";

grant truncate on table "public"."setup" to "anon";

grant update on table "public"."setup" to "anon";

grant delete on table "public"."setup" to "authenticated";

grant insert on table "public"."setup" to "authenticated";

grant references on table "public"."setup" to "authenticated";

grant select on table "public"."setup" to "authenticated";

grant trigger on table "public"."setup" to "authenticated";

grant truncate on table "public"."setup" to "authenticated";

grant update on table "public"."setup" to "authenticated";

grant delete on table "public"."setup" to "service_role";

grant insert on table "public"."setup" to "service_role";

grant references on table "public"."setup" to "service_role";

grant select on table "public"."setup" to "service_role";

grant trigger on table "public"."setup" to "service_role";

grant truncate on table "public"."setup" to "service_role";

grant update on table "public"."setup" to "service_role";

grant delete on table "public"."trades" to "anon";

grant insert on table "public"."trades" to "anon";

grant references on table "public"."trades" to "anon";

grant select on table "public"."trades" to "anon";

grant trigger on table "public"."trades" to "anon";

grant truncate on table "public"."trades" to "anon";

grant update on table "public"."trades" to "anon";

grant delete on table "public"."trades" to "authenticated";

grant insert on table "public"."trades" to "authenticated";

grant references on table "public"."trades" to "authenticated";

grant select on table "public"."trades" to "authenticated";

grant trigger on table "public"."trades" to "authenticated";

grant truncate on table "public"."trades" to "authenticated";

grant update on table "public"."trades" to "authenticated";

grant delete on table "public"."trades" to "service_role";

grant insert on table "public"."trades" to "service_role";

grant references on table "public"."trades" to "service_role";

grant select on table "public"."trades" to "service_role";

grant trigger on table "public"."trades" to "service_role";

grant truncate on table "public"."trades" to "service_role";

grant update on table "public"."trades" to "service_role";

grant delete on table "public"."type" to "anon";

grant insert on table "public"."type" to "anon";

grant references on table "public"."type" to "anon";

grant select on table "public"."type" to "anon";

grant trigger on table "public"."type" to "anon";

grant truncate on table "public"."type" to "anon";

grant update on table "public"."type" to "anon";

grant delete on table "public"."type" to "authenticated";

grant insert on table "public"."type" to "authenticated";

grant references on table "public"."type" to "authenticated";

grant select on table "public"."type" to "authenticated";

grant trigger on table "public"."type" to "authenticated";

grant truncate on table "public"."type" to "authenticated";

grant update on table "public"."type" to "authenticated";

grant delete on table "public"."type" to "service_role";

grant insert on table "public"."type" to "service_role";

grant references on table "public"."type" to "service_role";

grant select on table "public"."type" to "service_role";

grant trigger on table "public"."type" to "service_role";

grant truncate on table "public"."type" to "service_role";

grant update on table "public"."type" to "service_role";

create policy "account_delete_policy"
on "public"."accounts"
as permissive
for delete
to public
using (((select auth.uid()) = user_id));


create policy "account_insert_policy"
on "public"."accounts"
as permissive
for insert
to public
with check (((select auth.uid()) = user_id));


create policy "account_select_policy"
on "public"."accounts"
as permissive
for select
to public
using (((select auth.uid()) = user_id));


create policy "account_update_policy"
on "public"."accounts"
as permissive
for update
to public
using (((select auth.uid()) = user_id));


create policy "market_delete_policy"
on "public"."market"
as permissive
for delete
to public
using (((select auth.uid()) = user_id));


create policy "market_insert_policy"
on "public"."market"
as permissive
for insert
to public
with check (((select auth.uid()) = user_id));


create policy "market_select_policy"
on "public"."market"
as permissive
for select
to public
using (((select auth.uid()) = user_id));


create policy "market_update_policy"
on "public"."market"
as permissive
for update
to public
using (((select auth.uid()) = user_id));


create policy "Public profiles are viewable by everyone."
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to public
with check ((( select auth.uid() AS uid) = id));


create policy "Users can update own profile."
on "public"."profiles"
as permissive
for update
to public
using ((( select auth.uid() AS uid) = id));


create policy "setup_delete_policy"
on "public"."setup"
as permissive
for delete
to authenticated
using (((select auth.uid()) = user_id));


create policy "setup_insert_policy"
on "public"."setup"
as permissive
for insert
to authenticated
with check (((select auth.uid()) = user_id));


create policy "setup_select_policy"
on "public"."setup"
as permissive
for select
to authenticated
using (((select auth.uid()) = user_id));


create policy "setup_update_policy"
on "public"."setup"
as permissive
for update
to authenticated
using (((select auth.uid()) = user_id));


create policy "trade_delete_policy"
on "public"."trades"
as permissive
for delete
to authenticated
using (((select auth.uid()) = user_id));


create policy "trade_insert_policy"
on "public"."trades"
as permissive
for insert
to authenticated
with check (((select auth.uid()) = user_id));


create policy "trade_select_policy"
on "public"."trades"
as permissive
for select
to authenticated
using (((select auth.uid()) = user_id));


create policy "trade_update_policy"
on "public"."trades"
as permissive
for update
to authenticated
using (((select auth.uid()) = user_id));


create policy "type_delete_policy"
on "public"."type"
as permissive
for delete
to authenticated
using (((select auth.uid()) = user_id));


create policy "type_insert_policy"
on "public"."type"
as permissive
for insert
to authenticated
with check (((select auth.uid()) = user_id));


create policy "type_select_policy"
on "public"."type"
as permissive
for select
to authenticated
using (( (select auth.uid()) = user_id));


create policy "type_update_policy"
on "public"."type"
as permissive
for update
to authenticated
using (((select auth.uid()) = user_id));

create policy "buy_transactions_select_policy"
on "public"."buy_transactions"
as permissive
for select
to authenticated
using (((select auth.uid()) = user_id));

create policy "buy_transactions_insert_policy"
on "public"."buy_transactions"
as permissive
for insert
to authenticated
with check (((select auth.uid()) = user_id));


create policy "buy_transactions_update_policy"
on "public"."buy_transactions"
as permissive
for update
to authenticated
using (((select auth.uid()) = user_id));

create policy "buy_transactions_delete_policy"
on "public"."buy_transactions"
as permissive
for delete
to authenticated
using (((select auth.uid()) = user_id));

-- Create insert policy for sell_transactions
create policy "sell_transactions_insert_policy"
on "public"."sell_transactions"
as permissive
for insert
to authenticated
with check (((select auth.uid()) = user_id));

-- Create select policy for sell_transactions
create policy "sell_transactions_select_policy"
on "public"."sell_transactions"
as permissive
for select
to authenticated
using (((select auth.uid()) = user_id));

-- Create update policy for sell_transactions
create policy "sell_transactions_update_policy"
on "public"."sell_transactions"
as permissive
for update
to authenticated
using (((select auth.uid()) = user_id));

-- Create delete policy for sell_transactions
create policy "sell_transactions_delete_policy"
on "public"."sell_transactions"
as permissive
for delete
to authenticated
using (((select auth.uid()) = user_id));


CREATE OR REPLACE FUNCTION get_trades_with_remaining_quantity(user_id UUID)
RETURNS TABLE (
  id INT,
  name TEXT,
  remaining_quantity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, 
    t.name,
    COALESCE(SUM(b.quantity), 0) - COALESCE(SUM(s.quantity), 0) AS remaining_quantity
  FROM 
    trades t
    LEFT JOIN buy_transactions b ON t.id = b.trade_id
    LEFT JOIN sell_transactions s ON t.id = s.trade_id
  WHERE 
    t.user_id = get_trades_with_remaining_quantity.user_id
  GROUP BY 
    t.id, t.name
  HAVING 
    COALESCE(SUM(b.quantity), 0) - COALESCE(SUM(s.quantity), 0) > 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_remaining_quantity()
RETURNS TRIGGER AS $$
DECLARE
    remaining NUMERIC;
    trade_user_id UUID;
BEGIN
    -- Get the user_id for the trade
    SELECT user_id INTO trade_user_id
    FROM trades
    WHERE id = NEW.trade_id;

    -- Calculate the remaining quantity for the trade
    SELECT COALESCE(SUM(b.quantity), 0) - COALESCE(SUM(s.quantity), 0)
    INTO remaining
    FROM trades t
    LEFT JOIN buy_transactions b ON t.id = b.trade_id
    LEFT JOIN sell_transactions s ON t.id = s.trade_id
    WHERE t.id = NEW.trade_id
    GROUP BY t.id;

    -- Check if the new sell quantity exceeds the remaining quantity
    IF NEW.quantity > remaining THEN
        RAISE EXCEPTION 'Sell quantity (%) exceeds remaining quantity (%)', NEW.quantity, remaining;
    END IF;

    -- Set the user_id for the new sell transaction
    NEW.user_id := trade_user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to use the check_remaining_quantity function
CREATE TRIGGER check_sell_quantity
BEFORE INSERT OR UPDATE ON sell_transactions
FOR EACH ROW
EXECUTE FUNCTION check_remaining_quantity();