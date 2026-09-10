-- Ejecuta este archivo completo una vez en el SQL Editor de Supabase.
-- Salas privadas: el navegador nunca accede a esta tabla ni a la función.
create table if not exists public.beberciules_rooms (
  code text primary key check (code ~ '^[A-F0-9]{6}$'),
  version bigint not null,
  state jsonb not null,
  expires_at timestamptz not null
);
alter table public.beberciules_rooms enable row level security;
revoke all on public.beberciules_rooms from public, anon, authenticated;
grant select, insert, update, delete on public.beberciules_rooms to service_role;
create index if not exists beberciules_rooms_expiry on public.beberciules_rooms(expires_at);

create or replace function public.beberciules_commit(p_code text, p_expected bigint, p_state jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  delete from public.beberciules_rooms where expires_at < now();
  if p_expected = -1 then
    insert into public.beberciules_rooms(code, version, state, expires_at)
    values(p_code, (p_state->>'version')::bigint, p_state, now() + interval '6 hours')
    on conflict (code) do nothing;
  else
    update public.beberciules_rooms
    set version = (p_state->>'version')::bigint, state = p_state, expires_at = now() + interval '6 hours'
    where code = p_code and version = p_expected;
  end if;
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;
revoke all on function public.beberciules_commit(text,bigint,jsonb) from public, anon, authenticated;
grant execute on function public.beberciules_commit(text,bigint,jsonb) to service_role;
