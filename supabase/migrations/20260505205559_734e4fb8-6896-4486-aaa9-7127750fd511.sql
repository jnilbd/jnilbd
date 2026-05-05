
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  budget TEXT,
  urgent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a service request"
ON public.service_requests
FOR INSERT
WITH CHECK (
  ((auth.uid() IS NULL) AND (user_id IS NULL))
  OR ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
);

CREATE POLICY "Owner can view their service requests"
ON public.service_requests
FOR SELECT
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE TRIGGER set_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_service_requests_created_at ON public.service_requests(created_at DESC);
