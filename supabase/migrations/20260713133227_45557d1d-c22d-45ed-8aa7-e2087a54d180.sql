DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages are viewable by everyone" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_all" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;

CREATE POLICY "Authenticated users can read chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.chat_messages FROM anon;