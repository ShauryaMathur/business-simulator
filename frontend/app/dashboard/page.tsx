'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Game, GameHistory } from '@/types/database';
import { useAuth } from '@/components/AuthProvider';
import DecisionPanel from '@/components/DecisionPanel';
import OfficeGrid from '@/components/OfficeGrid';
import GameOverlay from '@/components/GameOverlay';
import AnalyticsCharts from '@/components/AnalyticsCharts';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [game, setGame] = useState<Game | null>(null);
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        const { data: gameData } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!gameData) {
            setGame(null);
            setHistory([]);
            setLoading(false);
            return;
        }

        const { data: historyData } = await supabase
            .from('game_history')
            .select('*')
            .eq('game_id', (gameData as Game).id)
            .order('quarter', { ascending: false })
            .limit(4);

        setGame(gameData as Game);
        setHistory((historyData ?? []) as GameHistory[]);
        setLoading(false);
    }, [user]);

    const handleRestart = async () => {
        setLoading(true);

        const { error } = await supabase.rpc('reset_game');

        if (error) {
            alert(error.message);
        } else {
            await fetchData();
        }
        setLoading(false);
    };

    useEffect(() => {
        if (authLoading) return;
        queueMicrotask(() => {
            void fetchData();
        });
    }, [authLoading, fetchData]);

    if (authLoading || loading) return <p className="p-8">Loading Startup...</p>;
    if (!user) return <p className="p-8">Please sign in to view the dashboard.</p>;
    if (!game) return <p className="p-8">No game found for this user.</p>;

    return (
        <main className="p-8 max-w-5xl mx-auto space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GameOverlay
                    cash={game.cash}
                    quarter={game.current_quarter}
                    onRestart={handleRestart}
                />
                <DecisionPanel onTurnAdvanced={fetchData} currentHeadcount = {game.engineers + game.sales_staff}/>

                <section className="border p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Financial History</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Q</th>
                                <th className="text-left py-2">Revenue</th>
                                <th className="text-left py-2">Net Inc.</th>
                                <th className="text-left py-2">Cash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h) => (
                                <tr key={h.id} className="border-b">
                                    <td className="py-2">{h.quarter}</td>
                                    <td>${h.revenue.toLocaleString()}</td>
                                    <td className={h.net_income >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        ${h.net_income.toLocaleString()}
                                    </td>
                                    <td>${h.cash.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <div className="grid grid-cols-1 gap-8">
                    <OfficeGrid
                        engineers={game.engineers}
                        sales={game.sales_staff}
                        totalCapacity={24} 
                    />
                </div>
                <AnalyticsCharts history={history} engineers={game.engineers} sales={game.sales_staff} />
            </div>

            <div className="flex justify-center pt-2">
                <button
                    onClick={handleRestart}
                    className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                    Restart Simulation
                </button>
            </div>
        </main>
    );
}
