import { useState } from 'react';
import SectionCard from '../ui/SectionCard';
import { getDateKey } from '../../utils/date';

function LiveBrandsSection({ brands, logRevenue }) {
  const [inputs, setInputs] = useState({});
  const todayKey = getDateKey();

  return (
    <SectionCard title="LIVE BRANDS" icon="📊" accent="#00ff88">
      {brands.length ? (
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="title-font text-sm uppercase text-zinc-100">{brand.name}</p>
              <div className="mt-2 flex gap-2">
                <input
                  className="input-dark"
                  placeholder={`How much did ${brand.name} make today? ₹`}
                  value={inputs[brand.id] || ''}
                  onChange={(event) => setInputs((prev) => ({ ...prev, [brand.id]: event.target.value }))}
                  type="number"
                />
                <button
                  className="btn-primary !min-h-[44px] !px-3"
                  onClick={async () => {
                    await logRevenue(brand.id, Number(inputs[brand.id] || 0));
                  }}
                >
                  Save
                </button>
              </div>
              {brand.revenueLog?.[todayKey] !== undefined && (
                <p className="mt-2 text-xs text-zinc-300">Today's revenue: ₹{Number(brand.revenueLog[todayKey] || 0).toLocaleString()}</p>
              )}
              <p className="text-xs text-zinc-400">Total revenue this month: ₹{Number(brand.monthlyRevenue || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-zinc-500">No live brands yet.</p>
      )}
    </SectionCard>
  );
}

export default LiveBrandsSection;
