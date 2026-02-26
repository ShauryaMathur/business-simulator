'use client';

import { formatQuarterLabel } from '@/lib/formatters';

interface GameOverlayProps {
  cash: number;
  quarter: number;
  cumulativeProfit?: number | null;
  onRestart: () => void;
  restarting?: boolean;
}

export default function GameOverlay({
  cash,
  quarter,
  cumulativeProfit,
  onRestart,
  restarting = false,
}: GameOverlayProps) {
  const isBankrupt = cash <= 0; 
  const isWinner = quarter > 40 && cash > 0; 

  if (!isBankrupt && !isWinner) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
        {isBankrupt ? (
          <>
            <h2 className="text-4xl font-bold text-red-600 mb-4">Bankrupt!</h2>
            <p className="text-gray-600 mb-6">
              Your cash reached zero in {formatQuarterLabel(quarter)}. The startup has folded.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-green-600 mb-4">Victory!</h2>
            <p className="text-gray-600 mb-2">
              You reached Year 10 with a successful business. 
            </p>
            <p className="text-2xl font-mono font-bold text-black mb-6">
              Final Cash: ${cash.toLocaleString()}
            </p>
            {typeof cumulativeProfit === 'number' ? (
              <p className="text-lg font-mono font-semibold text-gray-800 mb-6">
                Cumulative Profit: ${cumulativeProfit.toLocaleString()}
              </p>
            ) : null}
          </>
        )}

        <button
          onClick={onRestart}
          disabled={restarting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {restarting ? 'Restarting...' : 'Restart Simulation'}
        </button>
      </div>
    </div>
  );
}
