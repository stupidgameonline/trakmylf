import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SectionCard from '../ui/SectionCard';
import useBrands from '../../hooks/useBrands';

function BrandsAdminPage() {
  const {
    currentBrand,
    pipelineBrands,
    liveBrands,
    archiveBrands,
    saveCurrentBrand,
    updateCurrentBrand,
    addPipelineBrand,
    updatePipelineBrand,
    reorderPipelineBrand,
    setPipelineAsCurrent,
    deletePipelineBrand,
    addLiveBrand,
    closeLiveBrand
  } = useBrands();

  const [newCurrentName, setNewCurrentName] = useState('');
  const [pipelineForm, setPipelineForm] = useState({
    name: '',
    description: '',
    category: '',
    plannedStartDate: '',
    sourceIdea: ''
  });
  const [liveName, setLiveName] = useState('');

  const currentLogs = useMemo(
    () => (currentBrand?.dailyLogs ? Object.entries(currentBrand.dailyLogs).sort((a, b) => a[0].localeCompare(b[0])) : []),
    [currentBrand?.dailyLogs]
  );

  const createChecklistItem = (phaseKey) => {
    const label = window.prompt('Checklist item');
    if (!label?.trim()) return;
    const existing = currentBrand?.phaseData?.[phaseKey]?.checklist || [];
    updateCurrentBrand({
      phaseData: {
        ...(currentBrand?.phaseData || {}),
        [phaseKey]: {
          ...(currentBrand?.phaseData?.[phaseKey] || {}),
          checklist: [...existing, { id: `${Date.now()}`, label: label.trim(), done: false }]
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      <SectionCard title="Current Brand" icon="🚀" accent="#ff2d78">
        {currentBrand?.name ? (
          <div className="space-y-2">
            <p className="title-font text-base uppercase text-pink-200">{currentBrand.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="select-dark"
                value={currentBrand.phase || 1}
                onChange={(event) => updateCurrentBrand({ phase: Number(event.target.value) })}
              >
                <option value={1}>Phase 1: Research</option>
                <option value={2}>Phase 2: Build</option>
                <option value={3}>Phase 3: Execute</option>
              </select>
              <input
                className="input-dark"
                placeholder="Recheck date"
                type="date"
                value={currentBrand.phaseData?.phase3?.recheckDate || ''}
                onChange={(event) =>
                  updateCurrentBrand({
                    phaseData: {
                      ...(currentBrand.phaseData || {}),
                      phase3: {
                        ...(currentBrand.phaseData?.phase3 || {}),
                        recheckDate: event.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <textarea
              className="textarea-dark"
              placeholder="Expected outcome by recheck"
              value={currentBrand.phaseData?.phase3?.expectedOutcome || ''}
              onChange={(event) =>
                updateCurrentBrand({
                  phaseData: {
                    ...(currentBrand.phaseData || {}),
                    phase3: {
                      ...(currentBrand.phaseData?.phase3 || {}),
                      expectedOutcome: event.target.value
                    }
                  }
                })
              }
            />

            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="mb-1 text-xs uppercase text-zinc-500">Phase 1 Checklist</p>
              {(currentBrand.phaseData?.phase1?.checklist || []).map((item) => (
                <label key={item.id} className="mb-1 flex items-center gap-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={Boolean(item.done)}
                    onChange={(event) => {
                      const checklist = (currentBrand.phaseData?.phase1?.checklist || []).map((entry) =>
                        entry.id === item.id ? { ...entry, done: event.target.checked } : entry
                      );
                      updateCurrentBrand({
                        phaseData: {
                          ...(currentBrand.phaseData || {}),
                          phase1: {
                            ...(currentBrand.phaseData?.phase1 || {}),
                            checklist
                          }
                        }
                      });
                    }}
                  />
                  {item.label}
                </label>
              ))}
              <button className="btn-soft mt-2 !min-h-[34px] !px-2 text-xs" onClick={() => createChecklistItem('phase1')}>
                Add Phase 1 Item
              </button>
            </div>

            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="mb-1 text-xs uppercase text-zinc-500">Phase 2 Checklist</p>
              {(currentBrand.phaseData?.phase2?.checklist || []).map((item) => (
                <label key={item.id} className="mb-1 flex items-center gap-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={Boolean(item.done)}
                    onChange={(event) => {
                      const checklist = (currentBrand.phaseData?.phase2?.checklist || []).map((entry) =>
                        entry.id === item.id ? { ...entry, done: event.target.checked } : entry
                      );
                      updateCurrentBrand({
                        phaseData: {
                          ...(currentBrand.phaseData || {}),
                          phase2: {
                            ...(currentBrand.phaseData?.phase2 || {}),
                            checklist
                          }
                        }
                      });
                    }}
                  />
                  {item.label}
                </label>
              ))}
              <button className="btn-soft mt-2 !min-h-[34px] !px-2 text-xs" onClick={() => createChecklistItem('phase2')}>
                Add Phase 2 Item
              </button>
            </div>

            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="mb-1 text-xs uppercase text-zinc-500">Daily Log History</p>
              {currentLogs.length ? (
                currentLogs.map(([dateKey, value]) => (
                  <p key={dateKey} className="text-xs text-zinc-200">
                    {dateKey}: {value.text}
                  </p>
                ))
              ) : (
                <p className="text-xs text-zinc-500">No daily logs yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              className="input-dark"
              placeholder="Current brand name"
              value={newCurrentName}
              onChange={(event) => setNewCurrentName(event.target.value)}
            />
            <button
              className="btn-primary w-full"
              onClick={async () => {
                if (!newCurrentName.trim()) return;
                await saveCurrentBrand({ name: newCurrentName.trim() });
                setNewCurrentName('');
              }}
            >
              Set Current Brand
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Brand Pipeline" icon="🧠" accent="#f5a623">
        <div className="space-y-2">
          <input
            className="input-dark"
            placeholder="Brand name"
            value={pipelineForm.name}
            onChange={(event) => setPipelineForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <textarea
            className="textarea-dark"
            placeholder="Description"
            value={pipelineForm.description}
            onChange={(event) => setPipelineForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            className="input-dark"
            placeholder="Category"
            value={pipelineForm.category}
            onChange={(event) => setPipelineForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <input
            className="input-dark"
            type="date"
            value={pipelineForm.plannedStartDate}
            onChange={(event) => setPipelineForm((prev) => ({ ...prev, plannedStartDate: event.target.value }))}
          />
          <input
            className="input-dark"
            placeholder="Source idea"
            value={pipelineForm.sourceIdea}
            onChange={(event) => setPipelineForm((prev) => ({ ...prev, sourceIdea: event.target.value }))}
          />
          <button
            className="btn-primary w-full"
            onClick={async () => {
              if (!pipelineForm.name.trim()) return;
              await addPipelineBrand(pipelineForm);
              setPipelineForm({ name: '', description: '', category: '', plannedStartDate: '', sourceIdea: '' });
            }}
          >
            Add to Pipeline
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {pipelineBrands.map((brand) => (
            <div key={brand.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="text-sm font-semibold text-zinc-100">{brand.name}</p>
              <p className="text-xs text-zinc-400">Start: {brand.plannedStartDate || 'TBD'} • Source: {brand.sourceIdea || 'N/A'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-soft !min-h-[34px] !px-2 text-xs" onClick={() => reorderPipelineBrand(brand.id, 'up')}>
                  ↑
                </button>
                <button className="btn-soft !min-h-[34px] !px-2 text-xs" onClick={() => reorderPipelineBrand(brand.id, 'down')}>
                  ↓
                </button>
                <button className="btn-soft !min-h-[34px] !px-2 text-xs" onClick={() => setPipelineAsCurrent(brand.id)}>
                  Set as Current Brand
                </button>
                <button
                  className="btn-danger !min-h-[34px] !px-2 text-xs"
                  onClick={async () => {
                    if (!window.confirm('Delete this pipeline brand?')) return;
                    await deletePipelineBrand(brand.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Live Brands" icon="📊" accent="#00ff88">
        <div className="mb-3 flex gap-2">
          <input className="input-dark" placeholder="New live brand" value={liveName} onChange={(event) => setLiveName(event.target.value)} />
          <button
            className="btn-primary"
            onClick={async () => {
              if (!liveName.trim()) return;
              await addLiveBrand({ name: liveName.trim() });
              setLiveName('');
            }}
          >
            Add
          </button>
        </div>

        <div className="space-y-3">
          {liveBrands.map((brand) => {
            const chartData = Object.entries(brand.revenueLog || {}).map(([date, value]) => ({ date, value: Number(value || 0) }));
            return (
              <div key={brand.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
                <p className="text-sm font-semibold text-zinc-100">{brand.name}</p>
                {chartData.length ? (
                  <>
                    <div className="mt-2 h-36">
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 space-y-1">
                      {chartData.map((row) => (
                        <p key={`${brand.id}-${row.date}`} className="text-xs text-zinc-200">
                          {row.date}: ₹{row.value.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-500">No revenue history yet.</p>
                )}
                <button
                  className="btn-danger mt-2 w-full"
                  onClick={async () => {
                    if (!window.confirm("Close this brand as 'didn't work out'?")) return;
                    await closeLiveBrand(brand.id, "didn't work out");
                  }}
                >
                  Close Brand (didn't work out)
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Brand Archive" icon="📦" accent="#888888">
        <div className="space-y-2">
          {archiveBrands.length ? (
            archiveBrands.map((brand) => (
              <div key={brand.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
                <p className="text-sm font-semibold text-zinc-200">{brand.name}</p>
                <p className="text-xs text-zinc-400">
                  {brand.reason} • Closed: {brand.closedDate} • Total Revenue: ₹{Number(brand.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No archived brands.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export default BrandsAdminPage;
