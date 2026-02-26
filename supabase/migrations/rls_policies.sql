-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

-- Re-create policies idempotently
DROP POLICY IF EXISTS "Users can view own game" ON public.games;
CREATE POLICY "Users can view own game"
ON public.games
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own game" ON public.games;
CREATE POLICY "Users can update own game"
ON public.games
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own history" ON public.game_history;
CREATE POLICY "Users can view own history"
ON public.game_history
FOR SELECT
USING (
  game_id IN (
    SELECT id
    FROM public.games
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own history" ON public.game_history;
CREATE POLICY "Users can insert own history"
ON public.game_history
FOR INSERT
WITH CHECK (
  game_id IN (
    SELECT id
    FROM public.games
    WHERE user_id = auth.uid()
  )
);
