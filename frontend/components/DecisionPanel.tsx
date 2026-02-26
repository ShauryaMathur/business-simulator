'use client';

import { useState } from 'react';
import { OFFICE_MAX_CAPACITY } from '@/config/game';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/app/providers/ToastProvider';

export interface AdvanceTurnResult {
    is_win: boolean;
    cumulative_profit: number;
    new_cash: number;
}

interface DecisionPanelProps {
    onTurnAdvanced: (result?: AdvanceTurnResult) => void | Promise<void>;
    currentHeadcount: number;
}

export default function DecisionPanel({ onTurnAdvanced, currentHeadcount }: DecisionPanelProps) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const [decisions, setDecisions] = useState({
        unitPrice: 100,
        newEngineers: 0,
        newSales: 0,
        salaryPct: 100
    });

    const handleAdvanceTurn = async () => {
        const newHires = decisions.newEngineers + decisions.newSales;
        const totalCapacity = OFFICE_MAX_CAPACITY;

        if (currentHeadcount + newHires > totalCapacity) {
            showToast({
                message: `You only have ${totalCapacity - currentHeadcount} desks available!`,
                variant: 'error',
            });
            return;
        }

        if (decisions.unitPrice <= 0 || decisions.newEngineers < 0 || decisions.newSales < 0) {
            showToast({
                message: 'Please enter valid positive numbers.',
                variant: 'error',
            });
            return;
        }
        setLoading(true);

        const { data, error } = await supabase.rpc('advance_turn', {
            p_unit_price: decisions.unitPrice,
            p_new_engineers: decisions.newEngineers,
            p_new_sales: decisions.newSales,
            p_salary_pct: decisions.salaryPct,
            p_max_capacity: totalCapacity,
        });

        if (error) {
            showToast({
                message: `Error advancing turn: ${error.message}`,
                variant: 'error',
                durationMs: 4500,
            });
        } else {
            setDecisions(prev => ({ ...prev, newEngineers: 0, newSales: 0 }));
            await onTurnAdvanced(data as AdvanceTurnResult);
        }
        setLoading(false);
    };

    return (
        <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Quarterly Decisions</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price ($)</label>
                    <input
                        type="number"
                        min="1"
                        value={decisions.unitPrice}
                        onChange={(e) => setDecisions({ ...decisions, unitPrice: Number(e.target.value) })}
                        className="mt-1 block w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Salary (% of industry average)</label>
                    <input
                        type="number"
                        min="1"
                        value={decisions.salaryPct}
                        onChange={(e) => setDecisions({ ...decisions, salaryPct: Number(e.target.value) })}
                        className="mt-1 block w-full border rounded-md p-2"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hire Engineers</label>
                        <input
                            type="number"
                            min="0"
                            value={decisions.newEngineers}
                            onChange={(e) => setDecisions({ ...decisions, newEngineers: Number(e.target.value) })}
                            className="mt-1 block w-full border rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hire Sales Staff</label>
                        <input
                            type="number"
                            min="0"
                            value={decisions.newSales}
                            onChange={(e) => setDecisions({ ...decisions, newSales: Number(e.target.value) })}
                            className="mt-1 block w-full border rounded-md p-2"
                        />
                    </div>
                </div>

                <button
                    onClick={handleAdvanceTurn}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Processing...' : 'Advance Turn'}
                </button>
            </div>
        </section>
    );
}
