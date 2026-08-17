
-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ departments ============
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ roles ============
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  rank int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ permissions ============
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  module text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- ============ profiles ============
CREATE TYPE public.user_status AS ENUM ('active','inactive','suspended');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  employee_code text UNIQUE,
  phone text,
  job_title text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url text,
  status public.user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_department ON public.profiles(department_id);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE public.user_permissions (
  user_id uuid NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_id)
);

-- ============ audit logs ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  module text NOT NULL,
  record_id text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);

-- ============ security definer helpers ============
CREATE OR REPLACE FUNCTION public.is_active_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _user_id AND p.status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role_slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = _user_id AND r.slug = _role_slug
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_active_user(_user_id) AND (
    public.has_role(_user_id, 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = _user_id AND p.code = _code AND up.granted
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role_id = ur.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = _user_id AND p.code = _code
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.user_permissions up
        JOIN public.permissions p ON p.id = up.permission_id
        WHERE up.user_id = _user_id AND p.code = _code AND up.granted = false
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.my_permissions()
RETURNS TABLE(code text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.code FROM public.permissions p
  WHERE public.has_permission(auth.uid(), p.code);
$$;

-- ============ signup trigger ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role_slug text;
  _role_id uuid;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    _role_slug := 'super_admin';
  ELSE
    _role_slug := 'employee';
  END IF;

  SELECT id INTO _role_id FROM public.roles WHERE slug = _role_slug;
  IF _role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, _role_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ updated_at triggers ============
CREATE TRIGGER trg_departments_updated BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ grants ============
GRANT SELECT ON public.departments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT SELECT ON public.permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.departments, public.roles, public.permissions, public.role_permissions,
  public.user_permissions, public.user_roles, public.profiles, public.audit_logs TO service_role;

-- ============ RLS ============
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY dept_read ON public.departments FOR SELECT TO authenticated USING (public.is_active_user(auth.uid()));
CREATE POLICY dept_write ON public.departments FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(),'settings.manage')) WITH CHECK (public.has_permission(auth.uid(),'settings.manage'));

CREATE POLICY roles_read ON public.roles FOR SELECT TO authenticated USING (public.is_active_user(auth.uid()));
CREATE POLICY roles_write ON public.roles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(),'users.manage_permissions')) WITH CHECK (public.has_permission(auth.uid(),'users.manage_permissions'));

CREATE POLICY perms_read ON public.permissions FOR SELECT TO authenticated USING (public.is_active_user(auth.uid()));

CREATE POLICY rp_read ON public.role_permissions FOR SELECT TO authenticated USING (public.is_active_user(auth.uid()));
CREATE POLICY rp_write ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(),'users.manage_permissions')) WITH CHECK (public.has_permission(auth.uid(),'users.manage_permissions'));

CREATE POLICY up_read ON public.user_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_permission(auth.uid(),'users.manage_permissions'));
CREATE POLICY up_write ON public.user_permissions FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(),'users.manage_permissions')) WITH CHECK (public.has_permission(auth.uid(),'users.manage_permissions'));

CREATE POLICY ur_read ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_permission(auth.uid(),'users.view'));
CREATE POLICY ur_write ON public.user_roles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(),'users.manage_permissions')) WITH CHECK (public.has_permission(auth.uid(),'users.manage_permissions'));

CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_permission(auth.uid(),'users.view'));
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() AND public.is_active_user(auth.uid())) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'users.edit')) WITH CHECK (public.has_permission(auth.uid(),'users.edit'));
CREATE POLICY profiles_insert_admin ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(),'users.create'));

CREATE POLICY audit_read ON public.audit_logs FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'audit.view'));
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() AND public.is_active_user(auth.uid()));

-- ============ seed ============
INSERT INTO public.departments (slug, name) VALUES
  ('management','Management'),('hr','HR'),('sales','Sales'),
  ('marketing','Marketing'),('production','Production'),('operations','O&P');

INSERT INTO public.roles (slug, name, description, is_system, rank) VALUES
  ('super_admin','Super Admin','Full system access',true,1),
  ('admin','Admin','Broad administrative access',true,2),
  ('hr','HR','HR-focused access',true,3),
  ('employee','Employee','Standard employee access',true,4),
  ('worker','Worker','Restricted worker access',true,5);

