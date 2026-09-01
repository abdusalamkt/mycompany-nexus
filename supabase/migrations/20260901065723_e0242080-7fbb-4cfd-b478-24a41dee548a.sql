CREATE TABLE public.leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  person_type text NOT NULL DEFAULT 'employee',
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  leave_type text NOT NULL DEFAULT 'annual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  remarks text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaves TO authenticated;
GRANT ALL ON public.leaves TO service_role;

ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY leaves_read ON public.leaves FOR SELECT TO authenticated
  USING (is_active_user(auth.uid()) AND has_permission(auth.uid(), 'leaves.view'));
CREATE POLICY leaves_insert ON public.leaves FOR INSERT TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'leaves.manage'));
CREATE POLICY leaves_update ON public.leaves FOR UPDATE TO authenticated
  USING (has_permission(auth.uid(), 'leaves.manage'))
  WITH CHECK (has_permission(auth.uid(), 'leaves.manage'));
CREATE POLICY leaves_delete ON public.leaves FOR DELETE TO authenticated
  USING (has_permission(auth.uid(), 'leaves.manage'));

CREATE TRIGGER trg_leaves_updated BEFORE UPDATE ON public.leaves
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_leaves_start ON public.leaves (start_date DESC);

INSERT INTO public.permissions (code, module, description) VALUES
  ('leaves.view', 'Leave', 'View leave records'),
  ('leaves.manage', 'Leave', 'Add, edit and delete leave records')
ON CONFLICT (code) DO NOTHING;

-- every role can view leave
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r
CROSS JOIN public.permissions p
WHERE p.code = 'leaves.view'
ON CONFLICT DO NOTHING;

-- HR / admin roles can manage leave
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r
CROSS JOIN public.permissions p
WHERE p.code = 'leaves.manage' AND r.slug IN ('super_admin','admin','hr')
ON CONFLICT DO NOTHING;