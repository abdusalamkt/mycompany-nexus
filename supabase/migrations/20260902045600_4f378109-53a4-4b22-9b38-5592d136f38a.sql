CREATE TABLE public.org_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.org_chart_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_id uuid NOT NULL REFERENCES public.org_charts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.org_chart_nodes(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  person_name text NOT NULL,
  role_title text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_charts TO authenticated;
GRANT ALL ON public.org_charts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_chart_nodes TO authenticated;
GRANT ALL ON public.org_chart_nodes TO service_role;

ALTER TABLE public.org_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_chart_nodes ENABLE ROW LEVEL SECURITY;

INSERT INTO public.permissions (code, module, description) VALUES
  ('org_charts.view', 'Org Chart', 'View organization charts'),
  ('org_charts.manage', 'Org Chart', 'Create, edit and delete organization charts')
ON CONFLICT (code) DO NOTHING;

CREATE POLICY org_charts_read ON public.org_charts FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'org_charts.view'));
CREATE POLICY org_charts_write ON public.org_charts FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'org_charts.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'org_charts.manage'));

CREATE POLICY org_nodes_read ON public.org_chart_nodes FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'org_charts.view'));
CREATE POLICY org_nodes_write ON public.org_chart_nodes FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'org_charts.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'org_charts.manage'));

CREATE TRIGGER trg_org_charts_updated BEFORE UPDATE ON public.org_charts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_org_chart_nodes_updated BEFORE UPDATE ON public.org_chart_nodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_org_nodes_chart ON public.org_chart_nodes(chart_id);
CREATE INDEX idx_org_nodes_parent ON public.org_chart_nodes(parent_id);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE p.code = 'org_charts.view'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug IN ('super_admin','admin','hr') AND p.code = 'org_charts.manage'
ON CONFLICT DO NOTHING;