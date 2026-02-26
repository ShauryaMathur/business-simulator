'use client';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatQuarterLabel } from '@/lib/formatters';
import DecisionPanel from '@/components/DecisionPanel';
import OfficeGrid from '@/components/OfficeGrid';
import GameOverlay from '@/components/GameOverlay';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import FinancialHistory from '@/components/FinancialHistory';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const {
        game,
        history,
        loading,
        restarting,
        error,
        refetch,
        restartSimulation,
    } = useDashboardData({
        userId: user?.id,
        enabled: !authLoading,
    });

    const handleRestart = async () => {
        try {
            await restartSimulation();
        } catch (err) {
            showToast({
                message:
                    err instanceof Error
                        ? `Error restarting simulation: ${err.message}`
                        : 'Error restarting simulation.',
                variant: 'error',
                durationMs: 4500,
            });
        }
    };

    if (authLoading || (loading && !game)) return <p className="p-8">Loading Startup...</p>;
    if (!user) return <p className="p-8">Please sign in to view the dashboard.</p>;
    if (error) {
        return (
            <div className="p-8">
                <p className="text-red-600">Error: {error}</p>
                <button
                    onClick={() => void refetch()}
                    className="mt-4 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                >
                    Retry
                </button>
            </div>
        );
    }
    if (!game) return <p className="p-8">No game found for this user.</p>;

    return (
        <main className="p-8 max-w-5xl mx-auto space-y-8">
            <section className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Current Quarter</p>
                <p className="text-xl font-semibold text-gray-900">
                    {formatQuarterLabel(game.current_quarter)}
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GameOverlay
                    cash={game.cash}
                    quarter={game.current_quarter}
                    onRestart={handleRestart}
                    restarting={loading || restarting}
                />
                <DecisionPanel onTurnAdvanced={refetch} currentHeadcount = {game.engineers + game.sales_staff}/>

                <FinancialHistory history={history} />
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
                    onClick={() => void handleRestart()}
                    disabled={loading || restarting}
                    className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {restarting ? 'Restarting...' : 'Restart Simulation'}
                </button>
            </div>
        </main>
    );
}