INSERT INTO public.permissions (code, module, description) VALUES
  ('dashboard.view','Dashboard','View dashboard'),
  ('users.view','Users','View users'),('users.create','Users','Create users'),('users.edit','Users','Edit users'),
  ('users.deactivate','Users','Deactivate users'),('users.delete','Users','Delete users'),
  ('users.manage_permissions','Users','Manage roles and permissions'),
  ('employees.view','Employees','View employees'),('employees.create','Employees','Create employees'),
  ('employees.edit','Employees','Edit employees'),('employees.delete','Employees','Delete employees'),
  ('employees.view_sensitive','Employees','View sensitive employee data'),
  ('workers.view','Workers','View workers'),('workers.create','Workers','Create workers'),
  ('workers.edit','Workers','Edit workers'),('workers.delete','Workers','Delete workers'),
  ('documents.view','Documents','View documents'),('documents.upload','Documents','Upload documents'),
  ('documents.download','Documents','Download documents'),('documents.edit','Documents','Edit documents'),
  ('documents.delete','Documents','Delete documents'),
  ('passport.view','Passport','View passports'),('passport.upload','Passport','Upload passports'),('passport.edit','Passport','Edit passports'),
  ('visa.view','Visa','View visas'),('visa.upload','Visa','Upload visas'),('visa.edit','Visa','Edit visas'),
  ('leave.view','Leave','View leave'),('leave.create','Leave','Create leave'),('leave.edit','Leave','Edit leave'),
  ('leave.delete','Leave','Delete leave'),('leave.approve','Leave','Approve leave'),
  ('news.view','News','View news'),('news.create','News','Create news'),('news.edit','News','Edit news'),
  ('news.delete','News','Delete news'),('news.publish','News','Publish news'),
  ('policies.view','Policies','View policies'),('policies.create','Policies','Create policies'),
  ('policies.edit','Policies','Edit policies'),('policies.delete','Policies','Delete policies'),('policies.publish','Policies','Publish policies'),
  ('certificates.view','Certificates','View certificates'),('certificates.create','Certificates','Create certificates'),
  ('certificates.edit','Certificates','Edit certificates'),('certificates.delete','Certificates','Delete certificates'),
  ('memos.view','Memos','View memos'),('memos.create','Memos','Create memos'),('memos.edit','Memos','Edit memos'),
  ('memos.delete','Memos','Delete memos'),('memos.publish','Memos','Publish memos'),
  ('sales.view','Sales','View sales'),('sales.manage','Sales','Manage sales'),
  ('marketing.view','Marketing','View marketing'),('marketing.manage','Marketing','Manage marketing'),
  ('production.view','Production','View production'),('production.manage','Production','Manage production'),
  ('operations.view','O&P','View operations'),('operations.manage','O&P','Manage operations'),
  ('notifications.view','Notifications','View notifications'),('notifications.manage','Notifications','Manage notifications'),
  ('audit.view','Audit','View audit logs'),
  ('settings.view','Settings','View settings'),('settings.manage','Settings','Manage settings');

-- super admin: all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p WHERE r.slug = 'super_admin';

-- admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.code IN (
  'dashboard.view','users.view','users.create','users.edit','users.deactivate',
  'employees.view','employees.create','employees.edit','workers.view','workers.create','workers.edit',
  'documents.view','documents.upload','documents.download','documents.edit',
  'news.view','news.create','news.edit','news.publish','policies.view','policies.create','policies.edit','policies.publish',
  'memos.view','memos.create','memos.edit','memos.publish','certificates.view','certificates.create','certificates.edit',
  'leave.view','leave.approve','notifications.view','notifications.manage','settings.view',
  'sales.view','marketing.view','production.view','operations.view'
) WHERE r.slug = 'admin';

-- hr
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.code IN (
  'dashboard.view','users.view','employees.view','employees.create','employees.edit','employees.view_sensitive',
  'workers.view','workers.create','workers.edit','documents.view','documents.upload','documents.download','documents.edit',
  'passport.view','passport.upload','passport.edit','visa.view','visa.upload','visa.edit',
  'certificates.view','certificates.create','certificates.edit',
  'leave.view','leave.create','leave.edit','leave.approve','policies.view','news.view','memos.view',
  'notifications.view','notifications.manage'
) WHERE r.slug = 'hr';

-- employee
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.code IN (
  'dashboard.view','news.view','policies.view','memos.view','leave.view','leave.create','notifications.view','documents.view'
) WHERE r.slug = 'employee';

-- worker
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.code IN (
  'dashboard.view','news.view','policies.view','leave.view','notifications.view','documents.view'
) WHERE r.slug = 'worker';
