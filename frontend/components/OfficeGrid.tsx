'use client';

interface OfficeGridProps {
  engineers: number;
  sales: number;
  totalCapacity?: number;
}

export default function OfficeGrid({ engineers, sales, totalCapacity = 24 }: OfficeGridProps) {
  const totalEmployees = engineers + sales;

  return (
    <section className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-bold mb-4">Office Layout</h2>
      
      <div className="flex gap-4 mb-4 text-xs font-semibold">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div> Engineers
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div> Sales & Admin
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-300 rounded-sm"></div> Empty Desk
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 bg-gray-50 p-6 rounded-md border border-gray-200">
        {Array.from({ length: totalCapacity }).map((_, i) => {
          let content = null;
          
          if (i < engineers) {
            content = <div className="w-6 h-6 bg-blue-600 rounded-full shadow-md animate-in zoom-in" />;
          } else if (i < totalEmployees) {
            content = <div className="w-6 h-6 bg-orange-500 rounded-full shadow-md animate-in zoom-in" />;
          }

          return (
            <div key={i} className="relative flex flex-col items-center">
              <div className="w-10 h-8 border-2 border-gray-300 rounded-t-md bg-white flex items-center justify-center">
                {content}
              </div>
              <div className="w-12 h-1 bg-gray-300 rounded-full mt-0.5" />
            </div>
          );
        })}
      </div>
      
      <p className="mt-4 text-sm text-gray-500 italic">
        Occupancy: {totalEmployees} / {totalCapacity} desks filled.
      </p>
    </section>
  );
}