'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Game, GameHistory } from '@/types/database';

type UseDashboardDataParams = {
  userId?: string;
  enabled: boolean;
};

type DashboardDataResult = {
  game: Game | null;
  history: GameHistory[];
  loading: boolean;
  restarting: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  restartSimulation: () => Promise<void>;
};

async function fetchDashboardData(userId: string) {
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (gameError) {
    throw gameError;
  }

  if (!gameData) {
    return { game: null, history: [] as GameHistory[] };
  }

  const { data: historyData, error: historyError } = await supabase
    .from('game_history')
    .select('*')
    .eq('game_id', (gameData as Game).id)
    .eq('is_deleted', false)
    .order('quarter', { ascending: false })
    .limit(4);

  if (historyError) {
    throw historyError;
  }

  return {
    game: gameData as Game,
    history: (historyData ?? []) as GameHistory[],
  };
}

export function useDashboardData({
  userId,
  enabled,
}: UseDashboardDataParams): DashboardDataResult {
  const [game, setGame] = useState<Game | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setGame(null);
      setHistory([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchDashboardData(userId);
      setGame(result.game);
      setHistory(result.history);
    } catch (err) {
      setGame(null);
      setHistory([]);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const restartSimulation = useCallback(async () => {
    setRestarting(true);

    try {
      const { error: restartError } = await supabase.rpc('reset_game');

      if (restartError) {
        throw restartError;
      }

      await refetch();
    } finally {
      setRestarting(false);
    }
  }, [refetch]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      if (!userId) {
        if (cancelled) return;
        setGame(null);
        setHistory([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await fetchDashboardData(userId);
        if (cancelled) return;
        setGame(result.game);
        setHistory(result.history);
      } catch (err) {
        if (cancelled) return;
        setGame(null);
        setHistory([]);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  return { game, history, loading, restarting, error, refetch, restartSimulation };
}
