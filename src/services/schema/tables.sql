drop table if exists profiles;
create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  avatar text not null
);

create table profiles_private (
  id uuid references profiles(id) primary key,
  email text not null,
  admin boolean default false not null
);

alter table profiles_private
  enable row level security;

create policy "Profiles are only visible by the user who owns it"
  on profiles_private for select using (
    auth.uid() = id
  );
  

drop function if exists handle_new_user();
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, name, avatar)
  values (new.id, new.raw_user_meta_data::json->>'full_name', new.raw_user_meta_data::json->>'avatar_url');
  
  insert into profiles_private (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- recipes

create table recipes (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  slug text not null,
  name text not null,
  description text not null,

  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

alter table recipes
  enable row level security;

create policy "Recipes selected: anon"
  on recipes for select using (
    true
  );

create policy "Recipes inserted: authenticated"
  on recipes for insert with check (
    auth.role() = 'authenticated'
  );

create extension unaccent with schema extensions;

create or replace function public.slugify()
 returns trigger
as $$
begin
    new.slug := trim(BOTH '-' from regexp_replace(lower(extensions.unaccent(trim(new.name))), '[^a-z0-9\-_]+', '-', 'gi'));
    return new;
end;
$$ language plpgsql;

drop trigger if exists on_recipe_created_add_slug on public.recipes;
create trigger on_recipe_created_add_slug
  before insert on public.recipes
  for each row execute procedure public.slugify();

-- tags

create table tags (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  name text not null,

  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

create table recipe_tags (
  id uuid default extensions.uuid_generate_v4() primary key,

  tag_id uuid not null,
  constraint tag_id foreign key(tag_id) references tags(id) on delete cascade,

  recipe_id uuid not null,
  constraint recipe_id foreign key(recipe_id) references recipes(id) on delete cascade
);