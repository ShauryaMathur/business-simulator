'use client';

interface GameOverlayProps {
  cash: number;
  quarter: number;
  onRestart: () => void;
}

export default function GameOverlay({ cash, quarter, onRestart }: GameOverlayProps) {
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
              Your cash reached zero in Quarter {quarter}. The startup has folded. 
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
          </>
        )}

        <button
          onClick={onRestart}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Restart Simulation
        </button>
      </div>
    </div>
  );
}
