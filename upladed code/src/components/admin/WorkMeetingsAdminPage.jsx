import { format, addDays } from 'date-fns';
import { useMemo, useState } from 'react';
import SectionCard from '../ui/SectionCard';
import useWorkMeetings from '../../hooks/useWorkMeetings';

const defaultWork = {
  title: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '10:00',
  priority: 'Medium'
};

const defaultMeeting = {
  title: '',
  with: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '16:00',
  notes: ''
};

function WorkMeetingsAdminPage() {
  const {
    workItems,
    meetingItems,
    addWork,
    addMeeting,
    updateWork,
    updateMeeting,
    deleteWork,
    deleteMeeting
  } = useWorkMeetings();

  const [workForm, setWorkForm] = useState(defaultWork);
  const [meetingForm, setMeetingForm] = useState(defaultMeeting);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editingMeetingId, setEditingMeetingId] = useState(null);

  const maxDate = useMemo(() => format(addDays(new Date(), 60), 'yyyy-MM-dd'), []);

  const submitWork = async () => {
    if (!workForm.title.trim()) return;
    if (editingWorkId) {
      await updateWork(editingWorkId, workForm);
      setEditingWorkId(null);
    } else {
      await addWork(workForm);
    }
    setWorkForm(defaultWork);
  };

  const submitMeeting = async () => {
    if (!meetingForm.title.trim()) return;
    if (editingMeetingId) {
      await updateMeeting(editingMeetingId, meetingForm);
      setEditingMeetingId(null);
    } else {
      await addMeeting(meetingForm);
    }
    setMeetingForm(defaultMeeting);
  };

  return (
    <div className="space-y-3">
      <SectionCard title="Work & Meetings" icon="💼" accent="#f5a623">
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
            <p className="mb-2 title-font text-xs uppercase text-accent">Add Work Item</p>
            <div className="space-y-2">
              <input
                className="input-dark"
                placeholder="Title"
                value={workForm.title}
                onChange={(event) => setWorkForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <textarea
                className="textarea-dark"
                placeholder="Description"
                value={workForm.description}
                onChange={(event) => setWorkForm((prev) => ({ ...prev, description: event.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input-dark"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  max={maxDate}
                  value={workForm.date}
                  onChange={(event) => setWorkForm((prev) => ({ ...prev, date: event.target.value }))}
                />
                <input
                  className="input-dark"
                  type="time"
                  value={workForm.time}
                  onChange={(event) => setWorkForm((prev) => ({ ...prev, time: event.target.value }))}
                />
              </div>
              <select
                className="select-dark"
                value={workForm.priority}
                onChange={(event) => setWorkForm((prev) => ({ ...prev, priority: event.target.value }))}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <button className="btn-primary w-full" onClick={submitWork}>
                {editingWorkId ? 'Update Work Item' : 'Save Work Item'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
            <p className="mb-2 title-font text-xs uppercase text-accent">Add Meeting</p>
            <div className="space-y-2">
              <input
                className="input-dark"
                placeholder="Title"
                value={meetingForm.title}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <input
                className="input-dark"
                placeholder="With whom"
                value={meetingForm.with}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, with: event.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input-dark"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  max={maxDate}
                  value={meetingForm.date}
                  onChange={(event) => setMeetingForm((prev) => ({ ...prev, date: event.target.value }))}
                />
                <input
                  className="input-dark"
                  type="time"
                  value={meetingForm.time}
                  onChange={(event) => setMeetingForm((prev) => ({ ...prev, time: event.target.value }))}
                />
              </div>
              <textarea
                className="textarea-dark"
                placeholder="Notes"
                value={meetingForm.notes}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
              <button className="btn-primary w-full" onClick={submitMeeting}>
                {editingMeetingId ? 'Update Meeting' : 'Save Meeting'}
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Upcoming Work" icon="📅" accent="#ffd166">
        <div className="space-y-2">
          {workItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border border-borderSubtle p-3 ${item.date < format(new Date(), 'yyyy-MM-dd') ? 'bg-zinc-900 text-zinc-500' : 'bg-cardAlt'}`}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs">{item.date} • {item.time} • {item.priority}</p>
              <p className="mt-1 text-xs">{item.description}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn-soft !min-h-[34px] !px-2 text-xs"
                  onClick={() => {
                    setEditingWorkId(item.id);
                    setWorkForm({
                      title: item.title || '',
                      description: item.description || '',
                      date: item.date || format(new Date(), 'yyyy-MM-dd'),
                      time: item.time || '10:00',
                      priority: item.priority || 'Medium'
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-danger !min-h-[34px] !px-2 text-xs"
                  onClick={async () => {
                    if (!window.confirm('Delete this work item?')) return;
                    await deleteWork(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Upcoming Meetings" icon="🤝" accent="#00e5ff">
        <div className="space-y-2">
          {meetingItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border border-borderSubtle p-3 ${item.date < format(new Date(), 'yyyy-MM-dd') ? 'bg-zinc-900 text-zinc-500' : 'bg-cardAlt'}`}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs">{item.date} • {item.time} • {item.with || 'N/A'}</p>
              <p className="mt-1 text-xs">{item.notes}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn-soft !min-h-[34px] !px-2 text-xs"
                  onClick={() => {
                    setEditingMeetingId(item.id);
                    setMeetingForm({
                      title: item.title || '',
                      with: item.with || '',
                      date: item.date || format(new Date(), 'yyyy-MM-dd'),
                      time: item.time || '16:00',
                      notes: item.notes || ''
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-danger !min-h-[34px] !px-2 text-xs"
                  onClick={async () => {
                    if (!window.confirm('Delete this meeting item?')) return;
                    await deleteMeeting(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default WorkMeetingsAdminPage;
