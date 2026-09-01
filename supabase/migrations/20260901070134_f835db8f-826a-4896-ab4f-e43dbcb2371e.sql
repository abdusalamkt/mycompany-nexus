CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  certificate_type text NOT NULL DEFAULT 'other',
  holder_type text NOT NULL DEFAULT 'company',
  holder_name text,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  issuing_authority text,
  certificate_number text,
  issue_date date,
  expiry_date date,
  status text NOT NULL DEFAULT 'valid',
  notes text,
  file_path text,
  file_name text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY certificates_read ON public.certificates FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'certificates.view'));
CREATE POLICY certificates_insert ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'certificates.create'));
CREATE POLICY certificates_update ON public.certificates FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'certificates.edit'))
  WITH CHECK (public.has_permission(auth.uid(), 'certificates.edit'));
CREATE POLICY certificates_delete ON public.certificates FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'certificates.delete'));

CREATE TRIGGER trg_certificates_updated BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_certificates_expiry ON public.certificates(expiry_date);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug IN ('super_admin','admin','hr')
  AND p.code IN ('certificates.view','certificates.create','certificates.edit','certificates.delete')
ON CONFLICT DO NOTHING;