DROP POLICY IF EXISTS employee_photos_read ON storage.objects;
CREATE POLICY employee_photos_read ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'employee-photos'
  AND is_active_user(auth.uid())
  AND (
    has_permission(auth.uid(), 'employees.view')
    OR has_permission(auth.uid(), 'employees.view_directory')
    OR has_permission(auth.uid(), 'workers.view')
    OR has_permission(auth.uid(), 'workers.view_directory')
  )
);