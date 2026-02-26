'use client';

import type { GameHistory } from '@/types/database';

interface FinancialHistoryProps {
  history: GameHistory[];
}

export default function FinancialHistory({ history }: FinancialHistoryProps) {
  return (
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
  );
}
