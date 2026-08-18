
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  employee_code text UNIQUE,
  email text,
  phone text,
  nationality text,
  date_of_birth date,
  gender text,
  photo_url text,
  address text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  job_title text,
  employment_type text NOT NULL DEFAULT 'full_time',
  joining_date date,
  contract_end_date date,
  salary numeric,
  status text NOT NULL DEFAULT 'active',
  passport_number text,
  passport_expiry date,
  visa_number text,
  visa_expiry date,
  emirates_id text,
  emirates_id_expiry date,
  insurance_expiry date,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY employees_read ON public.employees FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'employees.view'));
CREATE POLICY employees_insert ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'employees.create'));
CREATE POLICY employees_update ON public.employees FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'employees.edit'))
  WITH CHECK (public.has_permission(auth.uid(), 'employees.edit'));
CREATE POLICY employees_delete ON public.employees FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'employees.delete'));

CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_employees_department ON public.employees(department_id);
