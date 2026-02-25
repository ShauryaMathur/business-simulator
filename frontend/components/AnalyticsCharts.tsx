'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { GameHistory } from '@/types/database';

interface AnalyticsChartsProps {
  history: GameHistory[];
  engineers: number;
  sales: number;
}

export default function AnalyticsCharts({ history, engineers, sales }: AnalyticsChartsProps) {

  const chartData = [...history].reverse();

  const pieData = [
    { name: 'Engineers', value: engineers, color: '#2563eb' },
    { name: 'Sales', value: sales, color: '#f97316' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Cash Chart */}
      <div className="bg-white p-4 border rounded shadow-sm">
        <h3 className="text-sm font-bold text-gray-500 mb-2">Cash ($)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="quarter" label={{ value: 'Quarter', position: 'insideBottom', offset: -5 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Line type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Income Chart */}
      <div className="bg-white p-4 border rounded shadow-sm">
        <h3 className="text-sm font-bold text-gray-500 mb-2">Net Income ($/Qtr)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="quarter" />
              <YAxis hide />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Line type="monotone" dataKey="net_income" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Ratio Pie Chart */}
      <div className="bg-white p-4 border rounded shadow-sm flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-500 mb-2">Employee Ratio</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={30} outerRadius={60} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
