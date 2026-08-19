-- WORKERS
CREATE TABLE public.workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  worker_code text,
  photo_url text,
  nationality text,
  phone text,
  trade text,
  site text,
  department_id uuid REFERENCES public.departments(id),
  employment_type text NOT NULL DEFAULT 'full_time',
  joining_date date,
  contract_end_date date,
  status text NOT NULL DEFAULT 'active',
  passport_number text,
  passport_expiry date,
  visa_number text,
  visa_expiry date,
  emirates_id text,
  emirates_id_expiry date,
  labour_card_number text,
  labour_card_expiry date,
  insurance_expiry date,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workers TO authenticated;
GRANT ALL ON public.workers TO service_role;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY workers_read ON public.workers FOR SELECT TO authenticated USING (public.has_permission(auth.uid(), 'workers.view'));
CREATE POLICY workers_insert ON public.workers FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'workers.create'));
CREATE POLICY workers_update ON public.workers FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'workers.edit')) WITH CHECK (public.has_permission(auth.uid(), 'workers.edit'));
CREATE POLICY workers_delete ON public.workers FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'workers.delete'));
CREATE TRIGGER trg_workers_updated BEFORE UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NEWS
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'announcement',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY news_read ON public.news_posts FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'news.view') AND (is_published OR public.has_permission(auth.uid(), 'news.edit') OR author_id = auth.uid()));
CREATE POLICY news_insert ON public.news_posts FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'news.create'));
CREATE POLICY news_update ON public.news_posts FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'news.edit')) WITH CHECK (public.has_permission(auth.uid(), 'news.edit'));
CREATE POLICY news_delete ON public.news_posts FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'news.delete'));
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- POLICIES (company policy documents)
CREATE TABLE public.company_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  version text NOT NULL DEFAULT '1.0',
  file_path text,
  file_name text,
  effective_date date,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_policies TO authenticated;
GRANT ALL ON public.company_policies TO service_role;
ALTER TABLE public.company_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY policies_read ON public.company_policies FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'policies.view') AND (is_published OR public.has_permission(auth.uid(), 'policies.edit')));
CREATE POLICY policies_insert ON public.company_policies FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'policies.create'));
CREATE POLICY policies_update ON public.company_policies FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'policies.edit')) WITH CHECK (public.has_permission(auth.uid(), 'policies.edit'));
CREATE POLICY policies_delete ON public.company_policies FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'policies.delete'));
CREATE TRIGGER trg_company_policies_updated BEFORE UPDATE ON public.company_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  owner_user_id uuid,
  visibility text NOT NULL DEFAULT 'company',
  expiry_date date,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_read ON public.documents FOR SELECT TO authenticated
  USING (
    public.is_active_user(auth.uid()) AND (
      owner_user_id = auth.uid()
      OR (visibility = 'company' AND public.has_permission(auth.uid(), 'documents.view'))
      OR (visibility = 'restricted' AND public.has_permission(auth.uid(), 'employees.view_sensitive'))
    )
  );
CREATE POLICY documents_insert ON public.documents FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'documents.upload'));
CREATE POLICY documents_update ON public.documents FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'documents.edit')) WITH CHECK (public.has_permission(auth.uid(), 'documents.edit'));
CREATE POLICY documents_delete ON public.documents FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'documents.delete'));
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STORAGE policies for the private company-files bucket
CREATE POLICY "company_files_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'company-files' AND public.is_active_user(auth.uid()));
CREATE POLICY "company_files_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-files' AND (public.has_permission(auth.uid(), 'documents.upload') OR public.has_permission(auth.uid(), 'policies.create') OR public.has_permission(auth.uid(), 'workers.create')));
CREATE POLICY "company_files_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'company-files' AND (public.has_permission(auth.uid(), 'documents.edit') OR public.has_permission(auth.uid(), 'policies.edit') OR public.has_permission(auth.uid(), 'workers.edit')));
CREATE POLICY "company_files_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'company-files' AND (public.has_permission(auth.uid(), 'documents.delete') OR public.has_permission(auth.uid(), 'policies.delete') OR public.has_permission(auth.uid(), 'workers.delete')));