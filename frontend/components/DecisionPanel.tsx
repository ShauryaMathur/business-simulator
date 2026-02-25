'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DecisionPanelProps {
    onTurnAdvanced: () => void;
    currentHeadcount: number;
}

export default function DecisionPanel({ onTurnAdvanced, currentHeadcount }: DecisionPanelProps) {
    const [loading, setLoading] = useState(false);

    const [decisions, setDecisions] = useState({
        unitPrice: 100,
        newEngineers: 0,
        newSales: 0,
        salaryPct: 100
    });

    const handleAdvanceTurn = async () => {
        const newHires = decisions.newEngineers + decisions.newSales;
        const totalCapacity = 24;

        if (currentHeadcount + newHires > totalCapacity) {
            alert(`You only have ${totalCapacity - currentHeadcount} desks available!`);
            return;
        }

        if (decisions.unitPrice <= 0 || decisions.newEngineers < 0 || decisions.newSales < 0) {
            alert("Please enter valid positive numbers.");
            return;
        }
        setLoading(true);

        const { error } = await supabase.rpc('advance_turn', {
            p_unit_price: decisions.unitPrice,
            p_new_engineers: decisions.newEngineers,
            p_new_sales: decisions.newSales,
            p_salary_pct: decisions.salaryPct
        });

        if (error) {
            alert(`Error advancing turn: ${error.message}`);
        } else {
            setDecisions(prev => ({ ...prev, newEngineers: 0, newSales: 0 }));
            onTurnAdvanced();
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