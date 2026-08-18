
CREATE POLICY "employee_photos_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'employee-photos' AND public.has_permission(auth.uid(), 'employees.view'));
CREATE POLICY "employee_photos_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'employee-photos' AND (public.has_permission(auth.uid(), 'employees.create') OR public.has_permission(auth.uid(), 'employees.edit')));
CREATE POLICY "employee_photos_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'employee-photos' AND public.has_permission(auth.uid(), 'employees.edit'));
CREATE POLICY "employee_photos_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'employee-photos' AND public.has_permission(auth.uid(), 'employees.delete'));
