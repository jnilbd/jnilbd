DROP POLICY IF EXISTS "Anyone can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload rental images" ON storage.objects;

CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'marketplace-images' AND owner = auth.uid());

CREATE POLICY "Authenticated users can upload rental images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rental-images' AND owner = auth.uid());