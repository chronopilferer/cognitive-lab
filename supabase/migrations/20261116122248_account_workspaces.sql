create table public.user_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 5242880),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.user_workspaces enable row level security;
revoke all on public.user_workspaces from anon;
grant select, insert, update on public.user_workspaces to authenticated;
create policy workspace_select on public.user_workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy workspace_insert on public.user_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy workspace_update on public.user_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.save_workspace(p_user uuid, p_revision bigint, p_payload jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare result bigint;
begin
 if auth.uid() is null or auth.uid() <> p_user then raise exception 'Unauthorized'; end if;
 if p_revision = 0 then
  insert into public.user_workspaces(user_id,payload) values(p_user,p_payload)
  on conflict (user_id) do nothing returning revision into result;
 else
  update public.user_workspaces set payload=p_payload,revision=revision+1,updated_at=now()
  where user_id=p_user and revision=p_revision returning revision into result;
 end if;
 return result;
end; $$;
revoke all on function public.save_workspace(uuid,bigint,jsonb) from public, anon;
grant execute on function public.save_workspace(uuid,bigint,jsonb) to authenticated;
