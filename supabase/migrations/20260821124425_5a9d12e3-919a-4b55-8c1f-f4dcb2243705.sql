insert into public.permissions (code, module, description) values
  ('employees.view_directory','employees','View basic staff directory (no sensitive data)'),
  ('workers.view_directory','workers','View basic worker directory (no sensitive data)')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug in ('employee','worker')
  and p.code in ('employees.view_directory','workers.view_directory')
on conflict do nothing;

create or replace function public.staff_directory()
returns table (
  id uuid, full_name text, employee_code text, email text, phone text,
  job_title text, department_id uuid, employment_type text, status text, photo_url text
)
language sql stable security definer set search_path = public as $$
  select e.id, e.full_name, e.employee_code, e.email, e.phone,
         e.job_title, e.department_id, e.employment_type, e.status, e.photo_url
  from public.employees e
  where public.is_active_user(auth.uid())
    and (public.has_permission(auth.uid(),'employees.view')
      or public.has_permission(auth.uid(),'employees.view_directory'))
  order by e.full_name;
$$;

create or replace function public.worker_directory()
returns table (
  id uuid, full_name text, worker_code text, phone text, trade text, site text,
  department_id uuid, employment_type text, status text, photo_url text
)
language sql stable security definer set search_path = public as $$
  select w.id, w.full_name, w.worker_code, w.phone, w.trade, w.site,
         w.department_id, w.employment_type, w.status, w.photo_url
  from public.workers w
  where public.is_active_user(auth.uid())
    and (public.has_permission(auth.uid(),'workers.view')
      or public.has_permission(auth.uid(),'workers.view_directory'))
  order by w.full_name;
$$;

revoke all on function public.staff_directory() from public, anon;
revoke all on function public.worker_directory() from public, anon;
grant execute on function public.staff_directory() to authenticated;
grant execute on function public.worker_directory() to authenticated;