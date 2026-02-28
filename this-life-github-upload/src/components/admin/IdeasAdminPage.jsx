import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import SectionCard from '../ui/SectionCard';
import useIdeas from '../../hooks/useIdeas';
import useBrands from '../../hooks/useBrands';

function IdeasAdminPage() {
  const { ideas, addIdea, updateIdea, deleteIdea } = useIdeas();
  const { currentBrand, addPipelineBrand } = useBrands();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('marketing');

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const categoryMatch = filter === 'all' ? true : idea.category === filter;
      const searchMatch = idea.text?.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [filter, ideas, search]);

  const linkToPipeline = async (idea) => {
    const plannedStartDate = window.prompt('Planned start date (YYYY-MM-DD):', format(new Date(), 'yyyy-MM-dd'));
    if (!plannedStartDate) return;
    const name = window.prompt('Brand name for pipeline:', idea.text.slice(0, 40));
    if (!name) return;

    await addPipelineBrand({
      name,
      description: idea.text,
      category: 'idea-linked',
      plannedStartDate,
      sourceIdea: idea.id
    });

    await updateIdea(idea.id, { linkedBrand: name });
  };

  return (
    <div className="space-y-3">
      <SectionCard title="Ideas" icon="💡" accent="#ffd166">
        <div className="space-y-2">
          <textarea
            className="textarea-dark"
            placeholder="Capture a new idea..."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex gap-2">
            <select className="select-dark" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="marketing">Marketing Ideas</option>
              <option value="business">Business Ideas</option>
              <option value="other">Other</option>
            </select>
            <button
              className="btn-primary"
              onClick={async () => {
                if (!text.trim()) return;
                await addIdea({ text: text.trim(), category });
                setText('');
              }}
            >
              Save
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Idea Library" icon="🗂️" accent="#00e5ff">
        <div className="mb-3 flex gap-2">
          <input className="input-dark" placeholder="Search ideas" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select-dark w-[130px]" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="marketing">Marketing Ideas</option>
            <option value="business">Business Ideas</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <span className="badge mb-1 inline-block bg-accent/20 text-accent">
                {idea.category === 'marketing' ? 'Marketing Idea' : idea.category === 'business' ? 'Business Idea' : 'Other'}
              </span>
              <p className="text-sm text-zinc-100">{idea.text}</p>
              {idea.linkedBrand && <p className="mt-1 text-xs text-cyan-300">Linked: {idea.linkedBrand}</p>}

              <div className="mt-2 flex flex-wrap gap-2">
                {idea.category === 'marketing' && (
                  <>
                    <button
                      className="btn-soft !min-h-[34px] !px-2 text-xs"
                      onClick={async () => {
                        if (!currentBrand?.name) return;
                        await updateIdea(idea.id, { linkedBrand: currentBrand.name });
                      }}
                    >
                      Link to Current Brand
                    </button>
                    <button className="btn-soft !min-h-[34px] !px-2 text-xs" onClick={() => linkToPipeline(idea)}>
                      Link to Brand Pipeline
                    </button>
                  </>
                )}
                {idea.category === 'business' && (
                  <button className="btn-soft !min-h-[34px] !px-2 text-xs" onClick={() => linkToPipeline(idea)}>
                    Add to Brand Pipeline
                  </button>
                )}
                <button
                  className="btn-danger !min-h-[34px] !px-2 text-xs"
                  onClick={async () => {
                    if (!window.confirm('Delete this idea?')) return;
                    await deleteIdea(idea.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!filteredIdeas.length && <p className="text-xs text-zinc-500">No ideas match this filter.</p>}
        </div>
      </SectionCard>
    </div>
  );
}

export default IdeasAdminPage;
