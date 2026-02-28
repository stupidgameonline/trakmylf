import { Lightbulb, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionCard from '../ui/SectionCard';

const categories = [
  { label: 'Marketing Idea', value: 'marketing' },
  { label: 'New Business Idea', value: 'business' },
  { label: 'Other', value: 'other' }
];

const labelMap = {
  marketing: 'Marketing Idea',
  business: 'Business Idea',
  other: 'Other'
};

function IdeasCaptureSection({ latestIdeas, addIdea }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('marketing');

  return (
    <SectionCard title="IDEAS" icon={<Lightbulb className="h-4 w-4" />} accent="#ffd166">
      <div className="mb-3 flex gap-2">
        <input
          className="input-dark"
          placeholder="Quick idea..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <select className="select-dark w-[130px]" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          className="btn-primary !min-h-[44px] !px-3"
          onClick={async () => {
            if (!text.trim()) return;
            await addIdea({ text: text.trim(), category });
            setText('');
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {latestIdeas.map((idea) => (
          <div key={idea.id} className="rounded-lg border border-borderSubtle bg-cardAlt p-2">
            <span className="badge mb-1 inline-block bg-yellow-500/20 text-yellow-200">{labelMap[idea.category] || 'Other'}</span>
            <p className="text-sm text-zinc-100">{idea.text}</p>
          </div>
        ))}
      </div>

      <Link to="/admin/ideas" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
        View all ideas in Admin Panel →
      </Link>
    </SectionCard>
  );
}

export default IdeasCaptureSection;
